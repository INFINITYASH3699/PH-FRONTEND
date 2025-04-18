"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Configure Cloudinary
cloudinary_1.v2.config({
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
const uploadToCloudinary = async (filePath, folder = 'portfolio-hub', publicId) => {
    try {
        // Upload to Cloudinary
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
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
    }
    catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
/**
 * Delete a file from Cloudinary
 * @param publicId - Public ID of the file to delete
 * @returns Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary_1.v2.uploader.destroy(publicId);
        return {
            success: result === 'ok',
        };
    }
    catch (error) {
        console.error('Cloudinary delete error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Deletion failed',
        };
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
