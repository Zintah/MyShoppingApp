'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingList, ShoppingListSummary } from '@/types';
import ShoppingListComponent from '@/components/ShoppingList';
import NewListForm from '@/components/NewListForm';
import CatalogManager from '@/components/CatalogManager';

interface ListWithSummary extends ShoppingList {
  summary?: ShoppingListSummary;
}

export default function Home() {
  const [lists, setLists] = useState<ListWithSummary[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lists' | 'catalog'>('lists');

  const fetchLists = useCallback(async () => {
    try {
      const response = await fetch('/api/lists');
      if (response.ok) {
        const data = await response.json();
        
        // Fetch detailed information for each list to calculate summaries
        const listsWithSummaries = await Promise.all(
          data.map(async (list: ShoppingList) => {
            try {
              const detailResponse = await fetch(`/api/lists/${list.id}`);
              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                const summary = calculateListSummary(detailData.items || []);
                return { ...list, summary };
              }
            } catch (error) {
              console.error(`Error fetching details for list ${list.id}:`, error);
            }
            return list;
          })
        );

        // Sort by week starting date (newest first)
        const sortedLists = listsWithSummaries.sort((a, b) => 
          new Date(b.weekStarting).getTime() - new Date(a.weekStarting).getTime()
        );

        setLists(sortedLists);
        if (sortedLists.length > 0 && !selectedListId) {
          setSelectedListId(sortedLists[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedListId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const calculateListSummary = (items: any[]): ShoppingListSummary => {
    const completedItems = items.filter(item => item.completed);
    const estimatedTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const actualTotal = completedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const completionPercentage = items.length > 0 ? 
      Math.round((completedItems.length / items.length) * 100) : 0;

    return {
      totalItems: items.length,
      completedItems: completedItems.length,
      estimatedTotal,
      actualTotal,
      completionPercentage
    };
  };

  const handleListCreated = (newList: ShoppingList) => {
    const listWithSummary: ListWithSummary = {
      ...newList,
      summary: { totalItems: 0, completedItems: 0, estimatedTotal: 0, actualTotal: 0, completionPercentage: 0 }
    };
    setLists(prev => [listWithSummary, ...prev]);
    setSelectedListId(newList.id);
    setActiveTab('lists'); // Switch to lists tab when new list is created
  };

  const handleListDeleted = (deletedListId: number) => {
    setLists(prev => prev.filter(list => list.id !== deletedListId));
    if (selectedListId === deletedListId) {
      const remainingLists = lists.filter(list => list.id !== deletedListId);
      setSelectedListId(remainingLists.length > 0 ? remainingLists[0].id : null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          My Shopping Lists
        </h1>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setActiveTab('lists')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'lists'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Shopping Lists
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Item Catalog
            </button>
          </div>
        </div>

        {activeTab === 'lists' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - New List Form and Lists */}
            <div className="lg:col-span-1">
              {/* Create New List Form */}
              <NewListForm onListCreated={handleListCreated} />

              {/* Weekly Shopping Lists */}
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Your Lists
                  </h2>
                  <span className="text-sm text-gray-500">
                    {lists.length} list{lists.length !== 1 ? "s" : ""}
                  </span>
                </div>
                
                {lists.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No shopping lists yet. Create your first one!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {lists.map((list) => (
                      <button
                        key={list.id}
                        onClick={() => setSelectedListId(list.id)}
                        className={`w-full text-left p-4 rounded-lg transition-colors border-2 ${
                          selectedListId === list.id
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-gray-900">{list.name}</div>
                          {list.summary && list.summary.completionPercentage === 100 && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Complete
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          Week of {new Date(list.weekStarting).toLocaleDateString()}
                        </div>
                        
                        {list.summary && (
                          <div className="space-y-2">
                            {/* Progress bar */}
                            <div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>{list.summary.completedItems} of {list.summary.totalItems} items</span>
                                <span>{list.summary.completionPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${list.summary.completionPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Cost summary */}
                            {list.summary.estimatedTotal > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">
                                  Budget: {formatCurrency(list.summary.estimatedTotal)}
                                </span>
                                <span className={`font-medium ${
                                  list.summary.actualTotal <= list.summary.estimatedTotal 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                }`}>
                                  Spent: {formatCurrency(list.summary.actualTotal)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Quick tip about catalog */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Tip</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Use the Item Catalog to save frequently purchased items and add them quickly to your lists!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Shopping List */}
            <div className="lg:col-span-2">
              {selectedListId ? (
                <ShoppingListComponent
                  listId={selectedListId}
                  onListDeleted={handleListDeleted}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="text-gray-500">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No list selected
                    </h3>
                    <p className="text-gray-500">
                      Create a new shopping list or select an existing one to get started.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Catalog Tab */
          <div className="max-w-4xl mx-auto">
            <CatalogManager />
            
            {/* Instructions */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">How to use the Item Catalog</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">🏪 Managing Your Catalog</h4>
                  <ul className="space-y-1">
                    <li>• Add frequently purchased items</li>
                    <li>• Set default quantities, units, and prices</li>
                    <li>• Organize by category</li>
                    <li>• Edit or delete items as needed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">⚡ Quick Shopping</h4>
                  <ul className="space-y-1">
                    <li>• Click "From Catalog" when adding items</li>
                    <li>• Items are automatically added to catalog</li>
                    <li>• Most used items appear first</li>
                    <li>• Search and filter for easy finding</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 