import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('userEmail') || '';
    } catch (e) {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('userEmail', email);
    } catch (err) {
      // ignore
    }
    navigate('/dashboard');
  };

  // Стили для шрифтов
  const fontStyles = {
    // Основной шрифт для всего текста
    primary: {
      fontFamily: 'Arial, sans-serif', // Замените на ваш основной шрифт
    },
    // Акцентный шрифт для специальных слов
    accent: {
      fontFamily: "'Times New Roman', serif", // Замените на ваш акцентный шрифт
      fontWeight: 'bold',
    }
  };

  return (
    <div style={{
      backgroundImage: 'url(/unbackgraund.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: 'white',
      ...fontStyles.primary
    }}>
      {/* ВОЙТИ - с акцентным шрифтом */}
      <h1 style={{
        fontSize: '3.5rem',
        fontWeight: '400',
        letterSpacing: '6px',
        marginBottom: '60px',
        textTransform: 'uppercase',
        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
        color: 'rgba(255, 255, 255, 0.95)',
        ...fontStyles.accent // Акцентный шрифт для заголовка
      }}>
        ВОЙТИ
      </h1>

      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '35px'
      }}>
        {/* Почта */}
        <div style={{ width: '100%' }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '300',
            marginBottom: '12px',
            letterSpacing: '1.5px',
            color: 'rgba(255, 255, 255, 0.9)',
            ...fontStyles.accent // Акцентный шрифт для меток
          }}>
            ПОЧТА
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            style={{
              width: '100%',
              padding: '18px 20px',
              fontSize: '1.3rem',
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid rgba(255, 255, 255, 0.25)',
              color: 'white',
              outline: 'none',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px',
              ...fontStyles.primary
            }}
            onFocus={(e) => {
              e.target.style.borderBottomColor = 'rgba(157, 78, 221, 0.9)';
              e.target.style.transform = 'translateY(-3px)';
            }}
            onBlur={(e) => {
              e.target.style.borderBottomColor = 'rgba(255, 255, 255, 0.25)';
              e.target.style.transform = 'translateY(0)';
            }}
          />
        </div>

        {/* Пароль */}
        <div style={{ width: '100%' }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '300',
            marginBottom: '12px',
            letterSpacing: '1.5px',
            color: 'rgba(255, 255, 255, 0.9)',
            ...fontStyles.accent // Акцентный шрифт для меток
          }}>
            ПАРОЛЬ
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '18px 20px',
              fontSize: '1.3rem',
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid rgba(255, 255, 255, 0.25)',
              color: 'white',
              outline: 'none',
              transition: 'all 0.3s ease',
              letterSpacing: '1px',
              ...fontStyles.primary
            }}
            onFocus={(e) => {
              e.target.style.borderBottomColor = 'rgba(157, 78, 221, 0.9)';
              e.target.style.transform = 'translateY(-3px)';
            }}
            onBlur={(e) => {
              e.target.style.borderBottomColor = 'rgba(255, 255, 255, 0.25)';
              e.target.style.transform = 'translateY(0)';
            }}
          />
        </div>

        {/* Запомнить меня */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '5px'
        }}>
          <div
            onClick={() => setRememberMe(!rememberMe)}
            style={{
              width: '24px',
              height: '24px',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backgroundColor: rememberMe ? 'rgba(157, 78, 221, 0.25)' : 'transparent'
            }}
          >
            {rememberMe && (
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#9d4edd',
                borderRadius: '2px'
              }} />
            )}
          </div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '300',
            color: 'rgba(255, 255, 255, 0.8)',
            letterSpacing: '0.8px',
            ...fontStyles.primary
          }}>
            Запомнить меня
          </div>
        </div>

        {/* Кнопка ПРОДОЛЖИТЬ - с акцентным шрифтом */}
        <button
          type="submit"
          style={{
            width: '100%',
            maxWidth: '280px',
            padding: '22px',
            marginTop: '40px',
            fontSize: '1.5rem',
            fontWeight: '400',
            letterSpacing: '3px',
            background: 'transparent',
            color: 'white',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '0',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.4s ease',
            position: 'relative',
            overflow: 'hidden',
            ...fontStyles.accent // Акцентный шрифт для кнопки
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'rgba(157, 78, 221, 0.9)';
            e.target.style.color = 'rgba(157, 78, 221, 0.9)';
            e.target.style.letterSpacing = '6px';
            e.target.style.boxShadow = '0 0 25px rgba(157, 78, 221, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            e.target.style.color = 'white';
            e.target.style.letterSpacing = '3px';
            e.target.style.boxShadow = 'none';
          }}
        >
          ПРОДОЛЖИТЬ
        </button>

        {/* Ссылки внизу */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '450px',
          marginTop: '50px',
          fontSize: '1rem',
          fontWeight: '300',
          letterSpacing: '0.8px',
          ...fontStyles.primary
        }}>
          <a
            href="#"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              padding: '8px 0',
              position: 'relative',
              ...fontStyles.accent // Акцентный шрифт для ссылок
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'rgba(157, 78, 221, 0.9)';
              e.target.style.letterSpacing = '1.5px';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'rgba(255, 255, 255, 0.7)';
              e.target.style.letterSpacing = '0.8px';
            }}
          >
            Забыли пароль?
          </a>
          
          <a
            href="/register"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              padding: '8px 0',
              position: 'relative',
              ...fontStyles.accent // Акцентный шрифт для ссылок
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'rgba(157, 78, 221, 0.9)';
              e.target.style.letterSpacing = '1.5px';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'rgba(255, 255, 255, 0.7)';
              e.target.style.letterSpacing = '0.8px';
            }}
          >
            Создать аккаунт
          </a>
        </div>
      </form>

      {/* Декоративная линия */}
      <div style={{
        width: '180px',
        height: '1px',
        background: 'rgba(255, 255, 255, 0.08)',
        marginTop: '60px'
      }} />

      {/* Copyright */}
      <div style={{
        marginTop: '25px',
        fontSize: '0.9rem',
        fontWeight: '300',
        letterSpacing: '1.5px',
        color: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        ...fontStyles.primary
      }}>
        © 2024 Все права защищены
      </div>
    </div>
  );
};

export default Login;