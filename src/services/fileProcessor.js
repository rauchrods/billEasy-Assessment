import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import * as fileModel from '../models/file.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processFile = async (data) => {
  const { fileId, filePath } = data;
  
  try {
    // Update file status to processing
    await fileModel.updateStatus(fileId, 'processing');
    
    // Get absolute file path
    const absoluteFilePath = path.join(__dirname, '../../', filePath);
    
    // Check if file exists
    if (!fs.existsSync(absoluteFilePath)) {
      throw new Error('File not found');
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(absoluteFilePath);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calculate file hash (as an example of "extracted data")
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Get file size
    const fileStats = fs.statSync(absoluteFilePath);
    const fileSizeInBytes = fileStats.size;
    
    // Example extracted data
    const extractedData = JSON.stringify({
      hash: fileHash,
      sizeInBytes: fileSizeInBytes,
      processedAt: new Date().toISOString()
    });
    
    // Update file status to processed with extracted data
    const updatedFile = await fileModel.updateStatus(fileId, 'processed', extractedData);
    
    return {
      success: true,
      fileId,
      status: 'processed',
      extractedData: JSON.parse(extractedData)
    };
  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error);
    
    // Update file status to failed
    await fileModel.updateStatus(fileId, 'failed', JSON.stringify({ error: error.message }));
    
    return {
      success: false,
      fileId,
      status: 'failed',
      error: error.message
    };
  }
};

export default {
  processFile
};