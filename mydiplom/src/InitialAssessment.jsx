// InitialAssessment.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InitialAssessment.css';
import Logo from './Logo';
import { saveJourneyProfile } from './userJourney';
import { LEARNING_PATHS, getEstimatedTimeRemaining } from './learningPath';

const InitialAssessment = () => {
  const navigate = useNavigate();

  const levelLabels = {
    beginner: 'Новичок (A1–A2) - основы',
    intermediate: 'Продвинутый (B1–B2) - уверенный средний',
    advanced: 'Шарящий (C1–C2) - мастерство',
  };

  const [dailyMinutes, setDailyMinutes] = useState('20');
  const [level, setLevel] = useState('beginner');
  const [goalTitle, setGoalTitle] = useState(`Английский язык: ${levelLabels['beginner']}`);
  const [selectedMonths, setSelectedMonths] = useState(LEARNING_PATHS['beginner'].defaultMonths);
  const [showTimeInfo, setShowTimeInfo] = useState(false);

  const levelDescriptions = {
    beginner: '10 заданий от алфавита до Past Simple. Идеально для старта.',
    intermediate: '10 заданий: Present Perfect, модальные глаголы, пассивный залог и монолог.',
    advanced: '10 заданий: инверсия, идиомы, акценты, дебаты и импровизация.',
  };

  const selectedPath = LEARNING_PATHS[level];
  const defaultMonths = selectedPath?.defaultMonths || 12;
  const monthsValue = selectedMonths || defaultMonths;

  const estimatedTime = getEstimatedTimeRemaining(level, 0, parseInt(dailyMinutes));
  // calculation for user-selected months: required words/day/month to meet chosen term
  const remainingWords = Math.max(0, (selectedPath?.totalWordsTarget || 1000) - 0);
  const requiredWordsPerMonth = Math.ceil(remainingWords / monthsValue);
  const requiredWordsPerDayForTarget = Math.max(1, Math.ceil(remainingWords / (monthsValue * 30)));
  const qualityPercent = Math.round((monthsValue / defaultMonths) * 100);

  const handleLevelChange = (e) => {
    const newLevel = e.target.value;
    setLevel(newLevel);
    // update selected months to the new level's default and title
    const p = LEARNING_PATHS[newLevel];
    if (p) {
      setSelectedMonths(p.defaultMonths);
      setGoalTitle(`Английский язык: ${p.label}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + monthsValue);

    saveJourneyProfile({
      dailyMinutes: Number(dailyMinutes),
      level,
      levelLabel: levelLabels[level],
      goalTitle: goalTitle || `Английский язык до уровня ${levelLabels[level]}`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      wordsLearned: 0,
      streakDays: 0,
      xp: 0,
      coins: 50,
      energy: 100,
      lives: 3,
      petName: 'Хранитель',
      currentTopic: null,
      completedTopics: [],
      topicProgress: { alphabet: 1 },
      lastLoginDate: startDate.toISOString(),
    });

    navigate('/onboarding-tour');
  };

  return (
    <div className="assessment-page">
      <div className="assessment-card">
        <h1>Добро пожаловать в <Logo alt="Logo" className="inline-logo" /></h1>
        <p>Ответь на несколько вопросов, чтобы мы подобрали идеальную программу обучения.</p>

        <form onSubmit={handleSubmit} className="assessment-form">
          <div className="form-group">
            <label>Сколько минут в день планируешь заниматься?</label>
            <select value={dailyMinutes} onChange={(e) => setDailyMinutes(e.target.value)}>
              <option value="10">10 минут (легкий режим)</option>
              <option value="20">20 минут (рекомендуем)</option>
              <option value="30">30 минут (интенсив)</option>
              <option value="45">45 минут (супер-интенсив)</option>
              <option value="60">60 минут (марафон)</option>
            </select>
            <small className="hint">При 20 минутах в день ты выучишь ~5-8 слов ежедневно</small>
          </div>

          <div className="form-group">
            <label>Какой у тебя текущий уровень?</label>
            <div className="level-options">
              {['beginner', 'intermediate', 'advanced'].map(lvl => (
                <div 
                  key={lvl}
                  className={`level-option ${level === lvl ? 'selected' : ''}`}
                  onClick={() => handleLevelChange({ target: { value: lvl } })}
                >
                  <div className="level-radio">
                    <input
                      type="radio"
                      name="level"
                      value={lvl}
                      checked={level === lvl}
                      onChange={handleLevelChange}
                    />
                    <span className="level-title">{levelLabels[lvl]}</span>
                  </div>
                  <p className="level-desc">{levelDescriptions[lvl]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Срок достижения цели (месяцев)</label>
            <div className="months-options">
              <div className="months-presets">
                {[3, 6, 9, 12, 18, 24].map(m => {
                  const disabled = m < (selectedPath?.minMonths || 1) || m > (selectedPath?.maxMonths || 36);
                  return (
                    <button
                      key={m}
                      type="button"
                      disabled={disabled}
                      className={`month-preset ${monthsValue === m ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                      onClick={() => setSelectedMonths(m)}
                    >
                      {m} мес
                    </button>
                  );
                })}
              </div>
            </div>
            <small className="hint">
              Рекомендуем: {selectedPath?.defaultMonths} месяцев для уровня {selectedPath?.label}. Меньше срок — ниже качество ({qualityPercent}%).
            </small>
          </div>

          <div className="form-group">
            <label>Название цели</label>
            <input 
              value={goalTitle} 
              onChange={(e) => setGoalTitle(e.target.value)} 
              placeholder="Например: Свободно говорить по-английски"
              required 
            />
          </div>

          <button 
            type="button" 
            className="info-btn"
            onClick={() => setShowTimeInfo(!showTimeInfo)}
          >
            {showTimeInfo ? 'Скрыть расчёт' : 'Показать расчёт времени'}
          </button>

          {showTimeInfo && (
            <div className="time-info">
              <h4>Примерный расчёт:</h4>
              <p>При {dailyMinutes} минутах в день:</p>
              <ul>
                <li>Слов в день (оценка): ~{estimatedTime.wordsPerDay}</li>
                <li>Осталось выучить: ~{estimatedTime.remainingWords} слов</li>
                <li>Ожидаемое при выбранном сроке: {monthsValue} мес — ~{requiredWordsPerMonth} слов/мес (~{requiredWordsPerDayForTarget} слов/день)</li>
                <li>Автоматическая оценка по скорости: потребуется ~{estimatedTime.days} дней ({estimatedTime.months} мес) при текущем темпе</li>
                <li>Качество цели (ориентир): {qualityPercent}% (меньше — ниже глубина проработки)</li>
              </ul>
              <div className="stages-preview">
                <h4>Этапы обучения:</h4>
                {selectedPath?.stages.map(stage => (
                  <div key={stage.id} className="stage-preview">
                    <span className="stage-color" style={{ background: stage.color }}></span>
                    <span>{stage.name}</span>
                    <span className="stage-months">{stage.monthsRange[0]}-{stage.monthsRange[1]} мес</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn">
            Начать обучение 
          </button>
        </form>
      </div>
    </div>
  );
};

export default InitialAssessment;