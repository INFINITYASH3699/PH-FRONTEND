import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file to Cloudinary
 * @param file - File buffer
 * @param folder - Destination folder in Cloudinary
 * @param publicId - Optional public ID for the file
 * @returns Cloudinary upload result
 */
export const uploadToCloudinary = async (
  file: Buffer,
  folder: string = 'portfolio-hub',
  publicId?: string
) => {
  try {
    // Convert buffer to base64
    const fileStr = `data:image/jpeg;base64,${file.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileStr, {
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
export const deleteFromCloudinary = async (publicId: string) => {
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
}

export { cloudinary };
