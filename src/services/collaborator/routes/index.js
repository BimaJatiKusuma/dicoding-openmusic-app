import { Router } from 'express';
import authenticateToken from '../../../middlewares/auth.js';
import validate from '../../../middlewares/validate.js';
import {
    createCollaboration,
    deleteCollaboration,
} from '../controller/collaborator-controller.js';

import {
    collaborationCreatePayloadSchema,
    collaborationDeletePayloadSchema,
} from '../validator/schema.js';

const router = Router();

router.post('/', authenticateToken, validate(collaborationCreatePayloadSchema), createCollaboration);
router.delete('/', authenticateToken, validate(collaborationDeletePayloadSchema), deleteCollaboration);

export default router;