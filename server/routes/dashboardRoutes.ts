import { Router } from 'express';
import { dbStore } from '../data/store.ts';

const router = Router();

// GET /api/dashboard - Indicadores consolidados, contagem por status e técnicos
router.get('/', (req, res) => {
  const metrics = dbStore.getDashboardMetrics();
  res.json(metrics);
});

export default router;
