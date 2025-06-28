export interface ShoppingItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  price: number;
  completed: boolean;
  listId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList {
  id: number;
  name: string;
  weekStarting: string;
  createdAt: string;
  updatedAt: string;
  items?: ShoppingItem[];
}

export interface CreateItemRequest {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  price: number;
  listId: number;
}

export interface UpdateItemRequest {
  id: number;
  name?: string;
  quantity?: number;
  unit?: string;
  category?: string;
  price?: number;
  completed?: boolean;
}

export interface CatalogItem {
  id: number;
  name: string;
  defaultQuantity: number;
  defaultUnit: string;
  category: string;
  defaultPrice: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogItemRequest {
  name: string;
  defaultQuantity: number;
  defaultUnit: string;
  category: string;
  defaultPrice: number;
}

export interface UpdateCatalogItemRequest {
  id: number;
  name?: string;
  defaultQuantity?: number;
  defaultUnit?: string;
  category?: string;
  defaultPrice?: number;
}

export interface ShoppingListSummary {
  totalItems: number;
  completedItems: number;
  estimatedTotal: number;
  actualTotal: number;
  completionPercentage: number;
} 