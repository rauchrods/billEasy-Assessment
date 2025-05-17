import { Queue, Worker } from "bullmq";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import { processFile } from "./fileProcessor.js";
import InMemoryQueue from "./inMemoryQueue.js";

dotenv.config();

// Redis connection options
const redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
};

let useRedis = true;
let fileQueue;
let queueModule;

// Try to initialize BullMQ with Redis
try {
  // Create file processing queue with BullMQ
  queueModule = { Queue, Worker };
  fileQueue = new Queue("fileProcessing", {
    connection: redisOptions,
  });
  console.log("Successfully initialized BullMQ with Redis");
} catch (error) {
  console.warn("Failed to initialize BullMQ with Redis:", error.message);
  console.log("Falling back to in-memory queue implementation");

  // Fall back to in-memory queue
  useRedis = false;
  queueModule = InMemoryQueue;
  fileQueue = new InMemoryQueue.Queue("fileProcessing");
}

// Initialize worker
export const initWorker = () => {
  console.log("Initializing file processing worker...");

  try {
    let worker;

    if (useRedis) {
      // Initialize BullMQ worker
      worker = new Worker(
        "fileProcessing",
        async (job) => {
          console.log(`Processing job ${job.id} for file ${job.data.fileId}`);

          try {
            return await processFile(job.data);
          } catch (error) {
            console.error(`Error processing job ${job.id}:`, error);
            throw error;
          }
        },
        { connection: redisOptions }
      );
    } else {
      // In-memory queue already handles processing
      worker = new InMemoryQueue.Worker("fileProcessing");
    }

    worker.on("completed", (job, result) => {
      console.log(`Job ${job.id} completed with result:`, result);
    });

    worker.on("failed", (job, error) => {
      console.error(`Job ${job.id} failed with error:`, error);
    });

    return worker;
  } catch (error) {
    console.error("Error initializing worker:", error);
    console.log("Jobs will still be processed by the in-memory queue system");
    return null;
  }
};

// Add a job to the queue
export const addFileProcessingJob = async (fileData) => {
  try {
    const job = await fileQueue.add("processFile", fileData);
    console.log(`Job ${job.id} added to queue for file ${fileData.fileId}`);
    return job;
  } catch (error) {
    console.error("Error adding job to queue:", error);
    throw error;
  }
};
