import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getScheduledServices, 
  updateAppointmentStatus, 
  deleteScheduledService,
  getTodaysAppointments,
  getUpcomingAppointments
} from '../utils/localStorage';
import { ScheduledService, AppointmentStatus } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Clock, 
  Phone, 
  Car, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ServiceCalendar: React.FC = () => {
  const { isAdmin } = useAuth();
  const [appointments, setAppointments] = useState<ScheduledService[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<ScheduledService[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<ScheduledService | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, statusFilter]);

  const loadAppointments = () => {
    const allAppointments = getScheduledServices();
    setAppointments(allAppointments);
  };

  const applyFilters = () => {
    let filtered = [...appointments];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }
    
    // Sort by scheduled date
    filtered.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    
    setFilteredAppointments(filtered);
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      updateAppointmentStatus(appointmentId, newStatus);
      loadAppointments();
      toast.success(`Appointment marked as ${newStatus}`);
      setSelectedAppointment(null);
    } catch (error) {
      toast.error('Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      try {
        deleteScheduledService(appointmentId);
        loadAppointments();
        toast.success('Appointment deleted successfully');
        setSelectedAppointment(null);
      } catch (error) {
        toast.error('Failed to delete appointment');
      }
    }
  };

  const getAppointmentsForDate = (date: Date): ScheduledService[] => {
    return appointments.filter(appointment => 
      isSameDay(parseISO(appointment.scheduledDate), date)
    );
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return <Clock size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'missed':
        return <XCircle size={16} />;
      case 'cancelled':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const renderCalendarView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <Card title={`Calendar - ${format(selectedDate, 'MMMM yyyy')}`} icon={Calendar}>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
            >
              Next
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  isCurrentDay ? 'bg-red-50 border-red-200' : ''
                }`}
                onClick={() => {
                  if (dayAppointments.length > 0) {
                    setSelectedAppointment(dayAppointments[0]);
                  }
                }}
              >
                <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-red-700' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map(appointment => (
                    <div
                      key={appointment.id}
                      className={`text-xs p-1 rounded border ${getStatusColor(appointment.status)}`}
                    >
                      <div className="font-medium truncate">{appointment.customerName}</div>
                      <div className="truncate">{format(parseISO(appointment.scheduledDate), 'HH:mm')}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const renderListView = () => {
    const todaysAppointments = getTodaysAppointments();
    const upcomingAppointments = getUpcomingAppointments();

    return (
      <div className="space-y-6">
        {/* Today's Appointments */}
        <Card title="Today's Appointments" icon={Clock}>
          {todaysAppointments.length > 0 ? (
            <div className="space-y-3">
              {todaysAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{appointment.customerName}</h4>
                        <p className="text-sm text-gray-500">{appointment.serviceType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {format(parseISO(appointment.scheduledDate), 'HH:mm')}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No appointments scheduled for today
            </div>
          )}
        </Card>

        {/* Upcoming Appointments */}
        <Card title="Upcoming Appointments (Next 7 Days)" icon={Calendar}>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{appointment.customerName}</h4>
                        <p className="text-sm text-gray-500">{appointment.serviceType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {format(parseISO(appointment.scheduledDate), 'MMM dd, HH:mm')}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No upcoming appointments in the next 7 days
            </div>
          )}
        </Card>

        {/* All Appointments */}
        <Card title="All Appointments" icon={Filter}>
          <div className="mb-4">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="space-y-3">
              {filteredAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{appointment.customerName}</h4>
                        <p className="text-sm text-gray-500">{appointment.serviceType}</p>
                        <p className="text-xs text-gray-400">Created by {appointment.createdByName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {format(parseISO(appointment.scheduledDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No appointments found
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Service Calendar</h1>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Link to="/schedule">
            <Button
              variant="primary"
              icon={Plus}
            >
              Schedule Service
            </Button>
          </Link>
        </div>
      </div>

      {viewMode === 'calendar' ? renderCalendarView() : renderListView()}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedAppointment(null)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${getStatusColor(selectedAppointment.status)}`}>
                    {getStatusIcon(selectedAppointment.status)}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Appointment Details
                    </h3>
                    <div className="mt-4">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500 flex items-center">
                            <User size={16} className="mr-1" />
                            Customer
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedAppointment.customerName}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500 flex items-center">
                            <Phone size={16} className="mr-1" />
                            Phone
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedAppointment.phoneNumber}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500 flex items-center">
                            <Car size={16} className="mr-1" />
                            Vehicle
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedAppointment.carDetails}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Service</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedAppointment.serviceType}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500 flex items-center">
                            <Clock size={16} className="mr-1" />
                            Date & Time
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {format(parseISO(selectedAppointment.scheduledDate), 'MMM dd, yyyy HH:mm')}
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                              {selectedAppointment.status}
                            </span>
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Created by</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedAppointment.createdByName}</dd>
                        </div>
                        {selectedAppointment.notes && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Notes</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedAppointment.notes}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  {selectedAppointment.status === 'scheduled' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                      >
                        Mark Completed
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleStatusUpdate(selectedAppointment.id, 'missed')}
                      >
                        Mark Missed
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={AlertCircle}
                        onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {isAdmin && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCalendar;