import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mydiplom',
    });

    console.log('Upgrading users.avatar column to TEXT...');
    await connection.query('ALTER TABLE users MODIFY COLUMN avatar TEXT NULL');
    console.log('Done.');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Failed to upgrade avatar column:', error.message || error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

run();
