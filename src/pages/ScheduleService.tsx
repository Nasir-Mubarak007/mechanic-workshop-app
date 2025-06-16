import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActiveServices, addScheduledService } from '../utils/localStorage';
import { Service } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { CalendarPlus, Save, ArrowLeft, Phone, Car, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ScheduleService: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    carDetails: '',
    serviceType: '',
    customServiceType: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
  });

  useEffect(() => {
    const activeServices = getActiveServices();
    setServices(activeServices);
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({
      ...prev,
      scheduledDate: format(tomorrow, 'yyyy-MM-dd'),
      scheduledTime: '09:00',
    }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to schedule a service');
      return;
    }

    // Validate required fields
    if (!formData.customerName || !formData.phoneNumber || !formData.carDetails || 
        !formData.serviceType || !formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate custom service type if "other" is selected
    if (formData.serviceType === 'other' && !formData.customServiceType.trim()) {
      toast.error('Please specify the custom service type');
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Check if the scheduled date/time is in the future
    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    const now = new Date();
    if (scheduledDateTime <= now) {
      toast.error('Please schedule the appointment for a future date and time');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        customerName: formData.customerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        carDetails: formData.carDetails.trim(),
        serviceType: formData.serviceType === 'other' ? formData.customServiceType.trim() : formData.serviceType,
        customServiceType: formData.serviceType === 'other' ? formData.customServiceType.trim() : undefined,
        scheduledDate: `${formData.scheduledDate}T${formData.scheduledTime}:00.000Z`,
        status: 'scheduled' as const,
        notes: formData.notes.trim() || undefined,
        createdBy: user.id,
        createdByName: user.name,
      };

      addScheduledService(appointmentData);
      toast.success('Service appointment scheduled successfully!');
      
      // Reset form
      setFormData({
        customerName: '',
        phoneNumber: '',
        carDetails: '',
        serviceType: '',
        customServiceType: '',
        scheduledDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // Tomorrow
        scheduledTime: '09:00',
        notes: '',
      });
      
      // Navigate to calendar to show the new appointment
      navigate('/calendar');
    } catch (error) {
      toast.error('Failed to schedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    return format(now, 'yyyy-MM-dd');
  };

  const getMinTime = () => {
    const now = new Date();
    const selectedDate = new Date(formData.scheduledDate);
    const today = new Date();
    
    // If selected date is today, set minimum time to current time + 1 hour
    if (selectedDate.toDateString() === today.toDateString()) {
      const minTime = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
      return format(minTime, 'HH:mm');
    }
    
    return '08:00'; // Default opening time
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate('/calendar')}
          className="mr-4"
        >
          Back to Calendar
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Schedule Service Appointment</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Customer Information" icon={Phone}>
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
                    className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter customer's full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label htmlFor="carDetails" className="block text-sm font-medium text-gray-700">
                  Vehicle Details *
                </label>
                <input
                  type="text"
                  name="carDetails"
                  id="carDetails"
                  required
                  value={formData.carDetails}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., 2018 Toyota Camry, License: ABC-123"
                />
              </div>
            </Card>

            <Card title="Service Details" icon={Car}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                    Service Type *
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    required
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name} - ${service.price}{service.type === 'hourly' ? '/hr' : ''}
                        {service.estimatedTime && ` (${service.estimatedTime} min)`}
                      </option>
                    ))}
                    <option value="other">Other (specify below)</option>
                  </select>
                </div>

                {formData.serviceType === 'other' && (
                  <div>
                    <label htmlFor="customServiceType" className="block text-sm font-medium text-gray-700">
                      Custom Service Description *
                    </label>
                    <input
                      type="text"
                      name="customServiceType"
                      id="customServiceType"
                      required={formData.serviceType === 'other'}
                      value={formData.customServiceType}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Describe the service needed"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Any special instructions or additional information"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Appointment Time" icon={Clock}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    id="scheduledDate"
                    required
                    min={getMinDateTime()}
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="scheduledTime"
                    id="scheduledTime"
                    required
                    min={getMinTime()}
                    max="17:00"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Business hours: 8:00 AM - 5:00 PM
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="bg-red-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Appointment Summary</h4>
                    <div className="text-xs text-red-700 space-y-1">
                      <p><strong>Customer:</strong> {formData.customerName || 'Not specified'}</p>
                      <p><strong>Service:</strong> {formData.serviceType === 'other' ? formData.customServiceType : formData.serviceType || 'Not selected'}</p>
                      <p><strong>Date:</strong> {formData.scheduledDate ? format(new Date(formData.scheduledDate), 'MMM dd, yyyy') : 'Not selected'}</p>
                      <p><strong>Time:</strong> {formData.scheduledTime || 'Not selected'}</p>
                    </div>
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
                disabled={!formData.customerName || !formData.phoneNumber || !formData.carDetails || !formData.serviceType || !formData.scheduledDate || !formData.scheduledTime}
                fullWidth
              >
                Schedule Appointment
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate('/calendar')}
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

export default ScheduleService;