import {nanoid} from "nanoid";
import {Pool} from "pg";

class CollaboratorRepositories {
    constructor() {
        this.pool = new Pool();
    }

    async createCollaboration(playlistId, userId) {
        const id = nanoid(16);
        const query = {
            text: 'INSERT INTO collaborators VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId]
        };

        const result = await this.pool.query(query);

        return result.rows[0];
    }

    async deleteCollaboration(playlistId, userId) {
        const query = {
            text: 'DELETE FROM collaborators WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId]
        };

        const result = await this.pool.query(query);
        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];
    }
}

export default new CollaboratorRepositories();