import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import progressRoutes from './routes/progress.routes.js';
import adminRoutes from './routes/admin.routes.js';
import supportRoutes from './routes/support.routes.js';
import friendsRoutes from './routes/friends.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import messagesRoutes from './routes/messages.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/messages', messagesRoutes);

export default app;
