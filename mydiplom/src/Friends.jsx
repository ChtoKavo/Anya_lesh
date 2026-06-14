import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import './Friends.css';
import './Pet.css';
import Logo from './Logo';
import Footer from './Footer';
import { getUsers, getFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, blockUser, unblockUser } from './apiClient';

const Friends = () => {
  const navigate = useNavigate();
  const [clouds, setClouds] = useState([]);
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'user');
  const [currentUserId, setCurrentUserId] = useState(() => Number(localStorage.getItem('userId')) || null);

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
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const handleGoToPractice = () => navigate('/practice');
  const handleGoToTasks = () => navigate('/tasks');
  const handleGoToFriends = () => navigate('/friends');
  const handleGoToProfile = () => navigate('/profile');

  const [activeTab, setActiveTab] = useState('friends');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendMessageStatus, setSendMessageStatus] = useState('');
  const [notification, setNotification] = useState({ text: '', type: '' });
  const MESSAGE_LIMIT_PER_FRIEND = 20;

  const [friends, setFriends] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const [friendRequests, setFriendRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  const [bannedUsers, setBannedUsers] = useState([]);
  const [messages, setMessages] = useState({});

  const getCurrentUserId = () => {
    const storedId = Number(localStorage.getItem('userId'));
    return Number.isFinite(storedId) && storedId > 0 ? storedId : null;
  };

  useEffect(() => {
    const currentId = Number(localStorage.getItem('userId')) || null;
    setCurrentUserId(currentId);
    setUserRole(localStorage.getItem('userRole') || 'user');

    // load persisted mini-messages from localStorage for this account only
    if (currentId) {
      try {
        const raw = localStorage.getItem(`miniMessages_v1_user_${currentId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const grouped = Array.isArray(parsed)
            ? parsed.reduce((acc, msg) => {
                const toId = msg.to?.id ?? msg.toId ?? msg.to_user_id;
                const fromId = msg.from?.id ?? msg.fromId ?? msg.from_user_id;
                const friendId = toId === currentId ? fromId : toId;
                if (!friendId) return acc;
                acc[friendId] = [...(acc[friendId] || []), msg];
                return acc;
              }, {})
            : parsed || {};
          setMessages(grouped);
        }
      } catch (e) {}
    }

    const currentEmail = localStorage.getItem('userEmail') || '';
    setCurrentUserEmail(currentEmail);

    const loadData = async () => {
      let friendsData = { friends: [], incoming: [], outgoing: [] };
      let usersData = { users: [] };

      try {
        friendsData = await getFriends();
      } catch (err) {
        console.error('Failed to load friends data:', err);
      }

      try {
        usersData = await getUsers();
      } catch (err) {
        console.error('Failed to load users data:', err);
      }

      const incoming = Array.isArray(friendsData.incoming) ? friendsData.incoming.map((r) => ({
        id: r.request_id,
        name: r.name || r.nickname,
        nickname: r.nickname,
        email: r.email,
        avatar: (r.name || r.nickname).charAt(0).toUpperCase(),
        level: r.level || 1,
        words: r.words || 0,
        streak: r.streak || 0,
        pending: true,
      })) : [];

      const outgoing = Array.isArray(friendsData.outgoing) ? friendsData.outgoing.map((r) => ({
        id: r.request_id,
        name: r.name || r.nickname,
        nickname: r.nickname,
        email: r.email,
        avatar: (r.name || r.nickname).charAt(0).toUpperCase(),
        level: r.level || 1,
        words: r.words || 0,
        streak: r.streak || 0,
        pending: true,
      })) : [];

      const acceptedFriendIds = Array.isArray(friendsData.friends) ? friendsData.friends.map((row) => row.user_id) : [];
      const pendingOutgoingIds = Array.isArray(friendsData.outgoing) ? friendsData.outgoing.map((row) => row.recipient_user_id) : [];

      const users = Array.isArray(usersData.users) ? usersData.users : [];
      const normalizedCurrentRole = (role) => String(role || '').trim().toLowerCase();
      const nonAdmin = users.filter((user) => normalizedCurrentRole(user.role) !== 'admin' && user.email !== currentEmail);

      const teacherAccounts = nonAdmin.filter(u => normalizedCurrentRole(u.role) === 'teacher').map((user) => ({
        id: user.id,
        name: user.name || user.nickname,
        nickname: user.nickname,
        petName: user.petName || user.nickname,
        role: 'teacher',
        email: user.email,
        avatar: (user.name || user.nickname || 'T').charAt(0).toUpperCase(),
        level: user.level || 1,
        words: user.words || 0,
        streak: user.streak || 0,
        isOnline: Math.random() > 0.5,
        lastActive: 'несколько минут назад',
      }));

      const userAccounts = nonAdmin.filter(u => normalizedCurrentRole(u.role) !== 'teacher').map((user) => ({
        id: user.id,
        name: user.name || user.nickname,
        nickname: user.nickname,
        petName: user.petName || user.nickname,
        role: 'user',
        email: user.email,
        avatar: (user.name || user.nickname || 'U').charAt(0).toUpperCase(),
        level: user.level || 1,
        words: user.words || 0,
        streak: user.streak || 0,
        status: acceptedFriendIds.includes(user.id) ? 'active' : 'user',
        outgoing: pendingOutgoingIds.includes(user.id),
        isOnline: Math.random() > 0.5,
        lastActive: 'несколько минут назад',
      }));

      setTeachers(teacherAccounts);
      setFriends(userAccounts);
      setFriendRequests(incoming);
      setOutgoingRequests(outgoing);

      if (!activeTab || activeTab === 'friends') {
        const hasFriendContent = acceptedFriendIds.length > 0;
        if (!hasFriendContent && (teacherAccounts.length > 0 || userAccounts.length > 0)) {
          setActiveTab('users');
        }
      }
    };

    loadData();
    // also expose reload on window for quick debugging
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // separate loader to allow refresh after actions
  const reloadLists = async () => {
    const currentEmail = localStorage.getItem('userEmail') || '';
    setCurrentUserEmail(currentEmail);

    let friendsData = { friends: [], incoming: [], outgoing: [] };
    let usersData = { users: [] };
    try {
      friendsData = await getFriends();
    } catch (err) {
      console.error('Failed to load friends data:', err);
    }
    try {
      usersData = await getUsers();
    } catch (err) {
      console.error('Failed to load users data:', err);
    }

    const incoming = Array.isArray(friendsData.incoming) ? friendsData.incoming.map((r) => ({
      id: r.request_id,
      name: r.name || r.nickname,
      nickname: r.nickname,
      email: r.email,
      avatar: (r.name || r.nickname).charAt(0).toUpperCase(),
      level: r.level || 1,
      words: r.words || 0,
      streak: r.streak || 0,
      pending: true,
    })) : [];

    const outgoing = Array.isArray(friendsData.outgoing) ? friendsData.outgoing.map((r) => ({
      id: r.request_id,
      name: r.name || r.nickname,
      nickname: r.nickname,
      email: r.email,
      avatar: (r.name || r.nickname).charAt(0).toUpperCase(),
      level: r.level || 1,
      words: r.words || 0,
      streak: r.streak || 0,
      pending: true,
    })) : [];

    const acceptedFriendIds = Array.isArray(friendsData.friends) ? friendsData.friends.map((row) => row.user_id) : [];
    const pendingOutgoingIds = Array.isArray(friendsData.outgoing) ? friendsData.outgoing.map((row) => row.recipient_user_id) : [];

    const users = Array.isArray(usersData.users) ? usersData.users : [];
    const normalizedCurrentRole = (role) => String(role || '').trim().toLowerCase();
    const nonAdmin = users.filter((user) => normalizedCurrentRole(user.role) !== 'admin' && user.email !== currentEmail);

    const teacherAccounts = nonAdmin.filter(u => normalizedCurrentRole(u.role) === 'teacher').map((user) => ({
      id: user.id,
      name: user.name || user.nickname,
      nickname: user.nickname,
      petName: user.petName || user.nickname,
      role: 'teacher',
      email: user.email,
      avatar: (user.name || user.nickname || 'T').charAt(0).toUpperCase(),
      level: user.level || 1,
      words: user.words || 0,
      streak: user.streak || 0,
      isOnline: Math.random() > 0.5,
      lastActive: 'несколько минут назад',
    }));

    const userAccounts = nonAdmin.filter(u => normalizedCurrentRole(u.role) !== 'teacher').map((user) => ({
      id: user.id,
      name: user.name || user.nickname,
      nickname: user.nickname,
      petName: user.petName || user.nickname,
      role: 'user',
      email: user.email,
      avatar: (user.name || user.nickname || 'U').charAt(0).toUpperCase(),
      level: user.level || 1,
      words: user.words || 0,
      streak: user.streak || 0,
      status: acceptedFriendIds.includes(user.id) ? 'active' : 'user',
      outgoing: pendingOutgoingIds.includes(user.id),
      isOnline: Math.random() > 0.5,
      lastActive: 'несколько минут назад',
    }));

    setTeachers(teacherAccounts);
    setFriends(userAccounts);
    setFriendRequests(incoming);
    setOutgoingRequests(outgoing);
  };

  const handleSearchUser = () => {
      const q = (searchEmail || '').trim().toLowerCase();
      if (!q) {
        setSearchError('Введите имя или имя питомца');
        return;
      }

      const availableUsers = [...friends, ...teachers];
      const foundUser = availableUsers.find((user) => {
        const name = (user.name || '').toLowerCase();
        const pet = (user.petName || '').toLowerCase();
        return name === q || pet === q || name.includes(q) || pet.includes(q);
      });
    if (!foundUser) {
      setSearchError('Пользователь не найден');
      setSearchResult(null);
      return;
    }

    if (foundUser.email === currentUserEmail) {
      setSearchError('Вы не можете добавить себя');
      setSearchResult(null);
      return;
    }

    if ([...friendRequests, ...outgoingRequests].some((f) => f.email === foundUser.email)) {
      setSearchError('Запрос уже отправлен');
      setSearchResult(null);
      return;
    }

    if (foundUser.status === 'active') {
      setSearchError('Этот пользователь уже друг');
      setSearchResult(null);
      return;
    }

    setSearchResult(foundUser);
    setSearchError('');
  };

  const showNotification = (text, type = 'success') => {
    setNotification({ text, type });
    window.setTimeout(() => setNotification({ text: '', type: '' }), 3000);
  };

  const handleSendFriendRequest = async () => {
    if (!searchResult) return;
    try {
      await sendFriendRequest({ recipientId: searchResult.id });
      setOutgoingRequests([...outgoingRequests, { id: Date.now(), ...searchResult, pending: true }]);
      setFriends(friends.map((user) => user.id === searchResult.id ? { ...user, outgoing: true } : user));
      setTeachers(teachers.map((user) => user.id === searchResult.id ? { ...user, outgoing: true } : user));
      setShowAddFriend(false);
      setSearchEmail('');
      setSearchResult(null);
      showNotification('Запрос отправлен. Ожидайте подтверждения.', 'success');
    } catch (err) {
      const errorText = err.message || 'Не удалось отправить запрос';
      setSearchError(errorText);
      showNotification(errorText, 'error');
    }
  };

  const isPendingRequest = (user) => [...friendRequests, ...outgoingRequests].some((request) => request.email === user.email);
  const isActiveFriend = (user) => user.status === 'active';

  const handleSendFriendRequestFromList = async (user) => {
    if (isActiveFriend(user)) {
      showNotification('Этот пользователь уже в друзьях.', 'warning');
      return;
    }
    if (isPendingRequest(user)) {
      showNotification('Запрос уже отправлен.', 'warning');
      return;
    }

    try {
      await sendFriendRequest({ recipientId: user.id });
      setOutgoingRequests([...outgoingRequests, { id: Date.now(), ...user, pending: true }]);
      setFriends(friends.map((item) => item.id === user.id ? { ...item, outgoing: true } : item));
      showNotification('Запрос отправлен. Его увидит пользователь.', 'success');
    } catch (err) {
      const errorText = err.message || 'Не удалось отправить запрос';
      console.error('send request failed', err);
      showNotification(errorText, 'error');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest({ requestId });
      // reload lists from server to ensure consistency
      await reloadLists();
    } catch (err) {
      console.error('accept failed', err);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectFriendRequest({ requestId });
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('reject failed', err);
    }
  };

  const handleRejectAndBlock = async (requestId) => {
    try {
      await rejectFriendRequest({ requestId, block: true });
      const req = friendRequests.find(r => r.id === requestId);
      if (req) {
        const id = req.requester_user_id || req.requesterId || req.id || Date.now();
        setBannedUsers([...bannedUsers, { id, name: req.name, avatar: req.avatar, banDate: new Date().toISOString() }]);
      }
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('reject+block failed', err);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого друга?')) return;
    try {
      await removeFriend(friendId);
      setFriends(friends.filter(f => f.id !== friendId));
    } catch (err) {
      console.error('remove failed', err);
    }
  };

  const handleBanUser = (friendId) => {
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;
    if (!window.confirm(`Вы уверены, что хотите заблокировать ${friend.name}?`)) return;
    blockUser({ blockedId: friendId }).then(() => {
      setBannedUsers([...bannedUsers, { ...friend, banDate: new Date().toISOString() }]);
      setFriends(friends.filter(f => f.id !== friendId));
    }).catch((err) => {
      console.error('block failed', err);
      setBannedUsers([...bannedUsers, { ...friend, banDate: new Date().toISOString() }]);
      setFriends(friends.filter(f => f.id !== friendId));
    });
  };

  const handleUnbanUser = (banId) => {
    const blocked = bannedUsers.find(b => b.id === banId);
    if (!blocked) return;
    unblockUser(banId).then(() => {
      setBannedUsers(bannedUsers.filter(b => b.id !== banId));
    }).catch((err) => {
      console.error('unblock failed', err);
      setBannedUsers(bannedUsers.filter(b => b.id !== banId));
    });
  };

  const handleViewProfile = (friend) => {
    setSelectedFriend(friend);
    setShowProfileModal(true);
    setSendMessageStatus('');
  };

  const openMessageModal = (friend) => {
    setSelectedFriend(friend);
    setShowMessageModal(true);
    setSendMessageStatus('');
  };

  const handleSendMessage = () => {
    if (!selectedFriend) {
      setSendMessageStatus('Выберите получателя сообщения.');
      return;
    }

    if (!messageText.trim()) {
      setSendMessageStatus('Введите сообщение.');
      return;
    }

    const activeUserId = currentUserId || getCurrentUserId();
    if (!activeUserId) {
      setSendMessageStatus('Сначала войдите в аккаунт.');
      return;
    }

    const friendId = selectedFriend.id;
    const messagesForFriend = messages[friendId] || [];
    const isTeacherConversation = selectedFriend.role === 'teacher' || userRole === 'teacher';
    if (!isTeacherConversation && messagesForFriend.length >= MESSAGE_LIMIT_PER_FRIEND) {
      setSendMessageStatus(`Лимит: не более ${MESSAGE_LIMIT_PER_FRIEND} сообщений этому другу.`);
      return;
    }

    const newMessage = {
      id: Date.now(),
      from: { id: activeUserId },
      to: { id: friendId, name: selectedFriend.name },
      text: messageText.trim(),
      date: new Date().toISOString(),
      sent: true,
    };

    const updatedMessages = {
      ...messages,
      [friendId]: [...messagesForFriend, newMessage],
    };
    setMessages(updatedMessages);
    try {
      localStorage.setItem(`miniMessages_v1_user_${activeUserId}`, JSON.stringify(updatedMessages));
    } catch (e) {}

    setMessageText('');
    setSendMessageStatus('Сообщение отправлено.');
    showNotification(`Сообщение отправлено ${selectedFriend.name}.`, 'success');
  };

  const getOnlineStatus = (isOnline, lastActive) => {
    if (isOnline) {
      return <span className="status-badge online">В сети</span>;
    }
    return <span className="status-badge offline">Был(а): {lastActive}</span>;
  };

  const acceptedCount = friends.filter(f => f.status === 'active').length;
  const otherUsersCount = friends.filter(f => f.status !== 'active').length;
  const teacherCount = teachers.length;

  const tabs = [
    { id: 'friends', label: 'Друзья', count: acceptedCount },
    { id: 'users', label: 'Пользователи', count: otherUsersCount + teacherCount },
    { id: 'requests', label: 'Запросы', count: friendRequests.length },
    { id: 'banned', label: 'Чёрный список', count: bannedUsers.length }
  ];

  // messages scoped to currently selected friend (both sent and received)
  const messagesForSelected = selectedFriend ? (messages[selectedFriend.id] || []) : [];

  return (
    <div className="friends">
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

      <header className="friends-header pet-header">
        <div className="header-container">
          <Logo className="friends-logo clickable-logo" alt="Logo" onClick={handleGoToDashboard} role="button" tabIndex={0} />
          <nav className="friends-nav">
            <button className="nav-link" onClick={handleGoToCharacter}>Персонаж</button>
            <button className="nav-link" onClick={handleGoToPractice}>Урок</button>
            <button className="nav-link" onClick={handleGoToTasks}>Задания</button>
            <button className="nav-link active" onClick={handleGoToFriends}>Друзья</button>
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

      <main className="friends-main">
        <div className="friends-container">
          <div className="friends-actions-bar">
            <div className="friends-tabs">
              {tabs.map(tab => (
                <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                  {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
                </button>
              ))}
            </div>
            <button className="add-friend-btn" onClick={() => setShowAddFriend(true)}>+ Добавить друга</button>
          </div>

          {activeTab === 'friends' && (
            <div className="friends-list">
              {friends.filter(f => f.status === 'active').length === 0 ? (
                <div className="empty-state"><p>Нет друзей</p></div>
              ) : (
                friends.filter(f => f.status === 'active').map(friend => (
                  <div key={friend.id} className="friend-card">
                    <div className="friend-avatar">{friend.avatar}</div>
                    <div className="friend-info">
                      <div className="friend-name-row">
                        <h4>{friend.name}</h4>
                        {friend.role === 'teacher' && <span className="teacher-badge">Учитель</span>}
                        {getOnlineStatus(friend.isOnline, friend.lastActive)}
                      </div>
                      <div className="friend-stats">
                        <span>Уровень {friend.level}</span>
                        <span>{friend.words} слов</span>
                        <span>{friend.streak} дней</span>
                      </div>
                    </div>
                    <div className="friend-actions">
                      {isActiveFriend(friend) && (
                        <button className="action-btn message" onClick={() => openMessageModal(friend)}>Сообщение</button>
                      )}
                      <button className="action-btn profile" onClick={() => handleViewProfile(friend)}>Профиль</button>
                      {isActiveFriend(friend) && (
                        <>
                          <button className="action-btn remove" onClick={() => handleRemoveFriend(friend.id)}>Удалить</button>
                          <button className="action-btn ban" onClick={() => handleBanUser(friend.id)}>Забанить</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-list">
              {teachers.length > 0 && (
                <div className="teachers-block">
                  <h3 style={{ marginBottom: '12px' }}>Учителя</h3>
                  {teachers.map((t) => (
                    <div key={t.id} className="friend-card user-row">
                      <div className="friend-avatar">{t.avatar}</div>
                      <div className="friend-info">
                        <div className="friend-name-row">
                          <h4>{t.name}</h4>
                          <span className="teacher-badge">Учитель</span>
                          {getOnlineStatus(t.isOnline, t.lastActive)}
                        </div>
                        <div className="friend-stats">
                          <span>Уровень {t.level}</span>
                          <span>{t.words} слов</span>
                        </div>
                      </div>
                      <div className="friend-actions">
                        <button className="action-btn message" onClick={() => openMessageModal(t)}>Написать</button>
                        <button className="action-btn profile" onClick={() => handleViewProfile(t)}>Профиль</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {teachers.length > 0 && <hr className="users-divider" />}

              <div style={{ marginTop: teachers.length > 0 ? '18px' : '0' }}>
                {friends.filter(f => f.status !== 'active').length === 0 ? (
                  <div className="empty-state"><p>Пользователей пока нет</p></div>
                ) : (
                  friends.filter(f => f.status !== 'active').map((user) => (
                    <div key={user.id} className="friend-card user-row">
                      <div className="friend-avatar">{user.avatar}</div>
                      <div className="friend-info">
                        <div className="friend-name-row">
                          <h4>{user.name}</h4>
                          {getOnlineStatus(user.isOnline, user.lastActive)}
                        </div>
                        <div className="friend-stats">
                          <span>Уровень {user.level}</span>
                          <span>{user.words} слов</span>
                        </div>
                      </div>
                      <div className="friend-actions">
                        {!isActiveFriend(user) && !isPendingRequest(user) && (
                          <button className="action-btn profile" onClick={() => handleSendFriendRequestFromList(user)}>Запрос в друзья</button>
                        )}
                        {isPendingRequest(user) && (
                          <button className="action-btn profile" disabled>Запрос отправлен</button>
                        )}
                        <button className="action-btn profile" onClick={() => handleViewProfile(user)}>Профиль</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-list">
              {friendRequests.length === 0 ? (
                <div className="empty-state"><p>Нет входящих заявок</p></div>
              ) : (
                friendRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-avatar">{request.avatar}</div>
                    <div className="request-info">
                      <h4>{request.name}</h4>
                      <p>@{request.nickname}</p>
                      <p>Уровень {request.level} • {request.words} слов</p>
                    </div>
                    <div className="request-actions">
                      <button className="accept-btn" onClick={() => handleAcceptRequest(request.id)}>Принять</button>
                      <button className="reject-btn" onClick={() => handleRejectRequest(request.id)}>Отклонить</button>
                      <button className="reject-ban-btn" onClick={() => handleRejectAndBlock(request.id)}>Отклонить и заблокировать</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'banned' && (
            <div className="banned-list">
              {bannedUsers.length === 0 ? (
                <div className="empty-state"><p>Чёрный список пуст</p></div>
              ) : (
                bannedUsers.map(ban => (
                  <div key={ban.id} className="banned-card">
                    <div className="banned-avatar">{ban.avatar}</div>
                    <div className="banned-info">
                      <h4>{ban.name}</h4>
                      <p>Забанен: {new Date(ban.banDate).toLocaleDateString()}</p>
                    </div>
                    <button className="unban-btn" onClick={() => handleUnbanUser(ban.id)}>Разбанить</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {notification.text && (
        <div className={`friends-notification ${notification.type}`}>
          {notification.text}
        </div>
      )}

      {/* Модальные окна (оставляем как есть) */}
      {showAddFriend && (
        <div className="modal-overlay" onClick={() => setShowAddFriend(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Добавить друга</h3><button className="modal-close" onClick={() => setShowAddFriend(false)}>×</button></div>
            <div className="modal-body">
              <div className="search-section">
                <label>Имя или имя питомца</label>
                <div className="search-input-group">
                  <input type="text" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} placeholder="Введите имя или имя питомца" className="search-input" />
                  <button className="search-btn" onClick={handleSearchUser}>Найти</button>
                </div>
                {searchError && <p className="error-text">{searchError}</p>}
                {searchResult && (
                  <div className="search-result">
                    <div className="result-avatar">{searchResult.avatar}</div>
                    <div className="result-info">
                      <h4>{searchResult.name}</h4>
                      <p>@{searchResult.nickname}</p>
                      <p>Уровень {searchResult.level} • {searchResult.words} слов</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddFriend(false)}>Отмена</button>
              {searchResult && <button className="send-btn" onClick={handleSendFriendRequest}>Отправить запрос</button>}
            </div>
          </div>
        </div>
      )}

      {showProfileModal && selectedFriend && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Профиль друга</h3><button className="modal-close" onClick={() => setShowProfileModal(false)}>×</button></div>
            <div className="modal-body profile-modal-body">
              <div className="profile-modal-avatar">{selectedFriend.avatar}</div>
              <div className="profile-modal-info">
                <h2>{selectedFriend.name}</h2>
                <p className="friend-nickname">@{selectedFriend.nickname}</p>
                <p className="friend-title">{selectedFriend.title || 'Искатель знаний'}</p>
                <div className="profile-modal-stats">
                  <div className="stat-item"><span className="stat-label">Уровень</span><span className="stat-value">{selectedFriend.level}</span></div>
                  <div className="stat-item"><span className="stat-label">Выучено слов</span><span className="stat-value">{selectedFriend.words}</span></div>
                  <div className="stat-item"><span className="stat-label">Дней подряд</span><span className="stat-value">{selectedFriend.streak}</span></div>
                </div>
                <div className="profile-modal-extra">
                    <p>{selectedFriend.email}</p>
                    <p>С нами с {selectedFriend.joinDate}</p>
                    {getOnlineStatus(selectedFriend.isOnline, selectedFriend.lastActive)}
                  </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="message-btn-modal" onClick={() => { setShowProfileModal(false); openMessageModal(selectedFriend); }}>Написать сообщение</button>
              <button className="cancel-btn" onClick={() => setShowProfileModal(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {showMessageModal && selectedFriend && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content message-modal" style={{ maxWidth: '900px', width: '95%', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Сообщение для {selectedFriend.name}</h3><button className="modal-close" onClick={() => setShowMessageModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="message-list" style={{ maxHeight: '40vh', overflowY: 'auto', marginBottom: '12px' }}>
                {messagesForSelected.length === 0 && <p className="empty-state">Нет сообщений</p>}
                {messagesForSelected.map((msg) => (
                  <div key={msg.id} className={`message-bubble ${msg.sent ? 'sent' : 'received'}`} style={{ marginBottom: '8px', display: 'flex', justifyContent: msg.sent ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: '14px', background: msg.sent ? '#CBEF66' : '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: 14, color: '#191923' }}>{msg.text}</div>
                      <div style={{ fontSize: 11, color: '#7b8895', marginTop: 6, textAlign: 'right' }}>{new Date(msg.date).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ marginBottom: '8px', color: '#7FB0E8' }}>
                Отправлено: {messagesForSelected.filter(m=>m.sent).length}/{MESSAGE_LIMIT_PER_FRIEND}
              </p>
              <textarea className="message-textarea" placeholder="Введите ваше сообщение..." value={messageText} onChange={(e) => setMessageText(e.target.value)} rows="4" />
              {sendMessageStatus && <p className="error-text">{sendMessageStatus}</p>}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowMessageModal(false)}>Закрыть</button>
              <button className="send-btn" onClick={handleSendMessage}>Отправить</button>
            </div>
          </div>
        </div>
      )}

      <Footer wrapperClass="friends-footer" />
    </div>
  );
};

export default Friends;