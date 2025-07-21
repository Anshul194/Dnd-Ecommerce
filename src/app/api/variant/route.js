import { NextResponse } from 'next/server';
import connectToDB from '../../connection/dbConnect.js';
import VariantService from '../../lib/services/VariantService.js';

const variantService = new VariantService();

export async function POST(req) {
  try {
    await connectToDB();
    const body = await req.json();
    const variant = await variantService.create(body);

    return NextResponse.json({
      success: true,
      message: 'Variant created successfully',
      data: variant
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create variant',
      errors: error.details || []
    }, { status: error.status || 500 });
  }
}

export async function GET(req) {
  try {
    await connectToDB();
    const variants = await variantService.getAll(); // ✅ Add getAll() method in your VariantService
    return NextResponse.json({
      success: true,
      message: 'Variants fetched successfully',
      data: variants
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch variants',
      errors: error.details || []
    }, { status: error.status || 500 });
  }
}