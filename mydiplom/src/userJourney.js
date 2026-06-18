import { syncProgress } from './apiClient';
// userJourney.js - ДОПОЛНЕНИЯ к существующему коду

import { LEARNING_PATHS, getCurrentTopic, getNextTopics, getEstimatedTimeRemaining } from './learningPath';

const JOURNEY_STORAGE_KEY_BASE = 'userJourneyProfile';
const ACHIEVEMENTS_STORAGE_KEY_BASE = 'userAchievements';
const TASKS_STORAGE_KEY_BASE = 'userTasks';

function getUserStorageKey(baseKey) {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  return userId ? `${baseKey}_user_${userId}` : baseKey;
}

export function getJourneyStorageKey() {
  return getUserStorageKey(JOURNEY_STORAGE_KEY_BASE);
}

export function getAchievementsStorageKey() {
  return getUserStorageKey(ACHIEVEMENTS_STORAGE_KEY_BASE);
}

export function getTasksStorageKey() {
  return getUserStorageKey(TASKS_STORAGE_KEY_BASE);
}

export function loadJourneyProfile() {
  try {
    return JSON.parse(localStorage.getItem(getJourneyStorageKey()) || 'null');
  } catch {
    return null;
  }
}

export function saveJourneyProfile(profile) {
  localStorage.setItem(getJourneyStorageKey(), JSON.stringify(profile));
  
  if (localStorage.getItem('authToken')) {
    syncProgress({
      xp: profile.xp,
      coins: profile.coins,
      energy: profile.energy,
      level: profile.level,
      wordsLearned: profile.wordsLearned,
      streakDays: profile.streakDays,
      lives: profile.lives
      ,
      inventory: profile.inventory
    }).catch(err => console.warn('Failed to sync progress to backend', err));
  }
  
  return profile;
}

export function updateJourneyProfile(updates) {
  const profile = loadJourneyProfile() || {};
  const updated = { ...profile, ...updates };
  return saveJourneyProfile(updated);
}

