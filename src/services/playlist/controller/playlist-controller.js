import response from '../../../utils/response.js';
import playlistRepositories from '../repositories/playlist-repositories.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import AuthorizationError from "../../../exceptions/authorization-error.js";
import openmusicRepositories from "../../openmusic/repositories/openmusic-repositories.js";

export const createPlaylist = async (req, res, next) => {
    const { name } = req.body;
    const {id: owner} = req.user;

    const playlist = await playlistRepositories.createPlaylist({name, ownerId: owner})

    if(!playlist) return next(new InvariantError('Gagal membuat playlist'));

    return response(res, 201, 'Playlist berhasil dibuat', {playlistId: playlist.id})
};

export const findPlaylist = async (req, res, next) => {
    const {id: owner} = req.user;
    const playlist = await playlistRepositories.findPlaylists(owner);
    if(!playlist) return next(new NotFoundError('Playlist tidak ditemukan'));
    return response(res, 200, 'Playlist ditemukan', {playlists: playlist});
};

export const deletePlaylist = async (req, res, next) => {
    const {id} = req.params;
    const {id: owner} = req.user;

    const isOwner = await playlistRepositories.verifyPlaylistOwner(id, owner);

    if(isOwner === null) return next(new NotFoundError('Playlist tidak ditemukan'))
    if(isOwner === false) return next(new AuthorizationError('Anda bukan pemilik playlist ini'))

    const deletedPlaylistId = await playlistRepositories.deletePlaylist(id);

    return response(res, 200, 'Playlist berhasil dihapus', { playlistId: deletedPlaylistId});
};

export const addSongInPlaylist = async (req, res, next) => {
    const { songId } = req.body;
    const { id: playlistId} = req.params;
    const { id: credentialId } = req.user;

    try {
        await playlistRepositories.verifyPlaylistAccess(playlistId, credentialId);
        const song = await openmusicRepositories.findSongById(songId);
        if(!song) return next(new NotFoundError('Lagu tidak ditemukan'));

        const result = await playlistRepositories.addSongToPlaylist(playlistId, songId, credentialId);
        if(!result) return next(new InvariantError('Gagal menambahkan song ke playlist'));
        return response(res, 201, 'Song berhasil ditambahkan ke playlist', result)
    } catch (error) {
        return next(error);
    }

};

export const findSongsInPlaylist = async (req, res, next) => {
    const { id: playlistId} = req.params;
    const { id: credentialId } = req.user;
    try {
        await playlistRepositories.verifyPlaylistAccess(playlistId, credentialId);

        const playlist = await playlistRepositories.findSongsInPlaylist(playlistId);
        if(!playlist) return next(new NotFoundError('Playlist tidak ditemukan'));
        return response(res, 200, 'Playlist ditemukan', {playlist});
    } catch (error) {
        return next(error);
    }

};

export const deleteSongInPlaylist = async (req, res, next) => {
    const { id: playlistId} = req.params;
    const { songId } = req.body;
    const { id: credentialId } = req.user;
    try {
        await playlistRepositories.verifyPlaylistAccess(playlistId, credentialId);

        const result = await playlistRepositories.deleteSongInPlaylist(playlistId, songId, credentialId);
        if(!result) return next(new NotFoundError('Song tidak ditemukan'));
        return response(res, 200, 'Song berhasil dihapus');
    } catch (error) {
        return next(error);
    }
};

export const findActivitiesPlaylist = async (req, res, next) => {
    const { id: playlistId} = req.params;
    const { id: credentialId } = req.user;
    try {
        await playlistRepositories.verifyPlaylistAccess(playlistId, credentialId);

        if (isOwner === false) return next(new AuthorizationError('Anda tidak berhak mengakses resource ini'));

        return response(res, 200, 'success', {
            playlistId: playlistId,
            activities: result
        });
    } catch (error) {
        next(error);
    }


}