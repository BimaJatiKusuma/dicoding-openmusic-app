import collaborationService from "../repositories/collaborator-repositories.js";
import response from "../../../utils/response.js";
import collaboratorRepositories from "../repositories/collaborator-repositories.js";
import {InvariantError} from "../../../exceptions/index.js";

export const createCollaboration = async (req, res, next) => {
    const {playlistId, userId} = req.body;

    const collaboration = await collaboratorRepositories.createCollaboration(playlistId, userId);

    return response(res, 201, 'Berhasil menambahkan kolaborasi', {
        collaborationId: collaboration.id
    });
};

export const deleteCollaboration = async (req, res, next) => {
    const {playlistId, userId} = req.body;

    const collaboration = await collaboratorRepositories.deleteCollaboration(playlistId, userId);

    if(collaboration === null) return next(InvariantError("Kolaborasi tidak ditemukan"))

    return response(res, 200, 'Berhasil menghapus kolaborasi', collaboration);
};