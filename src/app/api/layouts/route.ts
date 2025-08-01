// API Routes for Layout Management
// Place these in your API directory

// GET /api/layouts/product/[productId] - Get layout for a product
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = parseInt(params.productId);

    // Get active layout for product
    const query = `
      SELECT * FROM product_page_layouts 
      WHERE product_id = ? AND is_active = TRUE 
      ORDER BY created_at DESC LIMIT 1
    `;

    const layout = await db.query(query, [productId]);

    if (layout.length === 0) {
      return NextResponse.json({ error: "Layout not found" }, { status: 404 });
    }

    return NextResponse.json(layout[0]);
  } catch (error) {
    console.error("Error fetching layout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/layouts - Create new layout
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const query = `
      INSERT INTO product_page_layouts 
      (product_id, layout_name, total_columns, column_gap, component_gap, row_gap)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(query, [
      data.productId,
      data.layoutName,
      data.totalColumns,
      data.columnGap,
      data.componentGap,
      data.rowGap,
    ]);

    return NextResponse.json({ layoutId: result.insertId });
  } catch (error) {
    console.error("Error creating layout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/layouts - Update existing layout
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    const query = `
      UPDATE product_page_layouts 
      SET layout_name = ?, total_columns = ?, column_gap = ?, 
          component_gap = ?, row_gap = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.query(query, [
      data.layoutName,
      data.totalColumns,
      data.columnGap,
      data.componentGap,
      data.rowGap,
      data.id,
    ]);

    return NextResponse.json({ layoutId: data.id });
  } catch (error) {
    console.error("Error updating layout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
