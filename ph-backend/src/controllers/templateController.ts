import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Template, { ITemplate } from '../models/Template';
import Portfolio from '../models/Portfolio';

/**
 * Get all templates
 * @route GET /api/templates
 * @access Public
 */
export const getAllTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      featured,
      search,
      sort = 'createdAt',
      limit = 10,
      page = 1
    } = req.query;

    const query: any = { isPublished: true };

    // Apply category filter
    if (category) {
      query.category = category;
    }

    // Apply featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Apply search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Determine sort order
    let sortOptions: any = {};
    switch (sort) {
      case 'popular':
        sortOptions = { usageCount: -1 };
        break;
      case 'rating':
        sortOptions = { 'rating.average': -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Convert limit and page to numbers
    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get templates with pagination
    const templates = await Template.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('name description category previewImage isFeatured rating tags usageCount createdAt previewImages')
      .lean();

    // Get total count for pagination
    const totalTemplates = await Template.countDocuments(query);

    // Return templates with pagination info
    res.status(200).json({
      success: true,
      count: templates.length,
      totalPages: Math.ceil(totalTemplates / limitNum),
      currentPage: pageNum,
      templates
    });
  } catch (error: any) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get template by ID
 * @route GET /api/templates/:id
 * @access Public
 */
export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid template ID'
      });
      return;
    }

    // Get template by ID
    const template = await Template.findById(id).lean();

    // Check if template exists
    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    // Check if template is published or user is creator/admin
    if (!template.isPublished &&
        (!req.user ||
         (template.createdBy && template.createdBy.toString() !== req.user.id &&
         req.user.role !== 'admin'))) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Template is not published'
      });
      return;
    }

    // Calculate usage count (optional refinement)
    const usageCount = await Portfolio.countDocuments({ templateId: id });

    // If usage count from DB is different than stored, update it
    if (usageCount !== template.usageCount) {
      await Template.findByIdAndUpdate(id, { usageCount });
      template.usageCount = usageCount;
    }

    res.status(200).json({
      success: true,
      template
    });
  } catch (error: any) {
    console.error('Error getting template by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Create a new template
 * @route POST /api/templates
 * @access Private (Admin)
 */
export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only admins can create templates'
      });
      return;
    }

    const {
      name,
      description,
      category,
      previewImage,
      defaultStructure,
      layouts,
      sectionDefinitions,
      themeOptions,
      componentMapping,
      customizationOptions,
      tags
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !previewImage) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, description, category, and previewImage'
      });
      return;
    }

    // Create new template
    const newTemplate = new Template({
      name,
      description,
      category,
      previewImage,
      defaultStructure: defaultStructure || {},
      layouts: layouts || [],
      sectionDefinitions: sectionDefinitions || {},
      themeOptions: themeOptions || {
        colorSchemes: [],
        fontPairings: [],
        spacing: {}
      },
      componentMapping: componentMapping || {},
      customizationOptions: customizationOptions || {
        colorSchemes: [],
        fontPairings: [],
        layouts: []
      },
      tags: tags || [],
      createdBy: req.user.id
    });

    // Save template to database
    const savedTemplate = await newTemplate.save();

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      template: savedTemplate
    });
  } catch (error: any) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update template by ID
 * @route PUT /api/templates/:id
 * @access Private (Admin or Creator)
 */
