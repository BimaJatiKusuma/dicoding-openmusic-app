import response from "../../../utils/response.js";
import openMusicRepositories from "../repositories/openmusic-repositories.js";
import cacheService from "../../redis/cache-service.js";
import {InvariantError} from "../../../exceptions/index.js";
import NotFoundError from "../../../exceptions/not-found-error.js";
import config from "../../../utils/config.js";
import multer from "multer";
import path from "path";

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

export const postUploadCoverHandler = (req, res, next) => {
    // 1. Konfigurasi penyimpanan
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'src/services/storage/file/images');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // Hapus tanda '-' sebelum path.extname karena extname sudah membawa '.'
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });

    // 2. Konfigurasi multer
    const upload = multer({
        storage: storage,
        limits: { fileSize: 512000 }, // Batas ukuran file 512KB
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('File harus berupa gambar'), false);
            }
        }
    });

    const singleUpload = upload.single('cover');

    // 3. Eksekusi proses upload secara langsung
    singleUpload(req, res, async (err) => {
        // Penanganan error dari multer (termasuk 413 Payload Too Large)
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({
                    status: 'fail',
                    message: 'Ukuran payload terlalu besar'
                });
            }
            return res.status(400).json({
                status: 'fail',
                message: err.message
            });
        }

        // 4. Setelah multer berhasil memproses file, jalankan logika database
        try {
            const { id } = req.params;

            // Jika tidak ada file yang diupload (selain masalah ukuran/format)
            if (!req.file) {
                return next(new InvariantError('Gagal mengupload cover album. Pastikan format dan ukuran sesuai.'));
            }

            const { filename } = req.file;
            const coverUrl = `http://${config.app.host}:${config.app.port}/albums/images/${filename}`;

            // Simpan ke database
            await openMusicRepositories.uploadAlbumCover(id, coverUrl);

            return response(res, 201, 'Sampul berhasil diunggah');
        } catch (error) {
            next(error);
        }
    });
};
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


//LIKES HANDLER
export const postLikeHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: credentialId } = req.user;

        await openMusicRepositories.addLike(id, credentialId);

        return response(res, 201, 'Berhasil menyukai album');
    } catch (error) {
        next(error);
    }
}

export const deleteLikeHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: credentialId } = req.user;

        await openMusicRepositories.deleteLike(id, credentialId);

        return response(res, 200, 'Berhasil batal menyukai album');
    } catch (error) {
        next(error);
    }
}

export const getLikesHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { likes, source } = await openMusicRepositories.getLikesCount(id);

        if (source === 'cache') {
            res.setHeader('X-Data-Source', 'cache');
        }

        return response(res, 200, 'Berhasil mendapatkan likes', { likes: parseInt(likes) });
    } catch (error) {
        next(error);
    }
}

// Search Song
export const searchSongByTitle = () => {}

export const searchSongByArtist = () => {}
