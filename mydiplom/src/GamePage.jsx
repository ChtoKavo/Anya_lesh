import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GamePage.css';
import Logo from './Logo';
import Footer from './Footer';
import { getGameState as fetchGameState, saveGameState as saveGameStateApi } from './apiClient';
import { loadJourneyProfile, updateJourneyProfile, checkAchievements } from './userJourney';

const GamePage = () => {
  const navigate = useNavigate();
  
  const [cards, setCards] = useState([]);
  const [flippedIndexes, setFlippedIndexes] = useState([]);
  const [matchedIndexes, setMatchedIndexes] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [score, setScore] = useState(0);
  const timerRef = React.useRef(Date.now());
  const [coins, setCoins] = useState(() => loadJourneyProfile()?.coins ?? 1250);
  const [energy, setEnergy] = useState(() => loadJourneyProfile()?.energy ?? 85);
  const [clouds, setClouds] = useState([]);
  const [canFlip, setCanFlip] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(() => {
    const saved = localStorage.getItem(`memoryGame_${(localStorage.getItem('userEmail') || 'guest').trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_')}`);
    return saved ? JSON.parse(saved).currentLevel || 1 : 1;
  });
  const [unlockedLevels, setUnlockedLevels] = useState(() => {
    const saved = localStorage.getItem(`memoryGame_${(localStorage.getItem('userEmail') || 'guest').trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_')}`);
    return saved ? JSON.parse(saved).unlockedLevels || [1] : [1];
  });
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  const getGameStorageKey = () => {
    const rawEmail = localStorage.getItem('userEmail') || 'guest';
    const email = rawEmail.trim().toLowerCase() || 'guest';
    return `memoryGame_${email.replace(/[^a-z0-9@._-]/g, '_')}`;
  };

  const loadGameState = () => {
    try {
      const saved = localStorage.getItem(getGameStorageKey());
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const saveLocalGameState = (state) => {
    localStorage.setItem(getGameStorageKey(), JSON.stringify(state));
  };

  const saveRemoteGameState = async (state) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      await saveGameStateApi(state);
    } catch (error) {
      // Не критично, сохраняем локально и продолжаем
      // eslint-disable-next-line no-console
      console.warn('Remote save game state failed', error?.message || error);
    }
  };

  const persistGameState = (state) => {
    const currentState = loadGameState() || {};
    const nextState = { ...currentState, ...state };
    saveLocalGameState(nextState);
    if (localStorage.getItem('authToken')) {
      saveRemoteGameState(nextState);
    }
  };

  // Разделы слов по уровням
  const wordLevels = {
    1: {
      name: 'Алфавит: основа',
      pairs: [
        { id: 1, rus: 'Кошка', eng: 'cat' },
        { id: 2, rus: 'Собака', eng: 'dog' },
        { id: 3, rus: 'Солнце', eng: 'sun' },
        { id: 4, rus: 'Книга', eng: 'book' }
      ]
    },
    2: {
      name: 'Алфавит: предметы',
      pairs: [
        { id: 5, rus: 'Дом', eng: 'house' },
        { id: 6, rus: 'Машина', eng: 'car' },
        { id: 7, rus: 'Красный', eng: 'red' },
        { id: 8, rus: 'Хороший', eng: 'good' }
      ]
    },
    3: {
      name: 'Базовые существительные',
      pairs: [
        { id: 9, rus: 'Стул', eng: 'chair' },
        { id: 10, rus: 'Стол', eng: 'table' },
        { id: 11, rus: 'Лампа', eng: 'lamp' },
        { id: 12, rus: 'Ребёнок', eng: 'child' },
        { id: 13, rus: 'Время', eng: 'time' }
      ]
    },
    4: {
      name: 'Простые глаголы',
      pairs: [
        { id: 14, rus: 'Читать', eng: 'read' },
        { id: 15, rus: 'Писать', eng: 'write' },
        { id: 16, rus: 'Есть', eng: 'eat' },
        { id: 17, rus: 'Пить', eng: 'drink' },
        { id: 18, rus: 'Спать', eng: 'sleep' }
      ]
    },
    5: {
      name: 'Ежедневные прилагательные',
      pairs: [
        { id: 19, rus: 'Маленький', eng: 'small' },
        { id: 20, rus: 'Большой', eng: 'big' },
        { id: 21, rus: 'Старый', eng: 'old' },
        { id: 22, rus: 'Новый', eng: 'new' },
        { id: 23, rus: 'Тёплый', eng: 'warm' },
        { id: 24, rus: 'Холодный', eng: 'cold' }
      ]
    },
    6: {
      name: 'Семья и друзья',
      pairs: [
        { id: 25, rus: 'Мама', eng: 'mother' },
        { id: 26, rus: 'Папа', eng: 'father' },
        { id: 27, rus: 'Брат', eng: 'brother' },
        { id: 28, rus: 'Сестра', eng: 'sister' },
        { id: 29, rus: 'Семья', eng: 'family' },
        { id: 30, rus: 'Друг', eng: 'friend' }
      ]
    },
    7: {
      name: 'Еда и напитки',
      pairs: [
        { id: 31, rus: 'Яблоко', eng: 'apple' },
        { id: 32, rus: 'Хлеб', eng: 'bread' },
        { id: 33, rus: 'Молоко', eng: 'milk' },
        { id: 34, rus: 'Сыр', eng: 'cheese' },
        { id: 35, rus: 'Чай', eng: 'tea' },
        { id: 36, rus: 'Кофе', eng: 'coffee' }
      ]
    },
    8: {
      name: 'Школьные слова',
      pairs: [
        { id: 37, rus: 'Учитель', eng: 'teacher' },
        { id: 38, rus: 'Урок', eng: 'lesson' },
        { id: 39, rus: 'Учебник', eng: 'textbook' },
        { id: 40, rus: 'Ручка', eng: 'pen' },
        { id: 41, rus: 'Тетрадь', eng: 'notebook' },
        { id: 42, rus: 'Письмо', eng: 'letter' }
      ]
    },
    9: {
      name: 'Путешествия',
      pairs: [
        { id: 43, rus: 'Аэропорт', eng: 'airport' },
        { id: 44, rus: 'Багаж', eng: 'luggage' },
        { id: 45, rus: 'Самолёт', eng: 'plane' },
        { id: 46, rus: 'Поезд', eng: 'train' },
        { id: 47, rus: 'Путешествие', eng: 'travel' },
        { id: 48, rus: 'Паспорт', eng: 'passport' }
      ]
    },
    10: {
      name: 'Городская жизнь',
      pairs: [
        { id: 49, rus: 'Магазин', eng: 'shop' },
        { id: 50, rus: 'Улица', eng: 'street' },
        { id: 51, rus: 'Кафе', eng: 'cafe' },
        { id: 52, rus: 'Город', eng: 'city' },
        { id: 53, rus: 'Площадь', eng: 'square' },
        { id: 54, rus: 'Парк', eng: 'park' }
      ]
    },
    11: {
      name: 'Природа',
      pairs: [
        { id: 55, rus: 'Дерево', eng: 'tree' },
        { id: 56, rus: 'Река', eng: 'river' },
        { id: 57, rus: 'Гора', eng: 'mountain' },
        { id: 58, rus: 'Озеро', eng: 'lake' },
        { id: 59, rus: 'Море', eng: 'sea' },
        { id: 60, rus: 'Лес', eng: 'forest' }
      ]
    },
    12: {
      name: 'Погода',
      pairs: [
        { id: 61, rus: 'Дождь', eng: 'rain' },
        { id: 62, rus: 'Снег', eng: 'snow' },
        { id: 63, rus: 'Облако', eng: 'cloud' },
        { id: 64, rus: 'Ветер', eng: 'wind' },
        { id: 65, rus: 'Жара', eng: 'heat' },
        { id: 66, rus: 'Холод', eng: 'cold' }
      ]
    },
    13: {
      name: 'Хобби и спорт',
      pairs: [
        { id: 67, rus: 'Спорт', eng: 'sport' },
        { id: 68, rus: 'Футбол', eng: 'football' },
        { id: 69, rus: 'Танец', eng: 'dance' },
        { id: 70, rus: 'Музыка', eng: 'music' },
        { id: 71, rus: 'Рисование', eng: 'drawing' },
        { id: 72, rus: 'Фильм', eng: 'movie' }
      ]
    },
    14: {
      name: 'Работа и бизнес',
      pairs: [
        { id: 73, rus: 'Офис', eng: 'office' },
        { id: 74, rus: 'Работа', eng: 'work' },
        { id: 75, rus: 'Деньги', eng: 'money' },
        { id: 76, rus: 'Проект', eng: 'project' },
        { id: 77, rus: 'Встреча', eng: 'meeting' },
        { id: 78, rus: 'Клиент', eng: 'client' }
      ]
    },
    15: {
      name: 'Здоровье и чувства',
      pairs: [
        { id: 79, rus: 'Боль', eng: 'pain' },
        { id: 80, rus: 'Радость', eng: 'joy' },
        { id: 81, rus: 'Улыбка', eng: 'smile' },
        { id: 82, rus: 'Стресс', eng: 'stress' },
        { id: 83, rus: 'Здоровье', eng: 'health' },
        { id: 84, rus: 'Сон', eng: 'sleep' }
      ]
    },
    16: {
      name: 'Технологии',
      pairs: [
        { id: 85, rus: 'Компьютер', eng: 'computer' },
        { id: 86, rus: 'Интернет', eng: 'internet' },
        { id: 87, rus: 'Телефон', eng: 'phone' },
        { id: 88, rus: 'Приложение', eng: 'app' },
        { id: 89, rus: 'Сообщение', eng: 'message' },
        { id: 90, rus: 'Пароль', eng: 'password' }
      ]
    },
    17: {
      name: 'Образование',
      pairs: [
        { id: 91, rus: 'Университет', eng: 'university' },
        { id: 92, rus: 'Экзамен', eng: 'exam' },
        { id: 93, rus: 'Ученик', eng: 'student' },
        { id: 94, rus: 'Курс', eng: 'course' },
        { id: 95, rus: 'Знания', eng: 'knowledge' },
        { id: 96, rus: 'Наука', eng: 'science' }
      ]
    },
    18: {
      name: 'Культура и искусство',
      pairs: [
        { id: 97, rus: 'Картина', eng: 'painting' },
        { id: 98, rus: 'Театр', eng: 'theatre' },
        { id: 99, rus: 'Музыкант', eng: 'musician' },
        { id: 100, rus: 'Поэзия', eng: 'poetry' },
        { id: 101, rus: 'Литература', eng: 'literature' },
        { id: 102, rus: 'Выставка', eng: 'exhibition' }
      ]
    },
    19: {
      name: 'Абстрактные понятия',
      pairs: [
        { id: 103, rus: 'Мечта', eng: 'dream' },
        { id: 104, rus: 'Идея', eng: 'idea' },
        { id: 105, rus: 'Уверенность', eng: 'confidence' },
        { id: 106, rus: 'Результат', eng: 'result' },
        { id: 107, rus: 'Возможность', eng: 'opportunity' },
        { id: 108, rus: 'Успех', eng: 'success' }
      ]
    },
    20: {
      name: 'Продвинутые фразы',
      pairs: [
        { id: 109, rus: 'Сколько это стоит?', eng: 'How much does this cost?' },
        { id: 110, rus: 'Я хочу забронировать столик', eng: 'I want to book a table' },
        { id: 111, rus: 'Где находится ближайший банк?', eng: 'Where is the nearest bank?' },
        { id: 112, rus: 'Я учусь английскому каждый день', eng: 'I study English every day' },
        { id: 113, rus: 'Это лучший вариант для меня', eng: 'This is the best option for me' },
        { id: 114, rus: 'Спасибо за вашу помощь', eng: 'Thank you for your help' }
      ]
    }
  };
  
  // Облака
  useEffect(() => {
    const cloudPositions = [
      { top: '5%', left: '2%', width: '180px', opacity: 0.7 },
      { top: '15%', right: '3%', width: '220px', opacity: 0.6 },
      { bottom: '20%', left: '5%', width: '150px', opacity: 0.8 },
      { bottom: '10%', right: '8%', width: '280px', opacity: 0.5 },
      { top: '40%', left: '10%', width: '120px', opacity: 0.9 },
      { top: '60%', right: '12%', width: '200px', opacity: 0.6 }
    ];
    setClouds(cloudPositions);
  }, []);
  
  // Загрузка прогресса из localStorage
  useEffect(() => {
    const localState = loadGameState() || {};
    const journey = loadJourneyProfile() || {};

    const applyState = (state, backendCoins, backendEnergy) => {
      if (state?.currentLevel) setCurrentLevel(state.currentLevel);
      if (Array.isArray(state?.unlockedLevels)) setUnlockedLevels(state.unlockedLevels);
      // Load coins and energy from backend first (most up-to-date), then from journey, then from state
      if (typeof backendCoins === 'number') {
        setCoins(backendCoins);
      } else if (typeof journey?.coins === 'number') {
        setCoins(journey.coins);
      } else if (typeof state?.coins === 'number') {
        setCoins(state.coins);
      }
      if (typeof backendEnergy === 'number') {
        setEnergy(backendEnergy);
      } else if (typeof journey?.energy === 'number') {
        setEnergy(journey.energy);
      } else if (typeof state?.energy === 'number') {
        setEnergy(state.energy);
      }
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      // Load backend coins and energy
      import('./apiClient').then(({ fetchProfile }) => {
        fetchProfile().then((data) => {
          const backendCoins = data?.progress?.coins;
          const backendEnergy = data?.progress?.energy;
          fetchGameState()
            .then((data) => {
              const remoteState = data?.state || {};
              const mergedState = { ...localState, ...remoteState };
              saveLocalGameState(mergedState);
              applyState(mergedState, backendCoins, backendEnergy);
            })
            .catch(() => {
              applyState(localState, backendCoins, backendEnergy);
            });
        }).catch(() => {
          fetchGameState()
            .then((data) => {
              const remoteState = data?.state || {};
              const mergedState = { ...localState, ...remoteState };
              saveLocalGameState(mergedState);
              applyState(mergedState);
            })
            .catch(() => {
              applyState(localState);
            });
        });
      }).catch(err => console.warn('Failed to import apiClient', err));
    } else {
      applyState(localState);
    }
  }, []);

  useEffect(() => {
    persistGameState({
      currentLevel,
      unlockedLevels,
      coins,
      energy
    });
  }, [currentLevel, unlockedLevels, coins, energy]);
  
  // Инициализация игры для текущего уровня
  const initGame = (level = currentLevel) => {
    const levelData = wordLevels[level];
    if (!levelData) return;
    
    // Создаем карточки
    let newCards = [];
    levelData.pairs.forEach((pair) => {
      newCards.push({
        id: Math.random(),
        text: pair.rus,
        pairId: pair.id,
        type: 'rus'
      });
      newCards.push({
        id: Math.random(),
        text: pair.eng,
        pairId: pair.id,
        type: 'eng'
      });
    });
    
    // Перемешиваем
    newCards = newCards.sort(() => Math.random() - 0.5);
    
    setCards(newCards);
    setFlippedIndexes([]);
    setMatchedIndexes([]);
    setMoves(0);
    setScore(0);
    setGameFinished(false);
    setGameStarted(true);
    timerRef.current = Date.now();
    setCanFlip(true);
    setShowLevelComplete(false);
  };

  // Сброс уровня: заново запускаем текущую игру
  // без изменения общего прогресса (монеты, энергия, открытые уровни)
  const resetLevel = () => {
    initGame(currentLevel);
  };

  const unlockNextLevel = (level) => {
    const nextLevel = level + 1;
    if (nextLevel <= Object.keys(wordLevels).length && !unlockedLevels.includes(nextLevel)) {
      const newUnlocked = [...unlockedLevels, nextLevel];
      setUnlockedLevels(newUnlocked);
      persistGameState({ unlockedLevels: newUnlocked });
    }
  };

  const saveCurrentLevelProgress = (level) => {
    const currentState = loadGameState() || {};
    const newCurrentLevel = Math.max(level, currentState.currentLevel || 1);
    persistGameState({ currentLevel: newCurrentLevel });
  };
  
  // Проверка на завершение уровня
  useEffect(() => {
    if (matchedIndexes.length === cards.length && cards.length > 0 && gameStarted) {
      const levelScore = score;
      const bonusCoins = Math.floor(levelScore * 1.5) - 5;

      setCoins(prev => prev + bonusCoins);
      unlockNextLevel(currentLevel);
      saveCurrentLevelProgress(currentLevel);
      persistGameState({ lastCompletedLevel: currentLevel });
      const profile = loadJourneyProfile() || {};
      const completedLevels = Math.max(profile.completedLevels || 0, currentLevel);
      const newCoins = (profile.coins || 0) + bonusCoins;
      const newEnergy = Math.min(100, (profile.energy || 85) + energy - 85);
      updateJourneyProfile({ currentLevel, completedLevels, coins: newCoins, energy: Math.max(0, energy) });
      
      // Save progress to backend
      import('./apiClient').then(({ submitAnswer }) => {
        submitAnswer({
          task_id: currentLevel,
          stage_id: 'memory-game',
          answer_text: `score: ${levelScore}, moves: ${moves}`,
          is_correct: true,
          time_spent_seconds: Math.round((Date.now() - timerRef.current) / 1000) || 30
        }).catch(err => console.warn('Failed to save game stats to backend', err));
      }).catch(err => console.warn('Failed to import apiClient', err));

      checkAchievements();
      setShowLevelComplete(true);
      setGameFinished(true);
      setGameStarted(false);
    }
  }, [matchedIndexes, cards, gameStarted]);
  
  const handleCardClick = (index) => {
    if (!gameStarted || gameFinished) return;
    if (!canFlip) return;
    if (matchedIndexes.includes(index)) return;
    if (flippedIndexes.includes(index)) return;
    if (flippedIndexes.length === 2) return;
    
    const newFlipped = [...flippedIndexes, index];
    setFlippedIndexes(newFlipped);
    
    if (newFlipped.length === 2) {
      setCanFlip(false);
      setMoves(prev => prev + 1);
      
      const card1 = cards[newFlipped[0]];
      const card2 = cards[newFlipped[1]];
      
      if (card1.pairId === card2.pairId) {
        // Правильная пара
        setTimeout(() => {
          setMatchedIndexes(prev => [...prev, newFlipped[0], newFlipped[1]]);
          setFlippedIndexes([]);
          const pointsEarned = 5;
          setScore(prev => prev + pointsEarned);
          setCoins(prev => prev + pointsEarned);
          setEnergy(prev => Math.min(100, prev + 2));
          setCanFlip(true);
        }, 500);
      } else {
        // Неправильная пара
        setTimeout(() => {
          setFlippedIndexes([]);
          setCanFlip(true);
          setEnergy(prev => Math.max(0, prev - 1));
        }, 1000);
      }
    }
  };
  
  const nextLevel = () => {
    const nextLevelNum = currentLevel + 1;
    setCurrentLevel(nextLevelNum);
    initGame(nextLevelNum);
  };
  
  const selectLevel = (level) => {
    if (unlockedLevels.includes(level)) {
      setCurrentLevel(level);
      initGame(level);
    }
  };
  
  const handleGoToDashboard = () => navigate('/dashboard');
  const handleGoToCharacter = () => navigate('/pet');
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const handleGoToPractice = () => navigate('/practice');
  const handleGoToTasks = () => navigate('/tasks');
  const handleGoToFriends = () => navigate('/friends');
  const handleGoToProfile = () => navigate('/profile');
  
  const totalPairs = cards.length / 2;
  const foundPairs = matchedIndexes.length / 2;
  const currentLevelData = wordLevels[currentLevel];
  
  return (
    <div className="game-page-container">
      <div className="background-image" style={{ backgroundImage: `url('/background.jpg')` }}></div>
      
      {clouds.map((cloud, index) => (
        <img key={index} src="/cloud.png" alt="cloud" className="floating-cloud" style={{
          position: 'fixed', top: cloud.top, left: cloud.left,
          width: cloud.width, opacity: cloud.opacity, zIndex: 0, pointerEvents: 'none'
        }} />
      ))}
      
      <header className="game-header header">
        <div className="header-container">
          <Logo className="game-logo clickable-logo" alt="Logo" onClick={handleGoToDashboard} role="button" tabIndex={0} />
          <nav className="game-nav">
            <button className="nav-link" onClick={handleGoToCharacter}>Персонаж</button>
            <button className="nav-link" onClick={handleGoToPractice}>Урок</button>
            <button className="nav-link" onClick={handleGoToTasks}>Задания</button>
            <button className="nav-link" onClick={handleGoToFriends}>Друзья</button>
            {isAdmin && (
              <button className="nav-link" onClick={() => navigate('/admin')}>Админка</button>
            )}
          </nav>
          <button className="auth-btn" onClick={handleGoToProfile}>Вход / Профиль</button>
        </div>
      </header>
      
      <main className="game-main">
        <div className="game-content">
          
          {/* Ресурсы */}
          <div className="game-resources">
            <div className="resource-card">
              <img src="/energy2.png" alt="energy" className="resource-icon" />
              <div className="resource-info">
                <span className="resource-label">Энергия</span>
                <span className="resource-value">{Math.floor(energy)}/100</span>
              </div>
            </div>
            <div className="resource-card">
              <img src="/money.png" alt="coins" className="resource-icon" />
              <div className="resource-info">
                <span className="resource-label">Монеты</span>
                <span className="resource-value">{coins}</span>
              </div>
            </div>
          </div>
          
          {/* Выбор уровня */}
          <div className="level-selector">
            <h3>Выбор уровня</h3>
            <div className="level-buttons">
              {Object.keys(wordLevels).map(level => {
                const levelNum = parseInt(level);
                const isUnlocked = unlockedLevels.includes(levelNum);
                const isCurrent = currentLevel === levelNum;
                return (
                  <button
                    key={level}
                    className={`level-btn ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}`}
                    onClick={() => selectLevel(levelNum)}
                    disabled={!isUnlocked}
                  >
                    {levelNum}
                    {!isUnlocked && <span className="lock-icon">Locked</span>}
                  </button>
                );
              })}
            </div>
            {currentLevelData && (
              <div className="level-info">
                <span className="level-name">{currentLevelData.name}</span>
                <span className="level-pairs">{currentLevelData.pairs.length} пар слов</span>
              </div>
            )}
          </div>
          
          {/* Игровая зона */}
          <div className="game-play-area">
            {!gameStarted && !showLevelComplete ? (
              <div className="game-start-screen">
                <div className="start-card">
                  <h2>Memory Match</h2>
                  <p>Найди пары слов</p>
                  <div className="game-rules-card">
                    <h3>Правила игры</h3>
                    <ul>
                      <li>Все карточки закрыты знаком вопроса</li>
                      <li>Найди пару: русское слово — английский перевод</li>
                      <li>Правильная пара приносит монеты и энергию</li>
                      <li>Неправильная пара снижает энергию</li>
                      <li>Пройди уровень, чтобы открыть следующий</li>
                    </ul>
                  </div>
                  <button className="start-game-button" onClick={() => initGame()}>
                    Начать уровень {currentLevel}
                  </button>
                </div>
              </div>
            ) : gameStarted && (
              <>
                {/* Статистика */}
                <div className="game-stats-panel">
                  <div className="stat-item">
                    <span className="stat-label">Найдено пар</span>
                    <span className="stat-number">{foundPairs}/{totalPairs}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Ходов</span>
                    <span className="stat-number">{moves}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Счёт</span>
                    <span className="stat-number">{score}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Уровень</span>
                    <span className="stat-number">{currentLevel}/{Object.keys(wordLevels).length}</span>
                  </div>
                </div>
                
                {/* Игровое поле - динамическая сетка */}
                <div className={`memory-grid grid-${totalPairs}`}>
                  {cards.map((card, index) => (
                    <div
                      key={card.id}
                      className={`memory-card 
                        ${flippedIndexes.includes(index) ? 'flipped' : ''}
                        ${matchedIndexes.includes(index) ? 'matched' : ''}
                      `}
                      onClick={() => handleCardClick(index)}
                    >
                      <div className="card-inner">
                        <div className="card-front">
                          <span className="card-text">{card.text}</span>
                          <span className="card-type">{card.type === 'rus' ? 'rus' : 'eng'}</span>
                        </div>
                        <div className="card-back">
                          <span className="card-question">?</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Кнопки управления */}
                <div className="game-controls">
                  <button className="reset-btn" onClick={resetLevel}>
                    Сбросить уровень
                  </button>
                </div>
              </>
            )}
            
            {/* Экран завершения уровня */}
            {showLevelComplete && (
              <div className="result-card win">
                <h2>Уровень {currentLevel} пройден</h2>
                <p className="level-complete-name">{wordLevels[currentLevel].name}</p>
                <p>Найдено все {totalPairs} пар</p>
                <p className="result-score">Счёт: {score} очков</p>
                <p className="result-score">Бонус: +{Math.floor(score * 1.5)} монет</p>
                <p className="result-moves">Ходов сделано: {moves}</p>
                
                <div className="result-buttons">
                  {currentLevel < Object.keys(wordLevels).length ? (
                    <button className="play-again" onClick={nextLevel}>
                      Следующий уровень ({currentLevel + 1})
                    </button>
                  ) : (
                    <button className="play-again" onClick={() => {
                      setShowLevelComplete(false);
                      setGameStarted(false);
                    }}>
                      Игра завершена
                    </button>
                  )}
                  <button className="exit-game" onClick={handleGoToDashboard}>
                    На главную
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Подсказка */}
          <div className="game-hint">
            Кликните на карточки, чтобы открыть их. Найдите пары: русское слово и английский перевод.
          </div>
        </div>
      </main>
      
      <Footer wrapperClass="game-footer" />
    </div>
  );
};

export default GamePage;