export function getGoalStageFromDates(startDate, endDate) {
  if (!startDate || !endDate) {
    return 1;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const totalDays = Math.max((end - start) / (1000 * 60 * 60 * 24), 1);
  const passedDays = Math.max((now - start) / (1000 * 60 * 60 * 24), 0);
  const ratio = Math.min(Math.max(passedDays / totalDays, 0), 1);

  if (ratio < 0.33) return 1;
  if (ratio < 0.66) return 2;
  return 3;
}

export function getCurrentPracticeTopic(level, completedTopics = []) {
  const path = LEARNING_PATHS[level] || LEARNING_PATHS.beginner;
  const allTopics = (path.stages || []).flatMap((stage) => stage.topics || []);
  return allTopics.find((topic) => !completedTopics.includes(topic.id)) || allTopics[allTopics.length - 1] || null;
}

export function getNextPracticeTopics(level, completedTopics = [], count = 2) {
  const path = LEARNING_PATHS[level] || LEARNING_PATHS.beginner;
  const allTopics = (path.stages || []).flatMap((stage) => stage.topics || []);
  const currentIndex = allTopics.findIndex((topic) => !completedTopics.includes(topic.id));
  if (currentIndex === -1) return [];
  return allTopics.slice(currentIndex + 1, currentIndex + 1 + count);
}

export function markPracticeTopicCompleted(topicId) {
  const profile = loadJourneyProfile();
  if (!profile) return null;
  const completedTopics = Array.isArray(profile.completedTopics) ? [...profile.completedTopics] : [];
  if (!completedTopics.includes(topicId)) {
    completedTopics.push(topicId);
  }
  const updated = updateJourneyProfile({ completedTopics, lastActivityDate: new Date().toISOString() });
  // После отметки темы как пройденной — попытаться засчитать связанные ежедневные задания
  try {
    syncPracticeWithTasks(topicId, updated);
  } catch (e) {
    // не критично — логируем в консоль
    // eslint-disable-next-line no-console
    console.warn('syncPracticeWithTasks failed', e?.message || e);
  }
  return updated;
}

// Синхронизировать прогресс практики с ежедневными заданиями
export function syncPracticeWithTasks(topicId, profileOverride = null) {
  const profile = profileOverride || loadJourneyProfile();
  if (!profile) return null;

  const tasksData = JSON.parse(localStorage.getItem(getTasksStorageKey()) || '{}');
  const tasks = tasksData.tasks || [];

  // Найти информацию о теме в learning path
  const path = LEARNING_PATHS[profile.level] || LEARNING_PATHS.beginner;
  const allTopics = (path.stages || []).flatMap((s) => s.topics || []);
  const topic = allTopics.find(t => t.id === topicId);
  const totalItems = Array.isArray(topic?.questions) ? topic.questions.length : (topic?.wordsCount || 0);
  const unlocked = Math.max(1, (profile.topicProgress || {})[topicId] || 1);

  // Предпочитаем прямое соответствие по topicId, если задано в задаче
  const updatedTasks = tasks.map((t) => {
    if (t.completed) return t;
    if (t.topicId && t.topicId === topicId) {
      const shortThreshold = t.requiredForShort || Math.min(3, Math.max(1, Math.floor(totalItems * 0.3)));
      const repeatThreshold = t.requiredForRepeat || Math.min(6, Math.max(shortThreshold + 1, Math.floor(totalItems * 0.6)));
      const deepThreshold = t.requiredForDeep || Math.max(totalItems, 1);

      if (t.title && t.title.toLowerCase().includes('короткая практика') && unlocked >= shortThreshold) {
        return { ...t, completed: true, completedAt: new Date().toISOString() };
      }
      if (t.title && t.title.toLowerCase().includes('повторение') && unlocked >= repeatThreshold) {
        return { ...t, completed: true, completedAt: new Date().toISOString() };
      }
      if (t.title && t.title.toLowerCase().includes('углублённая') && unlocked >= deepThreshold) {
        return { ...t, completed: true, completedAt: new Date().toISOString() };
      }
    }

    // Fallback: старая эвристика по названию
    const title = String(t.title || '').toLowerCase();
    const topicName = String(topic?.name || '').toLowerCase();
    if (topicName && title.includes(topicName)) {
      if (title.includes('короткая практика') && unlocked >= 3) return { ...t, completed: true, completedAt: new Date().toISOString() };
      if (title.includes('повторение') && unlocked >= Math.min(6, totalItems || 6)) return { ...t, completed: true, completedAt: new Date().toISOString() };
      if (title.includes('углублённая') && unlocked >= (totalItems || 1)) return { ...t, completed: true, completedAt: new Date().toISOString() };
    }

    return t;
  });

  // Сохранить, если есть изменения
  const changed = JSON.stringify(updatedTasks) !== JSON.stringify(tasks);
  if (changed) {
    tasksData.tasks = updatedTasks;
    localStorage.setItem(getTasksStorageKey(), JSON.stringify(tasksData));
    // Обновить статистику профиля
    const today = new Date().toDateString();
    const stats = profile.stats || {};
    stats.dailyCompletions = stats.dailyCompletions || {};
    const completedCount = updatedTasks.filter(x => x.completed).length;
    stats.dailyCompletions[today] = completedCount;
    updateJourneyProfile({ stats, lastActivityDate: new Date().toISOString() });
  }

  return tasksData;
}

// ========== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ==========

// Создание нового профиля (при первом входе)
export function createNewProfile(assessmentData) {
  const now = new Date().toISOString();
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + (assessmentData.months || 12));
  
  const profile = {
    // Основные данные
    id: Date.now(),
    username: assessmentData.username || 'Игрок',
    petName: 'Хранитель',
    createdAt: now,
    lastLoginDate: now,
    lastActivityDate: now,
    
    // Ресурсы
    energy: 100,
    maxEnergy: 100,
    coins: 10,
    lives: 3,
    maxLives: 5,
    
    // Прогресс
    level: assessmentData.level || 'beginner',
    levelLabel: assessmentData.levelLabel || 'Начальный (A0-A1)',
    xp: 0,
    xpToNextLevel: 100,
    wordsLearned: 0,
    streakDays: 0,
    lastStreakDate: null,
    
    // Цели
    goalTitle: assessmentData.goalTitle || 'Английский язык до уровня B1',
    dailyMinutes: assessmentData.dailyMinutes || 20,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    
    // Обучение
    currentTopic: null,
    currentStage: 1,
    completedTopics: [],
    completedStages: [],
    topicProgress: { alphabet: 1 },
    masteredWords: [], // ID слов, которые полностью выучены
    learningWords: [], // Слова в процессе изучения

    // Статистика
    stats: {
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      totalGamesPlayed: 0,
      totalTimeSpent: 0, // в минутах
      dailyCompletions: {}, // { '2024-01-01': 3 }
      weeklyCompletions: {}
    },
    
    // Инвентарь
    inventory: {
      items: [], // купленные предметы
      equipped: {
        hat: null,
        accessory: null,
        petSkin: 'default'
      }
    },
    
    // Друзья
    friends: [],
    friendRequests: [],
    
    // Настройки
    settings: {
      soundEnabled: true,
      notificationsEnabled: true,
      theme: 'light'
    }
  };
  
  saveJourneyProfile(profile);
  initializeTasks(profile);
  return profile;
}

