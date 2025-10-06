import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { healthRouter } from './routes/health.routes';

export const app = express();

// Configurar CORS para permitir peticiones desde el frontend (ajusta el origen si hace falta)
const corsOptions: cors.CorsOptions = {
  origin: process.env.NODE_CORS_ACCESS ? JSON.parse(process.env.NODE_CORS_ACCESS) : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/auth', authRouter);
app.use('/health', healthRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'API is running' });
});
