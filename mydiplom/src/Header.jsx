import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState('user');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'user';
    setUserRole(role);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/dashboard', label: 'Главная', icon: '🏠' },
    { path: '/tasks', label: 'Задания', icon: '📋' },
    { path: '/pet', label: 'Питомец', icon: '🐉' },
    { path: '/profile', label: 'Профиль', icon: '👤' },
  ];

  const adminNav = userRole === 'admin'
    ? { path: '/admin', label: 'Админ Панель', icon: '🔐' }
    : null;

  const teacherNav = userRole === 'teacher'
    ? { path: '/teacher', label: 'Учитель', icon: '🎓' }
    : null;

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <header className="header">
      <div className="header-brand">
        <Link to="/dashboard" className="header-logo">
          <span className="gradient-text">GoalTracker</span>
        </Link>

        <button
          type="button"
          className="header-menu-toggle"
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`header-nav ${isMenuOpen ? 'header-nav-open' : ''}`} aria-label="Основное меню">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className="nav-link"
            style={{
              background: location.pathname === item.path ? 'rgba(157, 78, 221, 0.2)' : 'transparent',
              border: location.pathname === item.path ? '1px solid rgba(157, 78, 221, 0.3)' : 'none',
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        {adminNav && (
          <Link
            to={adminNav.path}
            className="nav-link admin-nav-link"
            style={{
              background: location.pathname === adminNav.path ? 'rgba(255, 107, 107, 0.2)' : 'transparent',
              border: location.pathname === adminNav.path ? '1px solid rgba(255, 107, 107, 0.5)' : '1px solid rgba(255, 107, 107, 0.3)',
            }}
          >
            <span>{adminNav.icon}</span>
            <span>{adminNav.label}</span>
          </Link>
        )}
        {teacherNav && (
          <Link
            to={teacherNav.path}
            className="nav-link admin-nav-link"
            style={{
              background: location.pathname === teacherNav.path ? 'rgba(80, 219, 155, 0.2)' : 'transparent',
              border: location.pathname === teacherNav.path ? '1px solid rgba(80, 219, 155, 0.5)' : '1px solid rgba(80, 219, 155, 0.3)',
            }}
          >
            <span>{teacherNav.icon}</span>
            <span>{teacherNav.label}</span>
          </Link>
        )}
      </nav>

      <div className="header-actions">
        <div className="header-stats">
          <span>🔥</span>
          <span>42</span>
        </div>
        <div className="header-avatar">👤</div>
      </div>
    </header>
  );
};

export default Header;