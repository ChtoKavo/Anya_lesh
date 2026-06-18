import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import './Tasks.css';
import Logo from './Logo';
import Footer from './Footer';
import { loadJourneyProfile, getCurrentTasks, completeTask } from './userJourney';
import { getLearningPath } from './learningPath';

const Tasks = () => {
  const navigate = useNavigate();
  const [clouds, setClouds] = useState([]);

  // Облака
  useEffect(() => {
    const cloudPositions = [
      { top: '5%', left: '2%', width: '180px', opacity: 0.7, zIndex: 0 },
      { top: '15%', right: '3%', width: '220px', opacity: 0.6, zIndex: 0 },
      { bottom: '20%', left: '5%', width: '150px', opacity: 0.8, zIndex: 0 },
      { bottom: '10%', right: '8%', width: '280px', opacity: 0.5, zIndex: 0 },
      { top: '40%', left: '10%', width: '120px', opacity: 0.9, zIndex: 0 },
      { top: '60%', right: '12%', width: '200px', opacity: 0.6, zIndex: 0 },
      { bottom: '45%', left: '15%', width: '160px', opacity: 0.7, zIndex: 0 },
      { top: '75%', right: '5%', width: '190px', opacity: 0.5, zIndex: 0 }
    ];
    
    const shuffled = [...cloudPositions].sort(() => 0.5 - Math.random());
    setClouds(shuffled.slice(0, 6));
  }, []);

  const handleGoToDashboard = () => navigate('/dashboard');
  const handleGoToCharacter = () => navigate('/pet');
  const handleGoToPractice = () => navigate('/practice');
  const handleGoToFriends = () => navigate('/friends');
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const handleGoToProfile = () => navigate('/profile');
  const handleGoToTasks = () => navigate('/tasks');

  const [tasks, setTasks] = useState(() => getCurrentTasks().tasks);

  const journey = loadJourneyProfile();

  const alphabetQuestions = (() => {
    try {
      if ((journey?.level || 'beginner') !== 'beginner') return [];
      const path = getLearningPath(journey.level || 'beginner');
      for (const stage of path.stages || []) {
        for (const topic of stage.topics || []) {
          if (topic.id === 'alphabet' || topic.type === 'phonetics' || (topic.name || '').toLowerCase().includes('алфавит')) {
            return Array.isArray(topic.questions) ? topic.questions : [];
          }
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  })();

  const [energy, setEnergy] = useState(() => loadJourneyProfile()?.energy ?? 100);
  const [maxEnergy] = useState(100);
  const [coins, setCoins] = useState(() => loadJourneyProfile()?.coins ?? 0);
  const [lives, setLives] = useState(() => loadJourneyProfile()?.lives ?? 3);
  const [activeTab, setActiveTab] = useState('daily');

  const handleCompleteTask = async (taskId) => {
    const result = completeTask(taskId, 'tasks');
    if (!result.success) return;

    // Save to backend so the teacher can see it
    try {
      const { submitAnswer } = await import('./apiClient');
      const taskObj = tasks.find(t => t.id === taskId);
      await submitAnswer({
        task_id: taskId,
        stage_id: 'daily-task',
        answer_text: taskObj ? taskObj.title : 'Task completed',
        is_correct: true,
        time_spent_seconds: 60 // Estimate
      });
    } catch (e) {
      console.warn('Failed to sync task completion to backend', e);
    }

    const updatedProfile = loadJourneyProfile();
    const currentTasks = getCurrentTasks().tasks;
    setTasks(currentTasks);
    setEnergy(updatedProfile?.energy ?? 100);
    setCoins(updatedProfile?.coins ?? 0);
    setLives(updatedProfile?.lives ?? 3);
  };

  const dailyTasks = tasks.filter(t => t.type === 'daily');
  const completedDailyCount = dailyTasks.filter(t => t.completed).length;
  const dailyProgress = dailyTasks.length ? (completedDailyCount / dailyTasks.length) * 100 : 0;

  return (
    <div className="tasks">
      <div className="background-image" style={{ backgroundImage: `url('/background.jpg')` }}></div>
      
      {/* Облака */}
      {clouds.map((cloud, index) => (
        <img
          key={index}
          src="/cloud.png"
          alt="cloud"
          className="floating-cloud"
          style={{
            position: 'fixed',
            top: cloud.top,
            left: cloud.left,
            right: cloud.right,
            bottom: cloud.bottom,
            width: cloud.width,
            opacity: cloud.opacity,
            zIndex: cloud.zIndex,
            pointerEvents: 'none'
          }}
        />
      ))}

      <header className="tasks-header">
        <div className="header-container">
          <Logo className="tasks-logo clickable-logo" alt="Logo" onClick={handleGoToDashboard} role="button" tabIndex={0} />
          <nav className="tasks-nav">
            <button className="nav-link" onClick={handleGoToCharacter}>Персонаж</button>
            <button className="nav-link" onClick={handleGoToPractice}>Урок</button>
            <button className="nav-link active" onClick={handleGoToTasks}>Задания</button>
            <button className="nav-link" onClick={handleGoToFriends}>Друзья</button>
            {isAdmin && (
              <button className="nav-link" onClick={() => navigate('/admin')}>Админка</button>
            )}
          </nav>
          <button className="auth-btn" onClick={handleGoToProfile}>Вход / Профиль</button>
        </div>
      </header>

      <Breadcrumbs />

      <main className="tasks-main">
        <div className="tasks-container">
          <div className="stats-row">
            <div className="stat-card">
              <img src="/energy2.png" alt="energy" className="stat-icon-large" />
              <div className="stat-info">
                <span className="stat-label">Энергия</span>
                <span className="stat-value">{energy}/{maxEnergy}</span>
                <div className="stat-progress">
                  <div className="stat-progress-fill" style={{ width: `${(energy / maxEnergy) * 100}%` }}></div>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <img src="/money.png" alt="coins" className="stat-icon-large" />
              <div className="stat-info">
                <span className="stat-label">Монеты</span>
                <span className="stat-value">{coins}</span>
              </div>
            </div>
            <div className="stat-card">
              <img src="/heart.png" alt="lives" className="stat-icon-large" />
              <div className="stat-info">
                <span className="stat-label">Жизни</span>
                <span className="stat-value">{lives}</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '18px', textAlign: 'center' }}>
            <button className="tasks-practice-btn" onClick={() => navigate('/practice')}>
              Начать выполнение заданий →
            </button>
          </div>

          {alphabetQuestions.length > 0 && (
            <div className="alphabet-section">
              <h3>Алфавит (уровень 1)</h3>
              <div className="alphabet-grid">
                {alphabetQuestions.map(q => (
                  <div key={q.id} className="alphabet-card">
                    <div className="alphabet-info">
                      <strong className="alphabet-letter">{q.correct || q.prompt || q.id}</strong>
                      {q.transcription && <div className="alphabet-trans">{q.transcription}</div>}
                      {q.audio && (
                        <button className="play-audio" onClick={() => { try { new Audio(q.audio).play(); } catch (e) {} }}>
                          ▶
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="tasks-tabs">
            <button className={`tab-btn active`}>
              Ежедневные задания
              <span className="tab-count">{completedDailyCount}/{dailyTasks.length}</span>
            </button>
          </div>

          {activeTab === 'daily' && (
            <div className="tasks-list">
              <div className="progress-card">
                <div className="progress-bar-wrapper">
                  <div className="progress-fill" style={{ width: `${dailyProgress}%` }}></div>
                </div>
                <p className="progress-text">Прогресс дня: {completedDailyCount} из {dailyTasks.length} выполнено</p>
              </div>

              {dailyTasks.map(task => (
                <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                  <div className="task-left">
                    <button className={`task-checkbox ${task.completed ? 'checked' : ''}`} onClick={() => handleCompleteTask(task.id)} disabled={task.completed}>
                      {task.completed && '✓'}
                    </button>
                    <div className="task-info">
                      <h4 className="task-title">{task.title}</h4>
                      <p className="task-desc">{task.description}</p>
                    </div>
                  </div>
                  <div className="task-right">
                    <div className="task-rewards">
                      <span className="reward"><img src="/energy2.png" alt="energy" /> +{task.energyReward}</span>
                      <span className="reward"><img src="/money.png" alt="coins" /> +{task.coinReward}</span>
                    </div>
                    <span className="task-deadline">{task.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Еженедельные задания удалены — только ежедневные остаются */}

          <div className="bonus-card">
            <div className="bonus-info">
              <h4>Бонус за выполнение всех заданий</h4>
              <p>Выполни все 3 ежедневных задания и получи дополнительные награды</p>
            </div>
            <div className="bonus-rewards">
              <span className="bonus-reward"><img src="/energy2.png" alt="energy" /> +20</span>
              <span className="bonus-reward"><img src="/money.png" alt="coins" /> +25</span>
            </div>
          </div>
        </div>
      </main>

      <Footer wrapperClass="tasks-footer" />
    </div>
  );
};

export default Tasks;