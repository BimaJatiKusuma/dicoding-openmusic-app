import response from '../../../utils/response.js';
import playlistRepositories from '../repositories/playlist-repositories.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import AuthorizationError from "../../../exceptions/authorization-error.js";

export const createPlaylist = async (req, res, next) => {
    const { name } = req.body;
    const {id: owner} = req.user;

    const playlist = await playlistRepositories.createPlaylist({name, owner})

    if(!playlist) return next(new InvariantError('Gagal membuat playlist'));

    return response(res, 201, 'Playlist berhasil dibuat', playlist)
};

export const findPlaylist = async (req, res, next) => {
    const playlist = await playlistRepositories.findPlaylists();
    if(!playlist) return next(new NotFoundError('Playlist tidak ditemukan'));
    return response(res, 200, 'Playlist ditemukan', playlist);
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

    const result = await playlistRepositories.addSongToPlaylist(playlistId, songId);
    if(!result) return next(new InvariantError('Gagal menambahkan song ke playlist'));
    return response(res, 201, 'Song berhasil ditambahkan ke playlist', result)
};

export const findSongsInPlaylist = async (req, res, next) => {
    const { id: playlistId} = req.params;
    const songs = await playlistRepositories.findSongsInPlaylist(playlistId);
    if(!songs) return next(new NotFoundError('Song tidak ditemukan'));
    return response(res, 200, 'Song ditemukan', songs);
};
export const deleteSongInPlaylist = async (req, res, next) => {
    const { id: playlistId} = req.params;
    const { songId } = req.body;
    const result = await playlistRepositories.deleteSongInPlaylist(playlistId, songId);
    if(!result) return next(new NotFoundError('Song tidak ditemukan'));
    return response(res, 200, 'Song berhasil dihapus');
};