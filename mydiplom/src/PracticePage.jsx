import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PracticePage.css';
import './Pet.css';
import './Dashboard.css';
import Logo from './Logo';
import Footer from './Footer';
import { getLevelContent } from './apiClient';
import { submitAnswer } from './apiClient';
import { loadJourneyProfile, updateJourneyProfile, markPracticeTopicCompleted, getCurrentPracticeTopic } from './userJourney';

// QUESTIONS are built from the user's learning path (alphabet/phonetics for beginners)

const shuffleArray = (items) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const letterSoundMap = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
  G: 'G',
  H: 'H',
  I: 'I',
  J: 'J',
  K: 'K',
  L: 'L',
  M: 'M',
  N: 'N',
  O: 'O',
  P: 'P',
  Q: 'Q',
  R: 'R',
  S: 'S',
  T: 'T',
  U: 'U',
  V: 'V',
  W: 'W',
  X: 'X',
  Y: 'Y',
  Z: 'Z'
};

const speakText = (text) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const playSound = (audioUrl, fallbackText) => {
  if (audioUrl) {
    try {
      new Audio(audioUrl).play();
      return;
    } catch (e) {
      // fallback to speech synthesis
    }
  }
  speakText(fallbackText || '');
};

const PracticePage = () => {
  const navigate = useNavigate();
  const [journey, setJourney] = useState(loadJourneyProfile());
  const [inputAnswer, setInputAnswer] = useState('');

  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const handleGoToCharacter = () => navigate('/pet');
  const handleGoToFriends = () => navigate('/friends');

  const saveJourney = (updates) => {
    const updated = updateJourneyProfile(updates);
    setJourney((prev) => ({ ...prev, ...updates }));
    return updated;
  };

  const getTopicProgress = (topicId) => {
    if (!journey?.topicProgress) return 1;
    return Math.max(1, journey.topicProgress[topicId] || 1);
  };

  const selectedTopic = useMemo(() => {
    return getCurrentPracticeTopic(journey?.level || 'beginner', journey?.completedTopics || []);
  }, [journey]);

  const QUESTIONS = useMemo(() => {
    if (!selectedTopic) return [];
    const topicQuestions = Array.isArray(selectedTopic.questions) ? selectedTopic.questions : [];
    if (selectedTopic.id === 'alphabet' || selectedTopic.type === 'phonetics') {
      const unlocked = getTopicProgress(selectedTopic.id);
      return topicQuestions.slice(0, Math.min(unlocked, topicQuestions.length));
    }

    return topicQuestions;
  }, [selectedTopic, journey?.topicProgress]);

  const hasMoreAlphabetQuestions = selectedTopic && (selectedTopic.id === 'alphabet' || selectedTopic.type === 'phonetics') && QUESTIONS.length < (selectedTopic.questions?.length || 0);

  const unlockNextAlphabetQuestion = () => {
    if (!selectedTopic) return 0;
    const topicId = selectedTopic.id;
    const currentCount = getTopicProgress(topicId);
    const maxCount = Array.isArray(selectedTopic.questions) ? selectedTopic.questions.length : 0;
    if (currentCount >= maxCount) return currentCount;

    const nextCount = Math.min(currentCount + 1, maxCount);
    saveJourney({ topicProgress: { ...(journey?.topicProgress || {}), [topicId]: nextCount } });
    return nextCount;
  };

  const playCurrentLetterSound = () => {
    if (!current) return;
    const fallback = letterSoundMap[current.correct] || current.correct || '';
    const audioUrl = current.audio || current.sound;
    playSound(audioUrl, fallback);
  };

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(journey?.lives ?? 3);
  const [energy, setEnergy] = useState(journey?.energy ?? 100);
  const [finished, setFinished] = useState(false);

  const current = QUESTIONS[index] || null;
  const shuffledAnswers = useMemo(() => {
    if (!current) return [];
    const answers = current.options || current.answers || [];
    return shuffleArray(answers);
  }, [current?.id, current?.options, current?.answers]);

  const progress = useMemo(() => (QUESTIONS.length ? Math.round(((index + 1) / QUESTIONS.length) * 100) : 0), [index, QUESTIONS.length]);

  // If level and stage provided via query, load stage content
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const paramLevel = urlParams?.get('level');
  const paramStage = urlParams?.get('stage');
  const [stageContent, setStageContent] = useState(null);
  useEffect(() => {
    if (!paramLevel || !paramStage) return;
    let mounted = true;
    getLevelContent(paramLevel).then((data) => {
      if (!mounted) return;
      const st = (data.stages || []).find((s) => s.id === paramStage);
      setStageContent({ level: data.level, levelTitle: data.title, stage: st });
    }).catch((err) => {
      console.warn('Failed to load level content', err.message || err);
    });
    return () => { mounted = false; };
  }, [paramLevel, paramStage]);

  const handleCheck = () => {
    if (finished || !current) return;
    let isCorrect = false;

    if (current.type === 'write') {
      isCorrect = inputAnswer && inputAnswer.trim().toLowerCase() === String(current.correct).trim().toLowerCase();
    } else {
      const answerToCheck = selected || '';
      isCorrect = answerToCheck === current.correct;
    }

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setFeedback('Верно! +5 XP');
      updateJourneyProfile({ xp: (journey?.xp ?? 0) + 5 });
    } else {
      const nextLives = Math.max(0, lives - 1);
      setLives(nextLives);
      setFeedback(`Неверно. Правильный ответ: ${current.correct}`);
      updateJourneyProfile({ lives: nextLives });
      if (nextLives === 0) {
        setFinished(true);
        setFeedback('Жизни закончились. Попробуй снова завтра.');
      }
    }
  };

  const handleNext = () => {
    if (finished) return;
    const spentEnergy = Math.max(0, energy - 2);
    setEnergy(spentEnergy);
    updateJourneyProfile({ energy: spentEnergy });

    if (index >= QUESTIONS.length - 1) {
      if (hasMoreAlphabetQuestions) {
        unlockNextAlphabetQuestion();
        setIndex((prev) => prev + 1);
        setSelected('');
        setInputAnswer('');
        setFeedback('Разблокирована следующая буква! Продолжай.');
        return;
      }

      if (selectedTopic) {
        markPracticeTopicCompleted(selectedTopic.id);
        const updatedJourney = loadJourneyProfile();
        setJourney(updatedJourney);

        const nextTopicName = getCurrentPracticeTopic(updatedJourney.level, updatedJourney.completedTopics || [])?.name;
        if (nextTopicName && nextTopicName !== selectedTopic.name) {
          setIndex(0);
          setSelected('');
          setInputAnswer('');
          setFeedback(`Тема «${selectedTopic.name}» пройдена! Переходим к теме «${nextTopicName}».`);
          setFinished(false);
          return;
        }
      }

      setFinished(true);
      const bonusCoins = correctCount * 2;
      updateJourneyProfile({
        coins: (journey?.coins ?? 0) + bonusCoins,
        wordsLearned: (journey?.wordsLearned ?? 0) + correctCount,
      });
      setFeedback(`Урок завершен! Правильных: ${correctCount}. +${bonusCoins} монет.`);
      return;
    }

    setIndex((prev) => prev + 1);
    setSelected('');
    setInputAnswer('');
    setFeedback('');
  };

  return (
    <div className="practice-page">
      <header className="dashboard-header pet-header">
        <div className="header-container">
          <Logo className="dashboard-logo clickable-logo" alt="Logo" onClick={() => navigate('/dashboard')} role="button" tabIndex={0} />
          <nav className="dashboard-nav">
            <button className="nav-link" onClick={handleGoToCharacter}>Персонаж</button>
            <button className="nav-link active">Урок</button>
            <button className="nav-link" onClick={() => navigate('/tasks')}>Задания</button>
            <button className="nav-link" onClick={handleGoToFriends}>Друзья</button>
            {isAdmin && (
              <button className="nav-link" onClick={() => navigate('/admin')}>Админка</button>
            )}
          </nav>
          <button className="auth-btn" onClick={() => navigate('/profile')}>Вход / Профиль</button>
        </div>
      </header>

      <main className="practice-main">
        <div className="practice-card">
          <div className="practice-top">
            <span>Тема: {selectedTopic?.name || 'Практика'}</span>
            <span>Прогресс: {progress}%</span>
            <span>Жизни: {lives}</span>
            <span>Энергия: {Math.floor(energy)}</span>
          </div>

          {selectedTopic && (selectedTopic.id === 'alphabet' || selectedTopic.type === 'phonetics') && (
            <div className="alphabet-progress">
              Разблокировано букв: {QUESTIONS.length} из {selectedTopic.questions?.length || 0}
            </div>
          )}

          <div className="question-block">
            <h3>{selectedTopic?.name || 'Практика'}</h3>
            <h2>{current ? current.prompt : (stageContent?.stage?.title || 'Нет вопросов')}</h2>
            <div className="answers-grid">
              {current && shuffledAnswers.length > 0 && shuffledAnswers.map((answer) => (
                <button
                  key={answer}
                  className={`answer-btn ${selected === answer ? 'selected' : ''}`}
                  onClick={() => setSelected(answer)}
                  disabled={finished}
                >
                  {answer}
                </button>
              ))}

              {current && current.type === 'write' && (
                <div className="write-answer">
                  <input
                    value={inputAnswer}
                    onChange={(e) => setInputAnswer(e.target.value)}
                    placeholder="Введите ответ"
                    disabled={finished}
                  />
                </div>
              )}

              {current && current.type === 'letter' && current.image && (
                <div className="letter-audio-row">
                  <button className="letter-image" type="button" onClick={playCurrentLetterSound}>
                    <img src={current.image} alt={current.correct || 'letter'} />
                  </button>
                  <div className="letter-audio-panel">
                    <div className="letter-audio-title">Нажми, чтобы услышать звук буквы</div>
                    <button className="play-audio-btn" type="button" onClick={playCurrentLetterSound}>
                      ▶ {current.correct}
                    </button>
                    <div className="letter-audio-hint">Транскрипция: <strong>{current.transcription || (current.correct && letterSoundMap[current.correct]) || current.correct}</strong></div>
                  </div>
                </div>

              )}

              {current && current.type === 'sound' && current.transcription && (
                <div className="sound-transcription">Транскрипция: <strong>{current.transcription || current.correct}</strong></div>
              )}
            </div>
          </div>

          {stageContent && (
            <div style={{ marginTop: 20 }}>
              <h3>{stageContent.stage.title}</h3>
              <p>Тип: {stageContent.stage.type}</p>
              {stageContent.stage.items && (
                <ul>
                  {stageContent.stage.items.map((it, idx) => (
                    <li key={idx}>{typeof it === 'string' ? it : JSON.stringify(it)}</li>
                  ))}
                </ul>
              )}
              <div style={{ marginTop: 12 }}>
                <button onClick={async () => {
                  try {
                    await submitAnswer({ task_id: 0, stage_id: stageContent.stage.id, answer_text: 'completed', is_correct: true, time_spent_seconds: 10 });
                    alert('Отметил как выполненное. Прогресс сохранён.');
                    window.location.reload();
                  } catch (e) {
                    alert('Не удалось сохранить прогресс: ' + (e.message || e));
                  }
                }} style={{ padding: '8px 12px', background: '#7fb0e8', color: '#fff', border: 'none', borderRadius: 6 }}>Отметить как выполнено</button>
              </div>
            </div>
          )}

          {feedback && <p className="feedback">{feedback}</p>}

          <div className="practice-actions">
            <button className="check-btn" onClick={handleCheck} disabled={!selected || finished}>Проверить</button>
            <button className="next-btn" onClick={handleNext} disabled={finished}>Дальше</button>
            <button className="exit-btn" onClick={() => navigate('/tasks')}>Выйти</button>
          </div>
        </div>
      </main>
      <Footer wrapperClass="dashboard-footer" />
    </div>
  );
};

export default PracticePage;
