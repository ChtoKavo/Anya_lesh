import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Введите имя';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
   
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('userEmail', formData.email);
      
     
      navigate('/create-first-goal');
    } else {
      setErrors(validationErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-title">РЕГИСТРАЦИЯ</h1>
          <p className="register-subtitle">Создайте аккаунт для начала путешествия</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label className="form-label">
               Ваше имя
              {errors.name && <span>*</span>}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Как к вам обращаться?"
            />
            {errors.name && <div className="form-error"> {errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
               Email
              {errors.email && <span>*</span>}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="example@mail.com"
            />
            {errors.email && <div className="form-error"> {errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
               Пароль
              {errors.password && <span>*</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Не менее 6 символов"
            />
            {errors.password && <div className="form-error"> {errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
               Повторите пароль
              {errors.confirmPassword && <span>*</span>}
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Повторите пароль"
            />
            {errors.confirmPassword && <div className="form-error"> {errors.confirmPassword}</div>}
          </div>

          <div className="password-policy">
            <h4> Требования к паролю:</h4>
            <ul className="policy-list">
              <li>Не менее 6 символов</li>
              <li>Лучше использовать буквы и цифры</li>
              <li>Избегайте простых паролей</li>
            </ul>
          </div>

          <button type="submit" className="register-button">
             Создать аккаунт
          </button>
        </form>

        <div className="register-footer">
          <p>
            Уже есть аккаунт?{' '}
            <Link to="/login" className="register-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;