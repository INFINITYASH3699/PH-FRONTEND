import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the uploaded file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    const fileType = file.type;
    const validFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!validFileTypes.includes(fileType)) {
      return NextResponse.json(
        { message: 'Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF)' },
        { status: 400 }
      );
    }

    // Get file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64
    const base64File = `data:${fileType};base64,${buffer.toString('base64')}`;

    // Use the formData folder or default to 'portfolio'
    const folder = formData.get('folder') as string || 'portfolio';

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64File, {
      folder,
      resource_type: 'image',
      // Add user ID to the public_id to help with organization
      public_id: `user_${session.user.id}_${Date.now()}`,
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Error uploading file' },
      { status: 500 }
    );
  }
}
