export const LEARNING_PATHS = {
  beginner: {
    id: 'beginner',
    label: 'Начальный (A0-A1)',
    description: 'С нуля до простых фраз',
    defaultMonths: 12,
    minMonths: 6,
    maxMonths: 18,
    totalWordsTarget: 400,
    stages: [
      {
        id: 1,
        name: 'Фундамент: фонетика и база',
        monthsRange: [1, 2],
        color: '#4CAF50',
        topics: [
          { id: 'alphabet', name: 'Алфавит и звуки', wordsCount: 26, type: 'phonetics', completed: false, questions: generateAlphabetQuestions() },
          { id: 'reading_rules', name: 'Правила чтения', wordsCount: 20, type: 'reading', completed: false, questions: generateReadingQuestions() },
          { id: 'basic_verbs', name: 'Глаголы to be, to have, to do', wordsCount: 15, type: 'grammar', completed: false, questions: generateBasicVerbsQuestions() },
          { id: 'food_family', name: 'Лексика: еда и семья', wordsCount: 50, type: 'vocabulary', completed: false, questions: generateFoodFamilyQuestions() },
          { id: 'colors_pronouns', name: 'Цвета и местоимения', wordsCount: 40, type: 'vocabulary', completed: false, questions: generateColorsPronounsQuestions() },
          { id: 'adjectives', name: 'Прилагательные (big/small)', wordsCount: 30, type: 'vocabulary', completed: false, questions: generateAdjectivesQuestions() }
        ],
        totalWordsTarget: 180
      },
      {
        id: 2,
        name: 'Настоящее и прошлое + диалоги',
        monthsRange: [3, 4],
        color: '#2196F3',
        topics: [
          { id: 'present_simple', name: 'Present Simple', wordsCount: 20, type: 'grammar', completed: false, questions: generatePresentSimpleQuestions() },
          { id: 'present_continuous', name: 'Present Continuous', wordsCount: 15, type: 'grammar', completed: false, questions: generatePresentContinuousQuestions() },
          { id: 'past_simple', name: 'Past Simple (неправильные глаголы)', wordsCount: 50, type: 'vocabulary', completed: false, questions: generatePastSimpleQuestions() },
          { id: 'future_tenses', name: 'Будущее время: will + going to', wordsCount: 15, type: 'grammar', completed: false, questions: generateFutureQuestions() },
          { id: 'modal_verbs', name: 'Модальные глаголы: can, must, should', wordsCount: 10, type: 'grammar', completed: false, questions: generateModalQuestions() },
          { id: 'daily_routine', name: 'Описание дня и диалоги', wordsCount: 40, type: 'vocabulary', completed: false, questions: generateDailyRoutineQuestions() }
        ],
        totalWordsTarget: 150
      },
      {
        id: 3,
        name: 'Осознанное настоящее и будущее + чтение',
        monthsRange: [5, 6],
        color: '#FF9800',
        topics: [
          { id: 'present_perfect', name: 'Present Perfect vs Past Simple', wordsCount: 20, type: 'grammar', completed: false, questions: generatePresentPerfectQuestions() },
          { id: 'comparisons', name: 'Степени сравнения прилагательных', wordsCount: 15, type: 'grammar', completed: false, questions: generateComparisonQuestions() },
          { id: 'prepositions', name: 'Предлоги времени и места', wordsCount: 20, type: 'grammar', completed: false, questions: generatePrepositionQuestions() },
          { id: 'reading_books', name: 'Чтение адаптированных книг', wordsCount: 50, type: 'reading', completed: false, questions: generateReadingBookQuestions() },
          { id: 'travel_topic', name: 'Тема: Путешествия', wordsCount: 40, type: 'vocabulary', completed: false, questions: generateTravelQuestions() },
          { id: 'writing_posts', name: 'Написание постов о путешествиях', wordsCount: 30, type: 'writing', completed: false, questions: generateWritingQuestions() }
        ],
        totalWordsTarget: 175
      },
      {
        id: 4,
        name: 'Плавная речь и письмо',
        monthsRange: [7, 9],
        color: '#9C27B0',
        topics: [
          { id: 'conditionals', name: 'Условные предложения 0 и 1 типа', wordsCount: 15, type: 'grammar', completed: false, questions: generateConditionalsQuestions() },
          { id: 'passive_voice', name: 'Пассивный залог', wordsCount: 15, type: 'grammar', completed: false, questions: generatePassiveQuestions() },
          { id: 'phrasal_verbs', name: 'Фразовые глаголы', wordsCount: 30, type: 'vocabulary', completed: false, questions: generatePhrasalVerbsQuestions() },
          { id: 'word_formation', name: 'Словообразование', wordsCount: 25, type: 'vocabulary', completed: false, questions: generateWordFormationQuestions() },
          { id: 'listening', name: 'Аудирование: подкасты и сериалы', wordsCount: 20, type: 'listening', completed: false, questions: generateListeningQuestions() },
          { id: 'speaking_stories', name: 'Рассказ историй без подготовки', wordsCount: 20, type: 'speaking', completed: false, questions: generateSpeakingQuestions() }
        ],
        totalWordsTarget: 125
      },
      {
        id: 5,
        name: 'Выход на уверенный B1',
        monthsRange: [10, 12],
        color: '#E91E63',
        topics: [
          { id: 'all_tenses', name: 'Все времена активного залога', wordsCount: 25, type: 'grammar', completed: false, questions: generateAllTensesQuestions() },
          { id: 'past_modals', name: 'Модальные глаголы в прошлом', wordsCount: 15, type: 'grammar', completed: false, questions: generatePastModalsQuestions() },
          { id: 'reported_speech', name: 'Косвенная речь', wordsCount: 15, type: 'grammar', completed: false, questions: generateReportedSpeechQuestions() },
          { id: 'complex_conjunctions', name: 'Сложные союзы', wordsCount: 15, type: 'grammar', completed: false, questions: generateConjunctionsQuestions() },
          { id: 'advanced_vocab', name: 'Лексика: работа, здоровье, новости', wordsCount: 60, type: 'vocabulary', completed: false, questions: generateAdvancedVocabQuestions() },
          { id: 'news_reading', name: 'Чтение новостей и дискуссии', wordsCount: 30, type: 'reading', completed: false, questions: generateNewsQuestions() }
        ],
        totalWordsTarget: 160
      }
    ]
  },
  
  intermediate: {
    id: 'intermediate',
    label: 'Средний (A2-B1)',
    description: 'Уже есть база, нужно прокачать разговорные навыки',
    defaultMonths: 8,
    minMonths: 4,
    maxMonths: 12,
    totalWordsTarget: 800,
    stages: [
      {
        id: 1,
        name: 'Повторение базы и разговорные фразы',
        monthsRange: [1, 2],
        color: '#4CAF50',
        topics: [
          { id: 'review_tenses', name: 'Повторение времен (Present, Past, Future)', wordsCount: 30, type: 'grammar', completed: false, questions: generateReviewTensesQuestions() },
          { id: 'everyday_phrases', name: 'Разговорные фразы для ежедневного общения', wordsCount: 50, type: 'vocabulary', completed: false, questions: generateEverydayPhrasesQuestions() },
          { id: 'phone_call', name: 'Разговор по телефону', wordsCount: 25, type: 'speaking', completed: false, questions: generatePhoneCallQuestions() }
        ],
        totalWordsTarget: 105
      },
      {
        id: 2,
        name: 'Расширение словарного запаса',
        monthsRange: [3, 5],
        color: '#2196F3',
        topics: [
          { id: 'work_vocab', name: 'Лексика: работа и карьера', wordsCount: 60, type: 'vocabulary', completed: false, questions: generateWorkVocabQuestions() },
          { id: 'health_vocab', name: 'Лексика: здоровье и спорт', wordsCount: 50, type: 'vocabulary', completed: false, questions: generateHealthVocabQuestions() },
          { id: 'education_vocab', name: 'Лексика: образование', wordsCount: 40, type: 'vocabulary', completed: false, questions: generateEducationVocabQuestions() }
        ],
        totalWordsTarget: 150
      },
      {
        id: 3,
        name: 'Грамматика для уверенной речи',
        monthsRange: [6, 8],
        color: '#FF9800',
        topics: [
          { id: 'conditionals_23', name: 'Условные предложения 2 и 3 типа', wordsCount: 20, type: 'grammar', completed: false, questions: generateConditionals23Questions() },
          { id: 'passive_advanced', name: 'Пассивный залог в разных временах', wordsCount: 20, type: 'grammar', completed: false, questions: generatePassiveAdvancedQuestions() },
          { id: 'phrasal_verbs_advanced', name: 'Продвинутые фразовые глаголы', wordsCount: 40, type: 'vocabulary', completed: false, questions: generateAdvancedPhrasalQuestions() }
        ],
        totalWordsTarget: 80
      }
    ]
  },
  
  advanced: {
    id: 'advanced',
    label: 'Продвинутый (B2+)',
    description: 'Свободное владение, нюансы и идиомы',
    defaultMonths: 6,
    minMonths: 3,
    maxMonths: 10,
    totalWordsTarget: 1200,
    stages: [
      {
        id: 1,
        name: 'Нюансы грамматики и стилистика',
        monthsRange: [1, 2],
        color: '#4CAF50',
        topics: [
          { id: 'inversion', name: 'Инверсия в английском', wordsCount: 15, type: 'grammar', completed: false, questions: generateInversionQuestions() },
          { id: 'subjunctive', name: 'Сослагательное наклонение', wordsCount: 15, type: 'grammar', completed: false, questions: generateSubjunctiveQuestions() },
          { id: 'advanced_tenses', name: 'Смешанные времена', wordsCount: 20, type: 'grammar', completed: false, questions: generateAdvancedTensesQuestions() }
        ],
        totalWordsTarget: 50
      },
      {
        id: 2,
        name: 'Идиомы и сленг',
        monthsRange: [3, 4],
        color: '#2196F3',
        topics: [
          { id: 'idioms', name: '100 популярных идиом', wordsCount: 100, type: 'vocabulary', completed: false, questions: generateIdiomsQuestions() },
          { id: 'slang', name: 'Современный сленг', wordsCount: 50, type: 'vocabulary', completed: false, questions: generateSlangQuestions() },
          { id: 'collocations', name: 'Устойчивые выражения', wordsCount: 60, type: 'vocabulary', completed: false, questions: generateCollocationsQuestions() }
        ],
        totalWordsTarget: 210
      },
      {
        id: 3,
        name: 'Академическое и деловое письмо',
        monthsRange: [5, 6],
        color: '#FF9800',
        topics: [
          { id: 'business_emails', name: 'Деловая переписка', wordsCount: 40, type: 'writing', completed: false, questions: generateBusinessEmailQuestions() },
          { id: 'essays', name: 'Написание эссе', wordsCount: 30, type: 'writing', completed: false, questions: generateEssayQuestions() },
          { id: 'presentations', name: 'Презентации и выступления', wordsCount: 30, type: 'speaking', completed: false, questions: generatePresentationQuestions() }
        ],
        totalWordsTarget: 100
      }
    ]
  }
};

