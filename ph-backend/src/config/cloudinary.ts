import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId - Public ID of the file to delete
 * @returns Deletion result
 */
export const deleteFromCloudinary = async (publicId: string): Promise<CloudinaryDeleteResult> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result === 'ok',
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deletion failed',
    };
  }
};

export { cloudinary };
