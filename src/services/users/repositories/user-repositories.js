import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';

class UserRepositories {
    constructor() {
        this.pool = new Pool();
    }

    async createUser({ username, password, fullname }) {
        const id = nanoid(16);
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdAt = new Date().toISOString();
        const query = {
            text: 'INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, username, hashedPassword, fullname, createdAt, createdAt]
        };

        const result = await this.pool.query(query);
        return result.rows[0];
    }

    async verifyNewUsername(username) {
        const query = {
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username],
        };

        const result = await this.pool.query(query);

        return result.rows.length > 0;
    }

    async getUserById(id) {
        const query = {
            text: 'SELECT * FROM users WHERE id = $1',
            values: [id],
        };

        const result = await this.pool.query(query);

        return result.rows[0];
    }
}

export default new UserRepositories();