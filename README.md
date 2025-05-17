## Background Processing

The application uses a queue system for background processing of uploaded files. It has two implementations:

1. **BullMQ with Redis** (Default): This is used when a compatible Redis server (v5.0.0+) is available.

2. **In-Memory Queue** (Fallback): If Redis is unavailable or incompatible (version < 5.0.0), the application automatically falls back to an in-memory queue implementation.

### Redis Requirements

If you want to use BullMQ with Redis, you need:
- Redis server v5.0.0 or higher
- Properly configured Redis connection in the .env file

If your Redis version is lower than 5.0.0 or Redis is unavailable, the application will automatically use the in-memory queue instead and log a warning message.# Secure File Upload & Metadata Processing Microservice

A secure Node.js backend microservice that handles authenticated file uploads, stores associated metadata in a PostgreSQL database, and processes those files asynchronously using a job queue.

## Features

- JWT Authentication for secure API access
- File upload with metadata storage
- Background processing of uploaded files
- File status tracking and retrieval
- Pagination support for file listing
- Rate limiting for API protection
- Secure error handling and logging

## Tech Stack

- **Node.js** (>=18)
- **Express.js** - Web framework
- **PostgreSQL** (Neon) - Database 
- **BullMQ** - Redis-based queue for background jobs
- **Multer** - File upload handling
- **JWT** - Authentication

## Project Structure

```
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
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL (or use Neon PostgreSQL)
- Redis (for BullMQ)

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd secure-file-upload-service
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file based on `.env.example`:
```
cp .env.example .env
```

4. Update the `.env` file with your own configuration values, especially:
   - `DATABASE_URL` with your Neon PostgreSQL connection string
   - `JWT_SECRET` with a secure random string
   - `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` if using a remote Redis instance

5. Start the server:
```
npm start
```

For development with auto-reload:
```
npm run dev
```

## API Documentation

## Authentication

The API supports both cookie-based and token-based authentication:

### Cookie-Based Authentication (Recommended for Browser Clients)
When you login or register, the JWT token is automatically set as an HTTP-only cookie. This is the recommended method for browser-based applications as it provides better security and simplifies testing with tools like Postman.

### Token-Based Authentication (For Non-Browser Clients)
For non-browser clients (like mobile apps or other API clients), the token is also returned in the response body. You can use this token in the Authorization header for subsequent requests.

### Authentication Endpoints

#### Register a new user
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "User created successfully",
  "token": "jwt-token-here", // For API clients
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```
The API also sets an HTTP-only cookie named `auth_token` containing the JWT token.

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "jwt-token-here", // For API clients
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```
The API also sets an HTTP-only cookie named `auth_token` containing the JWT token.

#### Logout
```
POST /auth/logout
```
This will clear the auth_token cookie.

Response:
```json
{
  "message": "Logout successful"
}
```

### File Operations

When testing with Postman, the authentication cookie will be automatically included with your requests after logging in, as long as you have "Send cookies" enabled in your Postman settings.

#### Upload a file
```
POST /files/upload
Content-Type: multipart/form-data

file: [FILE]
title: Optional title
description: Optional description
```

Response:
```json
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
```

#### Get a specific file
```
GET /files/:id
```

Response:
```json
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
```

#### Get all files (with pagination)
```
GET /files?page=1&limit=10
```

Response:
```json
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
```

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Design Choices

### PostgreSQL with Raw SQL
The project uses Neon PostgreSQL with raw SQL queries rather than an ORM. This approach:
- Provides direct control over database operations
- Avoids the overhead of ORM abstraction
- Allows for more complex and optimized queries when needed

### Background Processing
The project uses BullMQ with Redis for background job processing. This allows:
- Asynchronous file processing without blocking the main thread
- Reliable job execution with persistence
- Job retry and failure handling

### Security Considerations
- JWT authentication ensures only authorized users can access the API
- File access control ensures users can only access their own files
- Rate limiting prevents abuse and potential DoS attacks
- Helmet middleware adds various HTTP security headers

## Known Limitations

- File types are not validated or restricted
- No comprehensive input validation beyond basic checks
- No automatic cleanup of files (in a production system, you might want to implement file retention policies)
- Simple error handling without detailed user feedback
- No test suite included

## Future Enhancements

- Add comprehensive input validation
- Implement automatic file cleanup
- Add file type validation and restriction
- Add comprehensive test suite
- Implement file encryption for sensitive data
- Add support for S3 or other cloud storage