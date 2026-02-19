import { Router } from 'express';
import authenticateToken from "../../../middlewares/auth.js";
import validate from "../../../middlewares/validate.js";

import { exportPayloadSchema } from "../validator/schema.js";
import { exportPlaylist } from "../controller/export-controller.js";

const router = Router();

router.post('/playlists/:id', authenticateToken, validate(exportPayloadSchema), exportPlaylist);

export default router;