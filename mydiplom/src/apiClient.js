const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const buildUrl = (path) => `${API_BASE_URL}${path}`;

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = data?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function loginUser(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchProfile() {
  return apiRequest('/api/profile/me', {
    method: 'GET',
  });
}

export function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userAvatar');
}

export async function getLevelContent(level) {
  // request lightweight version by default to reduce payload
  return apiRequest(`/api/progress/content/level/${level}?lite=true`, { method: 'GET' });
}

export async function getLevelContentFull(level) {
  return apiRequest(`/api/progress/content/level/${level}`, { method: 'GET' });
}

export async function getGameLevels() {
  return apiRequest('/api/progress/content/game-levels', { method: 'GET' });
}

export async function getGameState() {
  return apiRequest('/api/progress/game-state', { method: 'GET' });
}

export async function saveGameState(state) {
  return apiRequest('/api/progress/game-state', { method: 'POST', body: JSON.stringify({ state }) });
}

export async function getTodayTasks() {
  // client-side cache: keep small TTL to reduce requests
  const cacheKey = 'todayTasksCache_v1';
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const ageMs = Date.now() - (parsed._ts || 0);
      const ttl = 1000 * 60 * 5; // 5 minutes
      if (ageMs < ttl) {
        return parsed.data;
      }
    }
  } catch (e) {
    // ignore parse errors
  }

  const data = await apiRequest(`/api/progress/today`, { method: 'GET' });
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ _ts: Date.now(), data }));
  } catch (e) {
    // ignore storage errors (quota, private mode)
  }
  return data;
}

export async function getTodayTasksFresh() {
  const cacheKey = 'todayTasksCache_v1';
  try { localStorage.removeItem(cacheKey); } catch (e) {}
  return apiRequest(`/api/progress/today`, { method: 'GET' });
}

export async function getUserStats() {
  return apiRequest(`/api/progress/stats`, { method: 'GET' });
}

export async function getAllUsers() {
  return apiRequest('/api/admin/all', { method: 'GET' });
}

export async function getUsers() {
  return apiRequest('/api/auth/users', { method: 'GET' });
}

export async function getTopUsers() {
  return apiRequest('/api/auth/top', { method: 'GET' });
}

export async function submitAnswer(payload) {
  return apiRequest('/api/progress/answer', { method: 'POST', body: JSON.stringify(payload) });
}

export async function advanceLevel(payload) {
  return apiRequest('/api/progress/advance', { method: 'POST', body: JSON.stringify(payload) });
}

