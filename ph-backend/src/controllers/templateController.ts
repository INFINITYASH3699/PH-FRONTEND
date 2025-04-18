import { Request, Response } from 'express';
import Template, { ITemplate } from '../models/Template';

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
export const getAllTemplates = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { category } = req.query;

    let query = {};

    // Filter by category if provided
    if (category) {
      query = { category, isPublished: true };
    } else {
      query = { isPublished: true };
    }

    const templates = await Template.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: templates.length,
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
      isPublished
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
      createdBy: req.user.id
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
      isPublished
    } = req.body;

    if (name) template.name = name;
    if (description) template.description = description;
    if (category) template.category = category;
    if (previewImage) template.previewImage = previewImage;
    if (defaultStructure) template.defaultStructure = defaultStructure;
    if (isPublished !== undefined) template.isPublished = isPublished;

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
