import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
    static getStatus(req, res) {
        res.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
    }

    static async getStats(req, res) {
        const userNum = await dbClient.nbUsers();
        const fileNum = await dbClient.nbFiles();
        res.status(200).json({ users: userNum, files: fileNum});
    }
}

module.exports = AppController;