// ========== ГЕНЕРАТОРЫ ВОПРОСОВ ДЛЯ КАЖДОЙ ТЕМЫ ==========

function generateAlphabetQuestions() {
  return [
    { id: 'a1', type: 'letter', prompt: 'Какая буква?', image: '/apple.png', correct: 'A', options: ['A', 'B', 'C', 'D'] },
    { id: 'a2', type: 'letter', prompt: 'Какая буква?', image: '/ball.png', correct: 'B', options: ['A', 'B', 'C', 'D'] },
    { id: 'a3', type: 'letter', prompt: 'Какая буква?', image: '/cat.png', correct: 'C', options: ['A', 'B', 'C', 'D'] },
    { id: 'a4', type: 'sound', prompt: 'Какой звук даёт буква A?', correct: '/æ/', options: ['/æ/', '/eɪ/', '/ɑː/', '/ə/'] },
    { id: 'a5', type: 'write', prompt: 'Напиши букву, с которой начинается слово "Apple"', correct: 'A' }
  ];
}

function generateReadingQuestions() {
  return [
    { id: 'r1', type: 'reading', prompt: 'Как читается буква "A" в слове "cat"?', correct: '/æ/', options: ['/eɪ/', '/æ/', '/ɑː/', '/ə/'] },
    { id: 'r2', type: 'reading', prompt: 'Как читается буква "A" в слове "cake"?', correct: '/eɪ/', options: ['/eɪ/', '/æ/', '/ɑː/', '/ə/'] },
    { id: 'r3', type: 'reading', prompt: 'Как читается "th" в слове "this"?', correct: '/ð/', options: ['/θ/', '/ð/', '/t/', '/d/'] },
    { id: 'r4', type: 'reading', prompt: 'Как читается "th" в слове "think"?', correct: '/θ/', options: ['/θ/', '/ð/', '/t/', '/d/'] },
    { id: 'r5', type: 'reading', prompt: 'Как читается "sh" в слове "ship"?', correct: '/ʃ/', options: ['/ʃ/', '/ʒ/', '/s/', '/tʃ/'] }
  ];
}

