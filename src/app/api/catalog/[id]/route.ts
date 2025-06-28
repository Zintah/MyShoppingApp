import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { UpdateCatalogItemRequest } from '@/types';

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/catalog/[id] - Update a catalog item
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const updates: UpdateCatalogItemRequest = await request.json();
    const db = await getDatabase();

    // Build dynamic update query
    const updateFields = [];
    const values = [];

    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name.trim());
    }
    if (updates.defaultQuantity !== undefined) {
      updateFields.push('default_quantity = ?');
      values.push(updates.defaultQuantity);
    }
    if (updates.defaultUnit !== undefined) {
      updateFields.push('default_unit = ?');
      values.push(updates.defaultUnit);
    }
    if (updates.category !== undefined) {
      updateFields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.defaultPrice !== undefined) {
      updateFields.push('default_price = ?');
      values.push(updates.defaultPrice);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(params.id);

    const result = await db.run(`
      UPDATE catalog_items 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, values);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Catalog item not found' }, { status: 404 });
    }

    const updatedItem = await db.get(`
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
    `, [params.id]);

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating catalog item:', error);
    return NextResponse.json({ error: 'Failed to update catalog item' }, { status: 500 });
  }
}

// DELETE /api/catalog/[id] - Delete a catalog item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const db = await getDatabase();
    const result = await db.run('DELETE FROM catalog_items WHERE id = ?', [params.id]);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Catalog item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Catalog item deleted successfully' });
  } catch (error) {
    console.error('Error deleting catalog item:', error);
    return NextResponse.json({ error: 'Failed to delete catalog item' }, { status: 500 });
  }
}

 