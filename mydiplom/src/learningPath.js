export const LEARNING_PATHS = {
  beginner: {
    id: 'beginner',
    label: 'Новичок (A1–A2)',
    description: '10 заданий: от алфавита до прошедшего времени',
    defaultMonths: 6,
    minMonths: 3,
    maxMonths: 12,
    totalWordsTarget: 200,
    stages: [
      {
        id: 1,
        name: 'Основы языка',
        topics: [
          {
            id: 'novice_task_1',
            name: 'ЗАДАНИЕ 1. Алфавит',
            type: 'grammar',
            questions: [
              { id: 'n1q1', prompt: 'Какой букве соответствует звук /eɪ/?', correct: 'A', options: ['A', 'E', 'I'] },
              { id: 'n1q2', prompt: 'Какой букве соответствует звук /biː/?', correct: 'B', options: ['P', 'B', 'D'] },
              { id: 'n1q3', prompt: 'Какая буква произносится как /siː/?', correct: 'C', options: ['C', 'S', 'Z'] },
              { id: 'n1q4', prompt: 'Какой букве соответствует звук /dʒiː/?', correct: 'J', options: ['J', 'G', 'Q'] },
              { id: 'n1q5', prompt: 'Какая буква произносится как /juː/?', correct: 'U', options: ['W', 'V', 'U'] }
            ]
          },
          {
            id: 'novice_task_2',
            name: 'ЗАДАНИЕ 2. Транскрипция',
            type: 'grammar',
            questions: [
              { id: 'n2q1', prompt: 'Как читается слово "cat"?', correct: '/kæt/', options: ['/kæt/', '/keɪt/', '/kət/'] },
              { id: 'n2q2', prompt: 'Как читается слово "dog"?', correct: '/dɒg/', options: ['/dɒg/', '/dəʊg/', '/dɔːg/'] },
              { id: 'n2q3', prompt: 'Как читается слово "sun"?', correct: '/sʌn/', options: ['/sʊn/', '/sʌn/', '/sɔːn/'] },
              { id: 'n2q4', prompt: 'Как читается слово "pen"?', correct: '/pen/', options: ['/piːn/', '/pen/', '/pɛn/'] },
              { id: 'n2q5', prompt: 'Как читается слово "fish"?', correct: '/fɪʃ/', options: ['/fɪʃ/', '/fiːʃ/', '/faɪʃ/'] }
            ]
          },
          {
            id: 'novice_task_3',
            name: 'ЗАДАНИЕ 3. Правила чтения',
            type: 'grammar',
            questions: [
              { id: 'n3q1', prompt: 'Какое слово читается НЕ так, как остальные?', correct: 'Name (читается /neɪm/)', options: ['Cat (читается /kæt/)', 'Hat (читается /hæt/)', 'Name (читается /neɪm/)'] },
              { id: 'n3q2', prompt: 'В каком слове буква "i" читается как /aɪ/?', correct: 'Bike', options: ['Sit', 'Bit', 'Bike'] },
              { id: 'n3q3', prompt: 'В каком слове буква "e" НЕ читается?', correct: 'Name', options: ['End', 'Name', 'Egg'] },
              { id: 'n3q4', prompt: 'Как читается сочетание "th" в слове "this"?', correct: '/ð/', options: ['/θ/', '/ð/', '/t/'] },
              { id: 'n3q5', prompt: 'В каком слове "sh" даёт звук /ʃ/?', correct: 'Ship', options: ['Ship', 'Shoe'] }
            ]
          },
          {
            id: 'novice_task_4',
            name: 'ЗАДАНИЕ 4. Числа',
            type: 'grammar',
            questions: [
              { id: 'n4q1', prompt: 'Как написать "13"?', correct: 'Thirteen', options: ['Thirtheen', 'Thirteen', 'Threeteen'] },
              { id: 'n4q2', prompt: 'Как написать "15"?', correct: 'Fifteen', options: ['Fifteen', 'Fiveteen', 'Fifeteen'] },
              { id: 'n4q3', prompt: 'Как написать "20"?', correct: 'Twenty', options: ['Twenty', 'Tweny', 'Twenteen'] },
              { id: 'n4q4', prompt: 'Как написать "50"?', correct: 'Fifty', options: ['Fivety', 'Fifty', 'Fifety'] },
              { id: 'n4q5', prompt: 'Как написать "100"?', correct: 'One hundred', options: ['One hundred', 'One hundre', 'One handred'] }
            ]
          },
          {
            id: 'novice_task_5',
            name: 'ЗАДАНИЕ 5. Базовые фразы',
            type: 'grammar',
            questions: [
              { id: 'n5q1', prompt: '"How are you?" → Что ответить?', correct: "I'm fine, thanks!", options: ["I'm fine, thanks!", "I'm good, and you?", "I'm five"] },
              { id: 'n5q2', prompt: '"What is your name?" → Что ответить?', correct: 'My name is Anna', options: ['My name Anna', 'My name is Anna', 'Name Anna'] },
              { id: 'n5q3', prompt: '"Where are you from?" → Что ответить?', correct: 'I am from Russia', options: ['I from Russia', 'I am from Russia', 'Me from Russia'] },
              { id: 'n5q4', prompt: '"Nice to meet you!" → Что ответить?', correct: 'Nice to meet you too!', options: ['Nice to meet you too!', 'I am nice!', 'Thank you!'] },
              { id: 'n5q5', prompt: '"Goodbye!" → Что ответить?', correct: 'Goodbye! See you!', options: ['Goodbye! See you!', 'Good night!', 'Hello!'] }
            ]
          },
          {
            id: 'novice_task_6',
            name: 'ЗАДАНИЕ 6. Глагол to be',
            type: 'grammar',
            questions: [
              { id: 'n6q1', prompt: 'I ___ a student.', correct: 'am', options: ['am', 'is', 'are'] },
              { id: 'n6q2', prompt: 'She ___ a doctor.', correct: 'is', options: ['am', 'is', 'are'] },
              { id: 'n6q3', prompt: 'We ___ happy.', correct: 'are', options: ['am', 'is', 'are'] },
              { id: 'n6q4', prompt: 'They ___ at home.', correct: 'are', options: ['am', 'is', 'are'] },
              { id: 'n6q5', prompt: 'You ___ my friend.', correct: 'are', options: ['am', 'is', 'are'] }
            ]
          },
          {
            id: 'novice_task_7',
            name: 'ЗАДАНИЕ 7. Present Simple',
            type: 'grammar',
            questions: [
              { id: 'n7q1', prompt: 'He ___ to school every day.', correct: 'goes', options: ['go', 'goes', 'going'] },
              { id: 'n7q2', prompt: 'They ___ coffee in the morning.', correct: 'drink', options: ['drink', 'drinks', 'drinking'] },
              { id: 'n7q3', prompt: 'She ___ English very well.', correct: 'speaks', options: ['speak', 'speaks', 'speaking'] },
              { id: 'n7q4', prompt: 'I ___ up at 7 o\'clock.', correct: 'get', options: ['get', 'gets', 'getting'] },
              { id: 'n7q5', prompt: 'We ___ in a big house.', correct: 'live', options: ['live', 'lives', 'living'] }
            ]
          },
          {
            id: 'novice_task_8',
            name: 'ЗАДАНИЕ 8. Отрицание в Present Simple',
            type: 'grammar',
            questions: [
              { id: 'n8q1', prompt: 'I ___ like spiders.', correct: "don't", options: ["don't", 'doesn\'t', 'not'] },
              { id: 'n8q2', prompt: 'She ___ eat meat.', correct: "doesn't", options: ["don't", 'doesn\'t', 'not'] },
              { id: 'n8q3', prompt: 'They ___ watch TV.', correct: "don't", options: ["don't", 'doesn\'t', 'not'] },
              { id: 'n8q4', prompt: 'He ___ play football.', correct: "doesn't", options: ["don't", 'doesn\'t', 'not'] },
              { id: 'n8q5', prompt: 'We ___ have a car.', correct: "don't", options: ["don't", 'doesn\'t', 'not'] }
            ]
          },
          {
            id: 'novice_task_9',
            name: 'ЗАДАНИЕ 9. Past Simple',
            type: 'grammar',
            questions: [
              { id: 'n9q1', prompt: 'Yesterday I ___ (play) chess.', correct: 'played', options: ['play', 'played', 'plaied'] },
              { id: 'n9q2', prompt: 'She ___ (visit) her grandma.', correct: 'visited', options: ['visit', 'visited', 'visite'] },
              { id: 'n9q3', prompt: 'We ___ (watch) a movie.', correct: 'watched', options: ['watch', 'watched', 'watchied'] },
              { id: 'n9q4', prompt: 'They ___ (walk) in the park.', correct: 'walked', options: ['walk', 'walked', 'walkied'] },
              { id: 'n9q5', prompt: 'He ___ (study) English.', correct: 'studied', options: ['study', 'studied', 'studyed'] }
            ]
          },
          {
            id: 'novice_task_10',
            name: 'ЗАДАНИЕ 10. Неправильные глаголы',
            type: 'grammar',
            questions: [
              { id: 'n10q1', prompt: 'Go → ?', correct: 'went', options: ['goed', 'went', 'gone'] },
              { id: 'n10q2', prompt: 'Eat → ?', correct: 'ate', options: ['eated', 'ate', 'eaten'] },
              { id: 'n10q3', prompt: 'See → ?', correct: 'saw', options: ['saw', 'see', 'seen'] },
              { id: 'n10q4', prompt: 'Buy → ?', correct: 'bought', options: ['buyed', 'bought', 'brought'] },
              { id: 'n10q5', prompt: 'Have → ?', correct: 'had', options: ['have', 'haved', 'had'] }
            ]
          }
        ]
      }
    ],
    totalWordsTarget: 50
  },

  intermediate: {
    id: 'intermediate',
    label: 'Продвинутый (B1–B2)',
    description: '10 заданий: от Present Perfect до пассивного залога и монолога',
    defaultMonths: 4,
    minMonths: 2,
    maxMonths: 8,
    totalWordsTarget: 400,
    stages: [
      {
        id: 1,
        name: 'Средний уровень',
        topics: [
          {
            id: 'adv_task_1',
            name: 'ЗАДАНИЕ 1. Present Perfect',
            type: 'grammar',
            questions: [
              { id: 'a1q1', prompt: 'I ___ (see) this movie already.', correct: 'have seen', options: ['see', 'saw', 'have seen'] },
              { id: 'a1q2', prompt: 'She ___ (write) three books.', correct: 'has written', options: ['wrote', 'has written', 'writes'] },
              { id: 'a1q3', prompt: 'They ___ (be) to London twice.', correct: 'have been', options: ['went', 'have been', 'were'] },
              { id: 'a1q4', prompt: 'He ___ (not/finish) his homework yet.', correct: "hasn't finished", options: ["hasn't finished", 'didn\'t finish', 'isnt finished'] },
              { id: 'a1q5', prompt: 'We ___ (know) each other for 5 years.', correct: 'have known', options: ['knew', 'have known', 'know'] }
            ]
          },
          {
            id: 'adv_task_2',
            name: 'ЗАДАНИЕ 2. Present Perfect vs Past Simple',
            type: 'grammar',
            questions: [
              { id: 'a2q1', prompt: 'I ___ (met) him in 2010.', correct: 'met', options: ['have met', 'met', 'meet'] },
              { id: 'a2q2', prompt: 'She ___ (be) a teacher since 2015.', correct: 'has been', options: ['has been', 'was', 'is'] },
              { id: 'a2q3', prompt: 'We ___ (visit) the museum yesterday.', correct: 'visited', options: ['have visited', 'visited', 'visit'] },
              { id: 'a2q4', prompt: 'They ___ (already/eat) dinner.', correct: 'have already eaten', options: ['already ate', 'have already eaten', 'already eat'] },
              { id: 'a2q5', prompt: 'I ___ (never/try) sushi.', correct: 'have never tried', options: ['never tried', 'have never tried', 'never try'] }
            ]
          },
          {
            id: 'adv_task_3',
            name: 'ЗАДАНИЕ 3. Present Perfect Continuous',
            type: 'grammar',
            questions: [
              { id: 'a3q1', prompt: 'She ___ (study) for 3 hours now.', correct: 'has been studying', options: ['studies', 'has been studying', 'studied'] },
              { id: 'a3q2', prompt: 'I ___ (work) here since 2020.', correct: 'have been working', options: ['have been working', 'worked', 'work'] },
              { id: 'a3q3', prompt: 'They ___ (wait) for the bus for 20 minutes.', correct: 'have been waiting', options: ['waited', 'have been waiting', 'wait'] },
              { id: 'a3q4', prompt: 'He ___ (live) in this city for 10 years.', correct: 'has been living', options: ['lived', 'has been living', 'lives'] },
              { id: 'a3q5', prompt: 'We ___ (drive) since 8 o\'clock.', correct: 'have been driving', options: ['drove', 'have been driving', 'drive'] }
            ]
          },
          {
            id: 'adv_task_4',
            name: 'ЗАДАНИЕ 4. Модальные глаголы',
            type: 'grammar',
            questions: [
              { id: 'a4q1', prompt: 'You ___ wear a seatbelt in the car. It\'s the law.', correct: 'must', options: ['should', 'must', 'could'] },
              { id: 'a4q2', prompt: 'You ___ see the new movie. It\'s fantastic!', correct: 'should', options: ['must', 'should', 'have to'] },
              { id: 'a4q3', prompt: 'I ___ go now. The boss is waiting for me.', correct: 'have to', options: ['should', 'have to', 'might'] },
              { id: 'a4q4', prompt: 'She ___ be tired. She\'s been working all day.', correct: 'must', options: ['should', 'must', 'have to'] },
              { id: 'a4q5', prompt: 'We ___ pay for the tickets online.', correct: 'have to', options: ['should', 'have to', 'might'] }
            ]
          },
          {
            id: 'adv_task_5',
            name: 'ЗАДАНИЕ 5. Условные предложения (1 тип)',
            type: 'grammar',
            questions: [
              { id: 'a5q1', prompt: 'If it rains, I ___ (stay) at home.', correct: 'will stay', options: ['stay', 'will stay', 'stayed'] },
              { id: 'a5q2', prompt: 'She ___ (call) you if she arrives.', correct: 'will call', options: ['will call', 'calls', 'called'] },
              { id: 'a5q3', prompt: 'If you heat ice, it ___ (melt).', correct: 'melts', options: ['will melt', 'melts', 'melted'] },
              { id: 'a5q4', prompt: 'We ___ (go) to the beach if the weather is nice.', correct: 'will go', options: ['will go', 'go', 'went'] },
              { id: 'a5q5', prompt: 'If you don\'t hurry, you ___ (miss) the train.', correct: 'will miss', options: ['miss', 'will miss', 'missed'] }
            ]
          },
          {
            id: 'adv_task_6',
            name: 'ЗАДАНИЕ 6. Условные предложения (2 тип)',
            type: 'grammar',
            questions: [
              { id: 'a6q1', prompt: 'If I ___ (be) you, I would take the job.', correct: 'were', options: ['am', 'was', 'were'] },
              { id: 'a6q2', prompt: 'If he ___ (have) more time, he would travel.', correct: 'had', options: ['had', 'has', 'have'] },
              { id: 'a6q3', prompt: 'She would buy a house if she ___ (win) the lottery.', correct: 'won', options: ['wins', 'won', 'would win'] },
              { id: 'a6q4', prompt: 'If we ___ (live) in Paris, we would visit the museums.', correct: 'lived', options: ['live', 'lived', 'had lived'] },
              { id: 'a6q5', prompt: 'What would you do if you ___ (find) 1000 dollars?', correct: 'found', options: ['found', 'find', 'had found'] }
            ]
          },
          {
            id: 'adv_task_7',
            name: 'ЗАДАНИЕ 7. Пассивный залог',
            type: 'grammar',
            questions: [
              { id: 'a7q1', prompt: 'They built this church in 1990. → This church ___ in 1990.', correct: 'was built', options: ['was built', 'built', 'is built'] },
              { id: 'a7q2', prompt: 'She writes a letter every day. → A letter ___ every day.', correct: 'is written', options: ['is written', 'was written', 'writes'] },
              { id: 'a7q3', prompt: 'They have opened a new shop. → A new shop ___ opened.', correct: 'has been', options: ['has been', 'was', 'is'] },
              { id: 'a7q4', prompt: 'The company will launch a new product. → A new product ___ launched.', correct: 'will be', options: ['will be', 'was', 'has been'] },
              { id: 'a7q5', prompt: 'He is repairing the car now. → The car ___ repaired now.', correct: 'is being', options: ['was', 'is being', 'has been'] }
            ]
          },
          {
            id: 'adv_task_8',
            name: 'ЗАДАНИЕ 8. Косвенная речь',
            type: 'grammar',
            questions: [
              { id: 'a8q1', prompt: 'He said: "I am happy." → He said that ___.', correct: 'he was happy', options: ['I am happy', 'he is happy', 'he was happy'] },
              { id: 'a8q2', prompt: 'She said: "I will come tomorrow." → She said that ___.', correct: 'she would come the next day', options: ['she will come tomorrow', 'she would come the next day', 'she comes tomorrow'] },
              { id: 'a8q3', prompt: 'They said: "We have finished." → They said that ___.', correct: 'they had finished', options: ['we have finished', 'they had finished', 'they have finished'] },
              { id: 'a8q4', prompt: 'He said: "I can swim." → He said that ___.', correct: 'he could swim', options: ['he can swim', 'he could swim', 'he swims'] },
              { id: 'a8q5', prompt: 'She said: "I am going to the store." → She said that ___.', correct: 'she was going to the store', options: ['she is going to the store', 'she was going to the store', 'she goes to the store'] }
            ]
          },
          {
            id: 'adv_task_9',
            name: 'ЗАДАНИЕ 9. Связки слов',
            type: 'grammar',
            questions: [
              { id: 'a9q1', prompt: 'I wanted to go to the party. ___, I had to study.', correct: 'However', options: ['However', 'Moreover', 'Therefore'] },
              { id: 'a9q2', prompt: 'She is intelligent. ___, she is very kind.', correct: 'Moreover', options: ['However', 'Moreover', 'But'] },
              { id: 'a9q3', prompt: 'He studied a lot. ___, he passed the exam easily.', correct: 'Therefore', options: ['However', 'Moreover', 'Therefore'] },
              { id: 'a9q4', prompt: 'The weather was cold. ___, they went for a walk.', correct: 'However', options: ['However', 'Therefore', 'Moreover'] },
              { id: 'a9q5', prompt: 'He doesn\'t like coffee. ___, he drinks tea every day.', correct: 'Instead', options: ['Away', 'Instead', 'Moreover'] }
            ]
          },
          {
            id: 'adv_task_10',
            name: 'ЗАДАНИЕ 10. Написание монолога',
            type: 'write',
            questions: [
              { id: 'a10q1', prompt: 'Напиши 5 предложений на тему "Why is learning English important?"', correct: 'Gemini Check', options: [] }
            ]
          }
        ]
      }
    ],
    totalWordsTarget: 100
  },

  advanced: {
    id: 'advanced',
    label: 'Шарящий (C1–C2)',
    description: '10 заданий: инверсия, идиомы, акценты и дебаты',
    defaultMonths: 3,
    minMonths: 1,
    maxMonths: 6,
    totalWordsTarget: 600,
    stages: [
      {
        id: 1,
        name: 'Продвинутый уровень',
        topics: [
          {
            id: 'exp_task_1',
            name: 'ЗАДАНИЕ 1. Инверсия',
            type: 'grammar',
            questions: [
              { id: 'e1q1', prompt: 'I have never seen such a beautiful view. → Never ___ such a beautiful view.', correct: 'have I seen', options: ['have I seen', 'I have seen', 'did I see'] },
              { id: 'e1q2', prompt: 'She rarely eats meat. → Rarely ___ meat.', correct: 'does she eat', options: ['does she eat', 'she eats', 'she does eat'] },
              { id: 'e1q3', prompt: 'He not only speaks French, but also German. → Not only ___ French, but also German.', correct: 'does he speak', options: ['he speaks', 'does he speak', 'he does speak'] },
              { id: 'e1q4', prompt: 'They had hardly arrived when the storm started. → Hardly ___ when the storm started.', correct: 'had they arrived', options: ['had they arrived', 'they had arrived', 'did they arrive'] },
              { id: 'e1q5', prompt: 'She knew little about the situation. → Little ___ about the situation.', correct: 'did she know', options: ['she knew', 'did she know', 'she did know'] }
            ]
          },
          {
            id: 'exp_task_2',
            name: 'ЗАДАНИЕ 2. Эллипсис',
            type: 'grammar',
            questions: [
              { id: 'e2q1', prompt: 'She ordered coffee, and he ordered coffee too. → She ordered coffee, and ___.', correct: 'he did too', options: ['he too', 'he did too', 'he ordered'] },
              { id: 'e2q2', prompt: 'I like pizza, and she likes pizza too. → I like pizza, and ___.', correct: 'she does too', options: ['she too', 'she does too', 'she likes'] },
              { id: 'e2q3', prompt: 'He didn\'t come to the party, and his brother didn\'t come either. → He didn\'t come to the party, and ___.', correct: 'neither did his brother', options: ["his brother didn't", 'neither did his brother', 'his brother too'] },
              { id: 'e2q4', prompt: 'She can speak Spanish, and he can speak Spanish too. → She can speak Spanish, and ___.', correct: 'he can too', options: ['he can too', 'he too', 'he can speak'] },
              { id: 'e2q5', prompt: 'They have been to Italy, and we have been to Italy too. → They have been to Italy, and ___.', correct: 'we have too', options: ['we have too', 'we too', 'we have been'] }
            ]
          },
          {
            id: 'exp_task_3',
            name: 'ЗАДАНИЕ 3. Сослагательное наклонение (wish)',
            type: 'grammar',
            questions: [
              { id: 'e3q1', prompt: 'I wish I ___ (know) the answer right now.', correct: 'knew', options: ['know', 'knew', 'had known'] },
              { id: 'e3q2', prompt: 'She wishes she ___ (have) more money.', correct: 'had', options: ['has', 'had', 'have'] },
              { id: 'e3q3', prompt: 'We wish we ___ (go) to the party last night.', correct: 'had gone', options: ['went', 'had gone', 'go'] },
              { id: 'e3q4', prompt: 'I wish I ___ (be) taller.', correct: 'were', options: ['am', 'were', 'had been'] },
              { id: 'e3q5', prompt: 'He wishes he ___ (not/say) that yesterday.', correct: 'hadn\'t said', options: ["didn't say", "hadn't said", "doesn't say"] }
            ]
          },
          {
            id: 'exp_task_4',
            name: 'ЗАДАНИЕ 4. Идиомы',
            type: 'grammar',
            questions: [
              { id: 'e4q1', prompt: '"He spilled the beans about the surprise party." Что значит spilled the beans?', correct: 'Проговорился, раскрыл секрет', options: ['Разбил чашку', 'Проговорился, раскрыл секрет', 'Уронил еду'] },
              { id: 'e4q2', prompt: '"She hit the sack early last night." Что значит hit the sack?', correct: 'Пошла спать', options: ['Ударила мешок', 'Пошла спать', 'Упала в обморок'] },
              { id: 'e4q3', prompt: '"It\'s raining cats and dogs." Что это значит?', correct: 'Идёт очень сильный дождь', options: ['Идёт очень сильный дождь', 'С неба падают животные', 'В зоопарке беспорядок'] },
              { id: 'e4q4', prompt: '"Break a leg before your performance!" Что значит break a leg?', correct: 'Удачи!', options: ['Сломай ногу', 'Удачи!', 'Отдохни'] },
              { id: 'e4q5', prompt: '"The project is a piece of cake." Что значит a piece of cake?', correct: 'Очень легко', options: ['Очень сложно', 'Очень легко', 'Вкусный торт'] }
            ]
          },
          {
            id: 'exp_task_5',
            name: 'ЗАДАНИЕ 5. Фразовые глаголы',
            type: 'grammar',
            questions: [
              { id: 'e5q1', prompt: 'I need to investigate this problem. → I need to ___ this problem.', correct: 'look into', options: ['look into', 'look at', 'look for'] },
              { id: 'e5q2', prompt: 'She finally discovered the truth. → She finally ___ the truth.', correct: 'found out', options: ['found out', 'found in', 'found at'] },
              { id: 'e5q3', prompt: 'Please tolerate the noise. → Please ___ the noise.', correct: 'put up with', options: ['put up with', 'put off', 'put in'] },
              { id: 'e5q4', prompt: 'We need to postpone the meeting. → We need to ___ the meeting.', correct: 'put off', options: ['put off', 'put up', 'put on'] },
              { id: 'e5q5', prompt: 'He is trying to find a solution. → He is trying to ___ a solution.', correct: 'come up with', options: ['come up with', 'come across', 'come into'] }
            ]
          },
          {
            id: 'exp_task_6',
            name: 'ЗАДАНИЕ 6. Определи стиль и тон',
            type: 'grammar',
            questions: [
              { id: 'e6q1', prompt: '"Kindly refrain from utilizing personal devices during the meeting." Это:', correct: 'Формальный', options: ['Неформальный', 'Формальный', 'Грубый'] },
              { id: 'e6q2', prompt: '"Hey, can you pass me the salt?" Это:', correct: 'Неформальный', options: ['Формальный', 'Неформальный', 'Агрессивный'] },
              { id: 'e6q3', prompt: '"I would appreciate it if you could send the report by Friday." Это:', correct: 'Вежливый, официальный', options: ['Вежливый, официальный', 'Требовательный', 'Неформальный'] },
              { id: 'e6q4', prompt: '"What the hell are you doing?" Это:', correct: 'Грубый, разговорный', options: ['Формальный', 'Грубый, разговорный', 'Нейтральный'] },
              { id: 'e6q5', prompt: '"Pursuant to the regulations, we must inform you..." Это:', correct: 'Юридический / официальный', options: ['Юридический / официальный', 'Разговорный', 'Шутлический'] }
            ]
          },
          {
            id: 'exp_task_7',
            name: 'ЗАДАНИЕ 7. Скрытый смысл (подтекст)',
            type: 'grammar',
            questions: [
              { id: 'e7q1', prompt: 'A: "It\'s cold in here." B: "I\'ll close the window." Что хотел сказать A?', correct: 'Он просит закрыть окно', options: ['Ему холодно', 'Он просит закрыть окно', 'Он жалуется на погоду'] },
              { id: 'e7q2', prompt: 'A: "Is there any more coffee?" B: "I\'ll make some." Что хотел сказать A?', correct: 'Он хочет кофе', options: ['Он хочет кофе', 'Он хочет узнать, есть ли кофе', 'Он недоволен'] },
              { id: 'e7q3', prompt: 'A: "Are you busy?" B: "I\'m working on something." Что значит ответ B?', correct: 'Он вежливо говорит "да, я занят"', options: ['Он говорит правду', 'Он вежливо говорит "да, я занят"', 'Он не хочет работать'] },
              { id: 'e7q4', prompt: 'A: "I don\'t understand this." B: "Let me explain." Что хотел сказать A?', correct: 'Он просит помощи', options: ['Он действительно не понимает', 'Он просит помощи', 'Он злится'] },
              { id: 'e7q5', prompt: 'A: "My car broke down again." B: "That\'s annoying." Что хотел сказать A?', correct: 'Он хочет, чтобы его пожалели / попросить помощи', options: ['Он сообщает факт', 'Он хочет, чтобы его пожалели / попросить помощи', 'Он хвастается'] }
            ]
          },
          {
            id: 'exp_task_8',
            name: 'ЗАДАНИЕ 8. Дебаты (аргументация)',
            type: 'grammar',
            questions: [
              { id: 'e8q1', prompt: 'Should social media be banned for teenagers? Какой аргумент ЗА запрет?', correct: 'Соцсети вызывают зависимость и снижают успеваемость', options: ['Соцсети помогают общаться с друзьями', 'Соцсети вызывают зависимость и снижают успеваемость', 'Соцсети дают образование'] },
              { id: 'e8q2', prompt: 'Should fast food be banned near schools? Какой аргумент ПРОТИВ запрета?', correct: 'Это нарушает свободу выбора бизнеса и потребителей', options: ['Дети будут здоровее', 'Это нарушает свободу выбора бизнеса и потребителей', 'Школы станут чище'] },
              { id: 'e8q3', prompt: 'Should homework be abolished? Какой аргумент ЗА отмену?', correct: 'У детей будет больше времени для хобби', options: ['У детей будет больше времени для хобби', 'Дети не будут учиться', 'Родители будут рады'] },
              { id: 'e8q4', prompt: 'Should cars be banned in city centers? Какой аргумент ПРОТИВ запрета?', correct: 'Людям будет сложно добираться до работы', options: ['Уменьшится загрязнение', 'Людям будет сложно добираться до работы', 'Города станут тише'] },
              { id: 'e8q5', prompt: 'Should students wear uniforms? Какой аргумент ЗА форму?', correct: 'Это создаёт дисциплину и равенство', options: ['Ученики будут выглядеть одинаково', 'Это создаёт дисциплину и равенство', 'Это скучно'] }
            ]
          },
          {
            id: 'exp_task_9',
            name: 'ЗАДАНИЕ 9. Понимание акцентов',
            type: 'grammar',
            questions: [
              { id: 'e9q1', prompt: 'Какой акцент произносит "water" как /wɔːtə/ (без чёткого "r")?', correct: 'Британский', options: ['Британский', 'Американский', 'Австралийский'] },
              { id: 'e9q2', prompt: 'Какой акцент произносит "car" с чётким "r" на конце?', correct: 'Американский', options: ['Британский', 'Американский', 'Шотландский'] },
              { id: 'e9q3', prompt: 'В каком акценте слово "dance" произносится как /dɑːns/ (долгая "a")?', correct: 'Британский (южный)', options: ['Британский (южный)', 'Американский', 'Северный британский'] },
              { id: 'e9q4', prompt: 'Какой акцент произносит "tomato" как /təˈmeɪtoʊ/?', correct: 'Американский', options: ['Британский', 'Американский', 'Австралийский'] },
              { id: 'e9q5', prompt: 'В каком акценте "schedule" звучит как /ˈʃedjuːl/?', correct: 'Британский', options: ['Британский', 'Американский', 'Канадский'] }
            ]
          },
          {
            id: 'exp_task_10',
            name: 'ЗАДАНИЕ 10. Импровизация (устный ответ)',
            type: 'write',
            questions: [
              { id: 'e10q1', prompt: 'Представь, что ты менеджер. Твой сотрудник опаздывает на работу каждый день. Скажи ему об этом вежливо, но строго за 1 минуту.', correct: 'Gemini Check', options: [] }
            ]
          }
        ]
      }
    ],
    totalWordsTarget: 200
  }
};