function generateBasicVerbsQuestions() {
  return [
    { id: 'v1', type: 'grammar', prompt: 'I ___ a student.', correct: 'am', options: ['am', 'is', 'are', 'be'] },
    { id: 'v2', type: 'grammar', prompt: 'She ___ happy.', correct: 'is', options: ['am', 'is', 'are', 'be'] },
    { id: 'v3', type: 'grammar', prompt: 'We ___ friends.', correct: 'are', options: ['am', 'is', 'are', 'be'] },
    { id: 'v4', type: 'grammar', prompt: 'I ___ a car.', correct: 'have', options: ['have', 'has', 'am', 'is'] },
    { id: 'v5', type: 'grammar', prompt: 'He ___ a dog.', correct: 'has', options: ['have', 'has', 'is', 'are'] },
    { id: 'v6', type: 'grammar', prompt: '___ you like coffee?', correct: 'Do', options: ['Do', 'Does', 'Is', 'Are'] },
    { id: 'v7', type: 'grammar', prompt: '___ she speak English?', correct: 'Does', options: ['Do', 'Does', 'Is', 'Are'] }
  ];
}

function generateFoodFamilyQuestions() {
  return [
    { id: 'f1', type: 'image', prompt: 'Что это?', image: '/apple.png', correct: 'apple', options: ['apple', 'orange', 'banana', 'grape'] },
    { id: 'f2', type: 'image', prompt: 'Что это?', image: '/bread.png', correct: 'bread', options: ['bread', 'milk', 'cheese', 'meat'] },
    { id: 'f3', type: 'translate', prompt: 'Переведи "мама"', correct: 'mother', options: ['mother', 'father', 'sister', 'brother'] },
    { id: 'f4', type: 'translate', prompt: 'Переведи "брат"', correct: 'brother', options: ['sister', 'brother', 'mother', 'father'] },
    { id: 'f5', type: 'match', prompt: 'Найди пару: "кошка"', correct: 'cat', options: ['cat', 'dog', 'bird', 'fish'] }
  ];
}

