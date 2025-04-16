import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Template } from '@/models/Template';
import { seedSingleTemplate } from '@/lib/db/seed';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Seed a template if none exist (for demo purposes)
    await seedSingleTemplate();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPremium = searchParams.get('isPremium');

    // Build query
    const query: Record<string, any> = {};

    if (category) {
      query.category = category;
    }

    if (isPremium !== null) {
      query.isPremium = isPremium === 'true';
    }

    // Fetch templates
    const templates = await Template.find(query).sort({ createdAt: -1 });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
