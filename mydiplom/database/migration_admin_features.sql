-- Миграция для админ панели и расширенных функций профиля
-- Выполнить в MySQL консоли

-- 1. Добавить поля в таблицу users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(500),
ADD COLUMN IF NOT EXISTS name VARCHAR(255) COMMENT 'User real name',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT 1;

-- 2. Создать таблицу pets (для питомцев)
CREATE TABLE IF NOT EXISTS pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  mood VARCHAR(50) DEFAULT 'happy',
  growth_stage INT DEFAULT 1,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  energy INT DEFAULT 100,
  max_energy INT DEFAULT 100,
  hunger INT DEFAULT 50,
  happiness INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Создать таблицу user_progress
CREATE TABLE IF NOT EXISTS user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  coins INT DEFAULT 0,
  words_learned_total INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  total_lessons INT DEFAULT 0,
  last_lesson_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Создать таблицу support_requests (для запросов в поддержку)
CREATE TABLE IF NOT EXISTS support_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'normal',
  response_message TEXT,
  admin_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Создать таблицу user_ratings (для рейтингов)
CREATE TABLE IF NOT EXISTS user_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_xp INT DEFAULT 0,
  rank INT,
  previous_rank INT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_rank (user_id)
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_support_user ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_pets_user ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_xp ON user_ratings(total_xp DESC);
