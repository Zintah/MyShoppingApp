'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingList, ShoppingItem, ShoppingListSummary } from '@/types';
import ShoppingItemComponent from './ShoppingItem';
import AddItemForm from './AddItemForm';

interface ShoppingListProps {
  listId: number;
  onListDeleted: (listId: number) => void;
}

export default function ShoppingListComponent({ listId, onListDeleted }: ShoppingListProps) {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      const response = await fetch(`/api/lists/${listId}`);
      if (response.ok) {
        const data = await response.json();
        setList(data);
      }
    } catch (error) {
      console.error('Error fetching list:', error);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleItemAdded = (newItem: ShoppingItem) => {
    setList(prev => prev ? {
      ...prev,
      items: [...(prev.items || []), newItem]
    } : null);
    setShowAddForm(false);
  };

  const handleItemUpdated = (updatedItem: ShoppingItem) => {
    setList(prev => prev ? {
      ...prev,
      items: (prev.items || []).map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    } : null);
  };

  const handleItemDeleted = (deletedItemId: number) => {
    setList(prev => prev ? {
      ...prev,
      items: (prev.items || []).filter(item => item.id !== deletedItemId)
    } : null);
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onListDeleted(listId);
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  // Calculate shopping summary
  const summary: ShoppingListSummary = useMemo(() => {
    if (!list?.items) {
      return {
        totalItems: 0,
        completedItems: 0,
        estimatedTotal: 0,
        actualTotal: 0,
        completionPercentage: 0
      };
    }

    const completedItems = list.items.filter(item => item.completed);
    const estimatedTotal = list.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const actualTotal = completedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const completionPercentage = list.items.length > 0 ? 
      Math.round((completedItems.length / list.items.length) * 100) : 0;

    return {
      totalItems: list.items.length,
      completedItems: completedItems.length,
      estimatedTotal,
      actualTotal,
      completionPercentage
    };
  }, [list?.items]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-xl text-red-600">List not found</div>
      </div>
    );
  }

  const completedItems = list.items?.filter(item => item.completed) || [];
  const pendingItems = list.items?.filter(item => !item.completed) || [];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
            <p className="text-gray-500">
              Week of {new Date(list.weekStarting).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleDeleteList}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Delete List"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Shopping Summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Progress */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Progress</h3>
            <div className="mt-2">
              <div className="flex justify-between text-sm text-blue-600 mb-1">
                <span>{summary.completedItems} of {summary.totalItems} items</span>
                <span>{summary.completionPercentage}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${summary.completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Estimated Total */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800">Estimated Total</h3>
            <div className="mt-2">
              <div className="text-2xl font-bold text-yellow-900">
                ${summary.estimatedTotal.toFixed(2)}
              </div>
              <div className="text-sm text-yellow-600">
                for {summary.totalItems} items
              </div>
            </div>
          </div>

          {/* Actual Spent */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Actual Spent</h3>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-900">
                ${summary.actualTotal.toFixed(2)}
              </div>
              <div className="text-sm text-green-600">
                {summary.completedItems} items purchased
              </div>
            </div>
          </div>
        </div>

        {/* Budget Status */}
        {summary.estimatedTotal > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Budget Status:</span>
              <div className="flex items-center space-x-2">
                {summary.actualTotal <= summary.estimatedTotal ? (
                  <>
                    <span className="text-green-600 font-medium">
                      ${(summary.estimatedTotal - summary.actualTotal).toFixed(2)} under budget
                    </span>
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span className="text-red-600 font-medium">
                      ${(summary.actualTotal - summary.estimatedTotal).toFixed(2)} over budget
                    </span>
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Item Button */}
      <div className="p-6 border-b border-gray-200">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Item
          </button>
        ) : (
          <AddItemForm
            listId={listId}
            onItemAdded={handleItemAdded}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>

      {/* Items List */}
      <div className="p-6">
        {(!list.items || list.items.length === 0) ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No items in this list yet. Add some items to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    To Buy ({pendingItems.length})
                  </h3>
                  <div className="text-sm text-gray-600">
                    ${pendingItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)} remaining
                  </div>
                </div>
                <div className="space-y-2">
                  {pendingItems.map((item) => (
                    <ShoppingItemComponent
                      key={item.id}
                      item={item}
                      onItemUpdated={handleItemUpdated}
                      onItemDeleted={handleItemDeleted}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Items */}
            {completedItems.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Completed ({completedItems.length})
                  </h3>
                  <div className="text-sm text-green-600 font-medium">
                    ${completedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)} spent
                  </div>
                </div>
                <div className="space-y-2">
                  {completedItems.map((item) => (
                    <ShoppingItemComponent
                      key={item.id}
                      item={item}
                      onItemUpdated={handleItemUpdated}
                      onItemDeleted={handleItemDeleted}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 