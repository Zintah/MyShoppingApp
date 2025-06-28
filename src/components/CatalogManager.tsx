'use client';

import { useState, useEffect } from 'react';
import { CatalogItem, CreateCatalogItemRequest } from '@/types';

interface CatalogManagerProps {
  onItemSelected?: (item: CatalogItem) => void;
  showSelector?: boolean;
}

export default function CatalogManager({ onItemSelected, showSelector = false }: CatalogManagerProps) {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    defaultQuantity: 1,
    defaultUnit: 'pcs',
    category: 'General',
    defaultPrice: ''
  });

  const categories = [
    'All',
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
    'pcs', 'kg', 'g', 'lbs', 'oz', 'liters', 'ml', 'cups', 'tbsp', 'tsp', 'bottles', 'cans', 'boxes', 'bags'
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
    setFormData(prev => ({ ...prev, defaultPrice: formatted }));
  };

  useEffect(() => {
    fetchCatalogItems();
  }, []);

  const fetchCatalogItems = async () => {
    try {
      const response = await fetch('/api/catalog');
      if (response.ok) {
        const data = await response.json();
        setCatalogItems(data);
      }
    } catch (error) {
      console.error('Error fetching catalog items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const parsedPrice = parsePrice(formData.defaultPrice);
      const submitData = {
        ...formData,
        defaultPrice: parsedPrice
      };

      if (editingItem) {
        // Update existing item
        const response = await fetch(`/api/catalog/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        if (response.ok) {
          const updatedItem = await response.json();
          setCatalogItems(prev => prev.map(item => 
            item.id === editingItem.id ? updatedItem : item
          ));
          setEditingItem(null);
        }
      } else {
        // Create new item
        const response = await fetch('/api/catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        if (response.ok) {
          const newItem = await response.json();
          setCatalogItems(prev => [newItem, ...prev]);
        } else if (response.status === 409) {
          alert('This item already exists in your catalog');
          return;
        }
      }

      // Reset form
      setFormData({ name: '', defaultQuantity: 1, defaultUnit: 'pcs', category: 'General', defaultPrice: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving catalog item:', error);
    }
  };

  const handleEdit = (item: CatalogItem) => {
    setFormData({
      name: item.name,
      defaultQuantity: item.defaultQuantity,
      defaultUnit: item.defaultUnit,
      category: item.category,
      defaultPrice: item.defaultPrice > 0 ? item.defaultPrice.toFixed(2) : ''
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (item: CatalogItem) => {
    if (!window.confirm(`Remove "${item.name}" from catalog?`)) return;

    try {
      const response = await fetch(`/api/catalog/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCatalogItems(prev => prev.filter(i => i.id !== item.id));
      }
    } catch (error) {
      console.error('Error deleting catalog item:', error);
    }
  };

  const handleSelect = async (item: CatalogItem) => {
    if (onItemSelected) {
      // Increment usage count
      try {
        await fetch(`/api/catalog/${item.id}/use`, { method: 'POST' });
        // Update local state
        setCatalogItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, usageCount: i.usageCount + 1 } : i
        ));
      } catch (error) {
        console.error('Error updating usage count:', error);
      }
      
      onItemSelected(item);
    }
  };

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">Loading catalog...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {showSelector ? 'Select from Catalog' : 'Item Catalog'}
        </h2>
        {!showSelector && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            + Add Item
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by category"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <h3 className="text-lg font-semibold mb-3">
            {editingItem ? 'Edit Item' : 'Add to Catalog'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-3">
                <input
                  type="text"
                  placeholder="Item name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Default quantity"
                  value={formData.defaultQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, defaultQuantity: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <select
                  value={formData.defaultUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, defaultUnit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  title="Default unit"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Default price"
                    value={formData.defaultPrice}
                    onChange={handlePriceChange}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  title="Category"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                {editingItem ? 'Update' : 'Add to Catalog'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setFormData({ name: '', defaultQuantity: 1, defaultUnit: 'pcs', category: 'General', defaultPrice: '' });
                }}
                className="text-gray-600 hover:text-gray-800 px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {catalogItems.length === 0 ? (
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>No items in catalog yet. Add frequently used items to make shopping faster!</p>
            </div>
          ) : (
            <p>No items match your search criteria.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border transition-all ${
                showSelector ? 'hover:bg-blue-50 cursor-pointer' : ''
              }`}
              onClick={showSelector ? () => handleSelect(item) : undefined}
            >
              <div className="flex-grow">
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500">
                  {item.defaultQuantity} {item.defaultUnit} • {item.category}
                  {item.defaultPrice > 0 && (
                    <span className="ml-2">• ${item.defaultPrice.toFixed(2)}</span>
                  )}
                  <span className="ml-2">• Used {item.usageCount} times</span>
                </div>
              </div>
              
              {!showSelector && (
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
              
              {showSelector && (
                <div className="ml-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 