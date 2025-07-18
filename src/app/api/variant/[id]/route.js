import { NextResponse } from 'next/server';
import connectToDB from '../../../connection/dbConnect.js';
import {
  getVariantById,
  updateVariant,
  deleteVariant
} from '../../../lib/controllers/variantController.js';

// GET /api/variant/[id] → Get a variant by ID
export async function GET(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    const response = await getVariantById(id);
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PUT /api/variant/[id] → Update a variant by ID
export async function PUT(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    const body = await req.json();
    const response = await updateVariant(id, body);
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/variant/[id] → Soft delete a variant by ID
export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    const response = await deleteVariant(id);
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}