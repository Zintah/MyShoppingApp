'use client';

import { useState } from 'react';
import { ShoppingItem, CatalogItem } from '@/types';
import CatalogManager from './CatalogManager';

interface AddItemFormProps {
  listId: number;
  onItemAdded: (item: ShoppingItem) => void;
  onCancel: () => void;
}

export default function AddItemForm({ listId, onItemAdded, onCancel }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  const categories = [
    'General',
    'Fruits & Vegetables',
    'Meat & Seafood',
    'Dairy & Eggs',
    'Bakery',
    'Beverages',
    'Snacks',
    'Household',
    'Personal Care',
    'Other'
  ];

  const units = [
    'pcs',
    'kg',
    'g',
    'lbs',
    'oz',
    'liters',
    'ml',
    'cups',
    'tbsp',
    'tsp',
    'bottles',
    'cans',
    'boxes',
    'bags'
  ];

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
    setPrice(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedPrice = parsePrice(price);
      
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          quantity,
          unit,
          category,
          price: parsedPrice,
          listId,
        }),
      });

      if (response.ok) {
        const newItem = await response.json();
        onItemAdded(newItem);
        
        // Try to add to catalog if it doesn't exist
        try {
          await fetch('/api/catalog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              defaultQuantity: quantity,
              defaultUnit: unit,
              category,
              defaultPrice: parsedPrice,
            }),
          });
        } catch (catalogError) {
          // Ignore catalog errors (item might already exist)
        }
        
        // Reset form
        setName('');
        setQuantity(1);
        setUnit('pcs');
        setCategory('General');
        setPrice('');
      } else {
        console.error('Failed to create item');
      }
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCatalogItemSelected = (catalogItem: CatalogItem) => {
    setName(catalogItem.name);
    setQuantity(catalogItem.defaultQuantity);
    setUnit(catalogItem.defaultUnit);
    setCategory(catalogItem.category);
    setPrice(catalogItem.defaultPrice > 0 ? catalogItem.defaultPrice.toFixed(2) : '');
    setShowCatalog(false);
  };

  if (showCatalog) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Choose from Catalog</h3>
          <button
            onClick={() => setShowCatalog(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        <CatalogManager showSelector={true} onItemSelected={handleCatalogItemSelected} />
        <div className="flex justify-end">
          <button
            onClick={() => setShowCatalog(false)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Or add manually →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Add New Item</h3>
        <button
          onClick={() => setShowCatalog(true)}
          className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
        >
          From Catalog
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-3">
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              id="itemName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Milk, Bread, Apples"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="price"
                value={price}
                onChange={handlePriceChange}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
} 