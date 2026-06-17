import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pet.css';
import ScrollToTop from './ScrollToTop';
import Breadcrumbs from './Breadcrumbs';
import Logo from './Logo';
import Footer from './Footer';
import { checkAchievements, getGoalStageFromDates, getUserAchievements, loadJourneyProfile } from './userJourney';
import { getRanking, fetchProfile, getTodayTasks } from './apiClient';

const Pet = () => {
  const navigate = useNavigate();
  const [energy, setEnergy] = useState(() => loadJourneyProfile()?.energy ?? 100);
  const [maxEnergy, setMaxEnergy] = useState(100);
  const [coins, setCoins] = useState(() => loadJourneyProfile()?.coins ?? 0);
  const [wordsLearned, setWordsLearned] = useState(() => loadJourneyProfile()?.wordsLearned ?? 0);
  const [totalWordsTarget, setTotalWordsTarget] = useState(1000);
  const [topicsCompleted, setTopicsCompleted] = useState(0);
  const [totalTopics, setTotalTopics] = useState(18);
  const [mood, setMood] = useState('happy');
  const [todayTasksCompleted, setTodayTasksCompleted] = useState(0);
  const [todayTasksTotal, setTodayTasksTotal] = useState(5);
  const [floatingWord, setFloatingWord] = useState(null);
  const [recentWords, setRecentWords] = useState([]);
  const [clouds, setClouds] = useState([]);
  const [growthStage, setGrowthStage] = useState(1);
  const [achievements, setAchievements] = useState([]);

  const [topUsers, setTopUsers] = useState([]);
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [todayData, setTodayData] = useState(null);

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

  const getMoodFromLastSeen = (lastSeen) => {
    if (!lastSeen) return 'happy';
    const diffMs = new Date() - new Date(lastSeen);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays >= 7) return 'angry';
    if (diffDays >= 1) return 'sad';
    return 'happy';
  };

  useEffect(() => {
    const journey = loadJourneyProfile();
    if (!journey?.startDate || !journey?.endDate) return;
    setGrowthStage(getGoalStageFromDates(journey.startDate, journey.endDate));
    checkAchievements();
    setAchievements(getUserAchievements());

    const storedLastSeen = localStorage.getItem('userLastSeen');
    setMood(getMoodFromLastSeen(storedLastSeen));
  }, []);

  // Load leaderboard and user-specific data
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // fetch top ranking (get more but show only 5 by default)
        const ranking = await getRanking(20, 0).catch(() => ({ rankings: [] }));
        let list = ranking?.rankings || ranking?.ranking || ranking?.top || ranking || [];
        if (!Array.isArray(list) && list?.data) {
          // fallback if wrapped
          list = list.data;
        }
        if (mounted) setTopUsers(Array.isArray(list) ? list : []);

        // fetch profile for current user (progress, coins, energy)
        const profileResp = await fetchProfile().catch(() => null);
        if (mounted && profileResp) setProfileData(profileResp);

        // fetch today's recommended task (light)
        const today = await getTodayTasks().catch(() => null);
        if (mounted && today) setTodayData(today);
      } catch (err) {
        // ignore silently for now
        console.error('Failed to load leaderboard/profile/today', err.message || err);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  // Плавающие слова
  useEffect(() => {
    if (!recentWords.length) return undefined;
    const words = recentWords;
    let index = 0;
    const interval = setInterval(() => {
      setFloatingWord(words[index % words.length]);
      setTimeout(() => setFloatingWord(null), 2500);
      index++;
    }, 8000);
    return () => clearInterval(interval);
  }, [recentWords]);

  const progress = (wordsLearned / totalWordsTarget) * 100;

  const getMoodIcon = () => {
    switch(mood) {
      case 'happy': return '/happy1.jpeg';
      case 'sad': return '/sad1.jpeg';
      case 'angry': return '/bad1.jpeg';
      case 'tired': return '/bad1.jpeg';
      default: return '/happy1.jpeg';
    }
  };

  const getMoodText = () => {
    switch(mood) {
      case 'happy': return 'Радостный';
      case 'sad': return 'Грустный';
      case 'angry': return 'Злой';
      case 'tired': return 'Уставший';
      default: return 'Спокойный';
    }
  };

  const getMoodMessage = () => {
    if (energy > 70) return 'Ты отлично занимаешься!';
    if (energy > 30) return 'Хороший прогресс, продолжай!';
    return 'Тебе нужно отдохнуть и позаниматься';
  };

  const getPetVideoData = (stage) => {
    switch (stage) {
      case 2:
        return {
          videos: ['/happyvideo.mp4', '/sadvideo1.mp4'],
          poster: '/sad2.jpeg',
        };
      case 3:
        return {
          videos: ['/angryvideo1.mp4', '/sadvideo1.mp4'],
          poster: '/bad1.jpeg',
        };
      default:
        return {
          videos: ['/happyvideo1.mp4', '/happyvideo2.mp4', '/happyvideo3.mp4'],
          poster: '/happy1.jpeg',
        };
    }
  };

  // Video playlist component
  function VideoPlaylistPoster({ stage }) {
    const { videos, poster } = getPetVideoData(stage);
    const [index, setIndex] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
      setIndex(0);
    }, [stage]);

    useEffect(() => {
      const v = ref.current;
      if (!v) return;
      const playPromise = v.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          // autoplay может быть заблокирован
        });
      }
    }, [index, stage]);

    const handleEnded = () => {
      setIndex((i) => (i + 1) % videos.length);
    };

    return (
      <video
        key={`${stage}-${index}`}
        ref={ref}
        className="pet-character-image"
        poster={poster}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
      >
        <source src={videos[index]} type={videos[index].endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        <img src={poster} alt="Персонаж" className="pet-character-image" />
      </video>
    );
  }


  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToPractice = () => navigate('/practice');

  const handleGoToTasks = () => {
    navigate('/tasks');
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleGoToFriends = () => {
    console.log('Друзья');
    navigate('/friends');
  };

  const isAdmin = localStorage.getItem('userRole') === 'admin';

  return (
    <div className="pet-page-container">
    
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

      {/* Хедер */}
       <header className="pet-header">
        <div className="header-container">
          <Logo className="pet-logo clickable-logo" alt="Logo" onClick={handleGoToDashboard} role="button" tabIndex={0} />
          <nav className="pet-nav">
            <button className="nav-link active">Персонаж</button>
            <button className="nav-link" onClick={handleGoToPractice}>Урок</button>
            <button className="nav-link" onClick={handleGoToTasks}>Задания</button>
            <button className="nav-link" onClick={handleGoToFriends}>Друзья</button>
            {isAdmin && (
              <button className="nav-link" onClick={() => navigate('/admin')}>Админка</button>
            )}
          </nav>
          <button className="auth-btn" onClick={handleGoToProfile}>Вход / Профиль</button>
        </div>
      </header>

      <Breadcrumbs />

      <main className="pet-main">
        <div className="pet-content">
          <div className="character-big-block">
            <div className="stats-mini-overlay">
              <div className="stat-mini-overlay energy">
                <img src="/energy2.png" alt="energy" className="stat-icon-overlay" />
                <span className="stat-value-overlay">{energy}/{maxEnergy}</span>
              </div>
              <div className="stat-mini-overlay coins">
                <img src="/money.png" alt="coins" className="stat-icon-overlay" />
                <span className="stat-value-overlay">{coins}</span>
              </div>
            </div>
            
            <div className="character-3d-container">
              <div className="pet-3d-placeholder">
                <VideoPlaylistPoster stage={growthStage} />
              </div>
              
              {floatingWord && (
                <div className="floating-word">
                  {floatingWord}
                </div>
              )}
            </div>
            
            <div className="character-name-block">
              <h2 className="character-name-title">{profileData?.user?.pets?.[0]?.name || profileData?.user?.nickname || 'Имя перса'}</h2>
              <p className="character-level">Уровень {profileData?.user?.pets?.[0]?.level || 1} • {profileData?.user?.pets?.[0]?.xp || 0}/2000 XP</p>
            </div>
          </div>

          <div className="info-blocks-container">
            <div className="goal-card">
              <h3 className="card-title">ЦЕЛЬ: {loadJourneyProfile()?.goalTitle || 'Английский язык до уровня B1'}</h3>
              <div className="goal-date">
                Стадия роста: {growthStage}/3
              </div>
              
              <div className="progress-section">
                <div className="progress-header">
                  <span>Прогресс</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill goal-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <div className="stats-mini">
                <div className="stat-mini">
                  <span className="stat-mini-label">Выучено слов</span>
                  <span className="stat-mini-value">{wordsLearned} / {totalWordsTarget}</span>
                </div>
                <div className="stat-mini">
                  <span className="stat-mini-label">Пройдено тем</span>
                  <span className="stat-mini-value">{topicsCompleted} / {totalTopics}</span>
                </div>
              </div>
            </div>

            <div className={`mood-card growth-stage-${growthStage}`}>
              <div className="mood-header">
                <img src={getMoodIcon()} alt="mood" className="mood-icon" />
                <div>
                  <div className="mood-label">НАСТРОЕНИЕ</div>
                  <div className="mood-value">{getMoodText()}</div>
                </div>
              </div>
              <div className="mood-message">{getMoodMessage()}</div>
              
              <div className="recent-words">
                <div className="recent-words-label">ПОСЛЕДНИЕ ВЫУЧЕННЫЕ СЛОВА</div>
                <div className="recent-words-list">
                  {recentWords.length === 0 && <span className="recent-word">Пока нет изученных слов</span>}
                  {recentWords.slice(0, 5).map((word, i) => (
                    <span key={i} className="recent-word">{word}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="quick-tasks-card">
              <div className="quick-tasks-header">
                <h3 className="card-title">ЕЖЕДНЕВНЫЕ ЗАДАНИЯ</h3>
                <span className="tasks-status">{todayTasksCompleted}/{todayTasksTotal} выполнено</span>
              </div>
              
              <button className="all-tasks-btn" onClick={handleGoToTasks}>
                Все задания →
              </button>
            </div>

            <div className="achievements-section">
              <h3 className="section-title">Достижения</h3>
              <div className="achievements-grid">
                {achievements.map((item) => (
                  <div key={item.id} className={`achievement-card ${item.earned ? 'earned' : 'locked'}`}>
                    <div className="achievement-icon">
                      {item.earned ? (
                        <img src="/trophy_icon.png" alt="earned" style={{ width: 28, height: 28 }} />
                      ) : (
                        <div className="achievement-placeholder" />
                      )}
                    </div>
                    <div className="achievement-body">
                      <span className="achievement-name">{item.name}</span>
                      <span className="achievement-desc">{item.description}</span>
                    </div>
                    <div className="achievement-badge">{item.earned ? 'Выполнено' : 'В прогрессе'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="leaderboard-card">
              <h3 className="card-title">ТОП УЧЕНИКОВ ЗА НЕДЕЛЮ</h3>
              <div className="leaderboard-list">
                {topUsers.length === 0 && <div className="leaderboard-item"><span className="user-name">Рейтинг пока пуст</span></div>}
                {topUsers.slice(0, leaderboardExpanded ? topUsers.length : 5).map((user, index) => (
                  <div key={index} className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}>
                    <span className="rank">{index + 1}</span>
                    <span className="user-name">{user.name}</span>
                    <span className="user-words">{user.words ?? user.words_learned_total ?? 0} слов</span>
                  </div>
                ))}

                {topUsers.length > 5 && (
                  <div style={{ paddingTop: 8 }}>
                    <button
                      className="show-more-btn"
                      onClick={() => setLeaderboardExpanded((s) => !s)}
                    >
                      {leaderboardExpanded ? 'Свернуть' : `Показать ещё (${topUsers.length - 5})`}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="today-stats-card">
              <h3 className="card-title">СЕГОДНЯ</h3>
              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-label">Выполнено заданий</span>
                  <span className="stat-value">{todayData?.stage?.exercises?.length ?? todayTasksCompleted}/{todayTasksTotal}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Выучено слов</span>
                  <span className="stat-value">{profileData?.progress?.words_learned_total ?? wordsLearned}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Заработано энергии</span>
                  <span className="stat-value">+{profileData?.progress?.energy ?? 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Заработано монет</span>
                  <span className="stat-value">+{profileData?.progress?.coins ?? coins}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer wrapperClass="pet-footer" />

      <ScrollToTop />
    </div>
  );
};

export default Pet;