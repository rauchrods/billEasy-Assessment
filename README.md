Secure File Upload & Metadata Processing Microservice
A secure Node.js backend microservice that handles authenticated file uploads, stores associated metadata in a PostgreSQL database, and processes those files asynchronously using a job queue.

Features
JWT Authentication for secure API access
File upload with metadata storage
Background processing of uploaded files
File status tracking and retrieval
Pagination support for file listing
Rate limiting for API protection
Secure error handling and logging
Tech Stack
Node.js (>=18)
Express.js - Web framework
PostgreSQL (Neon) - Database
BullMQ - Redis-based queue for background jobs
Multer - File upload handling
JWT - Authentication
Project Structure
secure-file-upload-service/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Middleware functions
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic and services
│   └── app.js          # Express app setup
├── uploads/            # File upload directory
├── .env                # Environment variables
└── README.md           # Project documentation
Getting Started
Prerequisites
Node.js >= 18
PostgreSQL (or use Neon PostgreSQL)
Redis (for BullMQ)
Installation
Clone the repository:
git clone <repository-url>
cd secure-file-upload-service
Install dependencies:
npm install
Create a .env file based on .env.example:
cp .env.example .env
Update the .env file with your own configuration values, especially:
DATABASE_URL with your Neon PostgreSQL connection string
JWT_SECRET with a secure random string
REDIS_HOST, REDIS_PORT, and REDIS_PASSWORD if using a remote Redis instance
Start the server:
npm start
For development with auto-reload:

npm run dev
API Documentation
Authentication
Register a new user
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
Response:

json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
Login
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
Response:

json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
File Operations
Upload a file
POST /files/upload
Authorization: Bearer jwt-token-here
Content-Type: multipart/form-data

file: [FILE]
title: Optional title
description: Optional description
Response:

json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "originalFilename": "example.pdf",
    "title": "My Document",
    "description": "An important document",
    "status": "uploaded",
    "uploadedAt": "2025-05-17T12:00:00.000Z"
  }
}
Get a specific file
GET /files/:id
Authorization: Bearer jwt-token-here
Response:

json
{
  "file": {
    "id": 1,
    "originalFilename": "example.pdf",
    "title": "My Document",
    "description": "An important document",
    "status": "processed",
    "extractedData": {
      "hash": "sha256-hash-here",
      "sizeInBytes": 1024,
      "processedAt": "2025-05-17T12:05:00.000Z"
    },
    "uploadedAt": "2025-05-17T12:00:00.000Z"
  }
}
Get all files (with pagination)
GET /files?page=1&limit=10
Authorization: Bearer jwt-token-here
Response:

json
{
  "files": [
    {
      "id": 1,
      "originalFilename": "example.pdf",
      "title": "My Document",
      "description": "An important document",
      "status": "processed",
      "extractedData": {
        "hash": "sha256-hash-here",
        "sizeInBytes": 1024,
        "processedAt": "2025-05-17T12:05:00.000Z"
      },
      "uploadedAt": "2025-05-17T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
Health Check
GET /health
Response:

json
{
  "status": "ok",
  "message": "Server is running"
}
Design Choices
PostgreSQL with Raw SQL
The project uses Neon PostgreSQL with raw SQL queries rather than an ORM. This approach:

Provides direct control over database operations
Avoids the overhead of ORM abstraction
Allows for more complex and optimized queries when needed
Background Processing
The project uses BullMQ with Redis for background job processing. This allows:

Asynchronous file processing without blocking the main thread
Reliable job execution with persistence
Job retry and failure handling
Security Considerations
JWT authentication ensures only authorized users can access the API
File access control ensures users can only access their own files
Rate limiting prevents abuse and potential DoS attacks
Helmet middleware adds various HTTP security headers
Known Limitations
File types are not validated or restricted
No comprehensive input validation beyond basic checks
No automatic cleanup of files (in a production system, you might want to implement file retention policies)
Simple error handling without detailed user feedback
No test suite included
Future Enhancements
Add comprehensive input validation
Implement automatic file cleanup
Add file type validation and restriction
Add comprehensive test suite
Implement file encryption for sensitive data
Add support for S3 or other cloud storage
