import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getActiveServices, 
  addJob, 
  getJobs, 
  updateJob, 
  getAvailableInventoryItems 
} from '../utils/localStorage';
import { Service, Job, JobService, JobConsumable, PaymentType, InventoryItem } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const JobForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<JobService[]>([]);
  const [selectedConsumables, setSelectedConsumables] = useState<JobConsumable[]>([]);
  
  const [formData, setFormData] = useState({
    customerName: '',
    vehicle: '',
    paymentType: 'cash' as PaymentType,
    notes: '',
  });
  
  useEffect(() => {
    // Load available services and inventory
    const services = getActiveServices();
    const inventory = getAvailableInventoryItems();
    setAvailableServices(services);
    setAvailableInventory(inventory);
    
    // If editing, load job data
    if (isEditing && id) {
      const jobs = getJobs();
      const job = jobs.find(j => j.id === id);
      
      if (job) {
        setFormData({
          customerName: job.customerName,
          vehicle: job.vehicle,
          paymentType: job.paymentType,
          notes: job.notes || '',
        });
        
        setSelectedServices(job.services);
        setSelectedConsumables(job.consumables || []);
      } else {
        toast.error('Job not found');
        navigate('/jobs');
      }
    }
  }, [id, isEditing, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const addServiceToJob = () => {
    if (availableServices.length === 0) return;
    
    const firstService = availableServices[0];
    const newService: JobService = {
      serviceId: firstService.id,
      serviceName: firstService.name,
      price: firstService.price,
      quantity: 1,
    };
    
    setSelectedServices([...selectedServices, newService]);
  };
  
  const removeServiceFromJob = (index: number) => {
    const updatedServices = [...selectedServices];
    updatedServices.splice(index, 1);
    setSelectedServices(updatedServices);
  };
  
  const handleServiceChange = (index: number, field: keyof JobService, value: string | number) => {
    const updatedServices = [...selectedServices];
    
    if (field === 'serviceId') {
      const selectedService = availableServices.find(s => s.id === value);
      if (selectedService) {
        updatedServices[index] = {
          ...updatedServices[index],
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          price: selectedService.price,
        };
      }
    } else {
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: field === 'quantity' ? Math.max(1, Number(value)) : value,
      };
    }
    
    setSelectedServices(updatedServices);
  };
  
  const addConsumableToJob = () => {
    if (availableInventory.length === 0) return;
    
    const firstItem = availableInventory[0];
    const newConsumable: JobConsumable = {
      itemId: firstItem.id,
      itemName: firstItem.itemName,
      quantityUsed: 1,
      unit: firstItem.unit,
    };
    
    setSelectedConsumables([...selectedConsumables, newConsumable]);
  };
  
  const removeConsumableFromJob = (index: number) => {
    const updatedConsumables = [...selectedConsumables];
    updatedConsumables.splice(index, 1);
    setSelectedConsumables(updatedConsumables);
  };
  
  const handleConsumableChange = (index: number, field: keyof JobConsumable, value: string | number) => {
    const updatedConsumables = [...selectedConsumables];
    
    if (field === 'itemId') {
      const selectedItem = availableInventory.find(i => i.id === value);
      if (selectedItem) {
        updatedConsumables[index] = {
          ...updatedConsumables[index],
          itemId: selectedItem.id,
          itemName: selectedItem.itemName,
          unit: selectedItem.unit,
        };
      }
    } else {
      updatedConsumables[index] = {
        ...updatedConsumables[index],
        [field]: field === 'quantityUsed' ? Math.max(0.1, Number(value)) : value,
      };
    }
    
    setSelectedConsumables(updatedConsumables);
  };
  
  const validateConsumables = (): boolean => {
    for (const consumable of selectedConsumables) {
      const inventoryItem = availableInventory.find(i => i.id === consumable.itemId);
      if (!inventoryItem) {
        toast.error(`Inventory item not found: ${consumable.itemName}`);
        return false;
      }
      if (inventoryItem.quantity < consumable.quantityUsed) {
        toast.error(`Insufficient quantity for ${consumable.itemName}. Available: ${inventoryItem.quantity} ${inventoryItem.unit}, Required: ${consumable.quantityUsed} ${consumable.unit}`);
        return false;
      }
    }
    return true;
  };
  
  const calculateTotal = (): number => {
    return selectedServices.reduce((total, service) => {
      return total + (service.price * service.quantity);
    }, 0);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to perform this action');
      return;
    }
    
    if (selectedServices.length === 0) {
      toast.error('You must add at least one service');
      return;
    }
    
    // Validate consumables only for new jobs (not when editing)
    if (!isEditing && selectedConsumables.length > 0 && !validateConsumables()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const jobData: Omit<Job, 'id'> = {
        customerName: formData.customerName,
        vehicle: formData.vehicle,
        services: selectedServices,
        consumables: selectedConsumables.length > 0 ? selectedConsumables : undefined,
        totalPrice: calculateTotal(),
        paymentType: formData.paymentType,
        date: new Date().toISOString(),
        staffId: user.id,
        staffName: user.name,
        notes: formData.notes,
      };
      
      if (isEditing && id) {
        updateJob({ id, ...jobData });
        toast.success('Job updated successfully');
      } else {
        addJob(jobData);
        toast.success('Job created successfully');
      }
      
      navigate('/jobs');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save job');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate('/jobs')}
          className="mr-4"
        >
          Back to Jobs
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Job' : 'Create New Job'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Customer Information">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    id="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">
                    Vehicle *
                  </label>
                  <input
                    type="text"
                    name="vehicle"
                    id="vehicle"
                    required
                    placeholder="Year, Make, Model"
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </Card>
            
            <Card 
              title="Services" 
              footer={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  onClick={addServiceToJob}
                  disabled={availableServices.length === 0}
                >
                  Add Service
                </Button>
              }
            >
              {selectedServices.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No services added yet. Click "Add Service" to begin.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedServices.map((service, index) => (
                    <div key={index} className="p-4 border rounded-md bg-gray-50">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                        <div className="sm:col-span-5">
                          <label htmlFor={`service-${index}`} className="block text-xs font-medium text-gray-700">
                            Service
                          </label>
                          <select
                            id={`service-${index}`}
                            value={service.serviceId}
                            onChange={(e) => handleServiceChange(index, 'serviceId', e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            {availableServices.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} - {formatCurrency(s.price)}{s.type === 'hourly' ? '/hr' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label htmlFor={`quantity-${index}`} className="block text-xs font-medium text-gray-700">
                            Quantity
                          </label>
                          <input
                            type="number"
                            id={`quantity-${index}`}
                            min="1"
                            value={service.quantity}
                            onChange={(e) => handleServiceChange(index, 'quantity', e.target.value)}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-medium text-gray-700">
                            Price
                          </label>
                          <div className="mt-1 block w-full py-2 px-3 text-sm font-medium">
                            {formatCurrency(service.price)}
                          </div>
                        </div>
                        
                        <div className="sm:col-span-2 flex items-end">
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={() => removeServiceFromJob(index)}
                            className="w-full"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            <Card 
              title="Consumables Used" 
              footer={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  onClick={addConsumableToJob}
                  disabled={availableInventory.length === 0}
                >
                  Add Consumable
                </Button>
              }
            >
              {selectedConsumables.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No consumables added. Click "Add Consumable" to track inventory usage.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedConsumables.map((consumable, index) => (
                    <div key={index} className="p-4 border rounded-md bg-gray-50">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                        <div className="sm:col-span-6">
                          <label htmlFor={`consumable-${index}`} className="block text-xs font-medium text-gray-700">
                            Item
                          </label>
                          <select
                            id={`consumable-${index}`}
                            value={consumable.itemId}
                            onChange={(e) => handleConsumableChange(index, 'itemId', e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            {availableInventory.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.itemName} (Available: {item.quantity} {item.unit})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label htmlFor={`consumable-quantity-${index}`} className="block text-xs font-medium text-gray-700">
                            Quantity Used
                          </label>
                          <input
                            type="number"
                            id={`consumable-quantity-${index}`}
                            min="0.1"
                            step="0.1"
                            value={consumable.quantityUsed}
                            onChange={(e) => handleConsumableChange(index, 'quantityUsed', e.target.value)}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Unit
                          </label>
                          <div className="mt-1 block w-full py-2 px-3 text-sm">
                            {consumable.unit}
                          </div>
                        </div>
                        
                        <div className="sm:col-span-2 flex items-end">
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={() => removeConsumableFromJob(index)}
                            className="w-full"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            <Card title="Additional Information">
              <div className="space-y-4">
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add any additional notes or comments here"
                  />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card title="Payment Details">
              <div className="space-y-4">
                <div>
                  <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">
                    Payment Type *
                  </label>
                  <select
                    id="paymentType"
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                  </select>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(calculateTotal())}</span>
                  </div>
                  
                  <div className="mt-4 flex justify-between text-base">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="flex flex-col space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Save}
                isLoading={loading}
                disabled={selectedServices.length === 0}
                fullWidth
              >
                {isEditing ? 'Update Job' : 'Create Job'}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate('/jobs')}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JobForm;