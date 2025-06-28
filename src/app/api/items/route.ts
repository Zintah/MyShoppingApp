import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { CreateItemRequest } from '@/types';

// POST /api/items - Create a new shopping item
export async function POST(request: NextRequest) {
  try {
    const { name, quantity, unit, category, price, listId }: CreateItemRequest = await request.json();
    
    if (!name || !listId) {
      return NextResponse.json({ error: 'Name and listId are required' }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.run(`
      INSERT INTO shopping_items (name, quantity, unit, category, price, list_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, quantity || 1, unit || 'pcs', category || 'General', price || 0, listId]);

    const newItem = await db.get(`
      SELECT 
        id,
        name,
        quantity,
        unit,
        category,
        price,
        completed,
        list_id as listId,
        created_at as createdAt,
        updated_at as updatedAt
      FROM shopping_items 
      WHERE id = ?
    `, [result.lastID]);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}