function generateColorsPronounsQuestions() {
  return [
    { id: 'c1', type: 'image', prompt: 'Какой цвет?', image: '/red.png', correct: 'red', options: ['red', 'blue', 'green', 'yellow'] },
    { id: 'c2', type: 'image', prompt: 'Какой цвет?', image: '/blue.png', correct: 'blue', options: ['red', 'blue', 'green', 'yellow'] },
    { id: 'c3', type: 'translate', prompt: 'Переведи "я"', correct: 'I', options: ['I', 'you', 'he', 'she'] },
    { id: 'c4', type: 'translate', prompt: 'Переведи "они"', correct: 'they', options: ['we', 'they', 'you', 'it'] },
    { id: 'c5', type: 'grammar', prompt: '___ am a teacher.', correct: 'I', options: ['I', 'You', 'He', 'She'] }
  ];
}

function generateAdjectivesQuestions() {
  return [
    { id: 'adj1', type: 'translate', prompt: 'Переведи "большой"', correct: 'big', options: ['big', 'small', 'tall', 'short'] },
    { id: 'adj2', type: 'translate', prompt: 'Переведи "маленький"', correct: 'small', options: ['big', 'small', 'tall', 'short'] },
    { id: 'adj3', type: 'opposite', prompt: 'Антоним к слову "big"', correct: 'small', options: ['big', 'small', 'large', 'huge'] },
    { id: 'adj4', type: 'translate', prompt: 'Переведи "счастливый"', correct: 'happy', options: ['happy', 'sad', 'angry', 'tired'] },
    { id: 'adj5', type: 'translate', prompt: 'Переведи "грустный"', correct: 'sad', options: ['happy', 'sad', 'angry', 'tired'] }
  ];
}

