import redis from 'redis';
import config from '../../utils/config.js';

class CacheService {
    constructor() {
        this.client = redis.createClient({
            socket: {
                host: config.valkey.host,
            }
        });

        this.client.on('error', (error) => {
            console.error('Valkey Error: ', error);
        })

        this.client.connect();
    }

    async set(key, value, expirationInSecond = 1800) {
        await this.client.set(key, value, {
            EX: expirationInSecond
        });
    }

    async get(key) {
        const result = await this.client.get(key);
        if (result === null) throw new Error('Cache tidak ditemukan');
        return result;
    }

    async delete(key) {
        return this.client.del(key);
    }
}

export default new CacheService();