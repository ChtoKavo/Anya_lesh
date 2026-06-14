import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузить переменные из .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkConnection() {
  try {
    console.log('🔄 Проверяю подключение к БД...\n');
    console.log('📋 Параметры подключения:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'mydiplom'}`);
    console.log('');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mydiplom',
    });

    console.log('✅ Подключение успешно!\n');

    // Получить информацию о БД
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('📊 Доступные БД:');
    databases.forEach(db => {
      console.log(`   - ${db.Database}`);
    });

    // Получить таблицы текущей БД
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n📑 Таблицы в БД "${process.env.DB_NAME}":`);
    if (tables.length === 0) {
      console.log('   (таблиц не найдено)');
    } else {
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
    }

    // Проверить структуру таблицы users
    try {
      const [columns] = await connection.query('DESC users');
      console.log('\n🔍 Структура таблицы users:');
      columns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
      });

      // Количество записей
      const [result] = await connection.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n👥 Записей в таблице users: ${result[0].count}`);
    } catch (err) {
      console.log('\n⚠️  Таблица users не найдена');
    }

    await connection.end();
    console.log('\n✅ Проверка завершена!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Ошибка подключения:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

checkConnection();
