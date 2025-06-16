import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getServices, addService, updateService, toggleServiceStatus } from '../utils/localStorage';
import { Service, ServiceType } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Wrench, Plus, Edit, Power, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Services: React.FC = () => {
  const { isAdmin } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'fixed' as ServiceType,
    price: 0,
    estimatedTime: 0,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    const allServices = getServices();
    setServices(allServices);
  };

  const handleAddNew = () => {
    setEditingService(null);
    setFormData({
      name: '',
      type: 'fixed',
      price: 0,
      estimatedTime: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      type: service.type,
      price: service.price,
      estimatedTime: service.estimatedTime || 0,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (service: Service) => {
    try {
      toggleServiceStatus(service.id);
      loadServices();
      toast.success(`Service ${service.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update service status');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        // Update existing service
        updateService({
          ...editingService,
          name: formData.name,
          type: formData.type,
          price: formData.price,
          estimatedTime: formData.type === 'hourly' ? undefined : formData.estimatedTime,
        });
        toast.success('Service updated successfully');
      } else {
        // Add new service
        addService({
          name: formData.name,
          type: formData.type,
          price: formData.price,
          estimatedTime: formData.type === 'hourly' ? undefined : formData.estimatedTime,
          isActive: true,
        });
        toast.success('Service added successfully');
      }
      
      setIsModalOpen(false);
      loadServices();
    } catch (error) {
      toast.error('Failed to save service');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'estimatedTime' ? parseFloat(value) || 0 : value,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleAddNew}
        >
          Add New Service
        </Button>
      </div>
      
      <Card title="Services List" icon={Wrench}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Time
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
              {services.map((service) => (
                <tr key={service.id} className={!service.isActive ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {service.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(service.price)}
                    {service.type === 'hourly' && '/hr'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.estimatedTime ? `${service.estimatedTime} min` : 'Variable'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit}
                        onClick={() => handleEdit(service)}
                        aria-label="Edit service"
                      >
                        Edit
                      </Button>
                      <Button
                        variant={service.isActive ? 'warning' : 'success'}
                        size="sm"
                        icon={Power}
                        onClick={() => handleToggleStatus(service)}
                        aria-label={service.isActive ? 'Deactivate service' : 'Activate service'}
                      >
                        {service.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No services found. Add your first service to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Service Form Modal */}
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
                      {editingService ? <Edit className="h-6 w-6 text-blue-600" /> : <Plus className="h-6 w-6 text-blue-600" />}
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {editingService ? 'Edit Service' : 'Add New Service'}
                      </h3>
                      <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Service Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Service Type
                          </label>
                          <div className="mt-1">
                            <select
                              id="type"
                              name="type"
                              value={formData.type}
                              onChange={handleInputChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="fixed">Fixed Price</option>
                              <option value="hourly">Hourly Rate</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            {formData.type === 'hourly' ? 'Hourly Rate' : 'Price'}
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <DollarSign className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                              type="number"
                              name="price"
                              id="price"
                              min="0"
                              step="0.01"
                              required
                              value={formData.price}
                              onChange={handleInputChange}
                              className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        
                        {formData.type === 'fixed' && (
                          <div className="sm:col-span-6">
                            <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700">
                              Estimated Time (minutes)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </div>
                              <input
                                type="number"
                                name="estimatedTime"
                                id="estimatedTime"
                                min="0"
                                value={formData.estimatedTime}
                                onChange={handleInputChange}
                                className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        )}
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
                    {editingService ? 'Update Service' : 'Add Service'}
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
    </div>
  );
};

export default Services;