import { pool } from '../src/config/db.js';

(async () => {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    console.log('📋 Existing tables:');
    tables.forEach(t => console.log('  -', Object.values(t)[0]));
    
    // Check user_answers table
    try {
      const [cols] = await pool.query("SHOW COLUMNS FROM user_answers");
      console.log('\n✅ user_answers columns:');
      cols.forEach(c => console.log('  -', c.Field, `(${c.Type})`));
    } catch (e) {
      console.log('\n❌ user_answers table does not exist');
    }
    
    // Check user_stats table
    try {
      const [cols] = await pool.query("SHOW COLUMNS FROM user_stats");
      console.log('\n✅ user_stats columns:');
      cols.forEach(c => console.log('  -', c.Field, `(${c.Type})`));
    } catch (e) {
      console.log('\n❌ user_stats table does not exist');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
