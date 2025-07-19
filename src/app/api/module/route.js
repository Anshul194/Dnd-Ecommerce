import dbConnect from '../../connection/dbConnect';
import { NextResponse } from 'next/server';
import {

createModule,
updateModule,
getModule,
deleteModule
} from '../../lib/controllers/moduleController.js';

// POST: Create a new module
export async function POST(request) {
try {
    console.log('POST /module called',request);
    await dbConnect();
    const result = await createModule(request);
    return NextResponse.json(result.body, { status: result.status });
} catch (err) {
    console.error('POST /module error:', err);
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
}
}

// GET: Get a module by id (via ?id=) or all modules (implement getModules if needed)
export async function GET(request) {
try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
        const result = await getModule(id);
        return NextResponse.json(result.body, { status: result.status });
    } else {
        // Optionally implement getModules for listing all modules
        return NextResponse.json({ success: false, message: 'Module id required' }, { status: 400 });
    }
} catch (err) {
    console.error('GET /module error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
}
}

// PUT: Update a module by id (?id=)
export async function PUT(request) {
try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const result = await updateModule(id, body);
    return NextResponse.json(result.body, { status: result.status });
} catch (err) {
    console.error('PUT /module error:', err);
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
}
}

// DELETE: Delete a module by id (?id=)
export async function DELETE(request) {
try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const result = await deleteModule(id);
    return NextResponse.json(result.body, { status: result.status });
} catch (err) {
    console.error('DELETE /module error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
}
}