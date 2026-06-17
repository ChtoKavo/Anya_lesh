import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import './Pet.css';
import Logo from './Logo';
import Footer from './Footer';
import { 
  fetchProfile, 
  logoutUser, 
  updateProfile, 
  changePassword,
  sendSupportRequest,
  getUserSupportRequests 
} from './apiClient';
import { loadJourneyProfile } from './userJourney';

const ACHIEVEMENTS_STORAGE_KEY = 'userAchievements';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'user');
  const [userData, setUserData] = useState({
    id: null,
    name: localStorage.getItem('userName') || 'Пользователь',
    email: localStorage.getItem('userEmail') || 'email@not.set',
    avatar: localStorage.getItem('userAvatar') || '',
    role: localStorage.getItem('userRole') || 'user',
    global_rank: null,
  });
  const [pets, setPets] = useState([]);
  const [profileError, setProfileError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Edit modal states
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    nickname: '',
  });

  // Password change states
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const avatarInputRef = useRef(null);

  // Support modal states
  const [supportModal, setSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: 'bug',
    message: '',
  });
  const [supportRequests, setSupportRequests] = useState([]);

  const journey = loadJourneyProfile();

  const userName = userData.name;
  const userEmail = userData.email;
  const avatar = userData.avatar || userName.charAt(0).toUpperCase();
  const xp = journey?.xp ?? 0;
  const words = journey?.wordsLearned ?? 0;
  const streak = journey?.streakDays ?? 0;
  const coins = journey?.coins ?? 0;
  const energy = Math.floor(journey?.energy ?? 100);
  const level = Math.max(1, Math.floor(xp / 300) + 1);
  const nextLevelXp = level * 300;
  const progress = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  const achievements = useMemo(() => {
    const base = [
      { id: 'first_login', title: 'Первый вход', unlocked: true },
      { id: 'words_50', title: '50 слов', unlocked: words >= 50 },
      { id: 'words_200', title: '200 слов', unlocked: words >= 200 },
      { id: 'streak_7', title: '7 дней подряд', unlocked: streak >= 7 },
      { id: 'level_5', title: 'Уровень 5', unlocked: level >= 5 },
    ];
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(base));
    return base;
  }, [level, streak, words]);

  useEffect(() => {
    const storedName = localStorage.getItem('userName') || 'Пользователь';
    const storedEmail = localStorage.getItem('userEmail') || 'email@not.set';

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchProfile();
        if (data?.user) {
          const name = data.user.name || storedName;
          const email = data.user.email || storedEmail;
          const serverAvatar = data.user.avatar || '';
          const storedAvatar = localStorage.getItem('userAvatar') || '';
          const avatarLetter = name.charAt(0).toUpperCase();
          const avatarValue = serverAvatar || storedAvatar || avatarLetter;
          const role = data.user.role || 'user';
          const rank = data.user.global_rank || null;

          const newUserData = {
            id: data.user.id,
            name,
            email,
            avatar: avatarValue,
            role,
            global_rank: rank,
          };

          setUserData(newUserData);
          setPets(data.user.pets || []);
          localStorage.setItem('userName', name);
          localStorage.setItem('userEmail', email);
          // prefer server avatar when available, otherwise keep stored or default
          if (serverAvatar) {
            localStorage.setItem('userAvatar', serverAvatar);
          } else if (!storedAvatar) {
            localStorage.setItem('userAvatar', avatarLetter);
          }
          if (data.user.last_seen) {
            localStorage.setItem('userLastSeen', data.user.last_seen);
          }
          localStorage.setItem('userRole', role.toLowerCase().trim());

          setEditForm({
            name,
            email,
            nickname: data.user.nickname || name,
          });
        }

        // Load support requests
        if (data?.user?.id) {
          const requests = await getUserSupportRequests(data.user.id);
          setSupportRequests(requests.requests || []);
        }
      } catch (error) {
        const message = error.message || 'Не удалось загрузить профиль';
        setProfileError(message);
        if (message.toLowerCase().includes('нет токена') || message.toLowerCase().includes('недействительный токен')) {
          logoutUser();
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const AVATAR_PRESETS = ['/happy1.jpeg', '/happy2.jpeg', '/sad1.jpeg', '/bad1.jpeg'];

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите только фото.');
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Размер файла не должен превышать 2 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result;
      if (typeof imageDataUrl === 'string') {
        setUserData((prev) => ({ ...prev, avatar: imageDataUrl }));
        localStorage.setItem('userAvatar', imageDataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectAvatar = (src) => {
    setUserData((prev) => ({ ...prev, avatar: src }));
    localStorage.setItem('userAvatar', src);
  };

  const handleEditProfile = async () => {
    const trimmedName = editForm.name.trim();
    const trimmedEmail = editForm.email.trim();
    const trimmedNickname = editForm.nickname.trim();

    if (!trimmedName) {
      alert('Введите имя');
      return;
    }
    if (!trimmedEmail) {
      alert('Введите email');
      return;
    }
    if (!/[^\s@]+@[^\s@]+\.[^\s@]+/.test(trimmedEmail)) {
      alert('Введите корректный email');
      return;
    }
    if (!trimmedNickname) {
      alert('Введите никнейм персонажа');
      return;
    }

    try {
      setLoading(true);
      const result = await updateProfile({
        name: trimmedName,
        email: trimmedEmail,
        nickname: trimmedNickname,
        avatar: userData.avatar,
      });
      const newAvatar = userData.avatar || trimmedName.charAt(0).toUpperCase();
      setUserData(prev => ({
        ...prev,
        name: trimmedName,
        email: trimmedEmail,
        nickname: trimmedNickname,
        avatar: newAvatar,
      }));
      localStorage.setItem('userName', trimmedNickname); // Сохраняем никнейм как userName для Dashboard
      localStorage.setItem('userRealName', trimmedName); // Сохраняем реальное имя отдельно
      localStorage.setItem('userEmail', trimmedEmail);
      localStorage.setItem('userAvatar', newAvatar);
      setEditMode(false);
      alert(result?.message || 'Профиль обновлен!');
    } catch (error) {
      alert('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Пароль должен быть не менее 6 символов');
      return;
    }

    try {
      setLoading(true);
      await changePassword(passwordForm);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordMode(false);
      alert('Пароль успешно изменен!');
    } catch (error) {
      alert('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSupport = async () => {
    if (!supportForm.subject || !supportForm.message) {
      alert('Заполните все поля');
      return;
    }

    try {
      setLoading(true);
      await sendSupportRequest({
        userId: userData.id,
        ...supportForm,
      });
      setSupportForm({
        subject: '',
        category: 'bug',
        message: '',
      });
      setSupportModal(false);

      // Reload support requests
      const requests = await getUserSupportRequests(userData.id);
      setSupportRequests(requests.requests || []);

      alert('Запрос отправлен!');
    } catch (error) {
      alert('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/auth');
  };

  const handleGoToPractice = () => navigate('/practice');

  return (
    <div className="profile-page">
      <header className="profile-header pet-header">
        <div className="header-container">
          <Logo className="profile-logo clickable-logo" alt="Logo" onClick={() => navigate('/dashboard')} role="button" tabIndex={0} />
          <nav className="profile-nav">
            <button className="nav-link" onClick={() => navigate('/pet')}>Персонаж</button>
            <button className="nav-link" onClick={handleGoToPractice}>Урок</button>
            <button className="nav-link" onClick={() => navigate('/tasks')}>Задания</button>
            <button className="nav-link" onClick={() => navigate('/friends')}>Друзья</button>
            {userRole === 'teacher' && (
              <button className="nav-link" onClick={() => navigate('/teacher')}>Учитель</button>
            )}
            {userRole === 'admin' && (
              <button className="nav-link" onClick={() => navigate('/admin')}>Админка</button>
            )}
            <button className="nav-link active">Профиль</button>
          </nav>
          <div className="profile-header-actions">
            <button className="auth-btn" onClick={handleLogout}>Выйти</button>
          </div>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-card user-card">
          <div className="user-avatar profile-avatar" onClick={handleAvatarClick} role="button" title="Нажмите, чтобы выбрать фото">
              <div className="avatar-content">
              {(avatar && (avatar.startsWith('data:image') || avatar.startsWith('/'))) ? (
                <img src={avatar} alt="Аватар пользователя" />
              ) : (
                avatar
              )}
            </div>
            <div className="avatar-overlay">
              <span className="avatar-badge">✎</span>
              <span className="avatar-hint">Сменить</span>
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarFileChange}
          />
          <div className="user-info">
            <h2>{userName}</h2>
            <p>{userEmail}</p>
            <p>Рейтинг: {userData.global_rank ? `#${userData.global_rank}` : '-'}</p>
          </div>
          <div className="level-box">
            <strong>Уровень {level}</strong>
            <div className="exp-bar"><div className="exp-fill" style={{ width: `${progress}%` }}></div></div>
            <small>{xp}/{nextLevelXp} XP</small>
          </div>
        </div>

        {profileError && <div className="profile-error">{profileError}</div>}
        {loading && <div className="profile-loading">Загрузка...</div>}

        <div className="tabs">
          <button className={activeTab === 'overview' ? 'tab active' : 'tab'} onClick={() => setActiveTab('overview')}>Обзор</button>
          <button className={activeTab === 'achievements' ? 'tab active' : 'tab'} onClick={() => setActiveTab('achievements')}>Достижения</button>
          <button className={activeTab === 'edit' ? 'tab active' : 'tab'} onClick={() => setActiveTab('edit')}>Редактировать</button>
          <button className={activeTab === 'security' ? 'tab active' : 'tab'} onClick={() => setActiveTab('security')}>Безопасность</button>
          <button className={activeTab === 'support' ? 'tab active' : 'tab'} onClick={() => setActiveTab('support')}>Поддержка</button>
          {userData.role === 'admin' && (
            <button className={activeTab === 'admin' ? 'tab active' : 'tab'} onClick={() => setActiveTab('admin')}>Админка</button>
          )}
        </div>

        {/* Обзор */}
        {activeTab === 'overview' && (
          <div className="profile-grid">
            <div className="profile-card stat-card"><span>Слов выучено</span><strong>{words}</strong></div>
            <div className="profile-card stat-card"><span>Дней подряд</span><strong>{streak}</strong></div>
            <div className="profile-card stat-card"><span>Монеты</span><strong>{coins}</strong></div>
            <div className="profile-card stat-card"><span>Энергия</span><strong>{energy}/100</strong></div>

            {pets.length > 0 && (
              <div className="profile-card">
                <h3>Мои питомцы</h3>
                {pets.map(pet => (
                  <div key={pet.id} className="pet-info">
                    <p><strong>{pet.name}</strong></p>
                    <p>Уровень: {pet.level} | XP: {pet.xp}</p>
                    <p>Настроение: {pet.mood}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Достижения */}
        {activeTab === 'achievements' && (
          <div className="profile-card achievements-list">
            {achievements.map((item) => (
              <div key={item.id} className={item.unlocked ? 'achievement unlocked' : 'achievement'}>
                <span>{item.title}</span>
                <span>{item.unlocked ? '✓' : '...'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Редактирование профиля */}
        {activeTab === 'edit' && (
          <div className="profile-card edit-section">
            <h2>Редактировать профиль</h2>
            
            {!editMode ? (
              <button className="btn-primary" onClick={() => setEditMode(true)}>Редактировать</button>
            ) : (
              <div className="edit-form">
                <div className="form-group">
                  <label>Имя:</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Никнейм персонажа:</label>
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                  />
                </div>
                <div className="form-group avatar-presets-group">
                  <label>Выберите аватарку:</label>
                  <div className="avatar-presets">
                    {AVATAR_PRESETS.map((src) => (
                      <button
                        type="button"
                        key={src}
                        className={`avatar-preset-button ${avatar === src ? 'selected' : ''}`}
                        onClick={() => handleSelectAvatar(src)}
                      >
                        <img src={src} alt="avatar option" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-primary" onClick={handleEditProfile} disabled={loading}>Сохранить</button>
                  <button className="btn-secondary" onClick={() => setEditMode(false)}>Отмена</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Безопасность */}
        {activeTab === 'security' && (
          <div className="profile-card security-section">
            <h2>Безопасность</h2>
            
            {!passwordMode ? (
              <button className="btn-primary" onClick={() => setPasswordMode(true)}>Изменить пароль</button>
            ) : (
              <div className="password-form">
                <div className="form-group">
                  <label>Текущий пароль:</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Новый пароль:</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Подтвердить пароль:</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button className="btn-primary" onClick={handleChangePassword} disabled={loading}>Изменить</button>
                  <button className="btn-secondary" onClick={() => setPasswordMode(false)}>Отмена</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Поддержка */}
        {activeTab === 'support' && (
          <div className="profile-card support-section">
            <h2>Служба поддержки</h2>
            <button className="btn-primary" onClick={() => setSupportModal(true)}>Написать поддержку</button>

            {supportRequests.length > 0 && (
              <div className="support-history">
                <h3>История ваших запросов</h3>
                {supportRequests.map(req => (
                  <div key={req.id} className="support-item">
                    <div className="support-header">
                      <strong>{req.subject}</strong>
                      <span className={`status status-${req.status}`}>{req.status}</span>
                    </div>
                    <p className="support-category">Категория: {req.category}</p>
                    <p className="support-msg">{req.message}</p>
                    {req.response_message && (
                      <div className="support-response">
                        <strong>Ответ поддержки:</strong>
                        <p>{req.response_message}</p>
                      </div>
                    )}
                    <small>{new Date(req.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Админка */}
        {activeTab === 'admin' && userData.role === 'admin' && (
          <div className="profile-card admin-section">
            <h2>Панель администратора</h2>
            <button className="btn-primary" onClick={() => navigate('/admin')}>Открыть полную админку</button>
          </div>
        )}
      </main>

      {/* Модаль для запроса в поддержку */}
      {supportModal && (
        <div className="modal-overlay" onClick={() => setSupportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSupportModal(false)}>✕</button>
            <h2>Написать в поддержку</h2>
            <div className="support-form">
              <div className="form-group">
                <label>Тема:</label>
                <input
                  type="text"
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                  placeholder="Кратко опишите проблему"
                />
              </div>
              <div className="form-group">
                <label>Категория:</label>
                <select
                  value={supportForm.category}
                  onChange={(e) => setSupportForm({...supportForm, category: e.target.value})}
                >
                  <option value="bug">Баг/Ошибка</option>
                  <option value="feature">Предложение функции</option>
                  <option value="account">Проблема с аккаунтом</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              <div className="form-group">
                <label>Сообщение:</label>
                <textarea
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                  placeholder="Подробно опишите вашу проблему..."
                  rows="5"
                />
              </div>
              <div className="form-actions">
                <button className="btn-primary" onClick={handleSendSupport} disabled={loading}>Отправить</button>
                <button className="btn-secondary" onClick={() => setSupportModal(false)}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer wrapperClass="profile-footer" />
    </div>
  );
};

export default Profile;