// Инициализация заданий при старте
export function initializeTasks(profile) {
  const result = buildPersonalTasks(profile);
  const tasksData = {
    tasks: result.tasks || [],
    bonuses: result.bonuses || [],
    lastReset: new Date().toISOString(),
    lastDailyReset: new Date().toDateString(),
    lastWeeklyReset: getStartOfWeek().toISOString()
  };
  localStorage.setItem(getTasksStorageKey(), JSON.stringify(tasksData));
  return tasksData;
}

// Получение начала недели (понедельник)
function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? 6 : day - 1);
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Проверка и обновление ежедневных/недельных заданий
export function checkAndResetTasks() {
  const tasksData = JSON.parse(localStorage.getItem(getTasksStorageKey()) || '{}');
  const today = new Date().toDateString();
  const now = new Date();
  const startOfWeek = getStartOfWeek();
  
  let needsUpdate = false;
  let updatedData = { ...tasksData };
  
  // Проверка ежедневных заданий
  if (tasksData.lastDailyReset !== today) {
    const profile = loadJourneyProfile();
    const newTasks = buildPersonalTasks(profile);
    updatedData.tasks = newTasks.tasks || [];
  }
  
  // Проверка недельных заданий
  if (new Date(tasksData.lastWeeklyReset || 0).toDateString() !== startOfWeek.toDateString()) {
    const profile = loadJourneyProfile();
    const newTasks = buildPersonalTasks(profile);
    updatedData.tasks = newTasks.tasks || [];
    updatedData.lastWeeklyReset = startOfWeek.toISOString();
    needsUpdate = true;
  }
  
  if (needsUpdate) {
    localStorage.setItem(getTasksStorageKey(), JSON.stringify(updatedData));
  }
  
  return updatedData;
}

// Получение текущих заданий
export function getCurrentTasks() {
  const tasksData = checkAndResetTasks();
  return {
    tasks: tasksData.tasks || [],
    bonuses: tasksData.bonuses || []
  };
}

