import { Request, Response } from 'express';
import Template, { ITemplate } from '../models/Template';
import User from '../models/User';
import mongoose from 'mongoose';

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
export const getAllTemplates = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      category,
      sort,
      featured,
      tags,
      search,
      limit = 20,
      page = 1
    } = req.query;

    let query: any = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Filter by published status
    query.isPublished = true;

    // Filter by featured status
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Filter by tags
    if (tags) {
      const tagList = (tags as string).split(',');
      query.tags = { $in: tagList };
    }

    // Search by query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'popular':
          sortOption = { usageCount: -1 };
          break;
        case 'rating':
          sortOption = { 'rating.average': -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      // Default sort order
      sortOption = { createdAt: -1 };
    }

    // Count total templates (for pagination)
    const total = await Template.countDocuments(query);

    // Get templates
    const templates = await Template.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      count: templates.length,
      total,
      totalPages,
      currentPage: pageNum,
      hasNextPage,
      hasPrevPage,
      templates
    });
  } catch (error: any) {
    console.error('Get templates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving templates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get template by ID
// @route   GET /api/templates/:id
// @access  Public
export const getTemplateById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Increment view count (not stored yet in schema, but could be added)
    // await Template.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    return res.status(200).json({
      success: true,
      template
    });
  } catch (error: any) {
    console.error('Get template error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create a new template
// @route   POST /api/templates
// @access  Private/Admin
export const createTemplate = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create templates'
      });
    }

    const {
      name,
      description,
      category,
      previewImage,
      defaultStructure,
      isPublished,
      tags,
      previewImages,
      customizationOptions
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !previewImage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create template
    const template = await Template.create({
      name,
      description,
      category,
      previewImage,
      defaultStructure: defaultStructure || {},
      isPublished: isPublished !== undefined ? isPublished : false,
      createdBy: req.user.id,
      tags: tags || [],
      previewImages: previewImages || [],
      customizationOptions: customizationOptions || {
        colorSchemes: [],
        fontPairings: [],
        layouts: []
      }
    });

    return res.status(201).json({
      success: true,
      template
    });
  } catch (error: any) {
    console.error('Create template error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private/Admin
export const updateTemplate = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update templates'
      });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Update fields
    const {
      name,
      description,
      category,
      previewImage,
      defaultStructure,
      isPublished,
      isFeatured,
      tags,
      previewImages,
      customizationOptions
    } = req.body;

    if (name) template.name = name;
    if (description) template.description = description;
    if (category) template.category = category;
    if (previewImage) template.previewImage = previewImage;
    if (defaultStructure) template.defaultStructure = defaultStructure;
    if (isPublished !== undefined) template.isPublished = isPublished;
    if (isFeatured !== undefined) template.isFeatured = isFeatured;
    if (tags) template.tags = tags;
    if (previewImages) template.previewImages = previewImages;
    if (customizationOptions) template.customizationOptions = customizationOptions;

    // Save updated template
    const updatedTemplate = await template.save();

    return res.status(200).json({
      success: true,
      template: updatedTemplate
    });
  } catch (error: any) {
    console.error('Update template error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private/Admin
export const deleteTemplate = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete templates'
      });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    await Template.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete template error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get featured templates
// @route   GET /api/templates/featured
// @access  Public
export const getFeaturedTemplates = async (req: Request, res: Response): Promise<Response> => {
  try {
    const templates = await Template.find({
      isPublished: true,
      isFeatured: true
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error: any) {
    console.error('Get featured templates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving featured templates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Rate a template
// @route   POST /api/templates/:id/rate
// @access  Private
export const rateTemplate = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if user has already rated this template
    const existingReviewIndex = template.reviews.findIndex(
      review => review.userId.toString() === req.user.id.toString()
    );

    if (existingReviewIndex >= 0) {
      // Update existing review
      template.reviews[existingReviewIndex].rating = rating;

      if (comment) {
        template.reviews[existingReviewIndex].comment = comment;
      }

      template.reviews[existingReviewIndex].createdAt = new Date();
    } else {
      // Add new review
      template.reviews.push({
        userId: req.user.id,
        rating,
        comment: comment || '',
        createdAt: new Date()
      });
    }

    // Calculate new average rating
    const totalRating = template.reviews.reduce((sum, review) => sum + review.rating, 0);
    template.rating = {
      average: parseFloat((totalRating / template.reviews.length).toFixed(1)),
      count: template.reviews.length
    };

    await template.save();

    return res.status(200).json({
      success: true,
      template
    });
  } catch (error: any) {
    console.error('Rate template error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error rating template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get template reviews
// @route   GET /api/templates/:id/reviews
// @access  Public
export const getTemplateReviews = async (req: Request, res: Response): Promise<Response> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Get user details for the reviews
    const reviewsWithUserDetails = await Promise.all(
      template.reviews.map(async (review) => {
        try {
          const user = await User.findById(review.userId, 'fullName username profilePicture');
          return {
            userId: review.userId,
            userName: user ? user.fullName : 'Unknown User',
            userAvatar: user ? user.profilePicture : '',
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt
          };
        } catch (error) {
          return {
            userId: review.userId,
            userName: 'Unknown User',
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      reviews: reviewsWithUserDetails
    });
  } catch (error: any) {
    console.error('Get template reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving template reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add or remove template from favorites
// @route   POST /api/templates/:id/favorite
// @access  Private
export const toggleFavoriteTemplate = async (req: Request, res: Response): Promise<Response> => {
  try {
    const templateId = req.params.id;
    const userId = req.user.id;
    const { isFavorite } = req.body;

    // Validate template existence
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Update user's favorites directly using MongoDB operations
    if (isFavorite) {
      // Add to favorites using $addToSet to prevent duplicates
      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { favoriteTemplates: new mongoose.Types.ObjectId(templateId) }
        },
        { new: true }
      );
    } else {
      // Remove from favorites
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: { favoriteTemplates: new mongoose.Types.ObjectId(templateId) }
        },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: isFavorite
        ? 'Template added to favorites'
        : 'Template removed from favorites'
    });
  } catch (error: any) {
    console.error('Toggle favorite template error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating favorite status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's favorite templates
// @route   GET /api/templates/favorites
// @access  Private
export const getFavoriteTemplates = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user.id;

    // Find user and populate favoriteTemplates
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user has no favorites or the field doesn't exist
    if (!user.favoriteTemplates || user.favoriteTemplates.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        templates: []
      });
    }

    // Fetch templates manually
    const templates = await Template.find({
      _id: { $in: user.favoriteTemplates },
      isPublished: true
    });

    return res.status(200).json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error: any) {
    console.error('Get favorite templates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving favorite templates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Increment template usage count
// @route   POST /api/templates/:id/use
// @access  Private
export const incrementTemplateUsage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Increment usage count
    template.usageCount = (template.usageCount || 0) + 1;
    await template.save();

    return res.status(200).json({
      success: true,
      message: 'Template usage count incremented',
      usageCount: template.usageCount
    });
  } catch (error: any) {
    console.error('Increment template usage error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating template usage',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
