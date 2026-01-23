import { Router } from 'express';
import openmusicRoutes from '../services/openmusic/routes/index.js';

const router = Router();

router.use('/', openmusicRoutes);

export default router;