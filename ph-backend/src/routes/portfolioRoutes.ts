import express from 'express';
import {
  createPortfolio,
  getUserPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
  getPortfolioBySubdomain
} from '../controllers/portfolioController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/subdomain/:subdomain', getPortfolioBySubdomain as express.RequestHandler);

// Protected routes
router.use(auth as express.RequestHandler); // All routes below this line require authentication
router.route('/')
  .get(getUserPortfolios as express.RequestHandler)
  .post(createPortfolio as express.RequestHandler);

router.route('/:id')
  .get(getPortfolioById as express.RequestHandler)
  .put(updatePortfolio as express.RequestHandler)
  .delete(deletePortfolio as express.RequestHandler);

export default router;