function generatePresentSimpleQuestions() {
  return [
    { id: 'ps1', type: 'grammar', prompt: 'I ___ to school every day.', correct: 'go', options: ['go', 'goes', 'going', 'went'] },
    { id: 'ps2', type: 'grammar', prompt: 'He ___ football on Sundays.', correct: 'plays', options: ['play', 'plays', 'playing', 'played'] },
    { id: 'ps3', type: 'grammar', prompt: '___ you like coffee?', correct: 'Do', options: ['Do', 'Does', 'Is', 'Are'] },
    { id: 'ps4', type: 'grammar', prompt: 'She ___ not eat meat.', correct: 'does', options: ['do', 'does', 'is', 'are'] },
    { id: 'ps5', type: 'translate', prompt: 'Переведи: "Я встаю в 7 утра"', correct: 'I get up at 7 am', options: ['I get up at 7 am', 'I gets up at 7 am', 'I getting up at 7 am', 'I am get up at 7 am'] }
  ];
}

function generatePresentContinuousQuestions() {
  return [
    { id: 'pc1', type: 'grammar', prompt: 'I ___ working now.', correct: 'am', options: ['am', 'is', 'are', 'be'] },
    { id: 'pc2', type: 'grammar', prompt: 'She ___ reading a book.', correct: 'is', options: ['am', 'is', 'are', 'be'] },
    { id: 'pc3', type: 'grammar', prompt: 'They ___ playing football.', correct: 'are', options: ['am', 'is', 'are', 'be'] },
    { id: 'pc4', type: 'grammar', prompt: 'What ___ you doing?', correct: 'are', options: ['am', 'is', 'are', 'be'] },
    { id: 'pc5', type: 'translate', prompt: 'Переведи: "Я сейчас читаю книгу"', correct: 'I am reading a book now', options: ['I read a book now', 'I am reading a book now', 'I reading a book now', 'I reads a book now'] }
  ];
}

function generatePastSimpleQuestions() {
  const irregularVerbs = [
    { base: 'go', past: 'went' },
    { base: 'eat', past: 'ate' },
    { base: 'see', past: 'saw' },
    { base: 'buy', past: 'bought' },
    { base: 'think', past: 'thought' }
  ];
  
  return irregularVerbs.map((v, i) => ({
    id: `past${i}`,
    type: 'grammar',
    prompt: `Прошедшее время глагола "${v.base}"`,
    correct: v.past,
    options: [v.past, v.base + 'ed', v.base + 'ing', v.base]
  }));
}

