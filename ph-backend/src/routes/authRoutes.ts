import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateUserProfile,
  uploadProfilePicture,
  deleteProfilePicture
} from '../controllers/authController';
import { auth } from '../middleware/auth';
import upload, { handleMulterError } from '../middleware/upload';

const router = express.Router();

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
  '/profile/upload-image',
  auth as express.RequestHandler,
  upload.single('profilePicture'),
  handleMulterError,
  uploadProfilePicture as express.RequestHandler
);

router.delete(
  '/profile/delete-image',
  auth as express.RequestHandler,
  deleteProfilePicture as express.RequestHandler
);

export default router;
