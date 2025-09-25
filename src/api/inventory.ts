import { InventoryItem } from '../types';
import api from './axios';


// Inventory API endpoints
export const fetchInventoryItems = () => api.get<InventoryItem[]>('/inventory');

export const fetchAvailableItems = () => api.get<InventoryItem[]>('/inventory/available');

export const fetchLowStockItems = () => api.get<InventoryItem[]>('/inventory/low-stock');

// export const addInventoryItem = (item) => api.post('/inventory', item);
export const addInventoryItem = (item: Partial<InventoryItem>) => api.post('/inventory', item);

// export const updateInventoryItem = (id, item) => api.put(`/inventory/${id}`, item);
export const updateInventoryItem = (id: string, item: Partial<InventoryItem>) => api.put<InventoryItem>(`/inventory/${id}`, item);

export const restockInventoryItem = (id:string, quantity:number) =>
  api.patch<InventoryItem>(`/inventory/${id}/restock`, { quantity });

export const toggleInventoryItemStatus = (id:string) =>
  api.patch<InventoryItem>(`/inventory/${id}/toggle`);

export const deleteInventoryItem = (id:string) => api.delete<{message:string}>(`/inventory/${id}`);


