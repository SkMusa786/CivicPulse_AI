import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { connectDatabase } from './db';
import authRoutes from './routes/auth';
import complaintRoutes from './routes/complaints';
import adminRoutes from './routes/admin';
import departmentRoutes from './routes/department';
import notificationRoutes from './routes/notifications';
import aiRoutes from './routes/ai';

const app = express();
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '14mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.use((error: Error & { status?: number; type?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = error.status === 413 || error.type === 'entity.too.large' ? 413 : 500;
  if (status === 413) {
    res.status(413).json({ error: 'Request is too large. Image uploads are limited to 10 MB.' });
    return;
  }
  console.error('Unhandled API error', error);
  res.status(status).json({ error: 'Internal server error' });
});

const start = async (): Promise<void> => {
  await connectDatabase();
  app.listen(config.port, () => console.log(`API listening on http://localhost:${config.port}`));
};

start().catch((error) => {
  console.error('API startup failed', error);
  process.exitCode = 1;
});

export default app;
