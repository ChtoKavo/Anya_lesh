import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GoalSelection.css';

const GoalSelection = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleSelectGoal = (goal) => {
    setSelectedGoal(goal);
  };

  const goals = [
    {
      id: 'english',
      title: 'Изучение английского языка',
      description: 'Погрузись в мир английского с увлекательными уроками, играми и практикой',
      icon: '🇬🇧',
      color: '#CBED66',
      bgGradient: 'linear-gradient(135deg, rgba(203, 237, 102, 0.15), rgba(180, 148, 249, 0.08))',
      status: 'active',
      features: [
        '1000+ слов для изучения',
        'Интерактивные игры',
        'Практика произношения',
        'Отслеживание прогресса'
      ]
    },
    {
      id: 'reading',
      title: 'Чтение книг',
      description: 'Развивай кругозор и наслаждайся лучшими книгами',
      icon: '📚',
      color: '#F5D244',
      bgGradient: 'linear-gradient(135deg, rgba(245, 210, 68, 0.15), rgba(203, 237, 102, 0.08))',
      status: 'coming_soon',
      features: [
        '🚧 Скоро появится',
        '🚧 В разработке',
        '🚧 Следите за обновлениями'
      ]
    }
  ];

  const handleContinue = () => {
    if (selectedGoal === 'english') {
      navigate('/assessment');
    }
  };

  const handleSkip = () => {
    navigate('/assessment');
  };

  return (
    <div className="goal-selection">
      <div className="goal-container">
        <div className="header-section">
          <h1 className="title">Выбери свою цель</h1>
          <p className="subtitle">Определи, что ты хочешь изучать, и начни своё путешествие</p>
        </div>

        <div className="goals-grid">
          {goals.map(goal => (
            <div
              key={goal.id}
              className={`goal-card ${selectedGoal === goal.id ? 'selected' : ''} ${goal.status === 'coming_soon' ? 'coming-soon' : ''}`}
              onClick={() => goal.status === 'active' && handleSelectGoal(goal.id)}
            >
              {goal.status === 'coming_soon' && (
                <div className="coming-soon-badge">
                  <span>В разработке</span>
                </div>
              )}
              <div className="goal-icon">
                {goal.icon}
              </div>
              <h2 className="goal-title">{goal.title}</h2>
              <p className="goal-description">{goal.description}</p>
              
              <div className="goal-features">
                {goal.features.map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        <div className="action-section">
          <button 
            className={`continue-btn ${selectedGoal === 'english' ? 'active' : 'disabled'}`}
            onClick={handleContinue}
            disabled={selectedGoal !== 'english'}
          >
            Начать обучение →
          </button>
          <p className="skip-text">
            Не сейчас? <button className="skip-btn" onClick={handleSkip}>Пропустить выбор</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoalSelection;