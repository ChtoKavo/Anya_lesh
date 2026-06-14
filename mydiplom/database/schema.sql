-- Users and progress
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

CREATE TABLE level_settings (
  level INT PRIMARY KEY,
  min_correct_percent INT DEFAULT 70,
  max_words INT DEFAULT 200,
  recommended_days INT DEFAULT 7
);

CREATE TABLE tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50),
  topic_id INT,
  payload_ref VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT,
  stage_id VARCHAR(64) NULL,
  answer_text TEXT,
  is_correct BOOLEAN,
  time_spent_seconds INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  stage_id VARCHAR(64) NOT NULL,
  correct_percent FLOAT,
  attempts INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  last_attempt_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
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

CREATE TABLE completions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  level INT NOT NULL,
  score FLOAT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
