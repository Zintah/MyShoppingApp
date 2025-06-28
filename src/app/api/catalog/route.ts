import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { CreateCatalogItemRequest } from '@/types';

// GET /api/catalog - Get all catalog items
export async function GET() {
  try {
    const db = await getDatabase();
    const items = await db.all(`
      SELECT 
        id,
        name,
        default_quantity as defaultQuantity,
        default_unit as defaultUnit,
        category,
        default_price as defaultPrice,
        usage_count as usageCount,
        created_at as createdAt,
        updated_at as updatedAt
      FROM catalog_items 
      ORDER BY usage_count DESC, name ASC
    `);
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching catalog items:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog items' }, { status: 500 });
  }
}

// POST /api/catalog - Create a new catalog item
export async function POST(request: NextRequest) {
  try {
    const { name, defaultQuantity, defaultUnit, category, defaultPrice }: CreateCatalogItemRequest = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Check if item already exists
    const existingItem = await db.get('SELECT id FROM catalog_items WHERE name = ?', [name.trim()]);
    if (existingItem) {
      return NextResponse.json({ error: 'Item already exists in catalog' }, { status: 409 });
    }

    const result = await db.run(`
      INSERT INTO catalog_items (name, default_quantity, default_unit, category, default_price, usage_count)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [name.trim(), defaultQuantity || 1, defaultUnit || 'pcs', category || 'General', defaultPrice || 0]);

    const newItem = await db.get(`
      SELECT 
        id,
        name,
        default_quantity as defaultQuantity,
        default_unit as defaultUnit,
        category,
        default_price as defaultPrice,
        usage_count as usageCount,
        created_at as createdAt,
        updated_at as updatedAt
      FROM catalog_items 
      WHERE id = ?
    `, [result.lastID]);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating catalog item:', error);
    return NextResponse.json({ error: 'Failed to create catalog item' }, { status: 500 });
  }
} 