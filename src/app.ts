import express from 'express';
import { authRouter } from './routes/auth.routes';
import { healthRouter } from './routes/health.routes';

export const app = express();

app.use(express.json());

app.use('/auth', authRouter);
app.use('/health', healthRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'API is running' });
});
