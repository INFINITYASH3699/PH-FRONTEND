# Running Portfolio Hub

This document provides instructions for running both the frontend and backend servers of Portfolio Hub.

## Prerequisites

- Node.js 18.x or later
- MongoDB connection (the default connection string is already configured)
- Cloudinary account (credentials already configured)

## Starting the Backend Server

1. Open a terminal window
2. Navigate to the backend directory:
   ```bash
   cd ph-backend
   ```
3. Install dependencies if you haven't already:
   ```bash
   npm install
   ```
4. Build the backend:
   ```bash
   npm run build
   ```
5. Start the server:
   ```bash
   npm start
   ```

The backend server should now be running on port 5000. You should see output like:
```
Server running in development mode on port 5000
Connected to MongoDB
```

## Starting the Frontend Server

1. Open a **new terminal window** (keep the backend server running)
2. Navigate to the frontend directory:
   ```bash
   cd ph-frontend
   ```
3. Install dependencies if you haven't already:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend server should now be running on port 3000. You can access the application at http://localhost:3000

## Troubleshooting

### "Failed to fetch" or "Connection refused" errors
- Make sure both servers are running simultaneously
- Verify the backend is running on port 5000
- Check that the frontend's `.env.local` file has `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

### MongoDB connection issues
- If you see MongoDB connection errors, check your internet connection
- The application is configured to use a remote MongoDB instance by default

### Cloudinary upload errors
- Cloudinary credentials are already configured in both frontend and backend
- If you encounter issues, ensure your internet connection is working
