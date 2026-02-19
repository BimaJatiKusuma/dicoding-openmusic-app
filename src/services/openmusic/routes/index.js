import express from 'express';
import {
    createAlbum, createSong,
    deleteAlbumById, deleteSong, findAlbumById,
    findSongs, findSongById,
    updateAlbum, updateSong, postUploadCoverHandler, postLikeHandler, deleteLikeHandler, getLikesHandler
} from "../controller/openmusic-controller.js";
import validate from "../../../middlewares/validate.js";
import {
    albumCreatePayloadSchema,
    albumUpdatePayloadSchema,
    songCreatePayloadSchema,
    songUpdatePayloadSchema
} from "../validator/schema.js";
import multer from "multer";
import path from "path";
import authenticateToken from "../../../middlewares/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/services/storage/file/images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + path.extname(file.originalname))
    }
})

const upload = multer ({
    storage: storage,
    limits: { fileSize: 512000 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('File harus berupa gambar'), false);
        }
    }
})

router.post('/albums', validate(albumCreatePayloadSchema), createAlbum);
router.get('/albums/:id', findAlbumById);
router.put('/albums/:id', validate(albumUpdatePayloadSchema), updateAlbum);
router.delete('/albums/:id', deleteAlbumById);

router.post('/albums/:id/covers', upload.single('cover'), postUploadCoverHandler);
router.post('/albums/:id/likes', authenticateToken, postLikeHandler);
router.post('/albums/:id/likes', authenticateToken, deleteLikeHandler);
router.get('/albums/:id/likes', getLikesHandler);

router.post('/songs', validate(songCreatePayloadSchema), createSong);
router.get('/songs', findSongs);
router.get('/songs/:id', findSongById);
router.put('/songs/:id', validate(songUpdatePayloadSchema), updateSong);
router.delete('/songs/:id', deleteSong);

export default router;