// Cloudinary configuration for frontend
// This file provides utilities for client-side uploads and signed uploads

// Check if we're using placeholder credentials
const isUsingPlaceholderCreds =
  !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhsovbumi';
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '411185747495248';
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio_hub';

// Function to get Cloudinary URL for client-side uploads
export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
};

/**
 * Upload a file to Cloudinary from the client-side
 * @param file - File object from input or drag-and-drop
 * @returns Cloudinary upload result
 */
export const uploadFileToCloudinary = async (file: File) => {
  try {
    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);

    // Upload to Cloudinary
    const response = await fetch(getCloudinaryUploadUrl(), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const result = await response.json();

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
 * Get a mock image URL for development
 * @param text - Text to display on the mock image
 * @param width - Width of the mock image
 * @param height - Height of the mock image
 * @returns URL for a placeholder image
 */
export const getMockImageUrl = (text = 'Portfolio+Image', width = 300, height = 300) => {
  return `https://via.placeholder.com/${width}x${height}?text=${text}`;
};

/**
 * Get Cloudinary optimization options for Next.js Image component
 */
export const getCloudinaryLoader = ({ src, width, quality }) => {
  // If it's not a Cloudinary URL, return the source unchanged
  if (!src.includes('res.cloudinary.com')) {
    return src;
  }

  const params = [
    'f_auto',
    'c_limit',
    `w_${width}`,
    `q_${quality || 75}`
  ];

  return `${src.split('/upload/')[0]}/upload/${params.join(',')}/v${src.split('/upload/v')[1]}`;
};

export const getCloudinaryConfig = () => {
  return {
    cloudName,
    apiKey,
    uploadPreset,
  };
};

export default {
  uploadFileToCloudinary,
  getMockImageUrl,
  getCloudinaryLoader,
  getCloudinaryConfig,
  getCloudinaryUploadUrl,
};
