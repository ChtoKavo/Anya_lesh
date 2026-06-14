import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkPetsTable() {
  let connection;
  try {
    console.log('🔄 Проверяю структуру таблиц...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mydiplom',
    });

    // Проверить структуру pets
    console.log('🐾 Структура таблицы pets:');
    const [petColumns] = await connection.query('DESC pets');
    petColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });

    // Проверить связь pets и users
    console.log('\n👥 Структура таблицы users:');
    const [userColumns] = await connection.query('DESC users');
    userColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });

    // Проверить, есть ли примеры данных
    const [pets] = await connection.query('SELECT * FROM pets LIMIT 1');
    const [users] = await connection.query('SELECT * FROM users LIMIT 1');
    
    console.log('\n📊 Пример данных pets:', pets[0] || 'нет данных');
    console.log('📊 Пример данных users:', users[0] || 'нет данных');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

checkPetsTable();
