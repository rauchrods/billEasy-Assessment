import { query } from "./db.js";

export const create = async (fileData) => {
  const { userId, originalFilename, storagePath, title, description } =
    fileData;

  try {
    const result = await query(
      `INSERT INTO files 
        (user_id, original_filename, storage_path, title, description) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, user_id, original_filename, storage_path, title, description, status, uploaded_at`,
      [userId, originalFilename, storagePath, title, description]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error creating file record:", error);
    throw error;
  }
};

export const findById = async (fileId) => {
  try {
    const result = await query("SELECT * FROM files WHERE id = $1", [fileId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error finding file by ID:", error);
    throw error;
  }
};

export const findByUser = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  try {
    const result = await query(
      "SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC LIMIT $2 OFFSET $3",
      [userId, limit, offset]
    );

    const countResult = await query(
      "SELECT COUNT(*) FROM files WHERE user_id = $1",
      [userId]
    );

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      files: result.rows,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error finding files by user:", error);
    throw error;
  }
};

export const updateStatus = async (fileId, status, extractedData = null) => {
  try {
    const result = await query(
      "UPDATE files SET status = $1, extracted_data = $2 WHERE id = $3 RETURNING *",
      [status, extractedData, fileId]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error updating file status:", error);
    throw error;
  }
};
