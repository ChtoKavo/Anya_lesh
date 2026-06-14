import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Footer from './Footer';
import './Dashboard.css';
import './DocsPage.css';

const TermsOfUse = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  return (
    <div className="dashboard docs-page">
      <header className="dashboard-header pet-header">
        <div className="header-container">
          <Logo className="dashboard-logo clickable-logo" alt="Logo" onClick={() => navigate('/dashboard')} role="button" tabIndex={0} />
          <nav className="dashboard-nav">
            <button className="nav-link" onClick={() => navigate('/pet')}>Персонаж</button>
            <button className="nav-link" onClick={() => navigate('/practice')}>Урок</button>
            <button className="nav-link" onClick={() => navigate('/tasks')}>Задания</button>
            <button className="nav-link" onClick={() => navigate('/friends')}>Друзья</button>
            {isAdmin && (
              <button className="nav-link" onClick={() => navigate('/admin')}>Админка</button>
            )}
          </nav>
          <button className="auth-btn" onClick={() => navigate('/profile')}>Вход / Профиль</button>
        </div>
      </header>

      <main className="docs-main">
        <div className="docs-card">
          <div className="docs-heading">
            <div>
              <h1 className="docs-title">Условия пользования</h1>
              <p className="docs-subtitle">Здесь описаны ключевые правила, которые применяются к использованию платформы.</p>
            </div>
            <div className="docs-actions">
              <button className="docs-btn docs-secondary" onClick={() => navigate('/dashboard')}>На главную</button>
              <button className="docs-btn" onClick={() => navigate(-1)}>Вернуться назад</button>
            </div>
          </div>

          <div className="docs-section">
            <p>Добро пожаловать на страницу условий пользования. Этот раздел объясняет, как пользователь может взаимодействовать с приложением, какие правила действуют и что запрещено.</p>
            <p>Используя сервис, вы соглашаетесь соблюдать правила, указанные в этом документе. Сюда входят ограничения на поведение, права на контент и ответственность сторон.</p>
            <p>Платформа оставляет за собой право изменять условия и уведомлять пользователей об этом. Обновления могут вступать в силу немедленно или после публикации на сайте.</p>
            <p>Пожалуйста, внимательно прочтите правила и, если нужно, сохраните эту страницу для дальнейшего ознакомления.</p>
          </div>
        </div>
      </main>

      <Footer wrapperClass="dashboard-footer" />
    </div>
  );
};

export default TermsOfUse;
