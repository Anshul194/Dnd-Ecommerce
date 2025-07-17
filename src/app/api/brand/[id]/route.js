import { NextResponse } from 'next/server';
import BrandService from '../../../lib/services/brandService';

const brandService = new BrandService();

// GET /api/brand/:id → Get brand by ID
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const brand = await brandService.getBrandById(id);

    if (!brand) {
      return NextResponse.json({
        success: false,
        message: 'Brand not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Brand fetched successfully',
      data: brand,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}

// PUT /api/brand/:id → Update brand by ID
export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updatedBrand = await brandService.updateBrand(id, body);

    if (!updatedBrand) {
      return NextResponse.json({
        success: false,
        message: 'Brand not found or could not be updated',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Brand updated successfully',
      data: updatedBrand,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}

// DELETE /api/brand/:id → Delete brand by ID
export async function DELETE(req, context) {
  try {
    const { id } = await context.params;

    const deleted = await brandService.deleteBrand(id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: 'Brand not found or could not be deleted',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}