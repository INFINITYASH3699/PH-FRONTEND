import { Request, Response } from "express";
import mongoose from "mongoose";
import fs from "fs";
import Portfolio from "../models/Portfolio";
import Template from "../models/Template";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  CloudinaryUploadResult,
} from "../config/cloudinary";

// @desc    Create new portfolio
// @route   POST /api/portfolios
// @access  Private
export const createPortfolio = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { title, subtitle, subdomain, templateId, content } = req.body;

    // Validate required fields
    if (!title || !subdomain) {
      return res.status(400).json({
        success: false,
        message: "Title and subdomain are required",
      });
    }

    // Check if subdomain is already taken, but allow the user to reuse their own subdomain
    const existingPortfolio = await Portfolio.findOne({
      subdomain: subdomain.toLowerCase(),
      userId: { $ne: req.user.id }, // Exclude portfolios owned by the requesting user
    });

    if (existingPortfolio) {
      return res.status(400).json({
        success: false,
        message: "This subdomain is already taken",
      });
    }

    // Check if user already has a portfolio with this template
    if (templateId) {
      console.log(`Checking if user ${req.user.id} already has a portfolio with template ${templateId}`);
      const userTemplatePortfolio = await Portfolio.findOne({
        userId: req.user.id,
        templateId: templateId
      });

      console.log(`Result of template portfolio check:`, userTemplatePortfolio ? `Found portfolio with ID ${userTemplatePortfolio._id}` : 'No existing portfolio with this template');

      if (userTemplatePortfolio) {
        return res.status(400).json({
          success: false,
          message: "You already have a portfolio using this template. Please choose a different template.",
        });
      }
    }

    // Look for user's existing portfolio with the same subdomain
    const userExistingPortfolio = await Portfolio.findOne({
      subdomain: subdomain.toLowerCase(),
      userId: req.user.id,
    });

    // If user already has a portfolio with this subdomain, update it instead of creating a new one
    if (userExistingPortfolio) {
      userExistingPortfolio.title = title;
      userExistingPortfolio.subtitle = subtitle;
      userExistingPortfolio.templateId = templateId || null;
      userExistingPortfolio.content = content || {};
      userExistingPortfolio.isPublished = req.body.isPublished || false;

      // If this portfolio is being published, unpublish any other published portfolios
      if (userExistingPortfolio.isPublished) {
        await Portfolio.updateMany(
          { userId: req.user.id, isPublished: true, _id: { $ne: userExistingPortfolio._id } },
          { $set: { isPublished: false } }
        );
        console.log(`Unpublished all other portfolios for user ${req.user.id}`);
      }

      const updatedPortfolio = await userExistingPortfolio.save();

      return res.status(200).json({
        success: true,
        portfolio: updatedPortfolio,
        message: "Portfolio updated successfully",
      });
    }

    // Check if template exists if templateId is provided
    if (templateId) {
      const template = await Template.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }
    }

    // If this portfolio is being published, unpublish any other published portfolios
    if (req.body.isPublished) {
      await Portfolio.updateMany(
        { userId: req.user.id, isPublished: true },
        { $set: { isPublished: false } }
      );
      console.log(`Unpublished all other portfolios for user ${req.user.id}`);
    }

    // Create portfolio
    const portfolio = await Portfolio.create({
      title,
      subtitle,
      subdomain: subdomain.toLowerCase(),
      userId: req.user.id,
      templateId: templateId || null,
      content: content || {},
      isPublished: req.body.isPublished || false,
    });

    return res.status(201).json({
      success: true,
      portfolio,
    });
  } catch (error: any) {
    console.error("Create portfolio error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during portfolio creation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all portfolios for current user
// @route   GET /api/portfolios
// @access  Private
export const getUserPortfolios = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .populate("templateId", "name previewImage category");

    return res.status(200).json({
      success: true,
      count: portfolios.length,
      portfolios,
    });
  } catch (error: any) {
    console.error("Get user portfolios error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving portfolios",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get single portfolio by ID
// @route   GET /api/portfolios/:id
// @access  Private
export const getPortfolioById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const portfolio = await Portfolio.findById(req.params.id).populate(
      "templateId",
      "name previewImage category defaultStructure"
    );

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Check if user owns the portfolio or is admin
    if (
      portfolio.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this portfolio",
      });
    }

    return res.status(200).json({
      success: true,
      portfolio,
    });
  } catch (error: any) {
    console.error("Get portfolio error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving portfolio",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update portfolio
// @route   PUT /api/portfolios/:id
// @access  Private
export const updatePortfolio = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      title,
      subtitle,
      content,
      isPublished,
      customDomain,
      headerImage,
      galleryImages,
    } = req.body;

    // Find portfolio
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Check if user owns the portfolio
    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this portfolio",
      });
    }

    // If this portfolio is being published, unpublish any other published portfolios
    if (isPublished && !portfolio.isPublished) {
      await Portfolio.updateMany(
        { userId: req.user.id, isPublished: true, _id: { $ne: portfolio._id } },
        { $set: { isPublished: false } }
      );
      console.log(`Unpublished all other portfolios for user ${req.user.id}`);
    }

    // Update fields
    if (title) portfolio.title = title;
    if (subtitle !== undefined) portfolio.subtitle = subtitle;
    if (isPublished !== undefined) portfolio.isPublished = isPublished;
    if (customDomain !== undefined) portfolio.customDomain = customDomain;

    // Handle content updates - ensure proper merging
    if (content) {
      // Initialize portfolio.content if it doesn't exist
      if (!portfolio.content) {
        portfolio.content = {};
      }

      // Deep merge the content
      Object.keys(content).forEach((key) => {
        // Special handling for arrays in content to ensure they're completely replaced
        if (content[key] && typeof content[key] === "object") {
          // For objects that contain arrays like 'items', we need special handling
          if (content[key].items && Array.isArray(content[key].items)) {
          }

          // For objects that contain the 'categories' array property
          if (
            content[key].categories &&
            Array.isArray(content[key].categories)
          ) {
          }
        }

        // Use direct assignment to completely replace the content for this section
        portfolio.content[key] = JSON.parse(JSON.stringify(content[key]));
      });
    }

    // Handle header image update
    if (headerImage) {
      // If new header image is different from existing one
      if (
        !portfolio.headerImage ||
        portfolio.headerImage.url !== headerImage.url
      ) {
        // Delete old image if it exists
        if (portfolio.headerImage && portfolio.headerImage.publicId) {
          await deleteFromCloudinary(portfolio.headerImage.publicId);
        }
        portfolio.headerImage = headerImage;
      }
    } else if (headerImage === null && portfolio.headerImage) {
      // If headerImage is explicitly set to null, delete the existing one
      await deleteFromCloudinary(portfolio.headerImage.publicId);
      portfolio.headerImage = undefined;
    }

    // Handle gallery images update
    if (galleryImages) {
      // Identify existing images that are not in the new set
      const existingPublicIds =
        portfolio.galleryImages?.map((img) => img.publicId) || [];
      const newPublicIds = galleryImages.map((img: any) => img.publicId);

      const removedPublicIds = existingPublicIds.filter(
        (id) => !newPublicIds.includes(id)
      );

      // Delete removed images from Cloudinary
      for (const publicId of removedPublicIds) {
        await deleteFromCloudinary(publicId);
      }

      // Update with new gallery images
      portfolio.galleryImages = galleryImages;
    }

    // Use markModified to ensure MongoDB detects changes in the mixed Schema.Types.Mixed
    portfolio.markModified("content");

    // Save updated portfolio
    const updatedPortfolio = await portfolio.save();

    return res.status(200).json({
      success: true,
      portfolio: updatedPortfolio,
    });
  } catch (error: any) {
    console.error("Update portfolio error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating portfolio",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete portfolio
// @route   DELETE /api/portfolios/:id
// @access  Private
export const deletePortfolio = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Check if user owns the portfolio or is admin
    if (
      portfolio.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this portfolio",
      });
    }

    // Delete related images from Cloudinary
    if (portfolio.headerImage?.publicId) {
      await deleteFromCloudinary(portfolio.headerImage.publicId);
    }

    if (portfolio.galleryImages && portfolio.galleryImages.length > 0) {
      for (const image of portfolio.galleryImages) {
        if (image.publicId) {
          await deleteFromCloudinary(image.publicId);
        }
      }
    }

    await Portfolio.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Portfolio deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete portfolio error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting portfolio",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get public portfolio by subdomain
