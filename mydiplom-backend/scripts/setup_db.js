import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  host: 'localhost',
  user: 'loh',
  password: 'RuMQuX8PAekfjGaF',
};

const NEW_DB_NAME = 'mydiplom_new';

async function createNewDatabase() {
  let connection;
  try {
    console.log('🔄 Подключаюсь к MySQL...');
    connection = await mysql.createConnection(config);

    console.log(`📦 Создаю новую БД: ${NEW_DB_NAME}...`);
    await connection.query(`DROP DATABASE IF EXISTS ${NEW_DB_NAME}`);
    await connection.query(`CREATE DATABASE ${NEW_DB_NAME}`);
    console.log(`✓ БД ${NEW_DB_NAME} создана`);

    // Переключиться на новую БД
    await connection.query(`USE ${NEW_DB_NAME}`);

    // Импортировать schema.sql
    const schemaPath = path.join(__dirname, '../..', 'mydiplom/database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Разбить на отдельные команды и выполнить
    const statements = schemaSql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`⚙️  Выполняю: ${statement.substring(0, 50)}...`);
        await connection.query(statement);
      }
    }

    console.log('\n✅ Новая БД успешно создана со всеми таблицами!');
    console.log(`\n📝 Обновите .env файл:`);
    console.log(`DB_NAME=${NEW_DB_NAME}`);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

createNewDatabase();
