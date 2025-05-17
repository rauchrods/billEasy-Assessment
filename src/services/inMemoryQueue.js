import EventEmitter from 'events';
import { processFile } from './fileProcessor.js';

/**
 * Simple in-memory queue implementation as a fallback when Redis is unavailable or incompatible
 */
class InMemoryQueue {
  constructor(name) {
    this.name = name;
    this.jobs = [];
    this.events = new EventEmitter();
    this.isProcessing = false;
    this.processingInterval = null;
  }

  async add(jobName, data) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const job = {
      id: jobId,
      name: jobName,
      data,
      status: 'queued',
      timestamp: Date.now()
    };
    
    this.jobs.push(job);
    console.log(`Added job ${job.id} to in-memory queue`);
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this.startProcessing();
    }
    
    return job;
  }

  startProcessing() {
    this.isProcessing = true;
    this.processNext();
  }

  async processNext() {
    if (this.jobs.length === 0) {
      this.isProcessing = false;
      return;
    }

    const job = this.jobs.shift();
    job.status = 'processing';
    
    console.log(`Processing job ${job.id} from in-memory queue`);
    
    try {
      const result = await processFile(job.data);
      job.status = 'completed';
      job.result = result;
      this.events.emit('completed', job, result);
      console.log(`Job ${job.id} completed with result:`, result);
    } catch (error) {
      job.status = 'failed';
      job.error = error;
      this.events.emit('failed', job, error);
      console.error(`Job ${job.id} failed with error:`, error);
    }

    // Process next job
    setTimeout(() => this.processNext(), 100);
  }

  on(event, callback) {
    this.events.on(event, callback);
    return this;
  }

  getJobs() {
    return [...this.jobs];
  }
}

class InMemoryWorker {
  constructor(queueName, processor) {
    this.queueName = queueName;
    this.processor = processor;
    this.events = new EventEmitter();
  }

  on(event, callback) {
    this.events.on(event, callback);
    return this;
  }
}

export default {
  Queue: InMemoryQueue,
  Worker: InMemoryWorker
};