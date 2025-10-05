import express from 'express';
import { healthRouter } from './routes/health.routes';

export const app = express();

app.use(express.json());
app.use('/health', healthRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'API is running' });
});
