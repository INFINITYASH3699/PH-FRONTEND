import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image formats
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];

/**
 * POST - Handle file upload
 * Uses Cloudinary for file storage
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File format not supported. Please upload JPG, PNG, WebP, or GIF images.' },
        { status: 400 }
      );
    }

    // Get the folder to upload to (default to 'portfolio-hub')
    const folder = formData.get('folder')?.toString() || 'portfolio-hub';

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a unique public ID using user ID and timestamp
    const userId = session.user.id;
    const timestamp = Date.now();
    const publicId = `${folder}/${userId}_${timestamp}`;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, folder, publicId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to upload file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file'
      },
      { status: 500 }
    );
  }
}

// Set larger response size limit for file upload
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};
