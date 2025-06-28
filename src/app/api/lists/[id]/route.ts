import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/lists/[id] - Get a specific shopping list with items
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const db = await getDatabase();
    const list = await db.get(`
      SELECT 
        id,
        name,
        week_starting as weekStarting,
        created_at as createdAt,
        updated_at as updatedAt
      FROM shopping_lists 
      WHERE id = ?
    `, [params.id]);

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const items = await db.all(`
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
      WHERE list_id = ?
      ORDER BY category, name
    `, [params.id]);

    return NextResponse.json({ ...list, items });
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json({ error: 'Failed to fetch list' }, { status: 500 });
  }
}

// DELETE /api/lists/[id] - Delete a shopping list
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const db = await getDatabase();
    const result = await db.run('DELETE FROM shopping_lists WHERE id = ?', [params.id]);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 });
  }
} 