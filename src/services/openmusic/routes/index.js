import express from 'express';
import {
    createAlbum, createSong,
    deleteAlbumById, deleteSong, findAlbumById,
    findSongs, findSongById,
    updateAlbum, updateSong
} from "../controller/openmusic-controller.js";
import validate from "../../../middlewares/validate.js";
import {
    albumCreatePayloadSchema,
    albumUpdatePayloadSchema,
    songCreatePayloadSchema,
    songUpdatePayloadSchema
} from "../validator/schema.js";
import authenticateToken from "../../../middlewares/auth.js";

const router = express.Router();

router.post('/albums', authenticateToken, validate(albumCreatePayloadSchema), createAlbum);
router.get('/albums/:id', authenticateToken, findAlbumById);
router.put('/albums/:id', authenticateToken, validate(albumUpdatePayloadSchema), updateAlbum);
router.delete('/albums/:id', authenticateToken, deleteAlbumById);

router.post('/songs', authenticateToken, validate(songCreatePayloadSchema), createSong);
router.get('/songs', authenticateToken, findSongs);
router.get('/songs/:id', authenticateToken, findSongById);
router.put('/songs/:id', authenticateToken, validate(songUpdatePayloadSchema), updateSong);
router.delete('/songs/:id', authenticateToken, deleteSong);

export default router;