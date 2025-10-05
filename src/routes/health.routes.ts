import { Router } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed', error });
  }
});

export const healthRouter = router;
