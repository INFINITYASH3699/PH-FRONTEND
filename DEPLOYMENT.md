# Portfolio Hub Deployment Guide

This guide explains how to deploy both the frontend and backend of Portfolio Hub.

## Frontend Deployment on Vercel

1. Connect your GitHub repository to Vercel
2. Choose the repository and set the following settings:
   - Framework Preset: Next.js
   - Root Directory: `ph-frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. Set the following environment variables:
   - `NEXT_PUBLIC_API_URL`: URL to your backend API (e.g., https://portfolio-hub-backend.onrender.com/api)
   - `NEXT_PUBLIC_BASE_URL`: URL to your frontend (e.g., https://portfolio-hub.vercel.app)
   - Add any other environment variables needed for your app

4. Deploy the project

## Backend Deployment on Render.com

1. Connect your GitHub repository to Render.com
2. Choose Web Service and select the repository
3. Configure the service:
   - Name: portfolio-hub-backend
   - Root Directory: `ph-backend`
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/index.js`

4. Set the following environment variables:
   - `NODE_ENV`: production
   - `PORT`: 10000 (or let Render assign one)
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret
   - `CLIENT_URL`: Your frontend URL (e.g., https://portfolio-hub.vercel.app)
   - Add any other environment variables needed

5. Deploy the service

## Important Notes

- For the backend to work properly, make sure your MongoDB connection is accessible from Render.com
- If you encounter CORS issues, verify that the `CLIENT_URL` environment variable in the backend is set correctly
- The frontend is configured to use `/api` endpoints, which are proxied to the backend URL specified in the vercel.json rewrites configuration
- Make sure both services are connected to the same database

## Troubleshooting

### Frontend Deployment Issues

- Ensure your build command is correct in vercel.json
- Check that the rewrites in vercel.json point to the correct backend API URL
- Verify that all environment variables are set correctly

### Backend Deployment Issues

- Ensure TypeScript is included in the dependencies (not just devDependencies)
- Verify the build process compiles TS to JS properly
- Check the logs in Render.com for any build or runtime errors
- Make sure the start command points to the compiled JavaScript file (dist/index.js)