// Выполнение задания
export function completeTask(taskId, taskType = 'tasks') {
  const profile = loadJourneyProfile();
  const tasksData = JSON.parse(localStorage.getItem(getTasksStorageKey()) || '{}');
  const taskKey = taskType === 'tasks' ? 'tasks' : taskType;
  const tasks = tasksData[taskKey] || [];
  
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1 || tasks[taskIndex].completed) {
    return { success: false, error: 'Задание уже выполнено или не найдено' };
  }
  
  const task = tasks[taskIndex];
  const rewardMultiplier = getRewardMultiplier(task.deadline);
  
  // Расчёт награды с учётом множителя (штраф за просрочку)
  const energyReward = Math.floor(task.energyReward * rewardMultiplier);
  const coinReward = Math.floor(task.coinReward * rewardMultiplier);
  const xpReward = Math.floor(task.xpReward * rewardMultiplier);
  
  // Обновление профиля
  const newEnergy = Math.min(profile.maxEnergy, profile.energy + energyReward);
  const newCoins = profile.coins + coinReward;
  const newXp = profile.xp + xpReward;
  
  // Проверка повышения уровня
  let newLevel = profile.level;
  let newLevelLabel = profile.levelLabel;
  if (newXp >= profile.xpToNextLevel) {
    const levelUpResult = levelUp(profile, newXp);
    newLevel = levelUpResult.level;
    newLevelLabel = levelUpResult.levelLabel;
  }
  
  // Отметка задания как выполненного
  tasks[taskIndex].completed = true;
  tasks[taskIndex].completedAt = new Date().toISOString();
  tasksData[taskKey] = tasks;
  localStorage.setItem(getTasksStorageKey(), JSON.stringify(tasksData));
  
  // Обновление статистики
  const today = new Date().toDateString();
  const stats = profile.stats || {};
  stats.dailyCompletions = stats.dailyCompletions || {};
  stats.dailyCompletions[today] = (stats.dailyCompletions[today] || 0) + 1;
  
  // Бонус за выполнение всех ежедневных заданий
  const todayKey = 'dailyTasksBonusDate';
  const todayStr = new Date().toDateString();
  const allCompleted = tasks.every(t => t.completed);
  const bonusAlreadyGiven = localStorage.getItem(todayKey) === todayStr;
  let bonusEnergy = 0;
  let bonusCoins = 0;

  if (allCompleted && !bonusAlreadyGiven) {
    const bonusData = buildPersonalTasks(profile);
    const bonus = bonusData.dailyCompletionBonus || { coins: 25, energy: 20 };
    bonusCoins = bonus.coins || 0;
    bonusEnergy = bonus.energy || 0;
    localStorage.setItem(todayKey, todayStr);
  }

  const finalEnergy = Math.min(profile.maxEnergy, newEnergy + bonusEnergy);
  const finalCoins = newCoins + bonusCoins;

  // Обновление профиля
  updateJourneyProfile({
    energy: finalEnergy,
    coins: finalCoins,
    xp: newXp,
    level: newLevel,
    levelLabel: newLevelLabel,
    stats: stats,
    lastActivityDate: new Date().toISOString()
  });
  
  // Проверка достижений
  checkAchievements();
  
  // Проверка стрика
  updateStreak();
  
  return { 
    success: true, 
    rewards: { energy: energyReward, coins: coinReward, xp: xpReward },
    multiplier: rewardMultiplier
  };
}

// Множитель награды (штраф за просрочку)
function getRewardMultiplier(deadline) {
  if (deadline === 'Сегодня') {
    return 1.0; // Вовремя
  }
  if (deadline.includes('вчера')) {
    return 0.5; // Просрочка на 1 день
  }
  if (deadline.includes('неделю')) {
    return 0.3; // Большая просрочка
  }
  return 0.7; // Просрочка
}

// Повышение уровня
export function levelUp(profile, newXp) {
  const levelMap = {
    'beginner': { next: 'intermediate', label: 'Средний (A2-B1)', xpNeeded: 500 },
    'intermediate': { next: 'advanced', label: 'Продвинутый (B2+)', xpNeeded: 1500 }
  };
  
  const currentLevelInfo = levelMap[profile.level];
  if (currentLevelInfo && newXp >= currentLevelInfo.xpNeeded) {
    return {
      level: currentLevelInfo.next,
      levelLabel: currentLevelInfo.label,
      xp: newXp - currentLevelInfo.xpNeeded,
      xpToNextLevel: 2000
    };
  }
  
  return {
    level: profile.level,
    levelLabel: profile.levelLabel,
    xp: newXp,
    xpToNextLevel: profile.xpToNextLevel
  };
}

// Обновление стрика (дней подряд)
export function updateStreak() {
  const profile = loadJourneyProfile();
  const today = new Date().toDateString();
  const lastLogin = profile.lastLoginDate ? new Date(profile.lastLoginDate).toDateString() : null;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  let newStreak = profile.streakDays || 0;
  
  if (lastLogin === today) {
    // Уже обновляли сегодня
    return newStreak;
  } else if (lastLogin === yesterdayStr) {
    // Продолжение стрика
    newStreak += 1;
  } else {
    // Стрик прерван
    newStreak = 1;
  }
  
  // Бонус за стрик
  if (newStreak === 7) {
    updateJourneyProfile({ coins: (profile.coins || 0) + 100, energy: Math.min(100, (profile.energy || 0) + 50) });
  }
  
  updateJourneyProfile({ 
    streakDays: newStreak, 
    lastLoginDate: new Date().toISOString() 
  });
  
  return newStreak;
}

