import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnboardingTour.css';

const OnboardingTour = ({ onComplete, onSkip }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [clouds, setClouds] = useState([]);

  const steps = [
    {
      title: 'Добро пожаловать!',
      description: 'Добро пожаловать в Трекер Целей! Здесь ты будешь учить английский, прокачивать питомца и открывать новые возможности.',
      petImage: '/image 179.png',
      petEmotion: 'happy'
    },
    {
      title: 'Твой питомец',
      description: 'Твой верный спутник. Он растёт вместе с тобой! Чем больше ты учишься, тем сильнее становится твой друг.',
      petImage: '/image 171.png',
      petEmotion: 'happy',
      highlight: 'Кликни на питомца, чтобы узнать о нём больше!'
    },
    {
      title: 'Задания',
      description: 'Тебе будут выданы ежедневные и недельные задания. Выполняй их, чтобы получать монеты и энергию для прокачки питомца.',
      petImage: '/image 172.png',
      petEmotion: 'happy',
      highlight: 'Каждое задание приносит награду!'
    },
    {
      title: 'Рейтинг и прогресс',
      description: 'Отслеживай свой прогресс. Чем больше заданий выполняешь, тем выше твой уровень и рейтинг среди других игроков.',
      petImage: '/image 174.png',
      petEmotion: 'weak'
    },
    {
      title: 'Энергия монеты сердце',
      description: 'Энергия нужна для выполнения действий, монеты — для покупки предметов в магазине, а сердце для восстановления прогресса, если нет активности. Задания пополняют все три ресурса!',
      petImage: '/image 175.png',
      petEmotion: 'happy'
    },
    {
      title: 'Магазин предметов',
      description: 'Трать монеты на полезные предметы. Они помогут тебе быстрее прокачивать питомца и открывать новые возможности.',
      petImage: '/image 176.png',
      petEmotion: 'happy'
    },
    {
      title: 'Мини-игра',
      description: 'Играй в космическое приключение! Собирай кристаллы и получай дополнительные награды для своего питомца.',
      petImage: '/image 177.png',
      petEmotion: 'happy'
    },
    {
      title: 'Готов к приключениям?',
      description: 'Ты готов начать своё путешествие к свободному английскому? Вперёд, тебя ждут увлекательные задания и новые достижения!',
      petImage: '/image 178.png',
      petEmotion: 'happy',
      isFinal: true
    }
  ];

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timer);
  }, [currentStep]);

  useEffect(() => {
    const cloudPositions = [
      { top: '8%', left: '4%', width: '160px', opacity: 0.75, zIndex: 0 },
      { top: '12%', right: '6%', width: '200px', opacity: 0.65, zIndex: 0 },
      { bottom: '20%', left: '8%', width: '140px', opacity: 0.8, zIndex: 0 },
      { bottom: '12%', right: '10%', width: '220px', opacity: 0.55, zIndex: 0 },
      { top: '45%', left: '10%', width: '120px', opacity: 0.7, zIndex: 0 }
    ];
    setClouds(cloudPositions.sort(() => 0.5 - Math.random()).slice(0, 4));
  }, []);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Если передан onComplete, используем его, иначе переходим на дашборд
      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    if (onSkip) {
      onSkip();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="onboarding-overlay">
      {clouds.map((cloud, index) => (
        <img
          key={index}
          src="/cloud.png"
          alt="cloud"
          className="onboarding-cloud"
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
      <div className="onboarding-modal">
        <div className="tour-progress-bar">
          <div className="tour-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        {/* close button intentionally removed per request */}

        <div className={`tour-content ${isAnimating ? 'tour-fade-in' : ''}`}>
          <div className="tour-pet-container">
            <img 
              src={currentStepData.petImage} 
              alt="pet" 
              className={`tour-pet-image tour-pet-${currentStepData.petEmotion}`}
            />
            <div className="tour-pet-glow"></div>
          </div>

          <h2 className="tour-title">{currentStepData.title}</h2>
          <p className="tour-description">{currentStepData.description}</p>

          {currentStepData.highlight && (
            <div className="tour-highlight">
              <span className="tour-highlight-text">{currentStepData.highlight}</span>
            </div>
          )}
        </div>

        <div className="tour-buttons">
          {currentStep > 0 && (
            <button className="tour-btn tour-btn-prev" onClick={handlePrev}>
              Назад
            </button>
          )}
          
          <button 
            className={`tour-btn tour-btn-next ${currentStepData.isFinal ? 'tour-btn-final' : ''}`} 
            onClick={handleNext}
          >
            {currentStepData.isFinal ? 'Начать' : 'Дальше'}
          </button>
        </div>

        <div className="tour-steps-counter">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`tour-step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
              onClick={() => setCurrentStep(idx)}
            />
          ))}
        </div>
        
        <button className="tour-skip-btn" onClick={handleClose}>
          Пропустить обучение
        </button>
      </div>
    </div>
  );
};

export default OnboardingTour;