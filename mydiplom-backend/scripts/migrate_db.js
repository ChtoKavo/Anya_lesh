import { pool } from './src/config/db.js';

async function runMigration() {
  try {
    console.log('🔄 Начинаю миграцию БД...');
    
    // Удалить старую таблицу (если есть данные - комментируйте эту строку)
    await pool.query('DROP TABLE IF EXISTS users');
    console.log('✓ Старая таблица удалена');
    
    // Создать новую таблицу
    const createTableSQL = `
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        pet_name VARCHAR(255),
        nickname VARCHAR(255),
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        current_level INT DEFAULT 1,
        current_stage VARCHAR(64) DEFAULT '1-1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableSQL);
    console.log('✓ Новая таблица users создана');
    
    // Проверить структуру
    const [columns] = await pool.query('DESC users');
    console.log('✓ Структура таблицы:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    console.log('\n✅ Миграция успешно завершена!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при миграции:', error);
    process.exit(1);
  }
}

runMigration();
