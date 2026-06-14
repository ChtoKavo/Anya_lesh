-- Миграция: добавление полей для отслеживания неактивности и уведомлений

ALTER TABLE users
  ADD COLUMN last_seen TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER updated_at,
  ADD COLUMN inactive_notification_type ENUM('none','sad','angry','escalated') NOT NULL DEFAULT 'none' AFTER last_seen,
  ADD COLUMN inactive_notified_at TIMESTAMP NULL DEFAULT NULL AFTER inactive_notification_type;

-- После выполнения миграции проверьте:
-- SHOW COLUMNS FROM users;
