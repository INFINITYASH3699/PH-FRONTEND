import express from 'express';
import { auth } from '../middleware/auth';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getFeaturedTemplates,
  rateTemplate,
  getTemplateReviews,
  toggleFavoriteTemplate,
  getFavoriteTemplates,
  incrementTemplateUsage,
} from '../controllers/templateController';

const router = express.Router();

// Public routes
router.get('/', getAllTemplates);
router.get('/featured', getFeaturedTemplates);
router.get('/:id', getTemplateById);
router.get('/:id/reviews', getTemplateReviews);

// Protected routes that require authentication
router.post('/:id/rate', auth, rateTemplate);
router.post('/:id/favorite', auth, toggleFavoriteTemplate);
router.get('/favorites', auth, getFavoriteTemplates);
router.post('/:id/use', auth, incrementTemplateUsage);

// Protected routes that require admin privileges
router.post('/', auth, createTemplate);
router.put('/:id', auth, updateTemplate);
router.delete('/:id', auth, deleteTemplate);

export default router;
