import response from '../../../utils/response.js';
import ExportServices from '../repositories/export-service.js';

export const exportPlaylist = async (req, res) => {
    const { targetEmail } = req.validated;
    const { id } = req.params;

    const message = {
        userId: req.user.id,
        targetEmail
    }

    await ExportServices.sendMessage('export:playlist', JSON.stringify(message));
    return response(res, 201, 'Permintaan export playlist dalam antrean');
}