// @route   GET /api/portfolios/subdomain/:subdomain
// @access  Public
export const getPortfolioBySubdomain = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subdomain } = req.params;

    // Find the portfolio
    const portfolio = await Portfolio.findOne({
      subdomain: subdomain.toLowerCase(),
      isPublished: true,
    }).populate("templateId", "name category");

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found or not published",
      });
    }

    // Increment view count
    portfolio.viewCount = (portfolio.viewCount || 0) + 1;
    await portfolio.save();

    return res.status(200).json({
      success: true,
      portfolio,
    });
  } catch (error: any) {
    console.error("Get portfolio by subdomain error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving portfolio",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Upload portfolio image
// @route   POST /api/portfolios/:id/upload-image
// @access  Private
export const uploadPortfolioImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Get portfolio ID and image type from params
    const { id } = req.params;
    const { imageType } = req.body; // 'header' or 'gallery'

    if (!imageType || !["header", "gallery"].includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type. Must be "header" or "gallery"',
      });
    }

    // Find portfolio
    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Check if user owns the portfolio
    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this portfolio",
      });
    }

    // Get file path
    const filePath = req.file.path;

    // Define folder based on image type
    const folder = `portfolio-hub/portfolios/${id}/${imageType}`;

    // For header image, if we already have one, we'll replace it
    let existingPublicId = undefined;
    if (imageType === "header" && portfolio.headerImage) {
      existingPublicId = portfolio.headerImage.publicId;
    }

    // Upload to Cloudinary
    const cloudinaryResult: CloudinaryUploadResult = await uploadToCloudinary(
      filePath,
      folder,
      existingPublicId
    );

    // Delete local file after upload
    fs.unlinkSync(filePath);

    if (!cloudinaryResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to cloud storage",
        error: cloudinaryResult.error,
      });
    }

    // Update portfolio with new image
    if (imageType === "header" && cloudinaryResult.success) {
      // If we're not overwriting and there's an existing image with a different ID
      if (
        portfolio.headerImage?.publicId &&
        portfolio.headerImage.publicId !== cloudinaryResult.publicId
      ) {
        // Delete the old image
        await deleteFromCloudinary(portfolio.headerImage.publicId);
      }

      portfolio.headerImage = {
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
      };
    } else if (imageType === "gallery" && cloudinaryResult.success) {
      // Initialize gallery array if it doesn't exist
      if (!portfolio.galleryImages) {
        portfolio.galleryImages = [];
      }

      // Add new image to gallery
      portfolio.galleryImages.push({
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
      });
    }

    await portfolio.save();

    return res.status(200).json({
      success: true,
      message: `${imageType === "header" ? "Header" : "Gallery"} image uploaded successfully`,
      image: {
        url: cloudinaryResult.success ? cloudinaryResult.url : "",
        publicId: cloudinaryResult.success ? cloudinaryResult.publicId : "",
      },
    });
  } catch (error: any) {
    console.error("Portfolio image upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during image upload",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete portfolio image
// @route   DELETE /api/portfolios/:id/delete-image/:imageId
// @access  Private
export const deletePortfolioImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id, imageId } = req.params;
    const { imageType } = req.body; // 'header' or 'gallery'

    if (!imageType || !["header", "gallery"].includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type. Must be "header" or "gallery"',
      });
    }

    // Find portfolio
    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Check if user owns the portfolio
    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this portfolio",
      });
    }

    // Handle deletion based on image type
    if (imageType === "header") {
      if (
        !portfolio.headerImage ||
        portfolio.headerImage.publicId !== imageId
      ) {
        return res.status(404).json({
          success: false,
          message: "Header image not found",
        });
      }

      // Delete from Cloudinary
      await deleteFromCloudinary(imageId);

      // Remove from portfolio
      portfolio.headerImage = undefined;
    } else if (imageType === "gallery") {
      if (!portfolio.galleryImages || !portfolio.galleryImages.length) {
        return res.status(404).json({
          success: false,
          message: "Gallery is empty",
        });
      }

      // Find the image in gallery
      const imageIndex = portfolio.galleryImages.findIndex(
        (img) => img.publicId === imageId
      );
      if (imageIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Gallery image not found",
        });
      }

      // Delete from Cloudinary
      await deleteFromCloudinary(imageId);

      // Remove from gallery
      portfolio.galleryImages.splice(imageIndex, 1);
    }

    await portfolio.save();

    return res.status(200).json({
      success: true,
      message: `${imageType === "header" ? "Header" : "Gallery"} image deleted successfully`,
    });
  } catch (error: any) {
    console.error("Portfolio image deletion error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during image deletion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
