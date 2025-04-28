import { Request, Response } from "express";
import mongoose from "mongoose";
import fs from "fs";
import Portfolio from "../models/Portfolio";
import Template from "../models/Template";
import User from "../models/User";
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
    const {
      title,
      subtitle,
      subdomain,
      templateId,
      content,
      activeLayout,
      activeColorScheme,
      activeFontPairing,
      sectionVariants,
      animationsEnabled,
      stylePreset,
      sectionOrder
    } = req.body;


    // Validate required fields
    if (!title || !subdomain) {
      return res.status(400).json({
        success: false,
        message: "Title and subdomain are required",
      });
    }

    // Get user to check subscription plan
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is on a free plan - if so, they can only use their username as subdomain
    const isFreePlan = user.subscriptionPlan?.type === "free";
    const isPremiumPlan =
      user.subscriptionPlan?.type === "premium" ||
      user.subscriptionPlan?.type === "professional";
    const hasMultiplePortfoliosFeature =
      isPremiumPlan && user.subscriptionPlan?.features?.multiplePortfolios;

    if (isFreePlan && subdomain.toLowerCase() !== user.username.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message:
          "Free plan users can only use their username as subdomain. Upgrade to a paid plan to use custom subdomains.",
      });
    }

    // Check if subdomain is already taken by another user
    const existingPortfolio = await Portfolio.findOne({
      subdomain: subdomain.toLowerCase(),
      userId: { $ne: req.user.id }, // Exclude portfolios owned by the requesting user
    });

    if (existingPortfolio) {
      return res.status(400).json({
        success: false,
        message: "This subdomain is already taken by another user",
      });
    }

    // Check if template exists if templateId is provided
    let template: any = null;
    if (templateId) {
      template = await Template.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      if (content) {
        // If template exists but structure is missing needed elements, initialize them
        if (!template.sectionDefinitions) {
          console.warn(`Template ${template.name} (${template._id}) has no sectionDefinitions, initializing empty object`);
          template.sectionDefinitions = {};
        }

        if (!template.layouts || !Array.isArray(template.layouts) || template.layouts.length === 0) {
          console.warn(`Template ${template.name} (${template._id}) has no layouts, initializing default layout`);

          // Create a default layout for templates that are missing it
          template.layouts = [{
            id: 'default',
            name: 'Standard Layout',
            structure: {
              sections: ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact'],
              gridSystem: '12-column',
              spacing: { base: 8, multiplier: 1.5 }
            }
          }];
        }

        // Now we can continue with portfolio creation
      }
    }

    // Initialize portfolioOrder to 0 (default/main portfolio)
    let portfolioOrder = 0;

    // If this portfolio is being published, handle publishing rules based on subscription plan
    if (req.body.isPublished) {
      // For free plan users, automatically unpublish any existing published portfolio
      if (isFreePlan) {
        const existingPublishedPortfolio = await Portfolio.findOne({
          userId: req.user.id,
          isPublished: true,
        });

        if (existingPublishedPortfolio) {
          // Automatically unpublish the existing portfolio
          await Portfolio.updateOne(
            { _id: existingPublishedPortfolio._id },
            { $set: { isPublished: false } }
          );

        }
      } else if (hasMultiplePortfoliosFeature) {
        // For premium users with multiple portfolios feature
        // Check if there are existing published portfolios with the same base subdomain
        const existingPublishedPortfolios = await Portfolio.find({
          userId: req.user.id,
          subdomain: subdomain.toLowerCase(),
          isPublished: true,
        }).sort({ portfolioOrder: -1 }); // Get in descending order to find highest order

        if (existingPublishedPortfolios.length > 0) {
          // If there are existing published portfolios with the same subdomain,
          // set the portfolioOrder to be one higher than the highest existing order
          portfolioOrder =
            (existingPublishedPortfolios[0]?.portfolioOrder || 0) + 1;

        }
      } else {
        // For paid plans without multiple portfolios feature, unpublish other portfolios with the same subdomain
        await Portfolio.updateMany(
          {
            userId: req.user.id,
            subdomain: subdomain.toLowerCase(),
            isPublished: true,
          },
          { $set: { isPublished: false } }
        );
      }
    }

    const newPortfolio = new Portfolio({
      title,
      subtitle,
      subdomain: subdomain.toLowerCase(),
      userId: req.user.id,
      templateId: templateId || null,
      content: content || {},
      isPublished: req.body.isPublished || false,
      portfolioOrder: portfolioOrder,
      activeLayout: activeLayout || 'default',
      activeColorScheme: activeColorScheme || 'default',
      activeFontPairing: activeFontPairing || 'default',
      sectionVariants: sectionVariants || {},
      animationsEnabled: animationsEnabled !== undefined ? animationsEnabled : true,
      stylePreset: stylePreset || 'modern',
      sectionOrder: sectionOrder || []
    });

    // Save the new portfolio
    const savedPortfolio = await newPortfolio.save();


    return res.status(201).json({
      success: true,
      portfolio: savedPortfolio,
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
      subdomain,
      content,
      isPublished,
      customDomain,
      headerImage,
      galleryImages,
      activeLayout,
      activeColorScheme,
      activeFontPairing,
      sectionVariants,
      animationsEnabled,
      stylePreset,
      sectionOrder,
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

    // Get user to check subscription plan
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is on a free plan
    const isFreePlan = user.subscriptionPlan?.type === "free";
    const isPremiumPlan =
      user.subscriptionPlan?.type === "premium" ||
      user.subscriptionPlan?.type === "professional";
    const hasMultiplePortfoliosFeature =
      isPremiumPlan && user.subscriptionPlan?.features?.multiplePortfolios;

    // If subdomain is being changed
    if (subdomain && subdomain.toLowerCase() !== portfolio.subdomain) {
      // Free plan users can only use their username as subdomain
      if (
        isFreePlan &&
        subdomain.toLowerCase() !== user.username.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Free plan users can only use their username as subdomain. Upgrade to a paid plan to use custom subdomains.",
        });
      }

      // Check if the new subdomain is taken by another user
      const existingPortfolio = await Portfolio.findOne({
        subdomain: subdomain.toLowerCase(),
        userId: { $ne: req.user.id },
      });

      if (existingPortfolio) {
        return res.status(400).json({
          success: false,
          message: "This subdomain is already taken by another user",
        });
      }

      // If changing subdomain and portfolio is published, need to handle portfolioOrder
      if (portfolio.isPublished && hasMultiplePortfoliosFeature) {
        // Reset portfolioOrder to 0 for the first portfolio with the new subdomain
        const existingPortfoliosWithNewSubdomain = await Portfolio.find({
          userId: req.user.id,
          subdomain: subdomain.toLowerCase(),
          isPublished: true,
          _id: { $ne: portfolio._id },
        }).sort({ portfolioOrder: -1 });

        if (existingPortfoliosWithNewSubdomain.length > 0) {
          // If there are existing published portfolios with the new subdomain,
          // set the portfolioOrder to be one higher than the highest existing order
          portfolio.portfolioOrder =
            (existingPortfoliosWithNewSubdomain[0]?.portfolioOrder || 0) + 1;
        } else {
          // If no existing portfolios with this subdomain, reset to 0
          portfolio.portfolioOrder = 0;
        }
      }

      // Update the subdomain
      portfolio.subdomain = subdomain.toLowerCase();
    }

    // If this portfolio is being published
    if (isPublished === true && !portfolio.isPublished) {
      // For free plan users, automatically unpublish their existing published portfolio
      if (isFreePlan) {
        const existingPublishedPortfolio = await Portfolio.findOne({
          userId: req.user.id,
          isPublished: true,
          _id: { $ne: portfolio._id },
        });

        if (existingPublishedPortfolio) {
          // Automatically unpublish the existing portfolio
          await Portfolio.updateOne(
            { _id: existingPublishedPortfolio._id },
            { $set: { isPublished: false } }
          );

        }
      } else if (hasMultiplePortfoliosFeature) {
        // For premium users with multiple portfolios feature
        // If publishing a portfolio, determine its portfolioOrder based on existing portfolios
        const existingPublishedPortfolios = await Portfolio.find({
          userId: req.user.id,
          subdomain: portfolio.subdomain,
          isPublished: true,
          _id: { $ne: portfolio._id },
        }).sort({ portfolioOrder: -1 });

        if (existingPublishedPortfolios.length > 0) {
          // Set the portfolioOrder to be one higher than the highest existing order
          portfolio.portfolioOrder =
            (existingPublishedPortfolios[0]?.portfolioOrder || 0) + 1;
     
        } else {
          // If no other published portfolios with this subdomain, set to 0
          portfolio.portfolioOrder = 0;
        }
      } else {


        await Portfolio.updateMany(
          {
            userId: req.user.id,
            subdomain: portfolio.subdomain,
            isPublished: true,
            _id: { $ne: portfolio._id },
          },
          { $set: { isPublished: false } }
        );
      }
    } else if (
      isPublished === false &&
      portfolio.isPublished &&
      hasMultiplePortfoliosFeature
    ) {
      // If a portfolio is being unpublished, we need to reorder other portfolios
      // Find all published portfolios with the same subdomain, ordered by portfolioOrder
      const publishedPortfolios = await Portfolio.find({
        userId: req.user.id,
        subdomain: portfolio.subdomain,
        isPublished: true,
        _id: { $ne: portfolio._id },
      }).sort({ portfolioOrder: 1 });

      // Reorder the remaining published portfolios
      for (let i = 0; i < publishedPortfolios.length; i++) {
        // Skip if the order doesn't need to change
        if (publishedPortfolios[i].portfolioOrder === i) continue;

        await Portfolio.updateOne(
          { _id: publishedPortfolios[i]._id },
          { $set: { portfolioOrder: i } }
        );

      }
    }

    // Update fields
    if (title) portfolio.title = title;
    if (subtitle !== undefined) portfolio.subtitle = subtitle;
    if (isPublished !== undefined) portfolio.isPublished = isPublished;

    // Handle content updates properly
    if (content) {
      // Ensure we merge the content object properly rather than overwrite it
      portfolio.content = {
        ...(typeof portfolio.content === "object" ? portfolio.content : {}),
        ...content,
      };
    }

    // Add handling for customization fields
    if (activeLayout !== undefined) portfolio.activeLayout = activeLayout;
    if (activeColorScheme !== undefined) portfolio.activeColorScheme = activeColorScheme;
    if (activeFontPairing !== undefined) portfolio.activeFontPairing = activeFontPairing;
    if (sectionVariants !== undefined) portfolio.sectionVariants = sectionVariants;
    if (animationsEnabled !== undefined) portfolio.animationsEnabled = animationsEnabled;
    if (stylePreset !== undefined) portfolio.stylePreset = stylePreset;
    if (sectionOrder !== undefined) portfolio.sectionOrder = sectionOrder;

    // Update custom domain if provided, or reset it if empty string
    if (customDomain !== undefined) {
      // Check if attempting to set a custom domain
      if (customDomain && customDomain.trim() !== "") {
        // Verify if user has paid plan with custom domain feature
        const hasCustomDomainFeature =
          user.subscriptionPlan?.type !== "free" &&
          user.subscriptionPlan?.isActive &&
          user.subscriptionPlan?.features?.customDomain;

        if (!hasCustomDomainFeature) {
          return res.status(402).json({
            success: false,
            message:
              "Custom domains are only available in paid plans. Please upgrade your subscription to use this feature.",
            portfolio: portfolio,
          });
        }

        // Validate the domain format
        const domainRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
        if (!domainRegex.test(customDomain)) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid domain name (e.g., example.com).",
            portfolio: portfolio,
          });
        }

        // Check if domain is already in use
        const existingPortfolioWithDomain = await Portfolio.findOne({
          customDomain: customDomain.toLowerCase(),
          _id: { $ne: portfolio._id },
        });

        if (existingPortfolioWithDomain) {
          return res.status(400).json({
            success: false,
            message:
              "This domain is already in use. Please choose a different one.",
            portfolio: portfolio,
          });
        }
      }

      // If we reach here, either the domain is empty (removing it) or valid and available
      portfolio.customDomain = customDomain
        ? customDomain.toLowerCase()
        : undefined;
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
    portfolio.markModified("sectionVariants");

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

