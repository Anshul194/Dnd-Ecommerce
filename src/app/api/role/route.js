import dbConnect from '../../connection/dbConnect';
import { NextResponse } from 'next/server';
import {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole
} from '../../lib/controllers/roleController.js';

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const result = await createRole(body);
        return NextResponse.json(result.body, { status: result.status });
    } catch (err) {
        console.error('POST /role error:', err);
        return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (id) {
            const result = await getRoleById(id);
            return NextResponse.json(result.body, { status: result.status });
        } else {
            const query = Object.fromEntries(searchParams.entries());
            const result = await getRoles(query);
            return NextResponse.json(result.body, { status: result.status });
        }
    } catch (err) {
        console.error('GET /role error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();
        const result = await updateRole(id, body);
        return NextResponse.json(result.body, { status: result.status });
    } catch (err) {
        console.error('PUT /role error:', err);
        return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const result = await deleteRole(id);
        return NextResponse.json(result.body, { status: result.status });
    } catch (err) {
        console.error('DELETE /role error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
