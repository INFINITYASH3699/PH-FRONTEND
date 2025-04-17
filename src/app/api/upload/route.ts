import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadFile, deleteFile } from '@/lib/cloudinary';

// Maximum file size (5MB)
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
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the uploaded file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        },
        { status: 400 }
      );
    }

    // Get file type and validate
    const fileType = file.type;
    const requestedType = (formData.get('type') as string || 'image').toLowerCase();

    // Check if the requested type is valid
    if (!VALID_FILE_TYPES[requestedType as keyof typeof VALID_FILE_TYPES]) {
      return NextResponse.json(
        { success: false, message: `Invalid file type category: ${requestedType}` },
        { status: 400 }
      );
    }

    // Check if the file type is valid for the requested category
    const validTypes = VALID_FILE_TYPES[requestedType as keyof typeof VALID_FILE_TYPES];
    if (!validTypes.includes(fileType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid file type. For ${requestedType}, please upload one of: ${validTypes.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Get file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64
    const base64File = `data:${fileType};base64,${buffer.toString('base64')}`;

    // Use the formData folder or default to 'portfolio'
    const folder = (formData.get('folder') as string || 'portfolio').replace(/[^a-zA-Z0-9_-]/g, '');

    // Get optional publicId if provided
    let publicId = formData.get('publicId') as string || '';
    if (publicId) {
      // Sanitize publicId
      publicId = publicId.replace(/[^a-zA-Z0-9_-]/g, '');
    }

    // Upload options
    const uploadOptions = {
      folder: `portfoliohub/${folder}`,
      resource_type: requestedType === 'image' ? 'image' : 'auto',
      // Add user ID to the public_id to help with organization
      public_id: publicId || `user_${session.user.id}_${Date.now()}`,
      // Add metadata about the upload
      context: {
        user_id: session.user.id,
        uploaded_at: new Date().toISOString(),
      },
      // For images, apply some basic optimizations
      ...(requestedType === 'image' && {
        quality: 'auto',
        fetch_format: 'auto',
        // Add responsive breakpoints for responsive images
        responsive_breakpoints: {
          create_derived: true,
          min_width: 200,
          max_width: 1000,
          max_images: 3
        }
      })
    };

    // Upload to Cloudinary
    const result = await uploadFile(base64File, uploadOptions);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      // Include additional data for responsive images
      ...(requestedType === 'image' && result.data.responsive_breakpoints && {
        responsiveUrls: result.data.responsive_breakpoints[0].breakpoints.map((b: any) => ({
          width: b.width,
          url: b.secure_url
        }))
      })
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error uploading file'
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
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the publicId from the URL parameters
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { success: false, message: 'No public ID provided' },
        { status: 400 }
      );
    }

    // Security check: Ensure the file belongs to the user
    // This is a basic check assuming you follow the naming convention from the upload
    // For more robust security, store file metadata in your database
    if (!publicId.includes(`user_${session.user.id}_`) && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to delete this file' },
        { status: 403 }
      );
    }

    // Delete from Cloudinary
    const result = await deleteFile(publicId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error deleting file'
      },
      { status: 500 }
    );
  }
}
