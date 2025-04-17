This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# PortfolioHub - Create Professional Portfolios

A Next.js application that allows users to create and customize professional portfolio websites from pre-designed templates.

## Features

- User authentication (sign up, sign in, password reset)
- Portfolio creation from templates
- Template browsing and filtering
- Portfolio customization (colors, fonts, layouts)
- File uploads with Cloudinary
- MongoDB database integration

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- MongoDB database (Atlas or local)
- Cloudinary account (for image uploads)

### Environment Setup

1. Clone the repository
   ```bash
   git clone https://github.com/INFINITYASH3699/PH-FRONTEND.git
   cd PH-FRONTEND
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   bun install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio-hub?retryWrites=true&w=majority

   # Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-chars

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Email Provider (for verification emails)
   EMAIL_SERVER_HOST=smtp.example.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@example.com
   EMAIL_SERVER_PASSWORD=your-email-password
   EMAIL_FROM=no-reply@your-domain.com
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deployment on Vercel

This application is designed to work with Vercel, which handles both frontend and backend (API routes) in a single deployment.

### Steps to deploy:

1. **Create a Vercel account** if you don't have one at [vercel.com](https://vercel.com)

2. **Install Vercel CLI** (optional, for easier deployments)
   ```bash
   npm install -g vercel
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy from your local repository**
   ```bash
   vercel
   ```

   This will guide you through setup process. For production deploy:
   ```bash
   vercel --prod
   ```

5. **Set up Environment Variables**:
   - Go to your project on Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all the same variables from your `.env.local` file

6. **Connect your GitHub repository** (alternative method):
   - Import your repository directly from GitHub in Vercel dashboard
   - Configure build settings (the defaults should work for Next.js)
   - Add the environment variables
   - Deploy

### Important Notes for Deployment:

- **MongoDB Atlas**: Make sure your MongoDB Atlas cluster is accessible from any IP or whitelist Vercel's IPs.
- **NextAuth**: Set NEXTAUTH_URL to your production URL.
- **Cloudinary**: Ensure your Cloudinary account has adequate capacity for your needs.
- **Email Provider**: Use a reliable SMTP provider for production.

## Project Structure

- `/src/app/api/*` - API routes (backend)
- `/src/app/*` - Frontend pages
- `/src/components/*` - React components
- `/src/lib/*` - Utility functions and libraries
- `/src/models/*` - MongoDB schemas
- `/src/types/*` - TypeScript type definitions

## Technologies Used

- **Frontend**: Next.js, React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary
- **Form Validation**: Zod, React Hook Form

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [NextAuth.js Documentation](https://next-auth.js.org/)
