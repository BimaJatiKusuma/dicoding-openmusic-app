import express from 'express';
import {
    createPlaylist,
    findPlaylist,
    deletePlaylist,
    addSongInPlaylist,
    findSongsInPlaylist,
    deleteSongInPlaylist,
    findActivitiesPlaylist,
} from "../controller/playlist-controller.js";
import validate from "../../../middlewares/validate.js";
import authenticateToken from "../../../middlewares/auth.js";
import {
    playlistCreatePayloadSchema,
    playlistAddSongPayloadSchema,
    playlistDeleteSongPayloadSchema,
} from "../validator/schema.js";

const router = express.Router();

router.post('/', authenticateToken, validate(playlistCreatePayloadSchema), createPlaylist);
router.get('/', authenticateToken, findPlaylist);
router.delete('/:id', authenticateToken, deletePlaylist);
router.post('/:id/songs', authenticateToken, validate(playlistAddSongPayloadSchema), addSongInPlaylist);
router.get('/:id/songs', authenticateToken, findSongsInPlaylist);
router.delete('/:id/songs', authenticateToken, validate(playlistDeleteSongPayloadSchema), deleteSongInPlaylist);
router.get('/:id/activities', authenticateToken, findActivitiesPlaylist)

export default router;