import { pool } from '../src/config/db.js';

(async function(){
  try{
    const limit = 5; const offset = 0;
    const [rows] = await pool.query(
      `SELECT 
        u.id,
        u.nickname,
        COALESCE(up.level, 1) as level,
        COALESCE(up.coins, 0) as coins,
        COALESCE(up.xp, 0) as xp,
        COALESCE(up.words_learned_total, 0) as words_learned,
        COALESCE(p.name, '') as pet_name,
        COALESCE(p.type, 'default') as pet_type,
        COALESCE(p.level, 1) as pet_level
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN pets p ON u.id = p.user_id
      WHERE u.is_active = 1 AND u.role = 'user'
      ORDER BY COALESCE(up.xp,0) DESC, COALESCE(up.level,0) DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    console.log('rows length:', rows.length);
    console.log(rows.slice(0,3));
    process.exit(0);
  }catch(e){
    console.error('test error:', e && e.message, e && e.code);
    if(e && e.sql) console.error('SQL:', e.sql);
    console.error(e && e.stack);
    process.exit(1);
  }
})();
