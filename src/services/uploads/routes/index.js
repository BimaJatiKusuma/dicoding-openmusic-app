import { Router } from 'express';
import { uploadImages } from '../controller/upload-controller.js';
import { upload } from '../storage/storage-config.js';

const router = Router();

router.post('/albums/:id/covers', upload.single('image'), uploadImages);

export default router;