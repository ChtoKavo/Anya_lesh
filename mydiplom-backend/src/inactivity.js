import { pool } from './config/db.js';
import { sendEmail } from './utils/mailer.js';

const EMAIL_TEMPLATE = {
  sad: {
    subject: 'Мы скучаем по тебе! Твой питомец грустит 😔',
    text: (name) => `Привет, ${name}! Ты не заходил в игру 1-2 дня — твой питомец начинает скучать. Вернись и продолжи обучение, чтобы не терять прогресс!`,
  },
  angry: {
    subject: 'Внимание! Твой питомец очень расстроен 😡',
    text: (name) => `Привет, ${name}! Прошло больше недели без активности — твой питомец злится и прогресс может обнулиться, если ты не вернешься. Заходи и забери его обратно!`,
  },
};

export async function processInactivityNotifications() {
  const now = new Date();
  const [rows] = await pool.query(
    `SELECT id, name, email, last_seen, inactive_notification_type, inactive_notified_at
     FROM users
     WHERE role = 'user' AND is_active = 1`
  );

  for (const user of rows) {
    try {
      const lastSeen = user.last_seen ? new Date(user.last_seen) : null;
      if (!lastSeen) continue;
      const diffMs = now - lastSeen;
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      let targetType = 'none';
      if (diffDays >= 7) targetType = 'angry';
      else if (diffDays >= 1) targetType = 'sad';

      if (targetType === 'none') continue;
      if (user.inactive_notification_type === targetType) continue;
      if (user.inactive_notified_at && new Date(user.inactive_notified_at) > new Date(now.getTime() - 30 * 60 * 1000)) continue;

      const template = EMAIL_TEMPLATE[targetType];
      if (!template) continue;

      await sendEmail({
        to: user.email,
        subject: template.subject,
        text: template.text(user.name || user.email),
      });

      await pool.query(
        'UPDATE users SET inactive_notification_type = ?, inactive_notified_at = NOW() WHERE id = ?',
        [targetType, user.id]
      );
      console.log(`Sent inactivity email to ${user.email}: ${targetType}`);
    } catch (err) {
      console.error('processInactivityNotifications error for user', user.email, err?.message || err);
    }
  }
}
