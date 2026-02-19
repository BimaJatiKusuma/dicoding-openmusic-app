import { nanoid } from "nanoid";
import { Pool } from 'pg';
import AuthorizationError from "../../../exceptions/authorization-error.js";
import {NotFoundError} from "../../../exceptions/index.js";

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
                            LEFT JOIN collaborations ON playlist.id = collaborations.playlist_id
                   WHERE playlist.owner = $1 OR collaborations.user_id = $1
                   GROUP BY playlist.id, users.username`,
            values: [owner]
        }

        const result = await this.pool.query(query);
        return result.rows;
    };

    async deletePlaylist(id){
        const queryDeleteActivities = {
            text: 'DELETE FROM playlist_song_activities WHERE playlist_id = $1',
            values: [id]
        };
        await this.pool.query(queryDeleteActivities);

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

    async addSongToPlaylist(playlistId, songId, userId){
        const id = nanoid(16);

        const query = {
            text: 'INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId]
        }

        const result = await this.pool.query(query);
        const queryActivities = {
            text: 'INSERT INTO playlist_song_activities(id, playlist_id, song_id, user_id, action, time) ' +
                'VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
            values: [id, playlistId, songId, userId, 'add']
        }
        const resultQueryActivities = await this.pool.query(queryActivities);
        if (resultQueryActivities.rowCount === 0) return null;
        return result.rows[0];
    };

    async findSongsInPlaylist(id){
        const query = {
            text: 'SELECT playlist.id, playlist.name, users.username ' +
                'FROM playlist ' +
                'LEFT JOIN users ON playlist.owner = users.id ' +
                'WHERE playlist.id = $1',
            values: [id]
        }

        const resultPlaylist = await this.pool.query(query);

        if (resultPlaylist.rowCount === 0) {
            return null;
        }

        const querySongs = {
            text: 'SELECT songs.id, songs.title, songs.performer ' +
                'FROM songs JOIN playlist_songs ON songs.id = playlist_songs.song_id ' +
                'WHERE playlist_songs.playlist_id = $1',
            values: [id]
        }

        const resultSongs = await this.pool.query(querySongs);

        const playlist = resultPlaylist.rows[0];

        return {
            id: playlist.id,
            name: playlist.name,
            songs: resultSongs.rows
        };
    };

    async deleteSongInPlaylist(playlistId, songId, userId){
        const id = nanoid(16);

        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId]
        }

        const result = await this.pool.query(query);

        if (result.rowCount === 0) {
            return null;
        }

        const queryActivities = {
            text: 'INSERT INTO playlist_song_activities(id, playlist_id, song_id, user_id, action, time) ' +
                'VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
            values: [id, playlistId, songId, userId, 'delete']
        }

        const resultQueryActivities = await this.pool.query(queryActivities);
        if (resultQueryActivities.rowCount === 0) return null;

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

    async findPlaylistActivities(playlistId){
        const query = {
            text: 'SELECT users.username, songs.title, playlist_song_activities.action, ' +
                'playlist_song_activities.time ' +
                'FROM playlist_song_activities ' +
                'JOIN users ON playlist_song_activities.user_id = users.id ' +
                'JOIN songs ON playlist_song_activities.song_id = songs.id ' +
                'WHERE playlist_song_activities.playlist_id = $1 ' +
                'ORDER BY playlist_song_activities.time ASC',
            values: [playlistId]
        }
        const result = await this.pool.query(query);
        return result.rows;
    }

    async verifyPlaylistAccess(playlistId, userId) {
        const query = {
            text: 'SELECT * FROM playlist WHERE id = $1',
            values: [playlistId],
        };
        const result = await this.pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];

        if (playlist.owner !== userId) {
            const queryCollaborator = {
                text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
                values: [playlistId, userId],
            };

            const resultCollaborator = await this.pool.query(queryCollaborator);

            if (!resultCollaborator.rows.length) {
                throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
            }
        }
    }
}

export default new PlaylistRepositories();