// Проверка неактивности пользователя
export function checkInactivity() {
  const profile = loadJourneyProfile();
  if (!profile) return { warning: false };
  
  const lastLogin = new Date(profile.lastLoginDate || profile.createdAt);
  const now = new Date();
  const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
  
  if (daysDiff >= 14) {
    // Полный сброс прогресса
    resetProgress();
    return { reset: true, days: daysDiff };
  }
  
  if (daysDiff >= 7) {
    // Предупреждение
    return { warning: true, daysLeft: 14 - daysDiff, daysGone: daysDiff };
  }
  
  return { warning: false, daysLeft: 14 - daysDiff };
}

// Сброс прогресса при долгом отсутствии
export function resetProgress() {
  const oldProfile = loadJourneyProfile();
  const newProfile = {
    ...oldProfile,
    wordsLearned: 0,
    xp: 0,
    level: 'beginner',
    levelLabel: 'Начальный (A0-A1)',
    streakDays: 0,
    completedTopics: [],
    masteredWords: [],
    learningWords: [],
    stats: {
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      totalGamesPlayed: 0,
      totalTimeSpent: 0,
      dailyCompletions: {},
      weeklyCompletions: {}
    }
  };
  saveJourneyProfile(newProfile);
  return newProfile;
}

// Покупка жизни за монеты
export function buyLife() {
  const profile = loadJourneyProfile();
  const LIFE_COST = 50;
  
  if (profile.coins < LIFE_COST) {
    return { success: false, error: 'Недостаточно монет' };
  }
  
  if (profile.lives >= profile.maxLives) {
    return { success: false, error: 'Жизни уже максимальные' };
  }
  
  updateJourneyProfile({
    coins: profile.coins - LIFE_COST,
    lives: profile.lives + 1
  });
  
  return { success: true, newLives: profile.lives + 1 };
}

// Автоматическое восстановление жизней (каждые 3 дня)
export function autoRestoreLives() {
  const profile = loadJourneyProfile();
  const lastRestore = localStorage.getItem('lastLivesRestore');
  const now = new Date();
  
  if (!lastRestore) {
    localStorage.setItem('lastLivesRestore', now.toISOString());
    return;
  }
  
  const daysDiff = Math.floor((now - new Date(lastRestore)) / (1000 * 60 * 60 * 24));
  if (daysDiff >= 3) {
    const restoreCount = Math.min(Math.floor(daysDiff / 3), 2);
    const newLives = Math.min(profile.maxLives, profile.lives + restoreCount);
    updateJourneyProfile({ lives: newLives });
    localStorage.setItem('lastLivesRestore', now.toISOString());
  }
}

// Получение прогресса по этапам
export function getStageProgress() {
  const profile = loadJourneyProfile();
  if (!profile) return null;
  
  const path = LEARNING_PATHS[profile.level];
  if (!path) return null;
  
  const tasksPool = [];
  const bonuses = [];

  // Основной пул заданий для уровня (неделимый набор задач)
  if (currentTopic) {
    tasksPool.push({
      id: `topic_${Date.now()}_1`,
      title: `Изучи тему: ${currentTopic.name}`,
      description: `Выучи ${Math.min(currentTopic.wordsCount, dailyWordCount)} слов по теме "${currentTopic.name}"`,
      type: 'task',
      completed: false,
      energyReward: 10,
      coinReward: 15,
      xpReward: 25,
      topicId: currentTopic.id
    });
  }

  // Добавляем подготовку к следующим темам и общие задания в пул
  if (nextTopics.length > 0) {
    tasksPool.push({
      id: `prep_${Date.now()}_1`,
      title: `Подготовка к теме: ${nextTopics[0]?.name || 'Новая тема'}`,
      description: `Ознакомься с материалами следующей темы (${nextTopics[0]?.wordsCount || 30} слов)`,
      type: 'task',
      completed: false,
      energyReward: 30,
      coinReward: 50,
      xpReward: 80,
      topicId: nextTopics[0]?.id
    });
  }

  tasksPool.push({
    id: `review_${Date.now()}_2`,
    title: 'Повторение пройденного',
    description: `Повтори ${Math.min(50, wordsLearned)} ранее выученных слов`,
    type: 'task',
    completed: false,
    energyReward: 25,
    coinReward: 40,
    xpReward: 60
  });

  tasksPool.push({
    id: `test_${Date.now()}_3`,
    title: 'Итоговый тест',
    description: 'Проверь свои знания',
    type: 'task',
    completed: false,
    energyReward: 35,
    coinReward: 60,
    xpReward: 100
  });

  return { tasks: tasksPool, bonuses };
}

