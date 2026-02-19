import { nanoid } from 'nanoid';
import { Pool } from 'pg';
import InvariantError from "../../../exceptions/invariant-error.js";
import {NotFoundError} from "../../../exceptions/index.js";
import cacheService from "../../redis/cache-service.js";

class OpenMusicRepositories {
    constructor() {
        this.pool = new Pool();
    }

    // ALBUM REPOSITORIES
    async createAlbum({ name, year }) {
        const id = nanoid();

        const query = {
            text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING *',
            values: [id, name, year]
        };

        const result = await this.pool.query(query);

        return result.rows[0];
    }

async findAlbumById(id) {
    try {
            const result = await cacheService.get(`album:${id}`);
            return JSON.parse(result);
        } catch (error) {
        const query = {
            text: 'SELECT a.id, a.name, a.year, a.cover, s.id as song_id, s.title, s.performer ' +
                'FROM albums a LEFT JOIN songs s ON s.album_id = a.id WHERE a.id = $1',
            values: [id]
        };

        const result = await this.pool.query(query);

        if (result.rowCount === 0) {
            return null;
        }

        const album = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            year: result.rows[0].year,
            coverUrl: result.rows[0].cover,
            songs: [],
        }

        result.rows.forEach((row) => {
            if (row.song_id) {
                album.songs.push({
                    id: row.song_id,
                    title: row.title,
                    performer: row.performer,
                });
            }
        });

        await cacheService.set(`album:${id}`, JSON.stringify(album));

        return album;
        }

}

    async updateAlbumById({ id, name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id]
        };

        const result = await this.pool.query(query);
        await cacheService.delete(`album:${id}`);
        return result.rows[0];
    }

    async editAlbumCover(id, coverUrl){
        const query = {
            text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
            values: [coverUrl, id]
        }

        const result = await this.pool.query(query);

        if(!result.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        await cacheService.delete(`album:${id}`);
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id]
        };

        const result = await this.pool.query(query);

        if (result.rowCount === 0) {
            return null;
        }

        await cacheService.delete(`album:${id}`);

        return result.rows[0].id;
    }

    // SONG REPOSITORIES
    async createSong({albumId, title, year, genre, performer, duration}) {
        const id = nanoid();
        const query = {
            text: 'INSERT INTO songs (id, album_id, title, year, genre, performer, duration) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            values: [id, albumId, title, year, genre, performer, duration]
        };

        const result = await this.pool.query(query);

        if (albumId) {
            await cacheService.delete(`album:${albumId}`);
        }
        return result.rows[0];
    }

    async findSongs({ title, performer}) {
        let baseQ = 'SELECT id, title, performer FROM songs';
        const condition = [];
        const values = [];

        if (title) {
            values.push(`%${title}%`);
            condition.push(`title ILIKE $${values.length}`);
        }

        if (performer) {
            values.push(`%${performer}%`);
            condition.push(`performer ILIKE $${values.length}`);
        }

        if (condition.length > 0) {
            baseQ += ` WHERE ${condition.join(' AND ')}`;
        }
        const result = await this.pool.query({
            text: baseQ,
            values
        });

        return result.rows;
    }

    async findSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id]
        }

        const result = await this.pool.query(query);
        return result.rows[0];
    }

    async updateSong({id, album_id, title, year, genre, performer, duration}) {
        const oldSongQuery = {
            text: 'SELECT album_id FROM songs WHERE id = $1',
            values: [id]
        }
        const oldSongResult = await this.pool.query(oldSongQuery);

        const query = {
            text: 'UPDATE songs SET album_id = $1, title = $2, year = $3, genre = $4, performer = $5, duration = $6 ' +
                'WHERE id = $7 RETURNING *',
            values: [album_id, title, year, genre, performer, duration, id]
        }

        const result = await this.pool.query(query);

        if (oldSongResult.rowCount > 0 && oldSongResult.rows[0].album_id) {
            await cacheService.delete(`album:${oldSongResult.rows[0].album_id}`);
        }

        if (album_id) {
            await cacheService.delete(`album:${album_id}`);
        }

        return result.rows[0];
    }

    async deleteSong(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id, album_id',
            values: [id]
        };

        const result = await this.pool.query(query);

        if (result.rowCount === 0) {
            return null;
        }

        const {id: deletedId, album_id } = result.rows[0];
        if (album_id) {
            await cacheService.delete(`album:${album_id}`);
        }

        return deletedId;
    }

    async addLike(userId, albumId){

        const checkAlbumQuery = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [albumId],
        };
        const albumResult = await this.pool.query(checkAlbumQuery);

        if (!albumResult.rowCount) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        const id = `like-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        };

        try {
            const result = await this.pool.query(query);
            if (!result.rows[0].id) {
                throw new InvariantError('Gagal menambahkan like');
            }

            await cacheService.delete(`likes:${albumId}`);
        } catch (error) {
            if (error.constraint === 'unique_user_album_like') {
                throw new InvariantError('Anda sudah menyukai album ini');
            }
            throw error;
        }
    }

    async deleteLike(userId, albumIb) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumIb],
        };

        const result = await this.pool.query(query);
        if (!result.rowCount) {
            throw new InvariantError('Like tidak ditemukan');
        }

        await cacheService.delete(`likes:${albumIb}`);
    }

    async checkIsLiked(userId, albumId) {
        const query = {
            text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };
        const result = await this.pool.query(query);
        return result.rowCount > 0;
    }

    async getLikesCount(albumId) {
        try {
            const result = await cacheService.get(`likes:${albumId}`);
            return {
                likes: parseInt(result, 10),
                source: 'cache'
            }
        } catch (error) {
            console.log(error);
            const query = {
                text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };

            const result = await this.pool.query(query);
            const likes = parseInt(result.rows[0].count, 10);

            await cacheService.set(`likes:${albumId}`, JSON.stringify(likes));

            return { likes };
        }

    }
}

export default new OpenMusicRepositories();