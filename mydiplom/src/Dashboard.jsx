import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './Pet.css';
import Breadcrumbs from './Breadcrumbs';
import Logo from './Logo';
import Footer from './Footer';
import Toast from './Toast';
import { getTodayTasks, getUserStats, getTopUsers, fetchProfile } from './apiClient';
import { loadJourneyProfile } from './userJourney';
import OnboardingTour from './OnboardingTour';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState('happy');
  const [growthStage, setGrowthStage] = useState(1);
  const [coins, setCoins] = useState(() => loadJourneyProfile()?.coins ?? 0);
  const [energy, setEnergy] = useState(() => loadJourneyProfile()?.energy ?? 100);
  const [petName, setPetName] = useState(() => localStorage.getItem('userName') || 'Персонаж');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'user');
  const isAdmin = userRole === 'admin';
  const [showTour, setShowTour] = useState(false);
  const [shopItems, setShopItems] = useState([
    { id: 1, name: 'Волшебное зелье', price: 150, image: '/zelka.png', purchased: false },
    { id: 2, name: 'Кристалл силы', price: 300, image: '/cristal.png', purchased: false },
    { id: 3, name: 'Драконья чешуя', price: 500, image: '/dragon cheshuya.png', purchased: false },
    { id: 4, name: 'Золотое яблоко', price: 750, image: '/apply.png', purchased: false }
  ]);

  const [clouds, setClouds] = useState([]);
  const [todayTask, setTodayTask] = useState(null);
  const [todayLoading, setTodayLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [topUsers, setTopUsers] = useState([]);

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
    setClouds(shuffled.slice(0, 4));
  }, []);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setShowTour(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    // Fetch profile to get real pet name and stats
    fetchProfile().then(data => {
      if (data?.user) {
        const name = data.user.pets?.[0]?.name || data.user.nickname || data.user.name || 'Персонаж';
        setPetName(name);
        localStorage.setItem('userName', name);
        if (data.progress) {
          setCoins(data.progress.coins || 0);
          setEnergy(data.progress.energy || 100);
        }
      }
    }).catch(err => console.warn('Dashboard: fetchProfile error', err));

    setTodayLoading(true);
    getTodayTasks().then((data) => {
      setTodayTask(data);
    }).catch((err) => {
      // ignore quietly
      console.warn('Failed to load today tasks', err.message || err);
    }).finally(() => setTodayLoading(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    getTopUsers().then((data) => {
      if (data && Array.isArray(data.top)) setTopUsers(data.top);
    }).catch((err) => {
      console.warn('Failed to load top users', err.message || err);
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    getUserStats().then((data) => {
      if (!data) return;
      setGrowthStage(data.level || 1);
    }).catch((err) => {
      console.warn('Failed to load user stats', err.message || err);
    });
  }, []);

  const emotions = [
    { id: 'happy', name: 'счастье', image: '/happy1.jpeg' },
    { id: 'sad', name: 'грусть', image: '/sad1.jpeg' },
    { id: 'weak', name: 'злость', image: '/bad1.jpeg' }
  ];

  const growthStages = [
    { level: 1, name: 'Детство', unlocked: true, icon: '1' },
    { level: 2, name: 'Юность', unlocked: growthStage >= 2, icon: '2' },
    { level: 3, name: 'Взросление', unlocked: growthStage >= 3, icon: '3' }
  ];

  const handleTourComplete = () => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
    setShowTour(false);
  };

  const handleTourSkip = () => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
    setShowTour(false);
  };

  const handlePurchase = (itemId) => {
    const item = shopItems.find(i => i.id === itemId);
    if (coins < item.price) {
      setToast({ 
        message: `Недостаточно монет! Нужно ${item.price}, а у вас ${coins}`, 
        type: 'error' 
      });
      return;
    }
    if (item.purchased) {
      setToast({ 
        message: 'Этот предмет уже куплен', 
        type: 'info' 
      });
      return;
    }
    
    setCoins(coins - item.price);
    setShopItems(shopItems.map(i => 
      i.id === itemId ? { ...i, purchased: true } : i
    ));
    setToast({ 
      message: `${item.name} успешно куплен! 🎉`, 
      type: 'success' 
    });
  };

  const handlePlayMiniGame = () => {
    navigate('/game');
  };

  const handleGoToCharacter = () => {
    navigate('/pet');
  };

  const handleGoToTasks = () => {
    navigate('/tasks');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleGoToFriends = () => {
    navigate('/friends');
  };
  const handleGoToPractice = () => navigate('/practice');

  const handleRestartTour = () => {
    setShowTour(true);
  };

  return (
    <div className="dashboard">
      
      <div 
        className="background-image" 
        style={{ backgroundImage: `url('/background.jpg')` }}
      ></div>
      
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

      <header className="dashboard-header pet-header">
        <div className="header-container"> 
          <Logo className="dashboard-logo clickable-logo" alt="Logo" onClick={handleGoToDashboard} role="button" tabIndex={0} />
          <nav className="dashboard-nav">
            <button className="nav-link" onClick={handleGoToCharacter}>Персонаж</button>
            <button className="nav-link" onClick={handleGoToPractice}>Урок</button>
            <button className="nav-link" onClick={handleGoToTasks}>Задания</button>
            <button className="nav-link" onClick={handleGoToFriends}>Друзья</button>
            {userRole === 'teacher' && (
              <button className="nav-link" onClick={() => navigate('/teacher')}>Учитель</button>
            )}
            {isAdmin && (
              <button className="nav-link" onClick={() => navigate('/admin')}>Админка</button>
            )}
          </nav>
          <button className="auth-btn" onClick={handleGoToProfile}>Вход / Профиль</button>
        </div>
      </header>

      <Breadcrumbs />

      <main className="dashboard-main">
        <div className="dashboard-content">

          <div className="today-block">
            <div className="today-card">
              <h3 className="today-title">Задание на сегодня</h3>
              <p className="today-task">Выучить 10 новых слов по теме "Путешествия"</p>
              <button className="today-btn" onClick={handleGoToTasks}>Выполнить →</button>
            </div>
            <div className="rank-card">
              <h3 className="rank-title">Уровень рейтинга</h3>
              {topUsers.length === 0 ? (
                <p className="rank-number">—</p>
              ) : (
                <>
                  <p className="rank-number">{topUsers[0].nickname || topUsers[0].name} — уровень {topUsers[0].level}</p>
                  <div className="rank-list">
                    {topUsers.map((u, idx) => (
                      <div key={u.id} className={`rank-item rank-pos-${idx+1}`}>
                        <span className="rank-pos">{idx+1}.</span>
                        <span className="rank-name">{u.nickname || u.name}</span>
                        <span className="rank-level">{u.level}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rank-progress">
                    <div
                      className="rank-fill"
                      style={{ width: `${Math.round((topUsers[0].level / (topUsers[0].level + 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="rank-text">До следующего уровня: уровень {topUsers[0].level + 1}</p>
                </>
              )}
            </div>
          </div>

          <div className="poster-card" onClick={handleGoToCharacter}>
            <div className="poster-image">
              <img src="/back4.png" alt="character" className="poster-bg-img" />
              <div className="poster-overlay"></div>
              <div className="poster-text">
                <h2 className="character-name">{petName}</h2>
                <p className="character-title">Верный друг</p>
                <button className="poster-btn">Перейти к персонажу →</button>
              </div>
            </div>
          </div>

          <div className="character-section">
            <div className="emotions-gallery">
                <h3 className="section-title">Персонаж</h3>
                <div className="emotions-container">
                  {emotions.map(emotion => {
                    const videoSrc = emotion.id === 'happy' ? '/happyvideo.mp4' : emotion.id === 'sad' ? '/sadvideo1.mp4' : '/angryvideo1.mp4';
                    return (
                      <div 
                        key={emotion.id}
                        className={`emotion-card ${selectedEmotion === emotion.id ? 'active' : ''}`}
                        onClick={() => setSelectedEmotion(emotion.id)}
                      >
                        <div className="emotion-avatar">
                          {selectedEmotion === emotion.id ? (
                            <video
                              src={videoSrc}
                              className="pet-img"
                              autoPlay
                              muted
                              playsInline
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                            />
                          ) : (
                            <img src={emotion.image} alt="pet" className="pet-img" />
                          )}
                        </div>
                        <span className="emotion-name">{emotion.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            <div className="growth-stages">
              <h3 className="section-title">Стадии роста</h3>
              <div className="stages-container">
                {growthStages.map(stage => (
                  <div key={stage.level} className={`stage-card ${stage.unlocked ? 'unlocked' : 'locked'}`}>
                    <div className="stage-icon">{stage.icon}</div>
                    <div className="stage-info">
                      <span className="stage-name">{stage.name}</span>
                      {!stage.unlocked && <span className="stage-lock">🔒</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="game-elements">
            <h3 className="section-title">Элементы игры</h3>
            <div className="elements-grid">
              <div className="element-card">
                <div className="element-icon">
                  <img src="/energy2.png" alt="energy" className="element-img" />
                </div>
                <div className="element-info">
                  <h4>Энергия</h4>
                  <p>Необходима для выполнения действий и прокачки персонажа</p>
                </div>
              </div>
              <div className="element-card">
                <div className="element-icon">
                  <img src="/money.png" alt="coins" className="element-img" />
                </div>
                <div className="element-info">
                  <h4>Монеты</h4>
                  <p>Игровая валюта для покупки предметов и улучшений</p>
                </div>
              </div>
              <div className="element-card">
                <div className="element-icon">
                  <img src="/heart.png" alt="lives" className="element-img" />
                </div>
                <div className="element-info">
                  <h4>Жизнь</h4>
                  <p>Показывает запас попыток при прохождении игровых заданий</p>
                </div>
              </div>
            </div>
          </div>

          <div className="shop-section">
            <h3 className="section-title">Мини-магазин</h3>
            <div className="shop-grid">
              {shopItems.map(item => (
                <div key={item.id} className={`shop-card ${item.purchased ? 'purchased' : ''}`}>
                  <div className="shop-item-icon">
                    <img src={item.image} alt={item.name} className="shop-item-img" />
                  </div>
                  <div className="shop-item-info">
                    <h4 className="shop-item-name">{item.name}</h4>
                    <div className="shop-item-price">
                      <img src="/money.png" alt="coin" className="price-icon" />
                      <span>{item.price}</span>
                    </div>
                    {!item.purchased ? (
                      <button 
                        className="shop-buy-btn"
                        onClick={() => handlePurchase(item.id)}
                        disabled={coins < item.price}
                        title={coins < item.price ? 'Монет недостаточно' : 'Купить'}
                      >
                        {coins < item.price ? 'Монет недостаточно' : 'Купить'}
                      </button>
                    ) : (
                      <span className="purchased-badge">Приобретено ✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="minigame-banner" onClick={handlePlayMiniGame}>
            <div className="banner-content">
              <div className="banner-icon">
                <img src="/game.png" alt="game" className="game-icon-img" />
              </div>
              <div className="banner-text">
                <h3>Космическое приключение</h3>
                <p>Играй собирая кристаллы и получи награду!</p>
                <button className="banner-btn">
                  Играть сейчас →
                </button>
              </div>
              <div className="banner-decoration">
                <img src="/cloud2.png" alt="game" className="game-icon-img" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer wrapperClass="dashboard-footer" />

      {showTour && (
        <OnboardingTour 
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;