import { Queue, Worker } from 'bullmq';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { processFile } from './fileProcessor.js';

dotenv.config();

// Redis connection options
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD })
};

// Create file processing queue
const fileQueue = new Queue('fileProcessing', {
  connection: redisOptions
});

// Initialize worker
const initWorker = () => {
  console.log('Initializing file processing worker...');
  
  const worker = new Worker('fileProcessing', async (job) => {
    console.log(`Processing job ${job.id} for file ${job.data.fileId}`);
    
    try {
      return await processFile(job.data);
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  }, { connection: redisOptions });

  worker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed with result:`, result);
  });

  worker.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed with error:`, error);
  });

  return worker;
};

// Add a job to the queue
export const addFileProcessingJob = async (fileData) => {
  try {
    const job = await fileQueue.add('processFile', fileData);
    console.log(`Job ${job.id} added to queue for file ${fileData.fileId}`);
    return job;
  } catch (error) {
    console.error('Error adding job to queue:', error);
    throw error;
  }
};

export default {
  fileQueue,
  initWorker,
  addFileProcessingJob
};