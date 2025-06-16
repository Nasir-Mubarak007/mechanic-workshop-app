import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  getInventoryItems, 
  getLowStockItems, 
  addInventoryItem, 
  updateInventoryItem, 
  restockInventoryItem 
} from '../utils/localStorage';
import { InventoryItem } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Package, Plus, Edit, RefreshCw, Search, Filter, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Inventory: React.FC = () => {
  const { isAdmin } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    lowStockOnly: false,
  });
  
  // Form state
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    quantity: 0,
    unit: '',
    threshold: 0,
    pricePerUnit: 0,
  });

  const categories = ['oil', 'filter', 'fluid', 'coolant', 'brake', 'transmission', 'other'];

  useEffect(() => {
    if (isAdmin) {
      loadInventory();
    }
  }, [isAdmin]);

  useEffect(() => {
    applyFilters();
  }, [inventoryItems, filters]);

  const loadInventory = () => {
    const items = getInventoryItems();
    const lowStock = getLowStockItems();
    setInventoryItems(items);
    setLowStockItems(lowStock);
  };

  const applyFilters = () => {
    let filtered = [...inventoryItems];
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.itemName.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Category filter
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    // Low stock filter
    if (filters.lowStockOnly) {
      filtered = filtered.filter(item => item.quantity <= item.threshold);
    }
    
    setFilteredItems(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      lowStockOnly: false,
    });
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      itemName: '',
      category: '',
      quantity: 0,
      unit: '',
      threshold: 0,
      pricePerUnit: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      threshold: item.threshold,
      pricePerUnit: item.pricePerUnit || 0,
    });
    setIsModalOpen(true);
  };

  const handleRestock = (item: InventoryItem) => {
    setRestockingItem(item);
    setRestockAmount(0);
    setIsRestockModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        // Update existing item
        updateInventoryItem({
          ...editingItem,
          itemName: formData.itemName,
          category: formData.category,
          quantity: formData.quantity,
          unit: formData.unit,
          threshold: formData.threshold,
          pricePerUnit: formData.pricePerUnit,
        });
        toast.success('Inventory item updated successfully');
      } else {
        // Add new item
        addInventoryItem({
          itemName: formData.itemName,
          category: formData.category,
          quantity: formData.quantity,
          unit: formData.unit,
          threshold: formData.threshold,
          pricePerUnit: formData.pricePerUnit,
        });
        toast.success('Inventory item added successfully');
      }
      
      setIsModalOpen(false);
      loadInventory();
    } catch (error) {
      toast.error('Failed to save inventory item');
    }
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restockingItem || restockAmount <= 0) {
      toast.error('Please enter a valid restock amount');
      return;
    }
    
    try {
      restockInventoryItem(restockingItem.id, restockAmount);
      toast.success(`Successfully restocked ${restockingItem.itemName}`);
      setIsRestockModalOpen(false);
      setRestockingItem(null);
      setRestockAmount(0);
      loadInventory();
    } catch (error) {
      toast.error('Failed to restock item');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'threshold' || name === 'pricePerUnit' 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStockStatusColor = (item: InventoryItem) => {
    if (item.quantity <= item.threshold) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-green-600 bg-green-50';
  };

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          {lowStockItems.length > 0 && (
            <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
              <AlertTriangle size={16} />
              <span>{lowStockItems.length} low stock</span>
            </div>
          )}
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleAddNew}
        >
          Add New Item
        </Button>
      </div>
      
      {/* Filters */}
      <Card title="Filters" icon={Filter}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Item name or category"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              id="lowStockOnly"
              name="lowStockOnly"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={filters.lowStockOnly}
              onChange={handleFilterChange}
            />
            <label htmlFor="lowStockOnly" className="ml-2 block text-sm text-gray-900">
              Show low stock only
            </label>
          </div>
          
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={resetFilters}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Inventory List */}
      <Card title="Inventory Items" icon={Package}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threshold
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/Unit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.threshold} {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.pricePerUnit ? formatCurrency(item.pricePerUnit) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(item)}`}>
                      {item.quantity <= item.threshold ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="success"
                        size="sm"
                        icon={RefreshCw}
                        onClick={() => handleRestock(item)}
                        aria-label="Restock item"
                      >
                        Restock
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit}
                        onClick={() => handleEdit(item)}
                        aria-label="Edit item"
                      >
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      {editingItem ? <Edit className="h-6 w-6 text-blue-600" /> : <Plus className="h-6 w-6 text-blue-600" />}
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">
                            Item Name
                          </label>
                          <input
                            type="text"
                            name="itemName"
                            id="itemName"
                            required
                            value={formData.itemName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                              Category
                            </label>
                            <select
                              id="category"
                              name="category"
                              required
                              value={formData.category}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="">Select category</option>
                              {categories.map(category => (
                                <option key={category} value={category} className="capitalize">
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                              Unit
                            </label>
                            <input
                              type="text"
                              name="unit"
                              id="unit"
                              required
                              placeholder="e.g., litres, pcs, bottles"
                              value={formData.unit}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                              Current Quantity
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              id="quantity"
                              min="0"
                              step="0.1"
                              required
                              value={formData.quantity}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">
                              Low Stock Threshold
                            </label>
                            <input
                              type="number"
                              name="threshold"
                              id="threshold"
                              min="0"
                              step="0.1"
                              required
                              value={formData.threshold}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700">
                            Price per Unit (Optional)
                          </label>
                          <input
                            type="number"
                            name="pricePerUnit"
                            id="pricePerUnit"
                            min="0"
                            step="0.01"
                            value={formData.pricePerUnit}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <Button
                    type="submit"
                    variant="primary"
                    className="sm:ml-3"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 sm:mt-0"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Restock Modal */}
      {isRestockModalOpen && restockingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsRestockModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleRestockSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                      <RefreshCw className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Restock Item
                      </h3>
                      <div className="mt-4">
                        <div className="bg-gray-50 p-4 rounded-md mb-4">
                          <h4 className="font-medium text-gray-900">{restockingItem.itemName}</h4>
                          <p className="text-sm text-gray-500">
                            Current Stock: {restockingItem.quantity} {restockingItem.unit}
                          </p>
                          <p className="text-sm text-gray-500">
                            Threshold: {restockingItem.threshold} {restockingItem.unit}
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="restockAmount" className="block text-sm font-medium text-gray-700">
                            Quantity to Add
                          </label>
                          <input
                            type="number"
                            name="restockAmount"
                            id="restockAmount"
                            min="0.1"
                            step="0.1"
                            required
                            value={restockAmount}
                            onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 0)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            New total will be: {restockingItem.quantity + restockAmount} {restockingItem.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <Button
                    type="submit"
                    variant="success"
                    className="sm:ml-3"
                    disabled={restockAmount <= 0}
                  >
                    Restock Item
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsRestockModalOpen(false)}
                    className="mt-3 sm:mt-0"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;