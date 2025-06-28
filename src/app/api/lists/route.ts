import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { ShoppingList } from '@/types';

// GET /api/lists - Get all shopping lists
export async function GET() {
  try {
    const db = await getDatabase();
    const lists = await db.all(`
      SELECT 
        id,
        name,
        week_starting as weekStarting,
        created_at as createdAt,
        updated_at as updatedAt
      FROM shopping_lists 
      ORDER BY week_starting DESC
    `);
    
    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
  }
}

// POST /api/lists - Create a new shopping list
export async function POST(request: NextRequest) {
  try {
    const { name, weekStarting } = await request.json();
    
    if (!name || !weekStarting) {
      return NextResponse.json({ error: 'Name and week starting date are required' }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.run(`
      INSERT INTO shopping_lists (name, week_starting)
      VALUES (?, ?)
    `, [name, weekStarting]);

    const newList = await db.get(`
      SELECT 
        id,
        name,
        week_starting as weekStarting,
        created_at as createdAt,
        updated_at as updatedAt
      FROM shopping_lists 
      WHERE id = ?
    `, [result.lastID]);

    return NextResponse.json(newList, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json({ error: 'Failed to create list' }, { status: 500 });
  }
} 