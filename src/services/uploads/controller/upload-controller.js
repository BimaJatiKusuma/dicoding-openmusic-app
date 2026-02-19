import ClientError from '../../../exceptions/client-error.js';
import response from "../../../utils/response.js";
import openmusicRepositories from "../../openmusic/repositories/openmusic-repositories.js";

export const uploadImages = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new ClientError('No file uploaded'));
        }

        const { id } = req.params; // Ambil ID album dari path parameter
        const host = process.env.HOST || 'localhost';
        const port = process.env.PORT || 5000;
        const encodedFilename = encodeURIComponent(req.file.filename);
        const fileLocation = `http://${host}:${port}/uploads/${encodedFilename}`;

        // Simpan coverUrl ke database
        await openMusicRepositories.editAlbumCover(id, fileLocation);

        // Kembalikan response sesuai kriteria Dicoding (tanpa mengembalikan object data)
        return response(res, 201, 'Sampul berhasil diunggah');
    } catch (error) {
        next(error); // Teruskan error ke error handler jika album tidak ditemukan
    }
}