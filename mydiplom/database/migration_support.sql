-- Миграция: добавление таблицы для запросов в поддержку
-- Выполнить в MySQL консоли

CREATE TABLE IF NOT EXISTS support_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  message TEXT NOT NULL,
  priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  response_message TEXT,
  admin_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Проверить результат
DESC support_requests;
