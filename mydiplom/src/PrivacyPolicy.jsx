import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Footer from './Footer';
import './Dashboard.css';
import './DocsPage.css';

const PrivacyPolicy = () => {
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
              <h1 className="docs-title">Политика конфиденциальности</h1>
              <p className="docs-subtitle">Здесь описано, как мы собираем и защищаем ваши данные при использовании сервиса.</p>
            </div>
            <div className="docs-actions">
              <button className="docs-btn docs-secondary" onClick={() => navigate('/dashboard')}>На главную</button>
              <button className="docs-btn" onClick={() => navigate(-1)}>Вернуться назад</button>
            </div>
          </div>

          <div className="docs-section">
            <p>Мы собираем данные для улучшения сервиса и обеспечения корректной работы личного кабинета. Это могут быть данные профиля, прогресс обучения и предпочтения.</p>
            <p>Собранная информация используется только в рамках приложения и не передается третьим лицам без вашего согласия, за исключением случаев, предусмотренных законом.</p>
            <p>Вы имеете право запросить удаление своих данных и изменения личной информации. Все запросы обрабатываются в соответствии с внутренними правилами безопасности.</p>
            <p>Пользуясь приложением, вы соглашаетесь с данной политикой и обязуетесь использовать сервис в соответствии с правилами.</p>
          </div>
        </div>
      </main>

      <Footer wrapperClass="dashboard-footer" />
    </div>
  );
};

export default PrivacyPolicy;
