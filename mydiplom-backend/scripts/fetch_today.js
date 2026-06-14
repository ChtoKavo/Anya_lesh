import { signToken } from '../src/utils/jwt.js';

const userId = process.argv[2] || '8';
const url = `http://localhost:5000/api/progress/today`;

(async () => {
  try {
    const token = process.env.TEST_TOKEN || signToken({ id: Number(userId), name: 'test', email: 'test@example.com', role: 'user' });
    const res = await globalThis.fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('fetch error', err.message);
    process.exit(1);
  }
})();