function generateFutureQuestions() {
  return [
    { id: 'fut1', type: 'grammar', prompt: 'I ___ call you tomorrow.', correct: 'will', options: ['will', 'going to', 'am', 'is'] },
    { id: 'fut2', type: 'grammar', prompt: 'She ___ travel to London next year.', correct: 'is going to', options: ['will', 'is going to', 'are going to', 'am going to'] },
    { id: 'fut3', type: 'grammar', prompt: '___ you help me?', correct: 'Will', options: ['Will', 'Are', 'Do', 'Does'] },
    { id: 'fut4', type: 'translate', prompt: 'Переведи: "Я собираюсь учить английский"', correct: 'I am going to learn English', options: ['I will learn English', 'I am going to learn English', 'I learn English', 'I learning English'] }
  ];
}

function generateModalQuestions() {
  return [
    { id: 'mod1', type: 'grammar', prompt: 'You ___ drive without a license.', correct: 'cannot', options: ['can', 'cannot', 'must', 'should'] },
    { id: 'mod2', type: 'grammar', prompt: 'You ___ study for the exam.', correct: 'should', options: ['can', 'must', 'should', 'may'] },
    { id: 'mod3', type: 'grammar', prompt: 'I ___ swim very well.', correct: 'can', options: ['can', 'must', 'should', 'may'] },
    { id: 'mod4', type: 'grammar', prompt: 'You ___ respect your parents.', correct: 'must', options: ['can', 'must', 'should', 'may'] },
    { id: 'mod5', type: 'translate', prompt: 'Переведи: "Ты должен прийти вовремя"', correct: 'You must come on time', options: ['You can come on time', 'You must come on time', 'You should come on time', 'You may come on time'] }
  ];
}

function generateDailyRoutineQuestions() {
  return [
    { id: 'dr1', type: 'translate', prompt: 'Переведи "просыпаться"', correct: 'wake up', options: ['wake up', 'get up', 'sleep', 'rest'] },
    { id: 'dr2', type: 'translate', prompt: 'Переведи "завтракать"', correct: 'have breakfast', options: ['have breakfast', 'have lunch', 'have dinner', 'eat'] },
    { id: 'dr3', type: 'order', prompt: 'Расставь слова: breakfast / I / at 8 / have', correct: 'I have breakfast at 8', options: ['I have breakfast at 8', 'Have I breakfast at 8', 'I at 8 have breakfast'] },
    { id: 'dr4', type: 'translate', prompt: 'Переведи: "Я ложусь спать в 23:00"', correct: 'I go to bed at 11 pm', options: ['I go to bed at 11 pm', 'I sleep at 11 pm', 'I going to bed at 11 pm'] }
  ];
}

// Функция для генерации вопросов по Present Perfect
function generatePresentPerfectQuestions() {
  return [
    { id: 'pp1', type: 'grammar', prompt: 'I ___ seen this film.', correct: 'have', options: ['have', 'has', 'am', 'is'] },
    { id: 'pp2', type: 'grammar', prompt: 'She ___ visited Paris.', correct: 'has', options: ['have', 'has', 'is', 'are'] },
    { id: 'pp3', type: 'grammar', prompt: '___ you ever been to London?', correct: 'Have', options: ['Have', 'Has', 'Do', 'Did'] },
    { id: 'pp4', type: 'compare', prompt: 'I ___ this film yesterday. (Past Simple vs Present Perfect)', correct: 'saw', options: ['saw', 'have seen', 'see', 'seen'] },
    { id: 'pp5', type: 'translate', prompt: 'Переведи: "Я никогда не был в Париже"', correct: 'I have never been to Paris', options: ['I never was in Paris', 'I have never been to Paris', 'I never go to Paris'] }
  ];
}

// Функция для генерации вопросов по Conditional sentences
function generateConditionalsQuestions() {
  return [
    { id: 'cond1', type: 'grammar', prompt: 'If you heat ice, it ___.', correct: 'melts', options: ['melts', 'melt', 'will melt', 'would melt'] },
    { id: 'cond2', type: 'grammar', prompt: 'If it rains, I ___ stay home.', correct: 'will', options: ['will', 'would', 'am', 'is'] },
    { id: 'cond3', type: 'grammar', prompt: 'If I were you, I ___ study more.', correct: 'would', options: ['will', 'would', 'am', 'is'] }
  ];
}

