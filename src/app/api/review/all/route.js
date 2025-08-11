import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../../lib/tenantDb';
import { ReviewSchema } from '../../../lib/models/Review.js';
import UserSchema from '../../../lib/models/User.js';
import {ProductSchema} from '../../../lib/models/Product.js'

export async function GET(req) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });

    }

    const User = conn.models.User || conn.model('User', UserSchema);
    const Review = conn.models.Review || conn.model('Review', ReviewSchema);
    const Product = conn.models.Product || conn.model('Product', ProductSchema);
    // Fetch all reviews and populate userId
    const reviews = await Review.find().populate('userId productId');
    return NextResponse.json({ success: true, message: 'All reviews fetched', data: reviews });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
