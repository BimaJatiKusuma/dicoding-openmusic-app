import collaborationService from "../repositories/collaborator-repositories.js";
import response from "../../../utils/response.js";
import collaboratorRepositories from "../repositories/collaborator-repositories.js";
import {InvariantError, NotFoundError} from "../../../exceptions/index.js";
import userRepositories from "../../users/repositories/user-repositories.js";
import playlistRepositories from "../../playlist/repositories/playlist-repositories.js";
import AuthorizationError from "../../../exceptions/authorization-error.js";

export const createCollaboration = async (req, res, next) => {
    const {playlistId, userId} = req.body;
    const {id: credentialId} = req.user;

    try {
        const isOwner = await playlistRepositories.verifyPlaylistOwner(playlistId, credentialId);
        if(isOwner === null) return next(new NotFoundError("Playlist tidak ditemukan"));
        if(isOwner === false) return next(new AuthorizationError("Anda tidak berhak mengakses resource ini"));

        const user = await userRepositories.getUserById(userId);
        if(!user) return next(new NotFoundError("User tidak ditemukan"));

        const collaboration = await collaboratorRepositories.createCollaboration(playlistId, userId);

        return response(res, 201, 'Berhasil menambahkan kolaborasi', {
            collaborationId: collaboration.id
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteCollaboration = async (req, res, next) => {
    const {playlistId, userId} = req.body;

    const collaboration = await collaboratorRepositories.deleteCollaboration(playlistId, userId);

    if(collaboration === null) return next(new InvariantError("Kolaborasi tidak ditemukan"))

    return response(res, 200, 'Berhasil menghapus kolaborasi', collaboration);
};