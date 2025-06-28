import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { UpdateItemRequest } from '@/types';

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/items/[id] - Update a shopping item
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const updates: UpdateItemRequest = await request.json();
    const db = await getDatabase();

    // Build dynamic update query
    const updateFields = [];
    const values = [];

    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.quantity !== undefined) {
      updateFields.push('quantity = ?');
      values.push(updates.quantity);
    }
    if (updates.unit !== undefined) {
      updateFields.push('unit = ?');
      values.push(updates.unit);
    }
    if (updates.category !== undefined) {
      updateFields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.price !== undefined) {
      updateFields.push('price = ?');
      values.push(updates.price);
    }
    if (updates.completed !== undefined) {
      updateFields.push('completed = ?');
      values.push(updates.completed ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(params.id);

    const result = await db.run(`
      UPDATE shopping_items 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, values);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updatedItem = await db.get(`
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
    `, [params.id]);

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE /api/items/[id] - Delete a shopping item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const db = await getDatabase();
    const result = await db.run('DELETE FROM shopping_items WHERE id = ?', [params.id]);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
} 