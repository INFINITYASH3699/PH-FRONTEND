import express from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import {
  register,
  login,
  getCurrentUser,
  updateUserProfile,
  uploadProfilePicture,
} from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (
    req: express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback       // 👈 Use the Multer type!
  ) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

// Public routes
router.post('/register', register as express.RequestHandler);
router.post('/login', login as express.RequestHandler);

// Protected routes
router.get(
  '/me',
  auth as express.RequestHandler,
  getCurrentUser as express.RequestHandler
);
router.put(
  '/profile',
  auth as express.RequestHandler,
  updateUserProfile as express.RequestHandler
);
router.post(
  '/profile/upload',
  auth as express.RequestHandler,
  upload.single('profilePicture'),
  uploadProfilePicture as express.RequestHandler
);

export default router;