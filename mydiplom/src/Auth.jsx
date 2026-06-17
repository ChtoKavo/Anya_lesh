import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from './apiClient';
import { loadJourneyProfile } from './userJourney';
import Toast from './Toast';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [petName, setPetName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const isStrongEnoughPassword = (value) => value.trim().length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setErrors({});
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setToast({ message: 'Введите корректный email', type: 'error' });
      return;
    }

    if (!isStrongEnoughPassword(password)) {
      setToast({ message: 'Пароль должен быть не менее 6 символов', type: 'error' });
      return;
    }

    if (isLogin) {
      const newErrors = {};
      if (!isValidEmail(normalizedEmail)) newErrors.email = 'Введите корректный email';
      if (!isStrongEnoughPassword(password)) newErrors.password = 'Пароль должен быть не менее 6 символов';
      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }

      try {
        setIsSubmitting(true);
        const response = await loginUser(normalizedEmail, password);
        if (response?.token) {
          localStorage.setItem('authToken', response.token);
        }
        const displayName = response?.user?.petName || response?.user?.name || 'Персонаж';
        const avatarValue = response?.user?.avatar || displayName.charAt(0).toUpperCase();
        localStorage.setItem('userId', response?.user?.id);
        localStorage.setItem('userName', displayName);
        localStorage.setItem('userAvatar', avatarValue);
        localStorage.setItem('userEmail', response?.user?.email || normalizedEmail);
        localStorage.setItem('userRole', (response?.user?.role || 'user').toLowerCase().trim());
        localStorage.setItem('userLastSeen', new Date().toISOString());
        setToast({ message: `Добро пожаловать, ${displayName}! 🎉`, type: 'success' });
        setTimeout(() => navigate('/main'), 1500);
      } catch (error) {
        setToast({ message: error.message || 'Не удалось выполнить вход', type: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const newErrors = {};
      if (password !== confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
      if (!petName.trim()) newErrors.petName = 'Введите имя персонажа';
      if (!nickname.trim()) newErrors.nickname = 'Введите никнейм';
      if (!isValidEmail(normalizedEmail)) newErrors.email = 'Введите корректный email';
      if (!isStrongEnoughPassword(password)) newErrors.password = 'Пароль должен быть не менее 6 символов';
      if (!agreeTerms) newErrors.agreeTerms = 'Необходимо принять условия использования';
      if (!agreePrivacy) newErrors.agreePrivacy = 'Необходимо согласиться на обработку персональных данных';

      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }

      try {
        setIsSubmitting(true);
        const response = await registerUser({
          petName: petName.trim(),
          nickname: nickname.trim(),
          email: normalizedEmail,
          password,
          agreeTerms,
          agreePrivacy,
        });
        if (response?.token) {
          localStorage.setItem('authToken', response.token);
        }
        const displayName = response?.user?.petName || petName || 'Персонаж';
        localStorage.setItem('userId', response?.user?.id);
        localStorage.setItem('userName', displayName);
        localStorage.setItem('userEmail', response?.user?.email || normalizedEmail);
        localStorage.setItem('userAvatar', displayName.charAt(0).toUpperCase());
        localStorage.setItem('userRole', (response?.user?.role || 'user').toLowerCase().trim());
        setToast({ message: `Поздравляем, ${displayName}! Добро пожаловать в игру! 🚀`, type: 'success' });
        setTimeout(() => navigate('/goal-selection'), 1500);
      } catch (error) {
        setToast({ message: error.message || 'Не удалось завершить регистрацию', type: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const checkboxStyle = {
    marginRight: '10px',
    width: '14px',
    height: '14px',
    cursor: 'pointer',
    accentColor: '#b3e41f'
  };

  const labelStyle = {
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  };

  const linkStyle = {
    color: '#CBED66',
    textDecoration: 'underline',
    cursor: 'pointer',
    marginLeft: '5px'
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}>
        <img
          src="/back9.png"
          alt="Background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </div>

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
        zIndex: 1
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflowY: 'auto',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'rgba(180, 148, 249, 0.85)',
          backdropFilter: 'blur(90px)',
          borderRadius: '20px',
          padding: '40px',
          width: '90%',
          maxWidth: '450px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'none',
          border: 'none'
        }}>
          {/* Текстовый заголовок вместо изображения */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{
              color: '#fff',
              fontSize: '32px',
              fontWeight: 'bold',
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {isLogin ? 'Авторизация' : 'Регистрация'}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="Имя персонажа"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '16px',
                      border: `1px solid ${errors.petName ? '#ff6b6b' : '#ddd'}`,
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  {errors.petName && <div style={{ color: '#ff6b6b', marginTop: '6px' }}>{errors.petName}</div>}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="Никнейм"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '16px',
                      border: `1px solid ${errors.nickname ? '#ff6b6b' : '#ddd'}`,
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  {errors.nickname && <div style={{ color: '#ff6b6b', marginTop: '6px' }}>{errors.nickname}</div>}
                </div>
              </>
            )}

            <div style={{ marginBottom: '20px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  fontSize: '16px',
                  border: `1px solid ${errors.email ? '#ff6b6b' : '#ddd'}`,
                  borderRadius: '10px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
              {errors.email && <div style={{ color: '#ff6b6b', marginTop: '6px' }}>{errors.email}</div>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  fontSize: '16px',
                  border: `1px solid ${errors.password ? '#ff6b6b' : '#ddd'}`,
                  borderRadius: '10px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
              {errors.password && <div style={{ color: '#ff6b6b', marginTop: '6px' }}>{errors.password}</div>}
            </div>

            {!isLogin && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="password"
                    placeholder="Подтвердите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '16px',
                      border: `1px solid ${errors.confirmPassword ? '#ff6b6b' : '#ddd'}`,
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  {errors.confirmPassword && <div style={{ color: '#ff6b6b', marginTop: '6px' }}>{errors.confirmPassword}</div>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={labelStyle}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      style={checkboxStyle}
                    />
                    Я принимаю 
                    <span 
                      style={linkStyle}
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Открыть условия использования');
                      }}
                    >
                      условия использования
                    </span>
                  </label>
                  {errors.agreeTerms && <div style={{ color: '#ff6b6b', marginTop: '6px' }}>{errors.agreeTerms}</div>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={labelStyle}>
                    <input
                      type="checkbox"
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                      style={checkboxStyle}
                    />
                    Я соглашаюсь на 
                    <span 
                      style={linkStyle}
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Открыть политику конфиденциальности');
                      }}
                    >
                      обработку персональных данных
                    </span>
                  </label>
                  {errors.agreePrivacy && <div style={{ color: '#ff6b6b', marginTop: '6px' }}>{errors.agreePrivacy}</div>}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: '#CBED66',
                color: '#333',
                border: '2px solid #333',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '10px',
                opacity: isSubmitting ? 0.8 : 1
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {isSubmitting ? 'Подождите...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                if (!isLogin) {
                  setName('');
                  setNickname('');
                  setConfirmPassword('');
                  setAgreeTerms(false);
                  setAgreePrivacy(false);
                  setAgreeMarketing(false);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#3f3f1c',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline',
                fontWeight: 'bold'
              }}
            >
              {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
            
            {/* Демо-режим удалён по требованию */}
          </div>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};


export default Auth;