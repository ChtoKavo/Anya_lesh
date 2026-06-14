-- Миграция: обновление схемы пользователей и добавление поддержки учителя/прогресса
-- Выполнить в MySQL консоли

-- 1. Проверить, есть ли данные
SELECT COUNT(*) FROM users;

-- 2. Если таблица пустая (рекомендуется)
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS teacher_notes;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  pet_name VARCHAR(255),
  nickname VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_teacher_id INT NULL,
  current_level INT DEFAULT 1,
  current_stage VARCHAR(64) DEFAULT '1-1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_nickname (nickname),
  FOREIGN KEY (assigned_teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255),
  type VARCHAR(120) DEFAULT 'default',
  mood ENUM('happy','sad','tired','weak','neutral') DEFAULT 'happy',
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  energy DECIMAL(8,2) DEFAULT 100.00,
  max_energy DECIMAL(8,2) DEFAULT 100.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_progress (
  user_id INT PRIMARY KEY,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  next_level_xp INT DEFAULT 1000,
  coins INT DEFAULT 0,
  energy DECIMAL(8,2) DEFAULT 100.00,
  max_energy DECIMAL(8,2) DEFAULT 100.00,
  streak_days INT DEFAULT 0,
  words_learned_total INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE teacher_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  student_id INT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Проверить результат
DESC users;
DESC pets;
DESC user_progress;
DESC teacher_notes;
