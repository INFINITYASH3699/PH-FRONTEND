import { v2 as cloudinary } from 'cloudinary';

// Check if we're using placeholder credentials
const isUsingPlaceholderCreds =
  process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' ||
  process.env.CLOUDINARY_API_KEY === 'placeholder' ||
  process.env.CLOUDINARY_API_SECRET === 'placeholder';

const isDevelopmentMode = process.env.NODE_ENV === 'development';

// Configure Cloudinary with your credentials
if (!isUsingPlaceholderCreds) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn('Using placeholder Cloudinary credentials. File operations will be mocked.');
}

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
  // Return mock data for development with placeholder credentials
  if (isDevelopmentMode && isUsingPlaceholderCreds) {
    console.log('DEV MODE: Mocking Cloudinary upload');
    // Generate a random ID for the mock upload
    const mockId = publicId || `dev_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      url: `https://via.placeholder.com/300?text=Mocked+Upload`,
      publicId: mockId,
      format: 'jpg',
      width: 300,
      height: 300,
    };
  }

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
  // Return mock success for development with placeholder credentials
  if (isDevelopmentMode && isUsingPlaceholderCreds) {
    console.log(`DEV MODE: Mocking Cloudinary delete for ${publicId}`);
    return {
      success: true,
    };
  }

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
