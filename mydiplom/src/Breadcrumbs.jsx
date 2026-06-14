import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter(x => x);

  const getPageName = (path) => {
    const names = {
      'welcome': 'Главная',
      'auth': 'Вход',
      'register': 'Регистрация',
      'goal-selection': 'Выбор цели',
      'onboarding': 'Обучение',
      'dashboard': 'Панель управления',
      'tasks': 'Задания',
      'pet': 'Питомец',
      'profile': 'Профиль',
      'create-first-goal': 'Создание цели',
      'main': 'Главная'
    };
    return names[path] || path;
  };

  if (pathnames.length === 0) return null;

  return (
    <div className="breadcrumbs">
      <div className="breadcrumbs-container">
        <Link to="/dashboard" className="breadcrumb-link">
          Главная
        </Link>
        
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          return (
            <React.Fragment key={name}>
              <span className="breadcrumb-separator">/</span>
              {isLast ? (
                <span className="breadcrumb-current">{getPageName(name)}</span>
              ) : (
                <Link to={routeTo} className="breadcrumb-link">
                  {getPageName(name)}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Breadcrumbs;