export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid template ID'
      });
      return;
    }

    // Get template by ID
    const template = await Template.findById(id);

    // Check if template exists
    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    // Check if user is admin or creator
    if (!req.user ||
        (template.createdBy && template.createdBy.toString() !== req.user.id &&
         req.user.role !== 'admin')) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only admins or template creators can update templates'
      });
      return;
    }

    // Fields to update
    const {
      name,
      description,
      category,
      previewImage,
      defaultStructure,
      isPublished,
      isFeatured,
      layouts,
      sectionDefinitions,
      themeOptions,
      componentMapping,
      customizationOptions,
      tags
    } = req.body;

    // Build update object
    const updateData: Partial<ITemplate> = {};

    // Add fields to update object if they exist
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (previewImage) updateData.previewImage = previewImage;
    if (defaultStructure) updateData.defaultStructure = defaultStructure;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (isFeatured !== undefined && req.user.role === 'admin') {
      updateData.isFeatured = isFeatured;
    }
    if (layouts) updateData.layouts = layouts;
    if (sectionDefinitions) updateData.sectionDefinitions = sectionDefinitions;
    if (themeOptions) updateData.themeOptions = themeOptions;
    if (componentMapping) updateData.componentMapping = componentMapping;
    if (customizationOptions) updateData.customizationOptions = customizationOptions;
    if (tags) updateData.tags = tags;

    // Update template
    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      template: updatedTemplate
    });
  } catch (error: any) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Delete template by ID
 * @route DELETE /api/templates/:id
 * @access Private (Admin or Creator)
 */
export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid template ID'
      });
      return;
    }

    // Get template by ID
    const template = await Template.findById(id);

    // Check if template exists
    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    // Check if user is admin or creator
    if (!req.user ||
        (template.createdBy && template.createdBy.toString() !== req.user.id &&
         req.user.role !== 'admin')) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only admins or template creators can delete templates'
      });
      return;
    }

    // Check if template is being used by any portfolios
    const portfoliosUsingTemplate = await Portfolio.countDocuments({ templateId: id });

    if (portfoliosUsingTemplate > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete template: It is being used by ${portfoliosUsingTemplate} portfolios`,
        usageCount: portfoliosUsingTemplate
      });
      return;
    }

    // Delete template
    await Template.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Add a review to a template
 * @route POST /api/templates/:id/reviews
 * @access Private
 */
export const addTemplateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid template ID'
      });
      return;
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
      return;
    }

    // Get template by ID
    const template = await Template.findById(id);

    // Check if template exists
    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    // Check if user has already reviewed this template
    const alreadyReviewed = template.reviews.find(
      review => review.userId.toString() === req.user.id
    );

    if (alreadyReviewed) {
      res.status(400).json({
        success: false,
        message: 'You have already reviewed this template'
      });
      return;
    }

    // Create new review
    const newReview = {
      userId: new mongoose.Types.ObjectId(req.user.id),
      rating,
      comment: comment || '',
      createdAt: new Date()
    };

    // Add review to template
    template.reviews.push(newReview);

    // Calculate new average rating
    const totalRating = template.reviews.reduce((sum, review) => sum + review.rating, 0);
    template.rating.average = Math.round((totalRating / template.reviews.length) * 10) / 10;
    template.rating.count = template.reviews.length;

    // Save template
    await template.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: newReview,
      newRating: template.rating
    });
  } catch (error: any) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get category statistics
 * @route GET /api/templates/stats/categories
 * @access Public
 */
export const getTemplateStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get count by category
    const categoryCounts = await Template.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get most popular templates
    const popularTemplates = await Template.find({ isPublished: true })
      .sort({ usageCount: -1 })
      .limit(5)
      .select('name category usageCount rating')
      .lean();

    // Get highest rated templates
    const highestRatedTemplates = await Template.find({
      isPublished: true,
      'rating.count': { $gte: 3 } // Only consider templates with at least 3 ratings
    })
      .sort({ 'rating.average': -1 })
      .limit(5)
      .select('name category rating')
      .lean();

    // Get featured templates count
    const featuredCount = await Template.countDocuments({
      isPublished: true,
      isFeatured: true
    });

    // Get total templates count
    const totalCount = await Template.countDocuments({ isPublished: true });

    res.status(200).json({
      success: true,
      stats: {
        totalTemplates: totalCount,
        featuredTemplates: featuredCount,
        categoryCounts,
        popularTemplates,
        highestRatedTemplates
      }
    });
  } catch (error: any) {
    console.error('Error getting template stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
