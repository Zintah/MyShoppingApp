'use client';

import { useState } from 'react';
import { ShoppingList } from '@/types';

interface NewListFormProps {
  onListCreated: (list: ShoppingList) => void;
}

export default function NewListForm({ onListCreated }: NewListFormProps) {
  const [name, setName] = useState('');
  const [weekStarting, setWeekStarting] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !weekStarting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          weekStarting,
        }),
      });

      if (response.ok) {
        const newList = await response.json();
        onListCreated(newList);
        setName('');
        setWeekStarting('');
      } else {
        console.error('Failed to create list');
      }
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDefaultDate = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Create New List
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-1">
            List Name
          </label>
          <input
            type="text"
            id="listName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Weekly Groceries"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="weekStarting" className="block text-sm font-medium text-gray-700 mb-1">
            Week Starting
          </label>
          <input
            type="date"
            id="weekStarting"
            value={weekStarting}
            onChange={(e) => setWeekStarting(e.target.value)}
            defaultValue={getDefaultDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !weekStarting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating...' : 'Create List'}
        </button>
      </form>
    </div>
  );
} 