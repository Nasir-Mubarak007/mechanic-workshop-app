import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchTodayJobs,
  fetchJobsByStaff,
  fetchServices,
  fetchLowStockItems,
  fetchTodaysAppointments,
  fetchUpcomingAppointments,
} from '../api/dashboard';
import { useLocation } from 'react-router-dom';  
import { format } from 'date-fns';
import { Job, Service, ScheduledService } from '../types';
import Card from '../components/common/Card';
import {
  Wrench,
  DollarSign,
  Clock,
  CalendarCheck,
  Car,
  BarChart,
  CreditCard,
  AlertTriangle,
  Calendar,
  CalendarPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [todayJobs, setTodayJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState<ScheduledService[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<ScheduledService[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalToday: 0,
    revenueToday: 0,
    pendingJobs: 0,
    averageService: 0,
  });

//   useEffect(() => {
//     const loadData = async () => {
//         setLoading(true);
//       try {
//         // ✅ Services
//         const allServices = await fetchServices();
//         setServices(allServices);

//         // ✅ Jobs: admin sees all, staff sees own
//         let jobs: Job[] = [];
//         if (isAdmin) {
//           jobs = await fetchTodayJobs();
//         } else if (user?._id) {
//           jobs = await fetchJobsByStaff(user._id, format(new Date(), 'yyyy-MM-dd'));
//         }
//         setTodayJobs(jobs);

//         // ✅ Stats
//         const totalRevenue = jobs.reduce((sum, job) => sum + job.totalPrice, 0);
//         setStats({
//           totalToday: jobs.length,
//           revenueToday: totalRevenue,
//           pendingJobs: 0, // needs status in schema to calculate properly
//           averageService: jobs.length > 0 ? totalRevenue / jobs.length : 0,
//         });

//         // ✅ Low stock (only admin)
//         if (isAdmin) {
//           const lowStockItems = await fetchLowStockItems();
//           setLowStockCount(lowStockItems.length);
//         }

//         // ✅ Appointments
//         const todayAppts = await fetchTodaysAppointments();
//         const upcomingAppts = await fetchUpcomingAppointments();
//         setTodaysAppointments(todayAppts);
//         setUpcomingAppointments(upcomingAppts);
//       } catch (err:any) {
//         toast.error('Dashboard load failed:', err);
//       }finally { setLoading(false) }
//     };

//     loadData();
//   }, [isAdmin, user, location]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // ✅ Services
        const allServices = await fetchServices();
        setServices(allServices);

        // ✅ Jobs
        let jobs: Job[] = [];
        if (isAdmin) {
          jobs = await fetchTodayJobs();
        } else if (user?._id) {
          jobs = await fetchJobsByStaff(user._id, format(new Date(), "yyyy-MM-dd"));
        }
        setTodayJobs(jobs);

        // ✅ Stats
        const totalRevenue = jobs.reduce((sum, job) => sum + job.totalPrice, 0);
        setStats({
          totalToday: jobs.length,
          revenueToday: totalRevenue,
          pendingJobs: 0,
          averageService: jobs.length > 0 ? totalRevenue / jobs.length : 0,
        });

        // ✅ Low stock
        if (isAdmin) {
          const lowStockItems = await fetchLowStockItems();
          setLowStockCount(lowStockItems.length);
        }

        // ✅ Appointments
        const todayAppts = await fetchTodaysAppointments();
        const upcomingAppts = await fetchUpcomingAppointments();
        setTodaysAppointments(todayAppts);
        setUpcomingAppointments(upcomingAppts);
      } catch (err: any) {
        console.error(err);
        toast.error(`Dashboard load failed: ${err.message || "Unknown error"}`, {
          duration: 4000,
        });
      } finally {
        setLoading(false); // <-- always reset loading
      }
    };

    loadData();
  }, [isAdmin, user]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    
      <div className="space-y-6">
        {loading 
        ? (<Spinner />)
        :
        (
            <>
          {/* Top stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="transform transition-transform hover:scale-105">
                  <div className="flex items-center">
                      <div className="p-3 rounded-full bg-red-100 text-red-700">
                          <Wrench size={24} />
                      </div>
                      <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Services Today</p>
                          <p className="text-2xl font-semibold text-gray-900">{stats.totalToday}</p>
                      </div>
                  </div>
              </Card>

              <Card className="transform transition-transform hover:scale-105">
                  <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100 text-green-800">
                          <DollarSign size={24} />
                      </div>
                      <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Revenue Today</p>
                          <p className="text-2xl font-semibold text-gray-900">
                              {formatCurrency(stats.revenueToday)}
                          </p>
                      </div>
                  </div>
              </Card>

              <Card className="transform transition-transform hover:scale-105">
                  <div className="flex items-center">
                      <div className="p-3 rounded-full bg-amber-100 text-amber-800">
                          <Clock size={24} />
                      </div>
                      <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Average Service</p>
                          <p className="text-2xl font-semibold text-gray-900">
                              {formatCurrency(stats.averageService)}
                          </p>
                      </div>
                  </div>
              </Card>

              <Card className="transform transition-transform hover:scale-105">
                  <div className="flex items-center">
                      <div className="p-3 rounded-full bg-red-100 text-red-700">
                          <CalendarCheck size={24} />
                      </div>
                      <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Appointments Today</p>
                          <p className="text-2xl font-semibold text-gray-900">{todaysAppointments.length}</p>
                      </div>
                  </div>
              </Card>
          </div>

          {/* Jobs & Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card
                  title="Today's Jobs"
                  icon={Car}
                  className="col-span-1 lg:col-span-2"
                  footer={
                      <Link
                          to="/jobs"
                          className="text-sm text-red-700 hover:text-red-600 font-medium flex items-center"
                      >
                          View all jobs
                      </Link>
                  }
              >
                  <div className="overflow-x-auto">
                      {todayJobs.length > 0 ? (
                          <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                  <tr>
                                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Customer
                                      </th>
                                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Vehicle
                                      </th>
                                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Service
                                      </th>
                                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Amount
                                      </th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                  {todayJobs.slice(0, 5).map((job) => (
                                      <tr key={job._id} className="hover:bg-red-50">
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                              {job.customerName}
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {job.carDetails}
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {job.services.length > 1
                                                  ? `${job.services[0].serviceName} +${job.services.length - 1} more`
                                                  : job.services[0]?.serviceName}
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                              {formatCurrency(job.totalPrice)}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      ) : (
                          <div className="text-center py-8 text-gray-500">No jobs recorded today</div>
                      )}
                  </div>
              </Card>

              <Card title="Quick Links" icon={BarChart}>
                  <div className="space-y-4">
                      <Link
                          to="/jobs/new"
                          className="block p-4 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                      >
                          <div className="flex items-center">
                              <div className="p-2 rounded-full bg-red-100 text-red-700">
                                  <Wrench size={18} />
                              </div>
                              <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">Log New Job</p>
                                  <p className="text-xs text-gray-500">Record a new service or repair</p>
                              </div>
                          </div>
                      </Link>

                      <Link
                          to="/schedule"
                          className="block p-4 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                      >
                          <div className="flex items-center">
                              <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                                  <CalendarPlus size={18} />
                              </div>
                              <div className="ml-3 flex-1">
                                  <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-900">Schedule Service</p>
                                      {upcomingAppointments.length > 0 && (
                                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                              {upcomingAppointments.length} upcoming
                                          </span>
                                      )}
                                  </div>
                                  <p className="text-xs text-gray-500">Book customer appointments</p>
                              </div>
                          </div>
                      </Link>

                      <Link
                          to="/calendar"
                          className="block p-4 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                      >
                          <div className="flex items-center">
                              <div className="p-2 rounded-full bg-purple-100 text-purple-800">
                                  <Calendar size={18} />
                              </div>
                              <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">Service Calendar</p>
                                  <p className="text-xs text-gray-500">View and manage appointments</p>
                              </div>
                          </div>
                      </Link>

                      {isAdmin && (
                          <>
                              <Link
                                  to="/inventory"
                                  className="block p-4 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                              >
                                  <div className="flex items-center">
                                      <div className="p-2 rounded-full bg-purple-100 text-purple-800">
                                          <AlertTriangle size={18} />
                                      </div>
                                      <div className="ml-3 flex-1">
                                          <div className="flex items-center justify-between">
                                              <p className="text-sm font-medium text-gray-900">Inventory Status</p>
                                              {lowStockCount > 0 && (
                                                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                                                      {lowStockCount} low
                                                  </span>
                                              )}
                                          </div>
                                          <p className="text-xs text-gray-500">Manage stock and consumables</p>
                                      </div>
                                  </div>
                              </Link>

                              <Link
                                  to="/reports"
                                  className="block p-4 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                              >
                                  <div className="flex items-center">
                                      <div className="p-2 rounded-full bg-green-100 text-green-800">
                                          <BarChart size={18} />
                                      </div>
                                      <div className="ml-3">
                                          <p className="text-sm font-medium text-gray-900">Today's Report</p>
                                          <p className="text-xs text-gray-500">View daily summary and stats</p>
                                      </div>
                                  </div>
                              </Link>

                              <Link
                                  to="/services"
                                  className="block p-4 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                              >
                                  <div className="flex items-center">
                                      <div className="p-2 rounded-full bg-amber-100 text-amber-800">
                                          <CreditCard size={18} />
                                      </div>
                                      <div className="ml-3">
                                          <p className="text-sm font-medium text-gray-900">Manage Services</p>
                                          <p className="text-xs text-gray-500">Update service pricing and details</p>
                                      </div>
                                  </div>
                              </Link>
                          </>
                      )}
                  </div>
              </Card>
          </div>

          {/* Appointments */}
          {todaysAppointments.length > 0 && (
              <Card
                  title="Today's Appointments"
                  icon={CalendarCheck}
                  footer={
                      <Link
                          to="/calendar"
                          className="text-sm text-red-700 hover:text-red-600 font-medium flex items-center"
                      >
                          View calendar
                      </Link>
                  }
              >
                  <div className="space-y-3">
                      {todaysAppointments.slice(0, 5).map((appointment) => (
                          <div
                              key={appointment._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                              <div className="flex items-center space-x-3">
                                  <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                                      <Clock size={16} />
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium text-gray-900">{appointment.customerName}</p>
                                      <p className="text-xs text-gray-500">{appointment.serviceType}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                      {format(new Date(appointment.scheduledDate), 'HH:mm')}
                                  </p>
                                  <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'scheduled'
                                              ? 'bg-blue-100 text-blue-800'
                                              : appointment.status === 'completed'
                                                  ? 'bg-green-100 text-green-800'
                                                  : appointment.status === 'missed'
                                                      ? 'bg-red-100 text-red-800'
                                                      : 'bg-gray-100 text-gray-800'
                                          }`}
                                  >
                                      {appointment.status}
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              </Card>
          )}
            </>
        )}
      </div>
  );
};

export default Dashboard;
