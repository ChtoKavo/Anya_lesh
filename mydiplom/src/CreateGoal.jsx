import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const CreateGoal = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [goalData, setGoalData] = useState({
    title: '',
    category: '',
    deadline: '',
    currentLevel: 'beginner',
    timePerWeek: 'medium',
    criteria: [],
    template: null,
  });

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [showEffects, setShowEffects] = useState(false);


  const categories = [
    { id: 'sport', name: 'Спорт', icon: '🏃', color: '#FF6B6B' },
    { id: 'creative', name: 'Творчество', icon: '🎨', color: '#9D4EDD' },
    { id: 'learning', name: 'Обучение', icon: '📚', color: '#4299E1' },
    { id: 'career', name: 'Карьера', icon: '💼', color: '#00CC88' },
    { id: 'health', name: 'Здоровье', icon: '💚', color: '#2ECC71' },
    { id: 'other', name: 'Другое', icon: '⭐', color: '#FFD700' },
  ];


  const goalTemplates = {
    sport: [
      { 
        id: 'run_10k', 
        name: 'Пробежать 10 км',
        description: 'Подготовка к забегу на 10 км',
        duration: '8 недель',
        phases: [
          { name: 'База', weeks: 3, tasks: ['Легкий бег 3 раза в неделю', 'Растяжка после тренировок'] },
          { name: 'Интенсив', weeks: 3, tasks: ['Интервальные тренировки', 'Увеличение дистанции'] },
          { name: 'Пик', weeks: 2, tasks: ['Длинные пробежки', 'Восстановление'] }
        ]
      },
      {
        id: 'lose_weight',
        name: 'Похудеть на 5 кг',
        description: 'Здоровое похудение',
        duration: '12 недель',
        phases: [
          { name: 'Старт', weeks: 4, tasks: ['Контроль питания', 'Кардио 3 раза в неделю'] },
          { name: 'Активная фаза', weeks: 6, tasks: ['Силовые тренировки', 'Дефицит калорий'] },
          { name: 'Закрепление', weeks: 2, tasks: ['Поддержание формы', 'Новые привычки'] }
        ]
      }
    ],
    creative: [
      {
        id: 'learn_guitar',
        name: 'Научиться играть на гитаре',
        description: 'Сыграть первую песню',
        duration: '12 недель',
        phases: [
          { name: 'Основы', weeks: 4, tasks: ['Изучение аккордов', 'Базовый бой'] },
          { name: 'Практика', weeks: 6, tasks: ['Разучивание песни', 'Работа с ритмом'] },
          { name: 'Совершенствование', weeks: 2, tasks: ['Запись исполнения', 'Работа над ошибками'] }
        ]
      }
    ]
  };


  const successCriteria = [
    { id: 'measurement', label: 'Измеряемый результат (км, кг, книги)' },
    { id: 'deadline', label: 'Конкретный срок' },
    { id: 'realistic', label: 'Реалистичность' },
    { id: 'specific', label: 'Конкретность' },
    { id: 'relevant', label: 'Актуальность для меня' }
  ];


  const Step1 = () => (
    <div className="step-container animate-fadeIn">
      <h2 className="step-title"> Сформулируй свою цель</h2>
      
      <div className="input-group">
        <label>Чего ты хочешь достичь?</label>
        <input
          type="text"
          className="goal-input"
          placeholder="Например: Научиться играть на гитаре"
          value={goalData.title}
          onChange={(e) => setGoalData({...goalData, title: e.target.value})}
          style={{fontSize: '18px', padding: '15px'}}
        />
      </div>

      <div className="input-group">
        <label>Сфера жизни</label>
        <div className="category-grid">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={`category-card ${goalData.category === cat.id ? 'selected' : ''}`}
              onClick={() => {
                setGoalData({...goalData, category: cat.id});
                
                document.getElementById(`cat-${cat.id}`).classList.add('pulse');
                setTimeout(() => {
                  document.getElementById(`cat-${cat.id}`).classList.remove('pulse');
                }, 300);
              }}
              id={`cat-${cat.id}`}
              style={{borderLeft: `5px solid ${cat.color}`}}
            >
              <div className="category-icon">{cat.icon}</div>
              <div className="category-name">{cat.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="input-group">
        <label>Дедлайн (когда хотите достичь?)</label>
        <input
          type="date"
          className="goal-input"
          value={goalData.deadline}
          onChange={(e) => setGoalData({...goalData, deadline: e.target.value})}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <button
        className="btn-primary"
        onClick={() => {
          if (goalData.title && goalData.category && goalData.deadline) {
            setShowEffects(true);
            setTimeout(() => {
              setShowEffects(false);
              setStep(2);
            }, 1000);
          } else {
            alert('Заполните все поля!');
          }
        }}
        style={{marginTop: '20px'}}
      >
        Далее →
      </button>
    </div>
  );

  // Шаг 2: Детализация
  const Step2 = () => (
    <div className="step-container animate-fadeIn">
      <h2 className="step-title">Детализируем цель</h2>
      
      <div className="input-group">
        <label>Ваш текущий уровень</label>
        <div className="level-selector">
          {[
            {value: 'beginner', label: ' Начинающий', desc: 'Только начинаю'},
            {value: 'basic', label: ' Знаю основы', desc: 'Имею небольшой опыт'},
            {value: 'intermediate', label: ' Средний уровень', desc: 'Могу делать базовые вещи'},
            {value: 'advanced', label: ' Продвинутый', desc: 'Хочу улучшить навыки'}
          ].map(level => (
            <div
              key={level.value}
              className={`level-card ${goalData.currentLevel === level.value ? 'selected' : ''}`}
              onClick={() => setGoalData({...goalData, currentLevel: level.value})}
            >
              <div className="level-label">{level.label}</div>
              <div className="level-desc">{level.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="input-group">
        <label>Сколько времени готов уделять в неделю?</label>
        <div className="time-selector">
          {[
            {value: 'low', label: '1-3 часа', emoji: '🐢'},
            {value: 'medium', label: '3-6 часов', emoji: '🚶'},
            {value: 'high', label: '6+ часов', emoji: '⚡'}
          ].map(time => (
            <button
              key={time.value}
              className={`time-btn ${goalData.timePerWeek === time.value ? 'active' : ''}`}
              onClick={() => setGoalData({...goalData, timePerWeek: time.value})}
            >
              <span style={{fontSize: '24px'}}>{time.emoji}</span>
              <span>{time.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="input-group">
        <label>Критерии успеха (выберите 2-3)</label>
        <div className="criteria-grid">
          {successCriteria.map(criterion => (
            <div
              key={criterion.id}
              className={`criterion-card ${goalData.criteria.includes(criterion.id) ? 'selected' : ''}`}
              onClick={() => {
                const newCriteria = goalData.criteria.includes(criterion.id)
                  ? goalData.criteria.filter(id => id !== criterion.id)
                  : [...goalData.criteria, criterion.id];
                setGoalData({...goalData, criteria: newCriteria});
                
                
                const card = document.querySelector(`[data-criterion="${criterion.id}"]`);
                card.classList.add('bounce');
                setTimeout(() => card.classList.remove('bounce'), 500);
              }}
              data-criterion={criterion.id}
            >
              <div className="checkmark">✓</div>
              <div className="criterion-text">{criterion.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
        <button className="btn-secondary" onClick={() => setStep(1)}>
          ← Назад
        </button>
        <button 
          className="btn-primary"
          onClick={() => {
            if (goalData.criteria.length >= 2) {
              generatePlan();
              setShowEffects(true);
              setTimeout(() => {
                setShowEffects(false);
                setStep(3);
              }, 1500);
            } else {
              alert('Выберите хотя бы 2 критерия успеха!');
            }
          }}
        >
          Сгенерировать план →
        </button>
      </div>
    </div>
  );

  // Генерация плана
  const generatePlan = () => {
    const templates = goalTemplates[goalData.category] || [];
    const selectedTemplate = templates[0]; 
    
    if (selectedTemplate) {
      let adaptedPhases = [...selectedTemplate.phases];
      if (goalData.timePerWeek === 'low') {
        adaptedPhases = adaptedPhases.map(phase => ({
          ...phase,
          weeks: Math.ceil(phase.weeks * 1.5) 
        }));
      } else if (goalData.timePerWeek === 'high') {
        adaptedPhases = adaptedPhases.map(phase => ({
          ...phase,
          weeks: Math.max(1, Math.floor(phase.weeks * 0.8)) 
        }));
      }

      setGeneratedPlan({
        ...selectedTemplate,
        phases: adaptedPhases,
        dailyTasks: [
          '15 минут практики ежедневно',
          'Отслеживание прогресса',
          'Еженедельный отчет'
        ],
        weeklyChallenges: adaptedPhases.map((phase, index) => ({
          title: `Завершить фазу "${phase.name}"`,
          tasks: phase.tasks
        }))
      });
    }
  };

  // Шаг 3: Генерация плана
  const Step3 = () => (
    <div className="step-container animate-fadeIn">
      <h2 className="step-title"> Ваш план готов!</h2>
      
      {generatedPlan && (
        <>
          <div className="plan-header">
            <h3 style={{color: categories.find(c => c.id === goalData.category)?.color}}>
              {goalData.title}
            </h3>
            <div className="plan-badge">
              <span> {generatedPlan.duration}</span>
              <span> {goalData.criteria.length} критериев</span>
            </div>
          </div>

          <div className="plan-visualization">
            <div className="timeline">
              {generatedPlan.phases.map((phase, index) => (
                <div key={index} className="phase-item">
                  <div className="phase-marker">
                    <div className="phase-number">{index + 1}</div>
                    <div className="phase-line"></div>
                  </div>
                  <div className="phase-content">
                    <h4>{phase.name}</h4>
                    <p>{phase.weeks} недель</p>
                    <ul>
                      {phase.tasks.map((task, i) => (
                        <li key={i}>• {task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="daily-tasks-preview">
            <h4> Ежедневные задания (авто-генерация)</h4>
            <div className="tasks-list">
              {generatedPlan.dailyTasks.map((task, index) => (
                <div key={index} className="task-item">
                  <div className="task-checkbox"></div>
                  <span>{task}</span>
                  <span className="task-reward">+10 EXP</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pet-impact">
            <h4> Влияние на питомца</h4>
            <div className="impact-visual">
              <div className="pet-preview"></div>
              <div className="impact-text">
                Эта цель поможет вашему питомцу эволюционировать в
                <span className="evolution-name"> "Мастера {categories.find(c => c.id === goalData.category)?.name}"</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="action-buttons">
        <button className="btn-secondary" onClick={() => setStep(2)}>
          ← Изменить план
        </button>
        <button 
          className="btn-primary"
          onClick={() => {
        
            setShowEffects(true);
            setTimeout(() => {
              alert('Цель создана! Теперь она появится в вашем списке целей.');
              navigate('/dashboard');
            }, 2000);
          }}
          style={{background: 'linear-gradient(90deg, #00CC88, #00AA66)'}}
        >
          Создать цель
        </button>
      </div>
    </div>
  );

  const Effects = () => (
    <div className="effects-container">
      {showEffects && (
        <>
          <div className="confetti"></div>
          <div className="sparkles"></div>
          <div className="particles"></div>
          <div className="glow-effect"></div>
        </>
      )}
    </div>
  );

  const ProgressBar = () => (
    <div className="progress-container">
      <div className="progress-steps">
        {[1, 2, 3].map(num => (
          <div key={num} className={`progress-step ${step >= num ? 'active' : ''}`}>
            <div className="step-circle">{num}</div>
            <div className="step-label">
              {num === 1 && 'Формулировка'}
              {num === 2 && 'Детализация'}
              {num === 3 && 'План'}
            </div>
          </div>
        ))}
      </div>
      <div className="progress-line">
        <div 
          className="progress-fill" 
          style={{width: `${((step - 1) / 2) * 100}%`}}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="create-goal-page">
      <Effects />
      
      <div className="goal-wizard">
        <div className="wizard-header">
          <h1> Проводник целей</h1>
          <p>Создайте цель, а мы поможем с планом достижения</p>
        </div>

        <ProgressBar />

        <div className="wizard-content">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
        </div>

        <div className="wizard-tip">
          💡 Совет: Цели с чётким планом достигаются в 3 раза чаще!
        </div>
      </div>
    </div>
  );
};

export default CreateGoal;