import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import { promises as fsPromises } from 'fs';
import path from 'path';
import dbClient from './utils/db';
import redisClient from './utils/redis';

// Create a Bull queue
const fileQueue = new Queue('fileQueue');

// Process the queue
fileQueue.process(async (job, done) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files').findOne({ _id: new dbClient.ObjectID(fileId), userId: new dbClient.ObjectID(userId) });

  if (!file) {
    throw new Error('File not found');
  }

  // Ensure the file is of type 'image'
  if (file.type !== 'image') {
    throw new Error('Not an image file');
  }

  const sizes = [500, 250, 100];
  const filePath = file.localPath;

  try {
    for (const size of sizes) {
      const options = { width: size };
      const thumbnail = await imageThumbnail(filePath, options);
      const thumbnailPath = `${filePath}_${size}`;
      await fsPromises.writeFile(thumbnailPath, thumbnail);
    }
    done();
  } catch (error) {
    done(new Error(`Error generating thumbnails: ${error.message}`));
  }
});

export default fileQueue;
