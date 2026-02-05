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

        const query = {
            text: 'INSERT INTO users VALUES ($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname]
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

    async verifyUserCredential(username, password) {
        const query = {
            text: 'SELECT id, password FROM users WHERE username = $1',
            values: [username],
        };

        const result = await this.pool.query(query);

        if(!result.rows.length) return null;

        const { id, password: hashedPassword } = result.rows[0];

        const match = await bcrypt.compare(password, hashedPassword);

        if(!match) return null;

        return id;
    }
}

export default new UserRepositories();