import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import Logo from './Logo';
import Footer from './Footer';
import {
  getAllUsers,
  getRanking,
  getAdminStats,
  getAllSupportRequests,
  respondToSupportRequest,
  // new admin helpers
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getShopItems,
  createShopItem,
  updateShopItem,
  deleteShopItem,
  reorderRanking,
  getChats,
  banUser,
  unbanUser,
  getUserInactivity,
  sendAdminMessage,
} from './apiClient';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [chats, setChats] = useState([]);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopForm, setShopForm] = useState(null);
  const [showAdminMessageModal, setShowAdminMessageModal] = useState(false);
  const [adminMessageText, setAdminMessageText] = useState('');
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [responseModal, setResponseModal] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [activeTab, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'users') {
        const data = await getAllUsers();
        const usersList = data.users || [];
        // fetch inactivity for users in parallel (best-effort)
        try {
          const enriched = await Promise.all(usersList.map(async (u) => {
            try {
              const ia = await getUserInactivity(u.id);
              return { ...u, daysPlayed: ia.daysPlayed, daysAbsent: ia.daysAbsent, is_banned: ia.isBanned };
            } catch (e) { return { ...u, daysPlayed: 0, daysAbsent: 0, is_banned: u.is_banned || false } };
          }));
          setUsers(enriched);
        } catch (e) {
          setUsers(usersList);
        }
      } else if (activeTab === 'teachers') {
        const data = await getTeachers();
        setTeachers(data.teachers || []);
      } else if (activeTab === 'ranking') {
        const data = await getRanking();
        setRanking(data.rankings || []);
      } else if (activeTab === 'stats') {
        const data = await getAdminStats();
        setStats(data);
      } else if (activeTab === 'shop') {
        const data = await getShopItems();
        setShopItems(data.items || []);
      } else if (activeTab === 'chats') {
        const data = await getChats();
        // simple mapping: threads
        setChats(data.threads || []);
      } else if (activeTab === 'support') {
        const data = await getAllSupportRequests({ status: filterStatus !== 'all' ? filterStatus : undefined });
        setSupportRequests(data.requests || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Teachers handlers
  const openAddTeacherModal = () => { setTeacherForm({ name: '', email: '' }); setShowTeacherModal(true); };
  const openEditTeacherModal = (t) => { setTeacherForm({ ...t }); setShowTeacherModal(true); };
  const handleDeleteTeacher = async (t) => {
    if (!confirm('Удалить учителя?')) return;
    try {
      await deleteTeacher(t.id);
      loadData();
    } catch (e) {
      alert('Ошибка при удалении учителя: ' + e.message);
    }
  };

  const submitTeacherForm = async () => {
    try {
      if (!teacherForm) return;
      if (teacherForm.id) {
        await updateTeacher(teacherForm.id, { name: teacherForm.name, email: teacherForm.email });
      } else {
        await createTeacher({ name: teacherForm.name, email: teacherForm.email });
      }
      setShowTeacherModal(false);
      setTeacherForm(null);
      loadData();
    } catch (e) { alert('Ошибка при сохранении: ' + e.message); }
  };

  // Shop handlers
  const openAddShopModal = () => { setShopForm({ name: '', price: 0 }); setShowShopModal(true); };
  const openEditShopModal = (it) => { setShopForm({ ...it }); setShowShopModal(true); };
  const handleDeleteShopItem = async (it) => {
    if (!confirm('Удалить товар?')) return;
    try {
      await deleteShopItem(it.id);
      loadData();
    } catch (e) {
      alert('Ошибка при удалении товара: ' + e.message);
    }
  };

  const submitShopForm = async () => {
    try {
      if (!shopForm) return;
      if (shopForm.id) {
        await updateShopItem(shopForm.id, { name: shopForm.name, price: shopForm.price });
      } else {
        await createShopItem({ name: shopForm.name, price: shopForm.price });
      }
      setShowShopModal(false);
      setShopForm(null);
      loadData();
    } catch (e) { alert('Ошибка при сохранении товара: ' + e.message); }
  };

  // Ranking move handlers
  const handleMoveRanking = async (index, direction) => {
    const newRank = [...ranking];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newRank.length) return;
    const tmp = newRank[swapIndex];
    newRank[swapIndex] = newRank[index];
    newRank[index] = tmp;
    setRanking(newRank);
    try {
      const order = newRank.map(r => r.id);
      await reorderRanking(order);
    } catch (e) {
      console.warn('Reorder failed', e.message || e);
    }
  };

  // User actions: ban/unban, inactivity check, send admin message
  const handleBanUser = async (user) => {
    if (!confirm(`Забанить пользователя ${user.nickname}?`)) return;
    try {
      await banUser(user.id, { reason: 'Админ-бан' });
      loadData();
    } catch (e) { alert('Ошибка: ' + e.message); }
  };

  const handleUnbanUser = async (user) => {
    if (!confirm(`Разбанить пользователя ${user.nickname}?`)) return;
    try {
      await unbanUser(user.id);
      loadData();
    } catch (e) { alert('Ошибка: ' + e.message); }
  };

  const handleCheckInactivity = async (user) => {
    try {
      const data = await getUserInactivity(user.id);
      alert(`Дней в игре: ${data.daysPlayed || 0}\nДней отсутствия: ${data.daysAbsent || 0}`);
    } catch (e) { alert('Ошибка: ' + e.message); }
  };

  const handleSendAdminMessage = async (user) => {
    setSelectedUser(user);
    setAdminMessageText('');
    setShowAdminMessageModal(true);
  };

  const submitAdminMessage = async () => {
    if (!selectedUser || !adminMessageText.trim()) return alert('Введите текст');
    try {
      await sendAdminMessage(selectedUser.id, { text: adminMessageText });
      setShowAdminMessageModal(false);
      setAdminMessageText('');
      alert('Сообщение отправлено');
    } catch (e) { alert('Ошибка при отправке: ' + e.message); }
  };

  const handleRespond = async () => {
    try {
      if (!responseText.trim()) {
        alert('Введите ответ');
        return;
      }
      await respondToSupportRequest({
        requestId: responseModal.id,
        response: responseText,
        status: 'resolved'
      });
      setResponseText('');
      setResponseModal(null);
      loadData();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-dashboard-header">
        <div className="header-container">
          <Logo className="admin-logo" alt="Logo" onClick={() => navigate('/dashboard')} role="button" tabIndex={0} />
          <nav className="admin-nav">
            <button className="nav-link" onClick={() => navigate('/pet')}>Персонаж</button>
            <button className="nav-link" onClick={() => navigate('/practice')}>Урок</button>
            <button className="nav-link" onClick={() => navigate('/tasks')}>Задания</button>
            <button className="nav-link" onClick={() => navigate('/friends')}>Друзья</button>
            <button className="nav-link active">Админка</button>
          </nav>
          <div className="admin-header-actions">
            <button className="auth-btn" onClick={() => navigate('/profile')}>Вход / Профиль</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-dashboard-main">
        <div className="admin-content-wrapper">
          {/* Tabs */}
          <div className="admin-tabs-container">
            <button
              className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Статистика
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
              onClick={() => setActiveTab('teachers')}
            >
              Учителя
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
              onClick={() => setActiveTab('ranking')}
            >
              Рейтинг
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Пользователи
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
              onClick={() => setActiveTab('shop')}
            >
              Мини-магазин
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              Поддержка
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
              onClick={() => setActiveTab('chats')}
            >
              Чаты
            </button>
          </div>

          {error && <div className="admin-error-message">{error}</div>}
          {loading && <div className="admin-loading-message">Загрузка...</div>}

          {/* Статистика */}
          {activeTab === 'stats' && !loading && stats && (
            <div className="admin-cards-container">
              <h2 className="section-title">Статистика системы</h2>
              
              <div className="stats-cards-grid">
                <div className="stat-card-item">
                  <div className="stat-icon">US</div>
                  <div className="stat-content">
                    <p className="stat-label">Всего пользователей</p>
                    <p className="stat-number">{stats.stats.totalUsers}</p>
                  </div>
                </div>
                
                <div className="stat-card-item">
                  <div className="stat-icon">PT</div>
                  <div className="stat-content">
                    <p className="stat-label">Активных питомцев</p>
                    <p className="stat-number">{stats.stats.totalPets}</p>
                  </div>
                </div>
                
                <div className="stat-card-item">
                  <div className="stat-icon">SR</div>
                  <div className="stat-content">
                    <p className="stat-label">Открытых запросов</p>
                    <p className="stat-number">{stats.stats.openSupportRequests}</p>
                  </div>
                </div>
              </div>

              <div className="top-users-section">
                <h3 className="subsection-title">Топ 5 пользователей</h3>
                <div className="top-users-list">
                  {stats.topUsers.map((user, index) => (
                    <div key={user.id} className="top-user-card">
                      <div className="user-rank">#{index + 1}</div>
                      <div className="user-avatar-small">{user.nickname.charAt(0)}</div>
                      <div className="user-info-small">
                        <p className="user-name">{user.nickname}</p>
                        <p className="user-stats">Уровень {user.level} • {user.xp} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Учителя */}
          {activeTab === 'teachers' && !loading && (
            <div className="admin-cards-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title">Учителя</h2>
                <button className="auth-btn" onClick={openAddTeacherModal}>Добавить учителя</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {teachers.map(t => (
                  <div key={t.id} className="user-list-item">
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600 }}>{t.name}</p>
                      <p style={{ color: '#5a7a9a' }}>{t.email}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="user-item-btn" onClick={() => openEditTeacherModal(t)}>Ред.</button>
                      <button className="user-item-btn" onClick={() => handleDeleteTeacher(t)}>Удал.</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Рейтинг */}
          {activeTab === 'ranking' && !loading && (
            <div className="admin-cards-container">
              <h2 className="section-title">Топ пользователей</h2>
              <div className="ranking-cards-grid">
                {ranking.map((user, index) => (
                  <div key={user.id} className="ranking-card-item">
                    <div className="rank-position">#{user.rank || index + 1}</div>
                    <div className="rank-avatar-large">{user.avatar || user.nickname.charAt(0)}</div>
                    <h3 className="rank-user-name">{user.nickname}</h3>
                    <p className="rank-pet-name">Питомец: {user.pet_name || 'Нет питомца'}</p>
                    <div className="rank-info-block">
                      <div className="rank-stat">
                        <span className="stat-label">Уровень</span>
                        <span className="stat-val">{user.level}</span>
                      </div>
                      <div className="rank-stat">
                        <span className="stat-label">XP</span>
                        <span className="stat-val">{user.xp}</span>
                      </div>
                      <div className="rank-stat">
                        <span className="stat-label">Монеты</span>
                        <span className="stat-val">{user.coins}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="user-item-btn" onClick={() => handleMoveRanking(index, 'up')}>Вверх</button>
                        <button className="user-item-btn" onClick={() => handleMoveRanking(index, 'down')}>Вниз</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Пользователи */}
          {activeTab === 'users' && !loading && (
            <div className="admin-cards-container">
              <div className="users-header">
                <h2 className="section-title">Управление пользователями</h2>
                <input
                  type="text"
                  placeholder="Поиск по email или нику..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="users-search-input"
                />
              </div>
              
              <div className="users-list-container">
                {filteredUsers.map(user => (
                  <div key={user.id} className="user-list-item">
                    <div className="user-item-avatar">{user.nickname.charAt(0)}</div>
                    <div className="user-item-info">
                      <p className="user-item-name">{user.nickname}</p>
                      <p className="user-item-email">{user.email}</p>
                    </div>
                    <div className="user-item-stats">
                      <span className="user-item-stat">Уровень: {user.user_level}</span>
                      <span className="user-item-stat">Питомец: {user.pet_name || '-'}</span>
                      <span className="user-item-stat">Дней в игре: {user.daysPlayed ?? '-'}</span>
                      <span className="user-item-stat">Отсутствие (дн): {user.daysAbsent ?? '-'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="user-item-btn" onClick={() => setSelectedUser(user)}>Подробно</button>
                      <button className="user-item-btn" onClick={() => handleCheckInactivity(user)}>Проверить активность</button>
                      <button className="user-item-btn" onClick={() => handleSendAdminMessage(user)}>Написать</button>
                      {user.is_banned ? (
                        <button className="user-item-btn" onClick={() => handleUnbanUser(user)}>Разбан</button>
                      ) : (
                        <button className="user-item-btn" onClick={() => handleBanUser(user)}>Бан</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Поддержка */}
          {activeTab === 'support' && !loading && (
            <div className="admin-cards-container">
              <div className="support-header">
                <h2 className="section-title">Запросы в поддержку</h2>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="support-filter-select"
                >
                  <option value="all">Все запросы</option>
                  <option value="open">Открытые</option>
                  <option value="in_progress">В работе</option>
                  <option value="resolved">Решенные</option>
                  <option value="closed">Закрытые</option>
                </select>
              </div>
              
              <div className="support-list-container">
                {supportRequests.map(request => (
                  <div key={request.id} className="support-item-card">
                    <div className="support-item-header">
                      <div>
                        <h3 className="support-subject">{request.subject}</h3>
                        <p className="support-from">От: {request.nickname} ({request.email})</p>
                      </div>
                      <span className={`support-status-badge status-${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <p className="support-category-tag">Категория: {request.category}</p>
                    <p className="support-message-text">{request.message}</p>
                    
                    {request.response_message && (
                      <div className="support-response-block">
                        <strong>Ответ администратора:</strong>
                        <p>{request.response_message}</p>
                      </div>
                    )}
                    
                    <div className="support-item-footer">
                      <small>{new Date(request.created_at).toLocaleString()}</small>
                      {request.status !== 'closed' && (
                        <button
                          className="support-respond-btn"
                          onClick={() => {
                            setResponseModal(request);
                            setResponseText(request.response_message || '');
                          }}
                        >
                          Ответить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Мини-магазин */}
          {activeTab === 'shop' && !loading && (
            <div className="admin-cards-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title">Мини-магазин</h2>
                <button className="auth-btn" onClick={openAddShopModal}>Добавить товар</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {shopItems.map(it => (
                  <div key={it.id} className="user-list-item">
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600 }}>{it.name}</p>
                      <p style={{ color: '#5a7a9a' }}>Цена: {it.price}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="user-item-btn" onClick={() => openEditShopModal(it)}>Ред.</button>
                      <button className="user-item-btn" onClick={() => handleDeleteShopItem(it)}>Удал.</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Чаты / модерация */}
          {activeTab === 'chats' && !loading && (
            <div className="admin-cards-container">
              <h2 className="section-title">Чаты и модерация</h2>
              <div className="chat-threads-container">
                {chats.length === 0 && <p>Нет доступных чатов для просмотра.</p>}
                {chats.map(thread => (
                  <div key={thread.id} className="chat-thread-card">
                    <div className="chat-thread-header">
                      <div>
                        <h3 className="chat-thread-title">{thread.title || `Чат ${thread.id}`}</h3>
                        <p className="chat-thread-meta">Участников: {thread.participants?.length || 0} • Сообщений: {thread.messageCount || '-'}</p>
                      </div>
                      <div className="chat-thread-actions">
                        <button className="support-respond-btn" onClick={() => alert('Открыть чат: ' + thread.id)}>Открыть</button>
                        <button className="support-respond-btn" onClick={() => { if (confirm('Пометить сообщения как платные?')) { alert('Помечено'); } }}>Монетизация</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Модаль пользователя */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setSelectedUser(null)}>X</button>
            <h2>Информация о пользователе</h2>
            
            <div className="modal-info-grid">
              <div className="info-item">
                <label>Email:</label>
                <p>{selectedUser.email}</p>
              </div>
              <div className="info-item">
                <label>Никнейм:</label>
                <p>{selectedUser.nickname}</p>
              </div>
              <div className="info-item">
                <label>Питомец:</label>
                <p>{selectedUser.pet_name || '-'}</p>
              </div>
              <div className="info-item">
                <label>Уровень:</label>
                <p>{selectedUser.user_level}</p>
              </div>
              <div className="info-item">
                <label>Монеты:</label>
                <p>{selectedUser.coins}</p>
              </div>
              <div className="info-item">
                <label>Слов выучено:</label>
                <p>{selectedUser.words_learned}</p>
              </div>
              <div className="info-item full-width">
                <label>Дата регистрации:</label>
                <p>{new Date(selectedUser.created_at).toLocaleString()}</p>
              </div>
              <div className="info-item full-width">
                <label>Статус:</label>
                <p>{selectedUser.is_active ? 'Активный' : 'Неактивный'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модаль редактирования/создания учителя */}
      {showTeacherModal && (
        <div className="admin-modal-overlay" onClick={() => { setShowTeacherModal(false); setTeacherForm(null); }}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => { setShowTeacherModal(false); setTeacherForm(null); }}>X</button>
            <h2>{teacherForm?.id ? 'Редактировать учителя' : 'Добавить учителя'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={teacherForm?.name || ''} onChange={(e) => setTeacherForm(f => ({ ...f, name: e.target.value }))} placeholder="Имя" />
              <input value={teacherForm?.email || ''} onChange={(e) => setTeacherForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-submit" onClick={submitTeacherForm}>Сохранить</button>
                <button className="btn-cancel" onClick={() => { setShowTeacherModal(false); setTeacherForm(null); }}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модаль редактирования/создания товара */}
      {showShopModal && (
        <div className="admin-modal-overlay" onClick={() => { setShowShopModal(false); setShopForm(null); }}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => { setShowShopModal(false); setShopForm(null); }}>X</button>
            <h2>{shopForm?.id ? 'Редактировать товар' : 'Добавить товар'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={shopForm?.name || ''} onChange={(e) => setShopForm(f => ({ ...f, name: e.target.value }))} placeholder="Название" />
              <input type="number" value={shopForm?.price || 0} onChange={(e) => setShopForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="Цена" />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-submit" onClick={submitShopForm}>Сохранить</button>
                <button className="btn-cancel" onClick={() => { setShowShopModal(false); setShopForm(null); }}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модаль отправки админ сообщения */}
      {showAdminMessageModal && selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setShowAdminMessageModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowAdminMessageModal(false)}>X</button>
            <h2>Отправить сообщение пользователю</h2>
            <p><strong>Кому:</strong> {selectedUser.nickname} ({selectedUser.email})</p>
            <textarea value={adminMessageText} onChange={(e) => setAdminMessageText(e.target.value)} rows={6} placeholder="Текст сообщения" />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn-submit" onClick={submitAdminMessage}>Отправить</button>
              <button className="btn-cancel" onClick={() => setShowAdminMessageModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модаль ответа на поддержку */}
      {responseModal && (
        <div className="admin-modal-overlay" onClick={() => setResponseModal(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setResponseModal(null)}>X</button>
            <h2>Ответить на запрос</h2>
            
            <div className="response-modal-info">
              <p><strong>Запрос:</strong> {responseModal.subject}</p>
              <p><strong>От:</strong> {responseModal.nickname}</p>
            </div>

            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Введите ваш ответ..."
              className="response-textarea"
              rows="6"
            />
            
            <div className="modal-actions">
              <button className="btn-submit" onClick={handleRespond}>
                ✓ Отправить ответ
              </button>
              <button className="btn-cancel" onClick={() => setResponseModal(null)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer wrapperClass="admin-footer" />
    </div>
  );
};

export default AdminPanel;
