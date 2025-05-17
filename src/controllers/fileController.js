import path from "path";
import { create, findById, findByUser } from "../models/file.js";
// import { addFileProcessingJob } from "../services/queue.js";

export const uploadFile = async (req, res, next) => {
  try {
    // req.file is populated by multer middleware
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title && !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    // Save file metadata to database
    const fileData = {
      userId,
      originalFilename: req.file.originalname,
      storagePath: path.join("uploads", req.file.filename), // Relative path
      title: title,
      description: description,
    };

    // Insert file record into database
    const savedFile = await create(fileData);

    // Add processing job to queue
    // await addFileProcessingJob({
    //   fileId: savedFile.id,
    //   filePath: fileData.storagePath,
    //   userId,
    // });

    // Return response
    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        id: savedFile.id,
        originalFilename: savedFile.original_filename,
        title: savedFile.title,
        description: savedFile.description,
        status: savedFile.status,
        uploadedAt: savedFile.uploaded_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// export const getFileById = async (req, res, next) => {
//   try {
//     const fileId = req.params.id;
//     const userId = req.user.id;

//     // Get file from database
//     const file = await findById(fileId);

//     // Check if file exists
//     if (!file) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     // Check if user owns the file
//     if (file.user_id !== userId) {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     // Parse extracted data if it exists
//     let extractedData = null;
//     if (file.extracted_data) {
//       try {
//         extractedData = JSON.parse(file.extracted_data);
//       } catch (e) {
//         extractedData = file.extracted_data;
//       }
//     }

//     // Return file info
//     res.status(200).json({
//       file: {
//         id: file.id,
//         originalFilename: file.original_filename,
//         title: file.title,
//         description: file.description,
//         status: file.status,
//         extractedData,
//         uploadedAt: file.uploaded_at,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getUserFiles = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;

//     // Get files from database
//     const result = await findByUser(userId, page, limit);

//     // Format the response
//     const formattedFiles = result.files.map((file) => {
//       // Parse extracted data if it exists
//       let extractedData = null;
//       if (file.extracted_data) {
//         try {
//           extractedData = JSON.parse(file.extracted_data);
//         } catch (e) {
//           extractedData = file.extracted_data;
//         }
//       }

//       return {
//         id: file.id,
//         originalFilename: file.original_filename,
//         title: file.title,
//         description: file.description,
//         status: file.status,
//         extractedData,
//         uploadedAt: file.uploaded_at,
//       };
//     });

//     // Return files
//     res.status(200).json({
//       files: formattedFiles,
//       pagination: result.pagination,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
