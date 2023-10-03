import { createClient } from "redis";
import { promisify } from 'util';

// defining methods for Redis commands
class RedisClient {
    constructor() {
        this.client = createClient();
        this.client.on('error', (error) => {
            console.log(`Redis client not connected to server: ${error}`);
        });
    }

    isAlive() {
        if(this.client.connected) {
            return true
        }
        return false;
    }

    async get(key) {
        const Get = promisify(this.client.get).bind(this.client);
        const value = await Get(key);
        return value;
    }

    async set(key, value, time) {
        const Set = promisify(this.client.set).bind(this.client);
        await Set(key, value);
        await this.client.expire(key, time);
    }

    async del(key) {
        const Del = promisify(this.client.del).bind(this.client);
        await Del(key);
    }
}

const redisClient = new RedisClient();

module.exports = redisClient;