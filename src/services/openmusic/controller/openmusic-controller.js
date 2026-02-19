import response from "../../../utils/response.js";
import openMusicRepositories from "../repositories/openmusic-repositories.js";
import cacheService from "../../valkey/cache-service.js";
import {InvariantError} from "../../../exceptions/index.js";
import NotFoundError from "../../../exceptions/not-found-error.js";
import req from "express/lib/request.js";

//Album Controller
export const createAlbum = async (req, res, next) => {
    const { name, year } = req.body;
    const album = await openMusicRepositories.createAlbum({ name, year });
    if(!album){
        return next(new InvariantError('Gagal menambahkan album'));
    }

    return response(res, 201, 'Album berhasil ditambahkan', { albumId: album.id})
}

export const findAlbumById = async (req, res, next) => {
    const { id } = req.params;
    const album = await openMusicRepositories.findAlbumById(id);
    if(!album){
        return next(new NotFoundError('Album tidak ditemukan'));
    }
    return response(res, 200, 'Album berhasil ditampilkan', {album});
}

export const updateAlbum = async (req, res, next) => {
    const { id } = req.params;
    const { name, year } = req.validated;
    const album = await openMusicRepositories.updateAlbumById({ id, name, year });

    if(!album){
        return next(new NotFoundError('Album tidak ditemukan'));
    }

    return response(res, 200, 'Album berhasil diubah', album);
}

export const deleteAlbumById = async (req, res, next) => {
    const { id } = req.params;
    const deletedAlbum = await openMusicRepositories.deleteAlbumById(id);

    if(!deletedAlbum){
        return next(new NotFoundError('Album tidak ditemukan'));
    }

    return response(res, 200, 'Album berhasil dihapus', deletedAlbum);
}

// Song Controller
export const createSong = async (req, res, next) => {
    const { albumId, title, year, genre, performer, duration } = req.validated;
    const song = await openMusicRepositories.createSong({ albumId, title, year, genre, performer, duration });
    if(!song){
        return next(new InvariantError('Gagal menambahkan lagu'));
    }
    return response(res, 201, 'Catatan berhasil ditambahkan', { songId: song.id });
}

export const findSongs = async (req, res) => {
    const { title, performer } = req.query;
    const songs = await openMusicRepositories.findSongs({ title, performer});
    return response(res, 200, 'List lagu berhasil ditampilkan', { songs });
}

export const findSongById = async (req, res, next) => {
    const { id } = req.params;
    const song = await openMusicRepositories.findSongById(id);
    if(!song){
        return next(new NotFoundError('Lagu tidak ditemukan'));
    }
    return response(res, 200, 'Lagu berhasil ditampilkan', { song });
}

export const updateSong = async (req, res, next) => {
    const { id } = req.params;
    const { album_id, title, year, genre, performer, duration } = req.validated;
    const song = await openMusicRepositories.updateSong({ id, album_id, title, year, genre, performer, duration });
    if(!song){
        return next(new NotFoundError('Lagu tidak ditemukan'));
    }
    return response(res, 200, 'Lagu berhasil diubah', song);
}

export const deleteSong = async (req, res, next) => {
    const { id } = req.params;
    const deletedSong = await openMusicRepositories.deleteSong(id);
    if(!deletedSong){
        return next(new NotFoundError('Lagu tidak ditemukan'));
    }
    return response(res, 200, 'Lagu berhasil dihapus', deletedSong);
}

export const postLikeHandler = async (req, res) => {
    const {id: albumId } = req.params;
    const {id: credentialId} = req.user;

    await openMusicRepositories.findAlbumById(albumId);
    await openMusicRepositories.addLike(credentialId, albumId);

    await cacheService.delete(`likes:${albumId}`);

    const response = h.response({
        status: 'success',
        message: 'Berhasil menambahkan like'
    });
    response.code = 200;
    return response;
}

export const deleteLikeHandler = async (req, res) => {
    const { id: albumId } = req.params;
    const { id: credentialId } = req.user;

    await openMusicRepositories.deleteLike(credentialId, albumId);

    await cacheService.delete(`likes:${albumId}`);

    return {
        status: 'success',
        message: 'Batal menyukai album',
    }
}

export const getLikesHandler = async (req, res) => {
    const { id: albumId } = req.params;

    try {
        const result = await cacheService.get(`likes:${albumId}`);
        const likes = JSON.parse(result);

        const response = h.response({
            status: 'success',
            data: { likes },
        });

        response.header('X-Data-Source', 'cache');
        return response;
    } catch {
        const likes = await openMusicRepositories.getLikesCount(albumId);

        await cacheService.set(`likes:${albumId}`, JSON.stringify(likes), 60 * 30);

        return {
            status: 'success',
            data: { likes },
        }
    }
}

// Search Song
export const searchSongByTitle = () => {}

export const searchSongByArtist = () => {}
