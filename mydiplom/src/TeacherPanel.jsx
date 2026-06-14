import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeacherStudents, assignStudent, getStudentDetails, addTeacherNote } from './apiClient';
import Header from './Header';
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
      <Header />
      <main className="admin-dashboard-main">
        <div className="admin-content-wrapper">
          <div className="admin-tabs-container">
            <h1 className="section-title">Панель учителя</h1>
            <p className="section-description">Здесь вы видите прогресс своих учеников, можете назначать себя и оставлять заметки.</p>
          </div>

          {error && <div className="admin-error-message">{error}</div>}
          {loading && <div className="admin-loading-message">⏳ Загрузка...</div>}

          {!loading && (
            <div className="admin-cards-container">
              {students.map((student) => (
                <div key={student.id} className="user-list-item">
                  <div className="user-item-avatar">{student.pet_name?.charAt(0) || student.nickname.charAt(0)}</div>
                  <div className="user-item-info">
                    <p className="user-item-name">{student.nickname}</p>
                    <p className="user-item-email">{student.email}</p>
                    <div className="user-item-stats">
                      <span className="user-item-stat">Ур.: {student.level}</span>
                      <span className="user-item-stat">💰 {student.coins}</span>
                      <span className="user-item-stat">⚡ {student.energy}</span>
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
                  <div className="notes-grid">
                    {studentDetails.stats.map((item) => (
                      <div key={item.stage_id} className="note-card">
                        <strong>{item.stage_id}</strong>
                        <p>Точность: {item.correct_percent}%</p>
                        <p>Попыток: {item.attempts}</p>
                        <p>Время: {item.time_spent_seconds}s</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="notes-section">
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
