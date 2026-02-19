import express from 'express';
import {
    createAlbum, createSong,
    deleteAlbumById, deleteSong, findAlbumById,
    findSongs, findSongById,
    updateAlbum, updateSong, postLikeHandler, deleteLikeHandler, getLikesHandler
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

router.post('/albums', validate(albumCreatePayloadSchema), createAlbum);
router.get('/albums/:id', findAlbumById);
router.put('/albums/:id', validate(albumUpdatePayloadSchema), updateAlbum);
router.delete('/albums/:id', deleteAlbumById);

router.post('/albums/:id/likes', authenticateToken, postLikeHandler);
router.delete('/albums/:id/likes', authenticateToken, deleteLikeHandler);
router.get('/albums/:id/likes', getLikesHandler);

router.post('/songs', validate(songCreatePayloadSchema), createSong);
router.get('/songs', findSongs);
router.get('/songs/:id', findSongById);
router.put('/songs/:id', validate(songUpdatePayloadSchema), updateSong);
router.delete('/songs/:id', deleteSong);

export default router;