// ========== СИСТЕМА ДОСТИЖЕНИЙ ==========

const ACHIEVEMENTS_LIST = [
  { id: 'first_word', name: 'Первое слово', description: 'Выучить первое слово', condition: (p) => p.wordsLearned >= 1, reward: { coins: 10, energy: 5 } },
  { id: 'word_master_50', name: 'Знаток', description: 'Выучить 50 слов', condition: (p) => p.wordsLearned >= 50, reward: { coins: 50, energy: 20 } },
  { id: 'word_master_100', name: 'Эрудит', description: 'Выучить 100 слов', condition: (p) => p.wordsLearned >= 100, reward: { coins: 100, energy: 50, item: 'smart_hat' } },
  { id: 'word_master_500', name: 'Полиглот', description: 'Выучить 500 слов', condition: (p) => p.wordsLearned >= 500, reward: { coins: 500, title: 'Полиглот' } },
  { id: 'streak_7', name: 'Недельный герой', description: 'Заниматься 7 дней подряд', condition: (p) => p.streakDays >= 7, reward: { coins: 150, energy: 50 } },
  { id: 'streak_30', name: 'Железный человек', description: 'Заниматься 30 дней подряд', condition: (p) => p.streakDays >= 30, reward: { coins: 500, energy: 100, item: 'iron_skin' } },
  { id: 'perfect_day', name: 'Идеальный день', description: 'Выполнить все ежедневные задания', condition: (p) => checkPerfectDay(p), reward: { coins: 50, energy: 30 } },
  { id: 'game_master', name: 'Мастер игр', description: 'Пройди игру без ошибок', condition: (p) => p.stats?.perfectGames > 0, reward: { coins: 100, item: 'master_trophy' } },
  { id: 'level_5', name: 'Первые пять', description: 'Пройти 5 уровней', condition: (p) => (p.completedLevels || 0) >= 5, reward: { coins: 50, energy: 20 } },
  { id: 'level_10', name: 'Десять уровней', description: 'Пройти 10 уровней', condition: (p) => (p.completedLevels || 0) >= 10, reward: { coins: 100, energy: 30 } },
  { id: 'level_20', name: 'Финальный рант', description: 'Пройти 20 уровней', condition: (p) => (p.completedLevels || 0) >= 20, reward: { coins: 250, energy: 50, title: 'Игровой мастер' } },
  { id: 'early_bird', name: 'Ранняя пташка', description: 'Заниматься до 9 утра', condition: (p) => p.stats?.morningSessions > 5, reward: { coins: 30, energy: 15 } },
  { id: 'marathon', name: 'Марафонец', description: 'Выполнить 100 заданий', condition: (p) => (p.stats?.dailyCompletions && Object.values(p.stats?.dailyCompletions).reduce((a,b)=>a+b,0)) >= 100, reward: { coins: 200, title: 'Марафонец' } }
];

export function checkAchievements() {
  const profile = loadJourneyProfile();
  const earnedAchievements = JSON.parse(localStorage.getItem(getAchievementsStorageKey()) || '[]');
  const newAchievements = [];
  
  for (const achievement of ACHIEVEMENTS_LIST) {
    if (!earnedAchievements.includes(achievement.id) && achievement.condition(profile)) {
      newAchievements.push(achievement);
      earnedAchievements.push(achievement.id);
      
      // Выдача награды
      if (achievement.reward.coins) {
        updateJourneyProfile({ coins: (profile.coins || 0) + achievement.reward.coins });
      }
      if (achievement.reward.energy) {
        updateJourneyProfile({ energy: Math.min(100, (profile.energy || 0) + achievement.reward.energy) });
      }
      if (achievement.reward.title) {
        updateJourneyProfile({ title: achievement.reward.title });
      }
    }
  }
  
  if (newAchievements.length) {
    localStorage.setItem(getAchievementsStorageKey(), JSON.stringify(earnedAchievements));
  }
  
  return newAchievements;
}

