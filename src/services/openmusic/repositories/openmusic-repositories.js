import { nanoid } from 'nanoid';
import { Pool } from 'pg';

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
        const query = {
            text: 'SELECT a.id, a.name, a.year, s.id as song_id, s.title, s.performer ' +
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

        return album;
    }

    async updateAlbumById({ id, name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id]
        };

        const result = await this.pool.query(query);
        return result.rows[0];
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
        const query = {
            text: 'UPDATE songs SET album_id = $1, title = $2, year = $3, genre = $4, performer = $5, duration = $6 ' +
                'WHERE id = $7 RETURNING *',
            values: [album_id, title, year, genre, performer, duration, id]
        }

        const result = await this.pool.query(query);
        return result.rows[0];
    }

    async deleteSong(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id]
        };

        const result = await this.pool.query(query);

        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0].id;
    }
}

export default new OpenMusicRepositories();