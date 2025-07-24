import { NextResponse } from 'next/server';
import dbConnect from '@/app/connection/dbConnect';
import { getCategoryById, updateCategory } from '@/app/lib/controllers/categoryController';
import mongoose from 'mongoose';

// GET /api/category/:id
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
    const result = await getCategoryById(id);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/category/:id
export async function PUT(req, context) {
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
    const result = await updateCategory(id, data);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
