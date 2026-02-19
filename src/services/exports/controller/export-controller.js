import response from '../../../utils/response.js';
import ExportServices from '../repositories/export-service.js';
import PlaylistRepositories from '../../playlist/repositories/playlist-repositories.js';
import { NotFoundError } from '../../../exceptions/index.js';
import AuthorizationError from "../../../exceptions/authorization-error.js";

export const exportPlaylist = async (req, res) => {
    const { targetEmail } = req.validated;
    const { id } = req.params;

    const isOwner = await PlaylistRepositories.verifyPlaylistOwner(id, req.user.id);
    if (isOwner === null) {
        throw new NotFoundError('Playlist tidak ditemukan');
    }
    if (isOwner === false) {
        throw new AuthorizationError('Anda tidak berhak mengekspor playlist ini');
    }

    const message = {
        playlistId: id,
        targetEmail
    }

    await ExportServices.sendMessage('export:playlist', JSON.stringify(message));
    return response(res, 201, 'Permintaan export playlist dalam antrean');
}