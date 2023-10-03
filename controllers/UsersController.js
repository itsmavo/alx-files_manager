import sha1 from 'sha1';
import {ObjectID} from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { response } from 'express';

const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

class UsersController {
    static postNew(req, res) {
        const email  = req.body ? req.body.email : null;
        const password  = req.body ? req.body.password : null;
        if (!email) {
            res.status(400).json({ error: 'Missing email'});
            return;
        }
        if(!password) {
            res.status(400).json({ error: 'Missing password'});
            return;
        }
        const users = dbClient.db.collection('users');
    users.findOne({ email }, (err, user) => {
      if (user) {
        res.status(400).json({ error: 'Already exist' });
      } else {
        const hashedPassword = sha1(password);
        users.insertOne(
          {
            email,
            password: hashedPassword,
          },
        ).then((result) => {
          res.status(201).json({ id: result.insertedId, email });
          userQueue.add({ userId: result.insertedId });
        }).catch((error) => console.log(error));
      }
    });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if(userId) {
        const users = dbClient.db.collection('users');
        const idObject = new ObjectID(userId);
        users.findOne({ _id: idObject}, (err, user) => {
            if (user) {
                res.status(200).json({ id: userId, email: user.email});
            } else {
                res.status(401).json({ error: 'Unauthorized'});
            }
        })
  } else {
    res.status(401).json({ error: 'Unauthorized'})
  }
}
    

    
    
}

module.exports = UsersController;