import { signToken } from '../src/utils/jwt.js';
const id = process.argv[2] || '8';
const name = process.argv[3] || 'user';
const email = process.argv[4] || 'user@example.com';
const role = process.argv[5] || 'user';

const token = signToken({ id: Number(id), name, email, role });
console.log(token);
