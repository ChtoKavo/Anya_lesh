import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStats } from './apiClient';

const Footer = ({ wrapperClass = 'footer' }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ level: '-', wordsLearned: '-', activeDays: '-' });

  useEffect(() => {
    let mounted = true;

    getUserStats()
      .then((data) => {
        if (!mounted) return;
        setStats({
          level: data?.level ?? '-',
          wordsLearned: data?.wordsLearned ?? 0,
          activeDays: data?.activeDays ?? 0,
        });
      })
      .catch(() => {
        if (!mounted) return;
        setStats({ level: '-', wordsLearned: '-', activeDays: '-' });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className={wrapperClass}>
      <div className="footer-container">
        <div className="footer-stats">
          <div className="footer-stat">
            <span>Уровень: {stats.level}</span>
          </div>
          <div className="footer-stat">
            <span>Слов пройдено: {stats.wordsLearned}</span>
          </div>
          <div className="footer-stat">
            <span>Дней: {stats.activeDays}</span>
          </div>
        </div>
        <div className="footer-links">
          <button className="footer-btn" onClick={() => navigate('/pet')}>Персонаж</button>
          <button className="footer-btn" onClick={() => navigate('/practice')}>Урок</button>
          <button className="footer-btn" onClick={() => navigate('/tasks')}>Задания</button>
          <button className="footer-btn" onClick={() => navigate('/friends')}>Друзья</button>
          <button className="footer-btn" onClick={() => navigate('/terms')}>Условия пользования</button>
          <button className="footer-btn" onClick={() => navigate('/privacy')}>Политика конфиденциальности</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;