import express from 'express';
import { auth } from '../middleware/auth';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  addTemplateReview,
  getTemplateStats
} from '../controllers/templateController';

const router = express.Router();

// Public routes
router.get('/', getAllTemplates as express.RequestHandler);
router.get('/stats/categories', getTemplateStats as express.RequestHandler);
router.get('/:id', getTemplateById as express.RequestHandler);

// Protected routes - require authentication
router.use(auth as express.RequestHandler);

// Template management routes
router.post('/', createTemplate as express.RequestHandler);
router.put('/:id', updateTemplate as express.RequestHandler);
router.delete('/:id', deleteTemplate as express.RequestHandler);

// Template review routes
router.post('/:id/reviews', addTemplateReview as express.RequestHandler);

export default router;
