import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/catalog/[id]/use - Increment usage count when item is used
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const db = await getDatabase();
    const result = await db.run(`
      UPDATE catalog_items 
      SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [params.id]);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Catalog item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Usage count updated' });
  } catch (error) {
    console.error('Error updating usage count:', error);
    return NextResponse.json({ error: 'Failed to update usage count' }, { status: 500 });
  }
} 