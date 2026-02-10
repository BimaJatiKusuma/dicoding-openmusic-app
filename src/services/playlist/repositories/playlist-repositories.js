import { nanoid } from "nanoid";
import { Pool } from 'pg';

class PlaylistRepositories {
    constructor() {
        this.pool = new Pool;
    }

    async createPlaylist({name, ownerId}){
        const id = nanoid(16);

        const query = {
            text: 'INSERT INTO playlist (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, ownerId]
        }

        const result = await this.pool.query(query);

        return result.rows[0];
    };

    async findPlaylists(owner){
        const query = {
            text: `SELECT playlist.id, playlist.name, users.username
            FROM playlist
            LEFT JOIN users ON playlist.owner = users.id
            WHERE playlist.owner = $1`,
            values: [owner]
        }

        const result = await this.pool.query(query);
        return result.rows;
    };

    async deletePlaylist(id){
        const query = {
            text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
            values: [id]
        }

        const result = await this.pool.query(query);

        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];
    };

    async addSongToPlaylist(playlistId, songId){
        const id = nanoid(16);

        const query = {
            text: 'INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId]
        }

        const result = await this.pool.query(query);

        return result.rows[0];
    };

    async findSongsInPlaylist(id){
        const query = {
            // PERBAIKAN 1: Hapus genre, duration, dan album_id. Ambil id, title, performer saja.
            // PERBAIKAN 2: Tambahkan spasi sebelum FROM.
            text: 'SELECT songs.id, songs.title, songs.performer ' +
                'FROM songs JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
            values: [id]
        }

        const resultPlaylist = await this.pool.query(query);

        if (resultPlaylist.rowCount === 0) {
            return null;
        }

        const querySongs = {
            text: 'SELECT songs.id, songs.title, songs.performer, songs.genre, songs.duration, songs.album_id ' +
                'FROM songs JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
            values: [id]
        }

        const resultSongs = await this.pool.query(querySongs);

        const playlist = resultPlaylist.rows[0];

        return {
            id: playlist.id,
            name: playlist.name,
            username: playlist.username,
            songs: resultSongs.rows
        };
    };

    async deleteSongInPlaylist(playlistId, songId){
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId]
        }

        const result = await this.pool.query(query);

        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];
    };

    async verifyPlaylistOwner(playlistId, userId){
        const query = {
            text: 'SELECT * FROM playlist WHERE id = $1',
            values: [playlistId]
        }

        const result = await this.pool.query(query);

        if(!result.rows.length) return null;

        const playlist = result.rows[0];

        if (playlist.owner !== userId) return false;

        return true
    }
}

export default new PlaylistRepositories();