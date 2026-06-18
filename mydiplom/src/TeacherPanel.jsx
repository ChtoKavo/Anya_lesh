import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeacherStudents, assignStudent, getStudentDetails, addTeacherNote } from './apiClient';
import Logo from './Logo';
import Footer from './Footer';
import './AdminPanel.css';

const TeacherPanel = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'teacher');

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      setError('');
      try {
        const data = await getTeacherStudents();
        setStudents(data.students || []);
      } catch (err) {
        setError(err.message || 'Не удалось загрузить учеников');
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setStudentDetails(null);
    setError('');
    try {
      const data = await getStudentDetails(student.id);
      setStudentDetails(data);
      setNoteText('');
    } catch (err) {
      setError(err.message || 'Не удалось загрузить данные ученика');
    }
  };

  const handleAssign = async (studentId) => {
    setError('');
    try {
      await assignStudent(studentId);
      const data = await getTeacherStudents();
      setStudents(data.students || []);
    } catch (err) {
      setError(err.message || 'Не удалось назначить ученика');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedStudent || !noteText.trim()) {
      return;
    }
    setError('');
    try {
      await addTeacherNote(selectedStudent.id, noteText.trim());
      const data = await getStudentDetails(selectedStudent.id);
      setStudentDetails(data);
      setNoteText('');
    } catch (err) {
      setError(err.message || 'Не удалось сохранить заметку');
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-dashboard-header">
        <div className="header-container">
          <Logo className="admin-logo clickable-logo" alt="Logo" onClick={() => navigate('/dashboard')} role="button" tabIndex={0} />
          <nav className="admin-nav">
            <button className="nav-link" onClick={() => navigate('/pet')}>Персонаж</button>
            <button className="nav-link" onClick={() => navigate('/practice')}>Урок</button>
            <button className="nav-link" onClick={() => navigate('/tasks')}>Задания</button>
            <button className="nav-link" onClick={() => navigate('/friends')}>Друзья</button>
            {['admin', 'owner_admin'].includes(userRole) && (
              <button className="nav-link" onClick={() => navigate('/admin')}>Админка</button>
            )}
            {['teacher', 'admin', 'owner_admin'].includes(userRole) && (
              <button className="nav-link active" onClick={() => navigate('/teacher')}>Учитель</button>
            )}
          </nav>
          <button className="auth-btn" onClick={() => navigate('/profile')}>Профиль</button>
        </div>
      </header>

      <main className="admin-dashboard-main">
        <div className="admin-content-wrapper">
          <div className="admin-tabs-container">
            <h1 className="section-title">Панель учителя</h1>
            <p className="section-description">Здесь вы видите прогресс своих учеников, можете назначать себя и оставлять заметки.</p>
          </div>

          {error && <div className="admin-error-message">{error}</div>}
          {loading && <div className="admin-loading-message">Загрузка...</div>}

          {!loading && (
            <div className="admin-cards-container">
              <div className="users-list-container">
                {students.map((student) => (
                  <div key={student.id} className="user-list-item">
                    <div className="user-item-avatar">{student.pet_name?.charAt(0) || student.nickname.charAt(0)}</div>
                    <div className="user-item-info">
                      <p className="user-item-name">{student.nickname}</p>
                      <p className="user-item-email">{student.email}</p>
                      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>Последняя активность: {student.last_seen ? new Date(student.last_seen).toLocaleDateString() : 'никогда'}</p>
                      <div className="user-item-stats" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <span className="user-item-stat">Ур.: {student.level}</span>
                        <span className="user-item-stat">Слов: {student.words_learned_total}</span>
                        <span className="user-item-stat">Стрик: {student.streak_days}</span>
                        <span className="user-item-stat">Монеты: {student.coins}</span>
                        <span className="user-item-stat">Энергия: {student.energy}</span>
                      </div>
                    </div>
                    <div className="user-item-actions">
                      <button className="user-item-btn" onClick={() => handleSelectStudent(student)}>
                        Открыть
                      </button>
                      {!student.is_assigned && (
                        <button className="user-item-btn" onClick={() => handleAssign(student.id)}>
                          Назначить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedStudent && studentDetails && (
            <div className="admin-cards-container" style={{ marginTop: '20px' }}>
              <div className="user-detail-card">
                <h2>Данные ученика: {studentDetails.student.nickname}</h2>
                <div className="modal-info-grid">
                  <div className="info-item"><label>Email:</label><p>{studentDetails.student.email}</p></div>
                  <div className="info-item"><label>Уровень:</label><p>{studentDetails.student.level}</p></div>
                  <div className="info-item"><label>Опыт:</label><p>{studentDetails.student.xp}</p></div>
                  <div className="info-item"><label>Монеты:</label><p>{studentDetails.student.coins}</p></div>
                  <div className="info-item"><label>Энергия:</label><p>{studentDetails.student.energy} / {studentDetails.student.max_energy}</p></div>
                  <div className="info-item"><label>Слова:</label><p>{studentDetails.student.words_learned_total}</p></div>
                  <div className="info-item"><label>Стreak:</label><p>{studentDetails.student.streak_days}</p></div>
                  <div className="info-item full-width"><label>Питомец:</label><p>{studentDetails.student.pet_name} ({studentDetails.student.pet_type})</p></div>
                </div>

                <div className="notes-section">
                  <h3>Статистика по этапам</h3>
                  {studentDetails.stats.length === 0 && <p>Данные по этапам отсутствуют.</p>}
                  <div className="notes-grid">
                    {studentDetails.stats.map((item) => (
                      <div key={item.stage_id} className="note-card">
                        <strong style={{ fontSize: '1.1rem', color: '#9d4ede' }}>Этап: {item.stage_id}</strong>
                        <div style={{ marginTop: '8px' }}>
                          <p>Точность: <span style={{ fontWeight: 'bold', color: item.correct_percent >= 70 ? '#50db9b' : '#ff6b6b' }}>{item.correct_percent}%</span></p>
                          <p>Попыток: {item.attempts}</p>
                          <p>Время: {item.time_spent_seconds} сек</p>
                          <p><small>Последняя: {new Date(item.last_attempt_at).toLocaleDateString()}</small></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="notes-section" style={{ marginTop: '40px' }}>
                  <h3>Последние ответы</h3>
                  {(!studentDetails.answers || studentDetails.answers.length === 0) && <p>Ответы отсутствуют.</p>}
                  <div className="answers-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {studentDetails.answers?.map((ans) => (
                      <div key={ans.id} className="note-card" style={{ borderLeft: `5px solid ${ans.is_correct ? '#50db9b' : '#ff6b6b'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>Этап {ans.stage_id} (Задание {ans.task_id})</strong>
                          <span style={{ color: ans.is_correct ? '#50db9b' : '#ff6b6b', fontWeight: 'bold' }}>
                            {ans.is_correct ? 'Верно' : 'Неверно'}
                          </span>
                        </div>
                        <p style={{ margin: '8px 0' }}>Ответ: <em>{ans.answer_text}</em></p>
                        <small>{new Date(ans.created_at).toLocaleString()} • {ans.time_spent_seconds} сек</small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="notes-section" style={{ marginTop: '40px' }}>
                  <h3>Заметки учителя</h3>
                  {studentDetails.notes.length === 0 && <p>Нет заметок.</p>}
                  {studentDetails.notes.map((note) => (
                    <div key={note.id} className="note-card">
                      <p>{note.note}</p>
                      <small>{new Date(note.created_at).toLocaleString()}</small>
                    </div>
                  ))}

                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Оставить заметку ученику..."
                    rows="4"
                    style={{ width: '100%', padding: '12px', marginTop: '12px', borderRadius: '10px', border: '1px solid #999' }}
                  />
                  <button className="user-item-btn" onClick={handleSaveNote} style={{ marginTop: '12px' }}>
                    Сохранить заметку
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer wrapperClass="admin-footer" />
    </div>
  );
};

export default TeacherPanel;
 TeacherPanel;
