import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function migrate() {
  let connection;
  try {
    console.log('🔄 Начинаю миграцию таблицы users...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mydiplom',
    });

    // Проверить текущую структуру
    const [columns] = await connection.query('DESC users');
    console.log('📋 Текущая структура users:');
    columns.forEach(col => console.log(`   - ${col.Field}`));
    console.log('');

    // Переименовать name -> pet_name
    console.log('🔄 Переименовываю колонку name -> pet_name...');
    await connection.query('ALTER TABLE users CHANGE COLUMN name pet_name VARCHAR(255)');
    console.log('✓ Переименовано');

    // Удалить ненужные колонки
    const columnsToRemove = ['avatar_url', 'is_active', 'email_verified_at', 'last_login_at'];
    
    for (const col of columnsToRemove) {
      try {
        console.log(`🗑️  Удаляю колонку ${col}...`);
        await connection.query(`ALTER TABLE users DROP COLUMN ${col}`);
        console.log(`✓ ${col} удалена`);
      } catch (err) {
        console.log(`⚠️  ${col} не существует (игнорирую)`);
      }
    }

    // Добавить колонку password_hash если её нет
    try {
      console.log('✅ Колонка password_hash уже есть');
    } catch {
      console.log('🔧 Добавляю password_hash...');
      await connection.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)');
    }

    console.log('\n✅ Миграция завершена!\n');

    // Проверить новую структуру
    const [newColumns] = await connection.query('DESC users');
    console.log('✨ Новая структура users:');
    newColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Ошибка миграции:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

migrate();
