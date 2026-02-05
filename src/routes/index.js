import { Router } from 'express';
import openmusicRoutes from '../services/openmusic/routes/index.js';
import usersRoutes from '../services/users/routes/index.js';
import authentications from '../services/authentications/routes/index.js';
import playlistsRoutes from '../services/playlist/routes/index.js';

const router = Router();

router.use('/', openmusicRoutes);
router.use('/users', usersRoutes);
router.use('/authentications', authentications);
router.use('/playlists', playlistsRoutes);
export default router;