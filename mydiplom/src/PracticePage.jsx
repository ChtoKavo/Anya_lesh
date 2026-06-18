import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PracticePage.css';
import './Pet.css';
import './Dashboard.css';
import Logo from './Logo';
import Footer from './Footer';
import { submitAnswer } from './apiClient';
import { loadJourneyProfile, updateJourneyProfile, markPracticeTopicCompleted } from './userJourney';
import { LEARNING_PATHS } from './learningPath';

const shuffleArray = (items) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const PracticePage = () => {
  const navigate = useNavigate();
  const [journey, setJourney] = useState(loadJourneyProfile());
  const [inputAnswer, setInputAnswer] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(journey?.level || 'beginner');

  const isAdmin = localStorage.getItem('userRole') === 'admin';

  const handleLevelSwitch = (levelKey) => {
    setSelectedLevel(levelKey);
    updateJourneyProfile({ level: levelKey });
    setIndex(0);
    setCorrectCount(0);
    setFinished(false);
    setFeedback('');
    setSelected('');
    setInputAnswer('');
  };

  const path = LEARNING_PATHS[selectedLevel] || LEARNING_PATHS.beginner;
  const allTopics = path.stages[0].topics;
  
  // Progress tracking
  const completedTopics = journey?.completedTopics || [];
  const currentTopic = allTopics.find(t => !completedTopics.includes(t.id)) || allTopics[allTopics.length - 1];
  const currentTopicIndex = allTopics.findIndex(t => t.id === currentTopic.id);
  const selectedTopic = currentTopic;

  const QUESTIONS = selectedTopic?.questions || [];

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
    const answers = current.options || [];
    return shuffleArray(answers);
  }, [current?.id, current?.options]);

  const progress = useMemo(() => (QUESTIONS.length ? Math.round(((index + 1) / QUESTIONS.length) * 100) : 0), [index, QUESTIONS.length]);

  const handleCheck = async () => {
    if (finished || !current) return;
    let isCorrect = false;

    if (current.type === 'write') {
      isCorrect = inputAnswer && inputAnswer.trim().length > 10;
    } else {
      isCorrect = selected === current.correct;
    }

    try {
      await submitAnswer({
        task_id: selectedTopic.id,
        stage_id: 'practice',
        answer_text: current.type === 'write' ? inputAnswer : selected,
        is_correct: isCorrect,
        time_spent_seconds: 10
      });
    } catch (e) {
      console.warn('Failed to save answer to backend', e);
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
      markPracticeTopicCompleted(selectedTopic.id);
      const totalWords = (journey?.wordsLearned || 0) + 5;
      updateJourneyProfile({ wordsLearned: totalWords });
      setJourney(loadJourneyProfile());

      if (currentTopicIndex >= allTopics.length - 1) {
        setFinished(true);
        const remainingLevels = Object.keys(LEARNING_PATHS).filter(k => k !== selectedLevel);
        const recommendations = remainingLevels.map(k => LEARNING_PATHS[k].label).join(' или ');
        setFeedback(`Уровень пройден! +${correctCount * 5} монет. ${remainingLevels.length ? `Теперь ты можешь выбрать: ${recommendations}.` : ''}`);
        updateJourneyProfile({ coins: (journey?.coins || 0) + correctCount * 5 });
        return;
      }

      setIndex(0);
      setSelected('');
      setInputAnswer('');
      setFeedback(`Задание "${selectedTopic.name}" пройдено! Переходим к следующему.`);
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
            <button className="nav-link" onClick={() => navigate('/pet')}>Персонаж</button>
            <button className="nav-link active">Урок</button>
            <button className="nav-link" onClick={() => navigate('/tasks')}>Задания</button>
            <button className="nav-link" onClick={() => navigate('/friends')}>Друзья</button>
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
            <span>{selectedTopic?.name}</span>
            <span>Прогресс: {progress}%</span>
            <span>Жизни: {lives}</span>
            <span>Энергия: {Math.floor(energy)}</span>
          </div>

          <div className="question-block">
            <h3>{selectedLevel === 'beginner' ? 'Новичок' : selectedLevel === 'intermediate' ? 'Продвинутый' : 'Шарящий'}</h3>
            <h2>{current?.prompt || 'Загрузка...'}</h2>
            <div className="answers-grid">
              {current && current.type !== 'write' && shuffledAnswers.map((answer) => (
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
                <div className="write-answer" style={{ width: '100%' }}>
                  <textarea
                    value={inputAnswer}
                    onChange={(e) => setInputAnswer(e.target.value)}
                    placeholder="Напишите ваш ответ здесь..."
                    disabled={finished}
                    style={{
                      width: '100%',
                      minHeight: '150px',
                      padding: '15px',
                      borderRadius: '15px',
                      border: '1px solid #7fb0e8',
                      fontFamily: 'inherit',
                      fontSize: '16px'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#5a7a9a', marginTop: '8px' }}>
                    Минимум 10 символов для проверки.
                  </p>
                </div>
              )}
            </div>
          </div>

          {feedback && <p className="feedback" style={{ 
            padding: '10px', 
            borderRadius: '10px', 
            background: feedback.includes('Верно') ? '#e8f5e9' : '#ffebee',
            color: feedback.includes('Верно') ? '#2e7d32' : '#c62828',
            marginTop: '15px'
          }}>{feedback}</p>}

          <div className="practice-actions">
            <button 
              className="check-btn" 
              onClick={handleCheck} 
              disabled={(current?.type === 'write' ? !inputAnswer : !selected) || finished}
              style={{ flex: 1 }}
            >
              Проверить
            </button>
            <button className="next-btn" onClick={handleNext} disabled={!feedback || finished} style={{ flex: 1 }}>Дальше</button>
            <button className="exit-btn" onClick={() => navigate('/tasks')} style={{ flex: 0.5 }}>Выйти</button>
          </div>
        </div>
      </main>
      <Footer wrapperClass="dashboard-footer" />
    </div>
  );
};

export default PracticePage;
