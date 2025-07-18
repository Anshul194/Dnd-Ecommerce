import { NextResponse } from 'next/server';
import connectToDB from '../../connection/dbConnect.js';
import {
  createVariant,
  getAllVariants
} from '../../lib/controllers/variantController.js';

export async function POST(req) {
  try {
    await connectToDB();
    const response = await createVariant(req);
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectToDB();
    const response = await getAllVariants(req);
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}