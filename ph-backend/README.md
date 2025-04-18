# Portfolio Hub Backend

This is the backend API for Portfolio Hub, a platform for developers and designers to create and showcase their portfolios.

## Getting Started

### Prerequisites

- Node.js (>= 18.0.0)
- MongoDB
- Cloudinary account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd ph-backend
   npm install
   ```
3. Create a `.env` file in the root directory (see `.env.example` for required variables)
4. Start the development server:
   ```bash
   npm run dev
   ```

## Cloudinary Setup

This application uses Cloudinary for image storage. Follow these steps to set up Cloudinary:

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud name, API Key, and API Secret from the Cloudinary dashboard
3. Add these credentials to your `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### Image Upload Flow

Images are stored using the following process:

1. Users upload images via the API
2. Images are temporarily stored on the server using Multer
3. Images are then uploaded to Cloudinary
4. The local temporary file is deleted
5. The Cloudinary URL and public ID are stored in the database

### Image Deletion

When images are deleted or replaced:

1. The application retrieves the image's public ID from the database
2. The image is deleted from Cloudinary using the public ID
3. The database record is updated to remove the image reference

### Image Folders Structure

Cloudinary images are organized in the following folder structure:

- `portfolio-hub/profile-pictures/` - User profile pictures
- `portfolio-hub/portfolios/{portfolioId}/header/` - Portfolio header images
- `portfolio-hub/portfolios/{portfolioId}/gallery/` - Portfolio gallery images

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user information
- PUT `/api/auth/profile` - Update user profile
- POST `/api/auth/profile/upload-image` - Upload profile picture
- DELETE `/api/auth/profile/delete-image` - Delete profile picture

### Portfolios

- POST `/api/portfolios` - Create new portfolio
- GET `/api/portfolios` - Get all portfolios for current user
- GET `/api/portfolios/:id` - Get portfolio by ID
- PUT `/api/portfolios/:id` - Update portfolio
- DELETE `/api/portfolios/:id` - Delete portfolio
- GET `/api/portfolios/subdomain/:subdomain` - Get public portfolio by subdomain
- POST `/api/portfolios/:id/upload-image` - Upload portfolio image (header or gallery)
- DELETE `/api/portfolios/:id/delete-image/:imageId` - Delete portfolio image

## Environment Variables

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://localhost:3001
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
