import express from 'express';
import { auth } from '../middleware/auth';
import upload, { handleMulterError } from '../middleware/upload';
import {
  createPortfolio,
  getUserPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
  getPortfolioBySubdomain,
  uploadPortfolioImage,
  deletePortfolioImage,
} from '../controllers/portfolioController';

const router = express.Router();

// Public portfolio routes
router.get('/subdomain/:subdomain', getPortfolioBySubdomain as express.RequestHandler);

// Protected portfolio routes
router.use(auth as express.RequestHandler); // All routes below this line require authentication
router.post('/', createPortfolio as express.RequestHandler);
router.get('/', getUserPortfolios as express.RequestHandler);
router.get('/:id', getPortfolioById as express.RequestHandler);
router.put('/:id', updatePortfolio as express.RequestHandler);
router.delete('/:id', deletePortfolio as express.RequestHandler);

// Portfolio image upload/delete routes
router.post(
  '/:id/upload-image',
  upload.single('image'),
  handleMulterError,
  uploadPortfolioImage as express.RequestHandler
);
router.delete('/:id/delete-image/:imageId', deletePortfolioImage as express.RequestHandler);

export default router;
