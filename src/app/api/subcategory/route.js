import dbConnect from '../../connection/dbConnect';
import { createSubCategory, getSubCategories } from '../../lib/controllers/subCategoryController';
import { NextResponse } from 'next/server';
// import { verifyAdminAccess } from '../../middleware/commonAuth';

export async function POST(request) {
  try {
    await dbConnect();

    // const authResult = await verifyAdminAccess(request);
    // if (authResult.error) return authResult.error;

    const form = await request.formData();
    const result = await createSubCategory(form);

    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error('POST /subcategory error:', err);
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const result = await getSubCategories(query);
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error('GET /subcategory error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}