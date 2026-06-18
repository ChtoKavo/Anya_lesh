import { pool } from '../src/config/db.js';

async function checkRoles() {
  try {
    const [rows] = await pool.query('SELECT email, role FROM users');
    console.log('User roles:');
    rows.forEach(row => {
      console.log(`${row.email}: ${row.role}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkRoles();
