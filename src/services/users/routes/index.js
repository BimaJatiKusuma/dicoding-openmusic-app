import { Router } from 'express';
import { createUser } from '../controller/user-controller.js';
import validate from '../../../middlewares/validate.js';
import { userPayloadSchema } from '../validator/schema.js';

const router = Router();

router.post('/', validate(userPayloadSchema), createUser);

export default router;