// Вспомогательные функции для других тем (сокращённо для объёма)
function generateComparisonQuestions() { return []; }
function generatePrepositionQuestions() { return []; }
function generateReadingBookQuestions() { return []; }
function generateTravelQuestions() { return []; }
function generateWritingQuestions() { return []; }
function generatePassiveQuestions() { return []; }
function generatePhrasalVerbsQuestions() { return []; }
function generateWordFormationQuestions() { return []; }
function generateListeningQuestions() { return []; }
function generateSpeakingQuestions() { return []; }
function generateAllTensesQuestions() { return []; }
function generatePastModalsQuestions() { return []; }
function generateReportedSpeechQuestions() { return []; }
function generateConjunctionsQuestions() { return []; }
function generateAdvancedVocabQuestions() { return []; }
function generateNewsQuestions() { return []; }
function generateReviewTensesQuestions() { return []; }
function generateEverydayPhrasesQuestions() { return []; }
function generatePhoneCallQuestions() { return []; }
function generateWorkVocabQuestions() { return []; }
function generateHealthVocabQuestions() { return []; }
function generateEducationVocabQuestions() { return []; }
function generateConditionals23Questions() { return []; }
function generatePassiveAdvancedQuestions() { return []; }
function generateAdvancedPhrasalQuestions() { return []; }
function generateInversionQuestions() { return []; }
function generateSubjunctiveQuestions() { return []; }
function generateAdvancedTensesQuestions() { return []; }
function generateIdiomsQuestions() { return []; }
function generateSlangQuestions() { return []; }
function generateCollocationsQuestions() { return []; }
function generateBusinessEmailQuestions() { return []; }
function generateEssayQuestions() { return []; }
function generatePresentationQuestions() { return []; }

// ========== ПОЛУЧЕНИЕ ДАННЫХ ДЛЯ ПОЛЬЗОВАТЕЛЯ ==========

export function getLearningPath(level) {
  return LEARNING_PATHS[level] || LEARNING_PATHS.beginner;
}

export function getCurrentStage(level, wordsLearned) {
  const path = getLearningPath(level);
  let accumulatedWords = 0;
  
  for (const stage of path.stages) {
    if (wordsLearned < accumulatedWords + stage.totalWordsTarget) {
      return stage;
    }
    accumulatedWords += stage.totalWordsTarget;
  }
  return path.stages[path.stages.length - 1];
}

export function getCurrentTopic(level, wordsLearned) {
  const stage = getCurrentStage(level, wordsLearned);
  let accumulatedWords = 0;
  
  for (const topic of stage.topics) {
    if (wordsLearned < accumulatedWords + topic.wordsCount) {
      return topic;
    }
    accumulatedWords += topic.wordsCount;
  }
  return stage.topics[0];
}

export function getNextTopics(level, wordsLearned, count = 3) {
  const path = getLearningPath(level);
  let allTopics = [];
  
  for (const stage of path.stages) {
    allTopics = [...allTopics, ...stage.topics];
  }
  
  let accumulatedWords = 0;
  let currentIndex = 0;
  
  for (let i = 0; i < allTopics.length; i++) {
    if (wordsLearned < accumulatedWords + allTopics[i].wordsCount) {
      currentIndex = i;
      break;
    }
    accumulatedWords += allTopics[i].wordsCount;
  }
  
  return allTopics.slice(currentIndex, currentIndex + count);
}

export function getEstimatedTimeRemaining(level, wordsLearned, dailyMinutes = 30) {
  const path = getLearningPath(level);
  const totalWords = path.totalWordsTarget;
  const remainingWords = Math.max(0, totalWords - wordsLearned);
  
  // Предполагаем, что в среднем 5 слов в день можно выучить
  const wordsPerDay = Math.max(3, Math.floor(dailyMinutes / 6));
  const daysNeeded = Math.ceil(remainingWords / wordsPerDay);
  
  return {
    days: daysNeeded,
    months: Math.ceil(daysNeeded / 30),
    wordsPerDay: wordsPerDay,
    remainingWords: remainingWords
  };
}