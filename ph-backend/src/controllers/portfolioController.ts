import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Portfolio from '../models/Portfolio';
import Template from '../models/Template';

// @desc    Create new portfolio
// @route   POST /api/portfolios
// @access  Private
export const createPortfolio = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { title, subtitle, subdomain, templateId, content } = req.body;

    // Validate required fields
    if (!title || !subdomain) {
      return res.status(400).json({
        success: false,
        message: 'Title and subdomain are required'
      });
    }

    // Check if subdomain is already taken
    const existingPortfolio = await Portfolio.findOne({ subdomain: subdomain.toLowerCase() });
    if (existingPortfolio) {
      return res.status(400).json({
        success: false,
        message: 'This subdomain is already taken'
      });
    }

    // Check if template exists if templateId is provided
    if (templateId) {
      const template = await Template.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }
    }

    // Create portfolio
    const portfolio = await Portfolio.create({
      title,
      subtitle,
      subdomain: subdomain.toLowerCase(),
      userId: req.user.id,
      templateId: templateId || null,
      content: content || {},
      isPublished: false
    });

    return res.status(201).json({
      success: true,
      portfolio
    });
  } catch (error: any) {
    console.error('Create portfolio error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during portfolio creation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all portfolios for current user
// @route   GET /api/portfolios
// @access  Private
export const getUserPortfolios = async (req: Request, res: Response): Promise<Response> => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .populate('templateId', 'name previewImage category');

    return res.status(200).json({
      success: true,
      count: portfolios.length,
      portfolios
    });
  } catch (error: any) {
    console.error('Get user portfolios error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving portfolios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single portfolio by ID
// @route   GET /api/portfolios/:id
// @access  Private
export const getPortfolioById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const portfolio = await Portfolio.findById(req.params.id)
      .populate('templateId', 'name previewImage category defaultStructure');

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Check if user owns the portfolio or is admin
    if (portfolio.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this portfolio'
      });
    }

    return res.status(200).json({
      success: true,
      portfolio
    });
  } catch (error: any) {
    console.error('Get portfolio error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update portfolio
// @route   PUT /api/portfolios/:id
// @access  Private
export const updatePortfolio = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { title, subtitle, content, isPublished, customDomain } = req.body;

    // Find portfolio
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Check if user owns the portfolio
    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this portfolio'
      });
    }

    // Update fields
    if (title) portfolio.title = title;
    if (subtitle !== undefined) portfolio.subtitle = subtitle;
    if (content) portfolio.content = content;
    if (isPublished !== undefined) portfolio.isPublished = isPublished;
    if (customDomain !== undefined) portfolio.customDomain = customDomain;

    // Save updated portfolio
    const updatedPortfolio = await portfolio.save();

    return res.status(200).json({
      success: true,
      portfolio: updatedPortfolio
    });
  } catch (error: any) {
    console.error('Update portfolio error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete portfolio
// @route   DELETE /api/portfolios/:id
// @access  Private
export const deletePortfolio = async (req: Request, res: Response): Promise<Response> => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Check if user owns the portfolio or is admin
    if (portfolio.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this portfolio'
      });
    }

    await Portfolio.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete portfolio error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get public portfolio by subdomain
// @route   GET /api/portfolios/subdomain/:subdomain
// @access  Public
export const getPortfolioBySubdomain = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { subdomain } = req.params;

    // Find the portfolio
    const portfolio = await Portfolio.findOne({
      subdomain: subdomain.toLowerCase(),
      isPublished: true
    }).populate('templateId', 'name category');

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or not published'
      });
    }

    // Increment view count
    portfolio.viewCount = (portfolio.viewCount || 0) + 1;
    await portfolio.save();

    return res.status(200).json({
      success: true,
      portfolio
    });
  } catch (error: any) {
    console.error('Get portfolio by subdomain error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