function checkPerfectDay(profile) {
  const tasks = getCurrentTasks();
  const dailyTasks = tasks.daily || [];
  const allCompleted = dailyTasks.length > 0 && dailyTasks.every(t => t.completed);
  return allCompleted;
}

// Получение всех достижений пользователя
export function getUserAchievements() {
  const earned = JSON.parse(localStorage.getItem(getAchievementsStorageKey()) || '[]');
  return ACHIEVEMENTS_LIST.map(ach => ({
    ...ach,
    earned: earned.includes(ach.id)
  }));
}

// Добавляем выученные слова в профиль
export function addLearnedWords(count) {
  const profile = loadJourneyProfile();
  if (!profile || typeof count !== 'number' || count <= 0) {
    return profile;
  }

  const updatedWordsLearned = (profile.wordsLearned || 0) + count;
  const updatedProfile = updateJourneyProfile({
    wordsLearned: updatedWordsLearned,
    lastActivityDate: new Date().toISOString()
  });

  return updatedProfile;
}

// ========== ОБНОВЛЁННЫЙ buildPersonalTasks ==========

export function buildPersonalTasks(profile) {
  if (!profile) return [];
  
  const level = profile.level || 'beginner';
  const wordsLearned = profile.wordsLearned || 0;
  const dailyMinutes = Number(profile.dailyMinutes || 20);
  
  // Получение текущей темы из learningPath
  const currentTopic = getCurrentPracticeTopic(level, profile.completedTopics || []);
  const nextTopics = getNextPracticeTopics(level, profile.completedTopics || [], 2);
  const estimatedTime = getEstimatedTimeRemaining(level, wordsLearned, dailyMinutes);
  
  // Базовое количество слов для изучения
  const dailyWordCount = level === 'beginner' ? 8 : (level === 'intermediate' ? 12 : 16);
  
  const tasksPool = [];
  const bonuses = [];
  // Создаём ровно 3 ежедневных задания, привязанных к текущей теме при наличии
  const topicName = currentTopic?.name || 'Общая практика';
  const totalItems = Array.isArray(currentTopic?.questions) ? currentTopic.questions.length : (currentTopic?.wordsCount || 0);
  const shortReq = Math.min(3, Math.max(1, Math.floor(totalItems * 0.3)));
  const repeatReq = Math.min(6, Math.max(shortReq + 1, Math.floor(totalItems * 0.6)));
  const deepReq = Math.max(totalItems, 1);

  for (let i = 0; i < 3; i++) {
    tasksPool.push({
      id: `daily_${Date.now()}_${i}`,
      title: i === 0 ? `Короткая практика: ${topicName}` : (i === 1 ? `Повторение: ${topicName}` : `Углублённая практика: ${topicName}`),
      description: i === 0 ? 'Короткая практика по теме' : (i === 1 ? 'Повтори ключевые слова темы' : 'Проверь знания по теме в тесте'),
      type: 'daily',
      completed: false,
      energyReward: i === 2 ? 20 : 10,
      coinReward: i === 2 ? 30 : 10,
      xpReward: i === 2 ? 50 : 15,
      deadline: 'Сегодня',
      topicId: currentTopic?.id || null,
      // Порог засчёта — количество разблокированных/отвеченных элементов темы
      requiredForShort: shortReq,
      requiredForRepeat: repeatReq,
      requiredForDeep: deepReq
    });
  }

  // Бонус за выполнение всех 3 ежедневных заданий
  const dailyCompletionBonus = { coins: 25, energy: 20 };

  return { tasks: tasksPool, bonuses: [], dailyCompletionBonus };
}

// Экспорт всех функций для использования в компонентах
export default {
  getJourneyStorageKey,
  getAchievementsStorageKey,
  getTasksStorageKey,
  loadJourneyProfile,
  saveJourneyProfile,
  updateJourneyProfile,
  createNewProfile,
  buildPersonalTasks,
  getCurrentTasks,
  completeTask,
  checkAndResetTasks,
  checkInactivity,
  resetProgress,
  buyLife,
  autoRestoreLives,
  updateStreak,
  addLearnedWords,
  getStageProgress,
  checkAchievements,
  getUserAchievements,
  levelUp,
  getGoalStageFromDates
};