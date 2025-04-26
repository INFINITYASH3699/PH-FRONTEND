import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

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

// --- TypeScript Types ---
type CloudinaryResourceType = "auto" | "image" | "video" | "raw";

// Success/failure types for upload
interface CloudinaryUploadSuccess {
  success: true;
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
}
interface CloudinaryUploadError {
  success: false;
  error: string;
}
export type CloudinaryUploadResult = CloudinaryUploadSuccess | CloudinaryUploadError;

// Success/failure types for delete
interface CloudinaryDeleteSuccess { success: true }
interface CloudinaryDeleteError { success: false; error: string }
export type CloudinaryDeleteResult = CloudinaryDeleteSuccess | CloudinaryDeleteError;

// --- Cloudinary setup ---
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

/**
 * Upload a file to Cloudinary
 * @param filePath - Path to the file (on disk)
 * @param folder - Folder in Cloudinary ("portfolio-hub" by default)
 * @param publicId - Optional publicId for the file in cloudinary
 * @param resourceType - "image" | "video" | "raw" | "auto" (defaults to "auto")
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'portfolio-hub',
  publicId?: string,
  resourceType: CloudinaryResourceType = "auto"
): Promise<CloudinaryUploadResult> => {
  try {
    // Config check
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('⚠️ Cloudinary configuration missing: uploadToCloudinary function aborted');
      return {
        success: false,
        error: 'Cloudinary is not properly configured. Please set the required environment variables.'
      };
    }

    if (!fs.existsSync(filePath)) {
      console.error(`⚠️ File not found at path: ${filePath}`);
      return { success: false, error: `File not found at path: ${filePath}` };
    }

    // Debug: Show file size
    try {
      const fileStats = fs.statSync(filePath);
      console.log(`Uploading: ${filePath} (${(fileStats.size / 1024).toFixed(2)} KB)`);
    } catch (e) {
      // fileStats is just for info so silently ignore
    }

    const uploadOptions = {
      folder,
      public_id: publicId,
      overwrite: !!publicId,
      resource_type: resourceType,
      timeout: 60_000,
    };

    // Upload (type-safe!)
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (cloudinaryError: any) {
    console.error('❌ Cloudinary upload error:', cloudinaryError);
    return {
      success: false,
      error: cloudinaryError?.message || 'Cloudinary upload failed',
    };
  } finally {
    // Clean up temporary file from disk
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Removed temp file ${filePath}`);
      }
    } catch (e) {
      console.warn('⚠️ Failed to remove temp file:', filePath, e);
    }
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId - Cloudinary public ID (NOT url!)
 */
export const deleteFromCloudinary = async (
  publicId: string,
): Promise<CloudinaryDeleteResult> => {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      return { success: false, error: 'Cloudinary is not properly configured.' };
    }
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return { success: true };
    } else {
      return {
        success: false,
        error: `Cloudinary deletion failed (status: ${result.result})`,
      };
    }
  } catch (error: any) {
    console.error("❌ Cloudinary delete error:", error);
    return {
      success: false,
      error: error?.message || 'Deletion failed',
    };
  }
};

export { cloudinary };