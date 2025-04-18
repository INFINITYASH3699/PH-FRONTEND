import express from 'express';
import { auth } from '../middleware/auth';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/templateController';

const router = express.Router();

// Public routes
router.get('/', getAllTemplates);
router.get('/:id', getTemplateById);

// Protected routes that require admin privileges
router.post('/', auth, createTemplate);
router.put('/:id', auth, updateTemplate);
router.delete('/:id', auth, deleteTemplate);

export default router;
