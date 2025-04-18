import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register as express.RequestHandler);
router.post('/login', login as express.RequestHandler);

// Protected routes
router.get('/me', auth as express.RequestHandler, getCurrentUser as express.RequestHandler);

export default router;
