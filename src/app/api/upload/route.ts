import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

// Define max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Valid file types by category
const VALID_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  // Add more categories as needed
};

/**
 * POST - Upload a file
 * FormData parameters:
 * - file: The file to upload
 * - folder: (optional) The folder to upload to (default: 'portfolio')
 * - type: (optional) The type of file ('image', 'document', etc.) - defaults to 'image'
 * - publicId: (optional) The public ID to use for the file
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the uploaded file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'portfolio-hub';

    // Validate file
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Check file type (basic validation)
    const fileType = file.type;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WEBP, PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Set folder path based on user ID for organization
    const userFolder = `${folder}/${session.user.id}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, userFolder);

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Failed to upload file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a file
 * Query parameters:
 * - publicId: The public ID of the file to delete
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the public ID from the request
    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Make sure the file belongs to the user (basic security check)
    if (!publicId.includes(`user_${session.user.id}_`)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this file' },
        { status: 403 }
      );
    }

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
