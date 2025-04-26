import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Validate Cloudinary configuration
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('⚠️ Cloudinary configuration is incomplete. Image uploads will fail.');
  console.error('Please ensure the following environment variables are set:');
  console.error('- CLOUDINARY_CLOUD_NAME');
  console.error('- CLOUDINARY_API_KEY');
  console.error('- CLOUDINARY_API_SECRET');
} else {
  console.log(`✅ Cloudinary configured with cloud name: ${cloudName}`);
}

// Success response interface for Cloudinary upload
interface CloudinaryUploadSuccess {
  success: true;
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
}

// Error response interface for Cloudinary upload
interface CloudinaryUploadError {
  success: false;
  error: string;
}

// Combined type for Cloudinary upload response
export type CloudinaryUploadResult = CloudinaryUploadSuccess | CloudinaryUploadError;

// Success response interface for Cloudinary delete
interface CloudinaryDeleteSuccess {
  success: true;
}

// Error response interface for Cloudinary delete
interface CloudinaryDeleteError {
  success: false;
  error: string;
}

// Combined type for Cloudinary delete response
export type CloudinaryDeleteResult = CloudinaryDeleteSuccess | CloudinaryDeleteError;

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

/**
 * Upload a file to Cloudinary
 * @param filePath - Path to the file or base64 string
 * @param folder - Destination folder in Cloudinary
 * @param publicId - Optional public ID for the file
 * @returns Cloudinary upload result
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'portfolio-hub',
  publicId?: string
): Promise<CloudinaryUploadResult> => {
  try {
    // Check if Cloudinary is properly configured
    if (!cloudName || !apiKey || !apiSecret) {
      return {
        success: false,
        error: 'Cloudinary is not properly configured. Please set the required environment variables.'
      };
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: `File not found at path: ${filePath}`
      };
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      public_id: publicId,
      overwrite: !!publicId,
      resource_type: 'auto',
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  } finally {
    // Clean up - try to remove the temp file if it exists
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Temporary file removed: ${filePath}`);
      }
    } catch (e) {
      console.error('Error removing temporary file:', e);
    }
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId - Public ID of the file to delete
 * @returns Deletion result
 */
export const deleteFromCloudinary = async (
  publicId: string
): Promise<CloudinaryDeleteResult> => {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      return {
        success: false,
        error: 'Cloudinary is not properly configured. Please set the required environment variables.'
      };
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result === 'ok') {
      return { success: true };
    } else {
      return {
        success: false,
        error: `Cloudinary deletion failed (status: ${result})`,
      };
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deletion failed',
    };
  }
};

export { cloudinary };
