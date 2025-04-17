import { v2 as cloudinary } from 'cloudinary';

// Verify environment variables
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary environment variables. File uploads will not work.');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or file path
 * @param options - Upload options
 * @returns Promise with upload result
 */
export async function uploadFile(file: string | Buffer, options: any = {}) {
  try {
    const defaultOptions = {
      resource_type: 'auto',
      folder: 'portfoliohub',
    };

    const result = await cloudinary.uploader.upload(file, {
      ...defaultOptions,
      ...options,
    });

    return {
      success: true,
      data: result,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Delete a file from Cloudinary by public ID
 * @param publicId - The public ID of the file to delete
 * @returns Promise with deletion result
 */
export async function deleteFile(publicId: string, options: any = {}) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, options);
    return {
      success: result === 'ok',
      data: result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error',
    };
  }
}

/**
 * Generate a URL with transformations
 * @param publicId - The public ID of the image
 * @param options - Transformation options
 * @returns Transformed image URL
 */
export function generateImageUrl(publicId: string, options: any = {}) {
  const defaultOptions = {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
  };

  return cloudinary.url(publicId, {
    ...defaultOptions,
    ...options,
  });
}

export { cloudinary };
