'use client';

import { useState } from 'react';
import { ShoppingItem } from '@/types';

interface ShoppingItemProps {
  item: ShoppingItem;
  onItemUpdated: (item: ShoppingItem) => void;
  onItemDeleted: (itemId: number) => void;
}

export default function ShoppingItemComponent({ item, onItemUpdated, onItemDeleted }: ShoppingItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
  const [editUnit, setEditUnit] = useState(item.unit);
  const [editCategory, setEditCategory] = useState(item.category);
  const [editPrice, setEditPrice] = useState(item.price > 0 ? item.price.toFixed(2) : '');

  const parsePrice = (priceStr: string): number => {
    // Remove any non-numeric characters except decimal point
    const cleaned = priceStr.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  };

  const formatPrice = (value: string): string => {
    // Remove any non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return cleaned;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    setEditPrice(formatted);
  };

  const handleToggleCompleted = async () => {
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !item.completed,
        }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        onItemUpdated(updatedItem);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const parsedPrice = parsePrice(editPrice);
      
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          quantity: editQuantity,
          unit: editUnit,
          category: editCategory,
          price: parsedPrice,
        }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        onItemUpdated(updatedItem);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setEditUnit(item.unit);
    setEditCategory(item.category);
    setEditPrice(item.price > 0 ? item.price.toFixed(2) : '');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onItemDeleted(item.id);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Item name"
          />
          <input
            type="number"
            value={editQuantity}
            onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={editUnit}
            onChange={(e) => setEditUnit(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Unit"
          />
          <input
            type="text"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Category"
          />
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              value={editPrice}
              onChange={handlePriceChange}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={handleCancelEdit}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = item.quantity * item.price;

  return (
    <div className={`flex items-center p-3 bg-gray-50 rounded-lg border transition-all ${
      item.completed ? 'opacity-75 bg-green-50' : ''
    }`}>
      {/* Checkbox */}
      <button
        onClick={handleToggleCompleted}
        className="mr-3 flex-shrink-0"
        aria-label={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          item.completed 
            ? 'bg-green-600 border-green-600' 
            : 'border-gray-300 hover:border-gray-400'
        }`}>
          {item.completed && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </button>

      {/* Item details */}
      <div className="flex-grow">
        <div className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {item.name}
        </div>
        <div className="text-sm text-gray-500">
          {item.quantity} {item.unit} • {item.category}
          {item.price > 0 && (
            <span className="ml-2">
              ${item.price.toFixed(2)} each • Total: ${totalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Price display */}
      {item.price > 0 && (
        <div className="text-right mr-3">
          <div className={`font-semibold ${item.completed ? 'line-through text-gray-500' : 'text-green-600'}`}>
            ${totalPrice.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            ${item.price.toFixed(2)} each
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 ml-3">
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-blue-600 transition-colors"
          title="Edit item"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition-colors"
          title="Delete item"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
} 