export function getLearningPath(level) {
  return LEARNING_PATHS[level] || LEARNING_PATHS.beginner;
}

export function getCurrentStage(level, wordsLearned) {
  const path = getLearningPath(level);
  return path.stages[0];
}

export function getCurrentTopic(level, wordsLearned) {
  const stage = getCurrentStage(level, wordsLearned);
  const topicIndex = Math.floor(wordsLearned / 5);
  return stage.topics[Math.min(topicIndex, stage.topics.length - 1)];
}

export function getNextTopics(level, wordsLearned, count = 3) {
  const stage = getCurrentStage(level, wordsLearned);
  const topicIndex = Math.floor(wordsLearned / 5);
  return stage.topics.slice(topicIndex + 1, topicIndex + 1 + count);
}

export function getEstimatedTimeRemaining(level, wordsLearned, dailyMinutes = 30) {
  const path = getLearningPath(level);
  const totalWords = path.totalWordsTarget;
  const remainingWords = Math.max(0, totalWords - wordsLearned);
  const wordsPerDay = 5;
  const daysNeeded = Math.ceil(remainingWords / wordsPerDay);
  
  return {
    days: daysNeeded,
    months: Math.ceil(daysNeeded / 30),
    wordsPerDay: wordsPerDay,
    remainingWords: remainingWords
  };
}
