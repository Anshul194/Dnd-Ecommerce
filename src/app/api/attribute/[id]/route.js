// src/app/api/attribute/[id]/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/app/connection/dbConnect';
import AttributeService from '@/app/lib/services/attributeService';
import mongoose from 'mongoose';

const attributeService = new AttributeService();

// GET /api/attribute/:id
export async function GET(req, context) {
  await connectDB();
  const { params } = context;
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID is missing' }, { status: 400 });
  }

  // Prevent 'search' from being treated as an ObjectId
  if (id === 'search') {
    return NextResponse.json({ success: false, message: 'Use /api/attribute/search for search queries.' }, { status: 400 });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: 'Invalid ObjectId' }, { status: 400 });
  }

  try {
    const attribute = await attributeService.getAttributeById(id);
    if (!attribute) {
      return NextResponse.json({ success: false, message: 'Attribute not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: attribute });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/attribute/:id
export async function PUT(req, context) {
  await connectDB();
  const { params } = context;
  const id = params?.id;
  const data = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID is missing' }, { status: 400 });
  }

  try {
    const updated = await attributeService.updateAttribute(id, data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH /api/attribute/:id
export async function PATCH(req, context) {
  await connectDB();
  const { params } = context;
  const id = params?.id;
  const data = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID is missing' }, { status: 400 });
  }

  try {
    const updated = await attributeService.updateAttribute(id, data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/attribute/:id
export async function DELETE(req, context) {
  await connectDB();
  const { params } = context;
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID is missing' }, { status: 400 });
  }

  try {
    await attributeService.deleteAttribute(id);
    return NextResponse.json({ success: true, message: 'Attribute deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// SEARCH /api/attribute/:id?name=Material
export async function SEARCH(req, context) {
  await connectDB();
  const { params } = context;
  const id = params?.id;
  const url = new URL(req.url);
  const name = url.searchParams.get('name');

  if (id !== 'search') {
    return NextResponse.json({ success: false, message: 'Invalid search route. Use /api/attribute/search.' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ success: false, message: 'Name query param is required', data: null }, { status: 400 });
  }
  try {
    const results = await attributeService.searchAttributesByName(name);
    return NextResponse.json({ success: true, message: 'Search complete', data: results });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message, data: null }, { status: 500 });
  }
}