// @desc    Get public portfolio by subdomain or custom domain
// @route   GET /api/portfolios/subdomain/:subdomain
// @access  Public
export const getPortfolioBySubdomain = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subdomain } = req.params;
    const customDomain = req.query.customDomain as string | undefined;
    const portfolioOrder = req.query.order
      ? parseInt(req.query.order as string)
      : undefined;


    let portfolio: any = null;

    // If customDomain is provided, try to find by custom domain first
    if (customDomain) {
      portfolio = await Portfolio.findOne({
        customDomain: customDomain.toLowerCase(),
        isPublished: true,
      })
        .populate("templateId", "name category defaultStructure layouts themeOptions animations sectionVariants stylePresets")
        .lean();
      if (portfolio) {
      }
    }

    // If not found by custom domain or no custom domain provided, look for published portfolio with subdomain
    if (!portfolio) {
      // Parse the subdomain for a possible number suffix (e.g. username-2)
      let baseSubdomain = subdomain.toLowerCase();
      let orderFromSubdomain: number | undefined = undefined;

      // Regex: match "something" or "something-2"
      const subdomainMatch = subdomain.match(/^(.*?)(?:-(\d+))?$/);
      if (subdomainMatch) {
        baseSubdomain = subdomainMatch[1].toLowerCase();
        if (subdomainMatch[2]) {
          orderFromSubdomain = parseInt(subdomainMatch[2]);
        }
      }


      // Prefer order in URL, then ?order= param, then 0
      let targetOrder = 0;
      if (orderFromSubdomain !== undefined) {
        targetOrder = orderFromSubdomain;
      } else if (portfolioOrder !== undefined) {
        targetOrder = portfolioOrder;
      }

      // First try to find by exact order number
      portfolio = await Portfolio.findOne({
        subdomain: baseSubdomain,
        portfolioOrder: targetOrder,
        isPublished: true,
      })
        .populate("templateId", "name category defaultStructure layouts themeOptions animations sectionVariants stylePresets")
        .lean();



      // If not found and no specific order was requested, get the default (order 0) or any published portfolio
      if (!portfolio) {
        // Try with exact order 0 first (main portfolio)
        portfolio = await Portfolio.findOne({
          subdomain: baseSubdomain,
          portfolioOrder: 0,
          isPublished: true,
        })
          .populate("templateId", "name category defaultStructure layouts themeOptions animations sectionVariants stylePresets")
          .lean();


        // If still not found, find any published portfolio with this subdomain
        if (!portfolio) {
          // Look for any published portfolio with this subdomain
          const allPortfolios = await Portfolio.find({
            subdomain: baseSubdomain,
            isPublished: true,
          }).sort({ portfolioOrder: 1 }); // Sort by order


          if (allPortfolios.length > 0) {
            // Get the first one in the list (lowest portfolioOrder)
            portfolio = await Portfolio.findOne({
              _id: allPortfolios[0]._id,
            })
              .populate("templateId", "name category defaultStructure layouts themeOptions animations sectionVariants stylePresets")
              .lean();

          } else {

          }
        }
      }
    }


    // Ensure template data is properly populated
    if (portfolio.templateId && typeof portfolio.templateId === "string") {
      // If templateId is just a string (not populated), fetch the template data
      const template = await Template.findById(
        portfolio.templateId,
        "name category defaultStructure layouts themeOptions animations sectionVariants stylePresets"
      );
      if (template) {
        portfolio.templateId = template;
      } else {
        console.warn(`Template with ID ${portfolio.templateId} not found`);
      }
    }

    // Increment view count
    portfolio.viewCount = (portfolio.viewCount || 0) + 1;
    // Save updated view count
    await Portfolio.updateOne(
      { _id: portfolio._id },
      { $set: { viewCount: portfolio.viewCount } }
    );



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
      console.error('No file found in request');
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }


    // Get portfolio ID and image type from params
    const { id } = req.params;
    const { imageType } = req.body; // 'header' or 'gallery' or 'project'

    // Map frontend image types to backend types for validation
    let validImageType = imageType;
    if (imageType === 'profile') {
      validImageType = 'header';
    } else if (imageType === 'work' || imageType === 'about') {
      validImageType = 'project';
    }


    if (!validImageType || ![
      "header", "gallery", "project", "thumbnail", "work", "temp"
    ].includes(validImageType.toLowerCase())) {
      console.error(`Invalid image type: ${imageType} (mapped to ${validImageType})`);
      return res.status(400).json({
        success: false,
        message: 'Invalid image type. Must be "header", "gallery", "project", "thumbnail", or "work"',
      });
    }

    // Find portfolio - wrap in try/catch to handle errors gracefully
    let portfolio = null;
    try {
      if (id !== 'temp') {
        portfolio = await Portfolio.findById(id);
      }
    } catch (findError) {
      console.error(`Error finding portfolio with ID ${id}:`, findError);
      // Continue with isTempUpload logic below instead of failing
    }

    // Special handling for 'temp' ID or project images
    const isTempUpload = id === 'temp' ||
                        validImageType === 'project' ||
                        validImageType === 'work' ||
                        validImageType === 'thumbnail';

    // For project images, we don't need a valid portfolio as these are standalone images
    if (!portfolio && !isTempUpload) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Get file path
    const filePath = req.file.path;

    // Define folder based on image type and whether this is a temp upload
    const folder = isTempUpload
      ? `portfolio-hub/temp-uploads/${validImageType.toLowerCase()}`
      : `portfolio-hub/portfolios/${id}/${validImageType.toLowerCase()}`;

    // For header image, if we already have one, we'll replace it
    let existingPublicId = undefined;
    if (validImageType === "header" && portfolio?.headerImage) {
      existingPublicId = portfolio.headerImage.publicId;
    }


    // Upload to Cloudinary
    const cloudinaryResult: CloudinaryUploadResult = await uploadToCloudinary(
      filePath,
      folder,
      existingPublicId
    );

    // Delete local file after upload - handled in uploadToCloudinary, so no need to do it here

    if (!cloudinaryResult.success) {
      console.error('Cloudinary upload failed:', cloudinaryResult.error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to cloud storage",
        error: cloudinaryResult.error,
      });
    }

    // Only update portfolio if it exists and we're not doing a temp upload
    if (portfolio && !isTempUpload) {
      // Update portfolio with new image
      if (validImageType === "header" && cloudinaryResult.success) {
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
      } else if (validImageType === "gallery" && cloudinaryResult.success) {
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

      // Save portfolio if we modified it
      await portfolio.save();
    }

    // Always return a successful response with the image data
    return res.status(200).json({
      success: true,
      message: `${
        validImageType === "header"
          ? "Header"
          : validImageType === "gallery"
          ? "Gallery"
          : "Project"
      } image uploaded successfully`,
      image: {
        url: cloudinaryResult.success ? cloudinaryResult.url : "",
        publicId: cloudinaryResult.success ? cloudinaryResult.publicId : "",
      },
    });
  } catch (error: any) {
    console.error("Portfolio image upload error:", error);
    // Make sure to delete any temporary file if upload failed
    try {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
    } catch (unlinkError) {
      console.warn(`Failed to delete temporary file: ${req.file?.path || 'unknown'}`, unlinkError);
    }

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
      message: `${
        imageType === "header" ? "Header" : "Gallery"
      } image deleted successfully`,
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