// Profile management
export async function updateProfile(payload) {
  return apiRequest('/api/profile/update', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function changePassword(payload) {
  return apiRequest('/api/profile/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePet(petId, payload) {
  return apiRequest(`/api/profile/pet/${petId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// Admin panel
export async function getAdminStats() {
  return apiRequest('/api/admin/stats', { method: 'GET' });
}

export async function getUserDetails(userId) {
  return apiRequest(`/api/admin/user/${userId}`, { method: 'GET' });
}

export async function getRanking(limit = 5, offset = 0) {
  return apiRequest(`/api/admin/ranking?limit=${limit}&offset=${offset}`, { method: 'GET' });
}

export async function changeUserRole(userId, role) {
  return apiRequest('/api/admin/user/role', {
    method: 'POST',
    body: JSON.stringify({ userId, role }),
  });
}

export async function deleteAdminUser(userId) {
  return apiRequest(`/api/admin/user/${userId}`, { method: 'DELETE' });
}

export async function getTeacherStudents() {
  return apiRequest('/api/teacher/students', { method: 'GET' });
}

export async function assignStudent(studentId) {
  return apiRequest(`/api/teacher/students/${studentId}/assign`, { method: 'POST' });
}

export async function getStudentDetails(studentId) {
  return apiRequest(`/api/teacher/students/${studentId}`, { method: 'GET' });
}

export async function addTeacherNote(studentId, note) {
  return apiRequest(`/api/teacher/students/${studentId}/note`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

// Support system
export async function sendSupportRequest(payload) {
  return apiRequest('/api/support/request', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUserSupportRequests(userId) {
  return apiRequest(`/api/support/requests/${userId}`, { method: 'GET' });
}

export async function getAllSupportRequests(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/api/support/all${queryString ? '?' + queryString : ''}`, { method: 'GET' });
}

export async function respondToSupportRequest(payload) {
  return apiRequest('/api/support/respond', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function closeSupportRequest(requestId) {
  return apiRequest(`/api/support/close/${requestId}`, {
    method: 'PUT',
  });
}

// Friends / social
export async function getFriends() {
  return apiRequest('/api/friends', { method: 'GET' });
}

export async function sendFriendRequest(payload) {
  return apiRequest('/api/friends/request', { method: 'POST', body: JSON.stringify(payload) });
}

export async function acceptFriendRequest(payload) {
  return apiRequest('/api/friends/accept', { method: 'POST', body: JSON.stringify(payload) });
}

export async function rejectFriendRequest(payload) {
  return apiRequest('/api/friends/reject', { method: 'POST', body: JSON.stringify(payload) });
}

export async function removeFriend(friendId) {
  return apiRequest(`/api/friends/${friendId}`, { method: 'DELETE' });
}

export async function blockUser(payload) {
  return apiRequest('/api/friends/block', { method: 'POST', body: JSON.stringify(payload) });
}

export async function unblockUser(blockedId) {
  return apiRequest(`/api/friends/block/${blockedId}`, { method: 'DELETE' });
}

export async function getMessagesWithUser(userId) {
  return apiRequest(`/api/messages/with/${userId}`, { method: 'GET' });
}

export async function sendMessageToUser(recipientId, text) {
  return apiRequest('/api/messages', { method: 'POST', body: JSON.stringify({ recipientId, text }) });
}

// Lazy-load media helper: returns object URL (cached in-memory)
const _mediaCache = new Map();
export async function loadMedia(url) {
  if (!url) return null;
  if (_mediaCache.has(url)) return _mediaCache.get(url);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load media');
    const blob = await res.blob();
    const obj = URL.createObjectURL(blob);
    _mediaCache.set(url, obj);
    return obj;
  } catch (e) {
    console.error('loadMedia error', e.message || e);
    return url; // fallback to original url
  }
}

// Additional admin/teacher/shop/chat helpers (frontend-side wrappers)
export async function getTeachers() {
  return apiRequest('/api/admin/teachers', { method: 'GET' });
}

export async function createTeacher(payload) {
  return apiRequest('/api/admin/teachers', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateTeacher(teacherId, payload) {
  return apiRequest(`/api/admin/teachers/${teacherId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteTeacher(teacherId) {
  return apiRequest(`/api/admin/teachers/${teacherId}`, { method: 'DELETE' });
}

// Mini-shop management
export async function getShopItems() {
  return apiRequest('/api/admin/shop', { method: 'GET' });
}

export async function createShopItem(payload) {
  return apiRequest('/api/admin/shop', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateShopItem(itemId, payload) {
  return apiRequest(`/api/admin/shop/${itemId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteShopItem(itemId) {
  return apiRequest(`/api/admin/shop/${itemId}`, { method: 'DELETE' });
}

// Ranking reorder
export async function reorderRanking(newOrder) {
  // newOrder: array of userIds in desired order
  return apiRequest('/api/admin/ranking/reorder', { method: 'POST', body: JSON.stringify({ order: newOrder }) });
}

// Chats / monetization review
export async function getChats(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/api/admin/chats${qs ? '?' + qs : ''}`, { method: 'GET' });
}

export async function flagChatMessage(messageId, payload) {
  return apiRequest(`/api/admin/chats/${messageId}/flag`, { method: 'POST', body: JSON.stringify(payload) });
}

// Ban / unban users
export async function banUser(userId, payload = {}) {
  return apiRequest('/api/admin/ban', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
}

export async function unbanUser(userId) {
  return apiRequest(`/api/admin/ban/${userId}`, { method: 'DELETE' });
}

// Inactivity and admin messaging
export async function getUserInactivity(userId) {
  return apiRequest(`/api/admin/user/${userId}/inactivity`, { method: 'GET' });
}

export async function sendAdminMessage(userId, payload) {
  return apiRequest('/api/admin/message', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
}
