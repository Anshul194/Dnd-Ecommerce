import { NextResponse } from 'next/server';
import dbConnect from '@/app/connection/dbConnect';
import { getSubCategoryById, updateSubCategory, deleteSubCategory } from '@/app/lib/controllers/subCategoryController';
import mongoose from 'mongoose';

// GET /api/subcategory/:id
export async function GET(req, context) {
  await dbConnect();
  const { params } = context;
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID is missing' }, { status: 400 });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: 'Invalid ObjectId' }, { status: 400 });
  }

  try {
    const result = await getSubCategoryById(id);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH /api/subcategory/:id
export async function PATCH(req, context) {
  await dbConnect();
  const { params } = context;
  const id = params?.id;
  const data = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID is missing' }, { status: 400 });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: 'Invalid ObjectId' }, { status: 400 });
  }

  try {
    const result = await updateSubCategory(id, data);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/subcategory/:id
export async function DELETE(req, context) {
  await dbConnect();
  const { params } = context;
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID is missing' }, { status: 400 });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: 'Invalid ObjectId' }, { status: 400 });
  }

  try {
    const result = await deleteSubCategory(id);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
