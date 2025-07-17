import { NextResponse } from 'next/server';
import BrandService from '../../lib/services/brandService';

const brandService = new BrandService();

// GET /api/brand?search=name → Get all brands or search by name
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('search');

    let brands;
    if (searchQuery) {
      brands = await brandService.searchBrandsByName(searchQuery);
    } else {
      brands = await brandService.getAllBrands();
    }

    return NextResponse.json({
      success: true,
      message: 'Brands fetched successfully',
      data: brands,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}

// POST /api/brand → Create a new brand
export async function POST(req) {
  try {
    const body = await req.json();
    const newBrand = await brandService.createBrand(body);

    return NextResponse.json({
      success: true,
      message: 'Brand created successfully',
      data: newBrand,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}