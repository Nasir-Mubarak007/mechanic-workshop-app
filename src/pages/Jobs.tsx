
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchJobs, fetchJobsByStaff, deleteJob } from "../api/job";
import { Job } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { FileText, Plus, Filter, Search, Trash2, Edit, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Jobs: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [jobDetails, setJobDetails] = useState<Job | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    staffId: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

 


  const loadData = async () => {
  try {
    let jobsData: Job[] = [];

    if (isAdmin) {
      jobsData = await fetchJobs();   // ✅ already an array
    } else if (user) {
      jobsData = await fetchJobsByStaff(user._id);  // ✅ already an array
    }

    jobsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setJobs(jobsData);
  } catch {
    toast.error("Failed to fetch jobs");
  }
};

const applyFilters = async () => {
  try {
    let filteredJobs: Job[] = [];

    if (isAdmin) {
      filteredJobs = await fetchJobs();   // ✅
    } else if (user) {
      filteredJobs = await fetchJobsByStaff(user._id);   // ✅
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.customerName?.toLowerCase().includes(searchLower) ||
        job.carDetails?.toLowerCase().includes(searchLower) ||
        job.services?.some(s => s.serviceName?.toLowerCase().includes(searchLower))
      );
    }

    if (filters.startDate) {
      filteredJobs = filteredJobs.filter(job =>
        new Date(job.createdAt) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      filteredJobs = filteredJobs.filter(job =>
        new Date(job.createdAt) < endDate
      );
    }

    if (isAdmin && filters.staffId) {
      filteredJobs = filteredJobs.filter(job => job.assignedTo === filters.staffId);
    }

    filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setJobs(filteredJobs);
    setIsFilterOpen(false);
  } catch {
    toast.error("Failed to apply filters");
  }
};

  const resetFilters = () => {
    setFilters({ search: '', startDate: '', endDate: '', staffId: '' });
    loadData();
    setIsFilterOpen(false);
  };

  const handleEditJob = (job: Job) => {
    navigate(`/jobs/edit/${job._id}`);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(jobId);
        toast.success("Job deleted");
        loadData();
      } catch {
        toast.error("Failed to delete job");
      }
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Job Logs</h1>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            icon={Filter}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            Filter
          </Button>
          <Link to="/jobs/new">
            <Button variant="primary" icon={Plus}>
              New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      {isFilterOpen && (
        <Card title="Filter Jobs" icon={Filter}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Customer, Vehicle, Service"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <Button variant="secondary" onClick={resetFilters}>Reset</Button>
            <Button variant="primary" onClick={applyFilters}>Apply Filters</Button>
          </div>
        </Card>
      )}

      {/* Jobs Table */}
      <Card title="Jobs List" icon={FileText}>
        <div className="overflow-x-auto flex">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className='min-w-full'>
                <th className="px-4 py-3 text-left text-black font-semibold tracking-tight whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-left text-black font-semibold tracking-tight whitespace-nowrap">Customer</th>
                <th className="px-4 py-3 text-left text-black font-semibold tracking-tight whitespace-nowrap">Vehicle</th>
                <th className="px-4 py-3 text-left text-black font-semibold tracking-tight whitespace-nowrap">Services</th>
                <th className="px-4 py-3 text-left text-black font-semibold tracking-tight whitespace-nowrap">Total</th>
                {isAdmin && <th className="px-4 py-3 text-left text-black font-semibold tracking-tight whitespace-nowrap">Staff</th>}
                <th className="px-4 py-3 text-right text-black font-semibold tracking-tight whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job._id}>
                  <td className="px-4 py-3 text-left text-sm font-medium text-gray-500 tracking-wider whitespace-nowrap">{job.createdAt ? format(parseISO(job.createdAt), 'MMM dd, yyyy') : '—'}</td>
                  <td className="px-4 py-3 text-left text-sm font-medium text-gray-500 tracking-wider whitespace-nowrap">{job.customerName || '—'}</td>
                  <td className="px-4 py-3 text-left text-sm font-medium text-gray-500 tracking-wider whitespace-nowrap">{job.carDetails || '—'}</td>
                  <td className="px-4 py-3 text-left text-sm font-medium text-gray-500 tracking-wider whitespace-nowrap">
                    {job.services?.length > 1
                      ? `${job.services[0]?.serviceName} +${job.services.length - 1} more`
                      : job.services?.[0]?.serviceName || '—'}
                  </td>
                  <td className="px-4 py-3 text-left text-sm font-medium text-gray-500 tracking-wider whitespace-nowrap">{formatCurrency(job.totalPrice)}</td>
                  {isAdmin && <td className="px-4 py-3 text-left text-sm font-medium text-gray-500 tracking-wider whitespace-nowrap">{job.staffName || '—'}</td>}
                  <td className='flex justify-end'>
                    <Button variant="ghost" color='success' size="sm" icon={Info} onClick={() => setJobDetails(job)}>Details</Button>
                    <Button variant="ghost" color='primary' size="sm" icon={Edit} onClick={() => handleEditJob(job)}>Edit</Button>
                    {isAdmin && (
                      <Button variant="ghost" color='danger' size="sm" icon={Trash2} onClick={() => handleDeleteJob(job._id)}>Delete</Button>
                    )}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6}>No jobs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Job Details Modal */}
      {jobDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 py-8 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setJobDetails(null)}
            />
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-6 py-5">
                {/* Header */}
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Job Details
                  </h3>
                </div>

                {/* Details grid */}
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Customer</dt>
                    <dd className="mt-1 text-sm text-gray-900">{jobDetails.customerName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
                    <dd className="mt-1 text-sm text-gray-900">{jobDetails.carDetails}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {format(parseISO(jobDetails.createdAt), 'MMM dd, yyyy')}
                    </dd>
                    <dt className="text-sm font-medium text-gray-500 mt-3">Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {format(parseISO(jobDetails.createdAt), 'hh:mm a')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Staff</dt>
                    <dd className="mt-1 text-sm text-gray-900">{jobDetails.staffName}</dd>
                  </div>
                </dl>

                {/* Services */}
                <div className="mt-6">
                  <dt className="text-sm font-medium text-gray-500">Services</dt>
                  <dd className="mt-2 text-sm text-gray-900">
                    <ul className="border rounded-md divide-y divide-gray-200">
                      {jobDetails.services.map((service, index) => (
                        <li
                          key={index}
                          className="flex justify-between px-4 py-2 text-sm"
                        >
                          <span>{service.serviceName}</span>
                          <div className="flex space-x-6">
                            <span className="text-gray-500">
                              {service.quantity > 1 ? `${service.quantity} × ` : ''}
                              {formatCurrency(service.price)}
                            </span>
                            <span className="text-gray-900 font-medium">
                              {formatCurrency(service.price * service.quantity)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>

                {/* Payment + Total */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {jobDetails.paymentType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-bold">
                      {formatCurrency(jobDetails.totalPrice)}
                    </dd>
                  </div>
                </div>

                {/* Notes */}
                {jobDetails.notes && (
                  <div className="mt-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{jobDetails.notes}</dd>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setJobDetails(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleEditJob(jobDetails)}
                >
                  Edit Job
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* {jobDetails && (
        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 -z-0"  onClick={() => setJobDetails(null)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <div className="inline-block bg-white rounded-lg text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-blue px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Job Details</h3>
                <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt>Customer</dt>
                    <dd>{jobDetails.customerName || '—'}</dd>
                  </div>
                  <div>
                    <dt>Vehicle</dt>
                    <dd>{jobDetails.carDetails || '—'}</dd>
                  </div>
                  <div>
                    <dt>Date</dt>
                    <dd>{jobDetails.createdAt ? format(parseISO(jobDetails.createdAt), 'MMM dd, yyyy') : '—'}</dd>
                    <dt className="mt-3">Time</dt>
                    <dd>{jobDetails.createdAt ? format(parseISO(jobDetails.createdAt), 'HH:mm a') : '—'}</dd>
                  </div>
                  <div>
                    <dt>Staff</dt>
                    <dd>{jobDetails.staffName || '—'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt>Services</dt>
                    <dd>
                      {jobDetails.services?.length ? (
                        <ul>
                          {jobDetails.services.map((s, i) => (
                            <li key={i}>
                              {s.serviceName} ({s.quantity} × {formatCurrency(s.price)}) = {formatCurrency(s.price * s.quantity)}
                            </li>
                          ))}
                        </ul>
                      ) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt>Payment Type</dt>
                    <dd>{jobDetails.paymentType || '—'}</dd>
                  </div>
                  <div>
                    <dt>Total</dt>
                    <dd>{formatCurrency(jobDetails.totalPrice)}</dd>
                  </div>
                  {jobDetails.notes && (
                    <div className="sm:col-span-2">
                      <dt>Notes</dt>
                      <dd>{jobDetails.notes}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="bg-gray-50 px-4 py-3 gap-3 sm:flex sm:flex-row-reverse rounded-b-lg">
                <Button variant="primary" onClick={() => {}}>Print Receipt</Button>
                <Button variant="primary" onClick={() => handleEditJob(jobDetails)}>Edit Job</Button>
                <Button variant="secondary" onClick={() => setJobDetails(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Jobs;












// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { fetchJobs, fetchJobsByDate, fetchJobsByStaff, deleteJob } from "../api/job";
// import { Job, Service } from '../types';
// import Card from '../components/common/Card';
// import Button from '../components/common/Button';
// import { FileText, Plus, Filter, Search, Trash2, Edit, Info } from 'lucide-react';
// import { format, parseISO } from 'date-fns';
// import { Link, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';

// const Jobs: React.FC = () => {
//   const { user, isAdmin } = useAuth();
//   const navigate = useNavigate();
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [services, setServices] = useState<Service[]>([]);
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [jobDetails, setJobDetails] = useState<Job | null>(null);
  
//   // Filter state
//   const [filters, setFilters] = useState({
//     search: '',
//     startDate: '',
//     endDate: '',
//     staffId: '',
//   });

//   // useEffect(() => {
//   //   loadData();
//   // }, [user]);

//   useEffect(() => {
//     if (user) {
//       loadData();
//     }
//   }, [user]);

//   // const loadData = () => {
//   //   const activeServices = getActiveServices();
//   //   setServices(activeServices);
    
//   //   let jobsData: Job[];
//   //   if (isAdmin) {
//   //     jobsData = fetchJobs();
//   //   } else if (user) {
//   //     jobsData = fetchJobsByStaff(user._id);
//   //   } else {
//   //     jobsData = [];
//   //   }
    
//   //   // Sort by date, newest first
//   //   jobsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//   //   setJobs(jobsData);
    
//   //   console.log(jobsData.map(job => job.services));
//   // };

//   const loadData = async () => {
//     try {
//       let jobsData: Job[] = [];

//       if (isAdmin) {
//         const res = await fetchJobs();
//         jobsData = res.data;
//       } else if (user) {
//         const res = await fetchJobsByStaff(user.id);
//         jobsData = res.data;
//       }

//       jobsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//       setJobs(jobsData);
//     } catch (err) {
//       toast.error("Failed to fetch jobs");
//     }
//   };

//   // const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//   //   const { name, value } = e.target;
//   //   setFilters(prev => ({
//   //     ...prev,
//   //     [name]: value,
//   //   }));
//   // };

//   // const applyFilters = () => {
//   //   let filteredJobs: Job[];
    
//   //   if (isAdmin) {
//   //     filteredJobs = fetchJobs();
//   //   } else if (user) {
//   //     filteredJobs = fetchJobsByStaff(user.id);
//   //   } else {
//   //     filteredJobs = [];
//   //   }
    
//   //   // Filter by search term
//   //   if (filters.search) {
//   //     const searchLower = filters.search.toLowerCase();
//   //     filteredJobs = filteredJobs.filter(job => 
//   //       job.customerName.toLowerCase().includes(searchLower) || 
//   //       job.vehicle.toLowerCase().includes(searchLower) ||
//   //       job.services.some(service => service.serviceName.toLowerCase().includes(searchLower))
//   //     );
//   //   }
    
//   //   // Filter by date range
//   //   if (filters.startDate) {
//   //     filteredJobs = filteredJobs.filter(job => 
//   //       new Date(job.date) >= new Date(filters.startDate)
//   //     );
//   //   }
    
//   //   if (filters.endDate) {
//   //     // Add one day to include the end date fully
//   //     const endDate = new Date(filters.endDate);
//   //     endDate.setDate(endDate.getDate() + 1);
      
//   //     filteredJobs = filteredJobs.filter(job => 
//   //       new Date(job.date) < endDate
//   //     );
//   //   }
    
//   //   // Filter by staff member
//   //   if (isAdmin && filters.staffId) {
//   //     filteredJobs = filteredJobs.filter(job => job.staffId === filters.staffId);
//   //   }
    
//   //   // Sort by date, newest first
//   //   filteredJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//   //   setJobs(filteredJobs);
//   //   setIsFilterOpen(false);
//   // };

//   // const resetFilters = () => {
//   //   setFilters({
//   //     search: '',
//   //     startDate: '',
//   //     endDate: '',
//   //     staffId: '',
//   //   });
//   //   loadData();
//   //   setIsFilterOpen(false);
//   // };

//   // const handleViewDetails = (job: Job) => {
//   //   setJobDetails(job);
//   // };

//   // const handleEditJob = (job: Job) => {
//   //   navigate(`/jobs/edit/${job.id}`);
//   // };

//   // const handleDeleteJob = (jobId: string) => {
//   //   if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
//   //     try {
//   //       deleteJob(jobId);
//   //       loadData();
//   //       toast.success('Job deleted successfully');
//   //     } catch (error) {
//   //       toast.error('Failed to delete job');
//   //     }
//   //   }
//   // };

//   // const formatCurrency = (amount: number) => {
//   //   return new Intl.NumberFormat('en-US', {
//   //     style: 'currency',
//   //     currency: 'USD',
//   //   }).format(amount);
//   // };

//   const applyFilters = async () => {
//     try {
//       let filteredJobs: Job[] = [];

//       if (isAdmin) {
//         const res = await fetchJobs();
//         filteredJobs = res.data;
//       } else if (user) {
//         const res = await fetchJobsByStaff(user._id);
//         filteredJobs = res.data;
//       }

//       if (filters.search) {
//         const searchLower = filters.search.toLowerCase();
//         filteredJobs = filteredJobs.filter(job =>
//           job.customerName.toLowerCase().includes(searchLower) ||
//           job.vehicle.toLowerCase().includes(searchLower) ||
//           job.services.some(s => s.serviceName.toLowerCase().includes(searchLower))
//         );
//       }

//       if (filters.startDate) {
//         filteredJobs = filteredJobs.filter(job =>
//           new Date(job.date) >= new Date(filters.startDate)
//         );
//       }

//       if (filters.endDate) {
//         const endDate = new Date(filters.endDate);
//         endDate.setDate(endDate.getDate() + 1);
//         filteredJobs = filteredJobs.filter(job =>
//           new Date(job.date) < endDate
//         );
//       }

//       if (isAdmin && filters.staffId) {
//         filteredJobs = filteredJobs.filter(job => job.staffId === filters.staffId);
//       }

//       filteredJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//       setJobs(filteredJobs);
//       setIsFilterOpen(false);
//     } catch {
//       toast.error("Failed to apply filters");
//     }
//   };

//   const resetFilters = () => {
//     setFilters({ search: '', startDate: '', endDate: '', staffId: '' });
//     loadData();
//     setIsFilterOpen(false);
//   };

//   const handleEditJob = (job: Job) => {
//     navigate(`/jobs/edit/${job._id}`);
//   };

//   const handleDeleteJob = async (jobId: string) => {
//     if (window.confirm("Are you sure you want to delete this job?")) {
//       try {
//         await deleteJob(jobId);
//         toast.success("Job deleted");
//         loadData();
//       } catch {
//         toast.error("Failed to delete job");
//       }
//     }
//   };

//   const formatCurrency = (amount: number) =>
//     new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
//         <h1 className="text-2xl font-bold text-gray-900">Job Logs</h1>
//         <div className="flex space-x-2">
//           <Button
//             variant="secondary"
//             icon={Filter}
//             onClick={() => setIsFilterOpen(!isFilterOpen)}
//           >
//             Filter
//           </Button>
//           <Link to="/jobs/new">
//             <Button
//               variant="primary"
//               icon={Plus}
//             >
//               New Job
//             </Button>
//           </Link>
//         </div>
//       </div>
      
//       {isFilterOpen && (
//         <Card title="Filter Jobs" icon={Filter}>
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//             <div>
//               <label htmlFor="search" className="block text-sm font-medium text-gray-700">
//                 Search
//               </label>
//               <div className="mt-1 relative rounded-md shadow-sm">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Search className="h-4 w-4 text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   name="search"
//                   id="search"
//                   className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                   placeholder="Customer, Vehicle, Service"
//                   value={filters.search}
//                   onChange={applyFilters}
//                 />
//               </div>
//             </div>
            
//             <div>
//               <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
//                 Start Date
//               </label>
//               <input
//                 type="date"
//                 name="startDate"
//                 id="startDate"
//                 className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                 value={filters.startDate}
//                 onChange={applyFilters}
//               />
//             </div>
            
//             <div>
//               <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
//                 End Date
//               </label>
//               <input
//                 type="date"
//                 name="endDate"
//                 id="endDate"
//                 className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                 value={filters.endDate}
//                 onChange={applyFilters}
//               />
//             </div>
            
//             {isAdmin && (
//               <div>
//                 <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">
//                   Staff Member
//                 </label>
//                 <select
//                   id="staffId"
//                   name="staffId"
//                   className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
//                   value={filters.staffId}
//                   onChange={applyFilters}
//                 >
//                   <option value="">All Staff Members</option>
//                   <option value="1">Admin User</option>
//                   <option value="2">John Mechanic</option>
//                   <option value="3">Jane Technician</option>
//                 </select>
//               </div>
//             )}
//           </div>
          
//           <div className="mt-4 flex justify-end space-x-3">
//             <Button
//               variant="secondary"
//               onClick={resetFilters}
//             >
//               Reset
//             </Button>
//             <Button
//               variant="primary"
//               onClick={applyFilters}
//             >
//               Apply Filters
//             </Button>
//           </div>
//         </Card>
//       )}
      
//       <Card title="Jobs List" icon={FileText}>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Date
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Customer
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Vehicle
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Services
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Total
//                 </th>
//                 {isAdmin && (
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Staff
//                   </th>
//                 )}
//                 <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {jobs?.map((job) => (
//                 <tr key={job._id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {format(parseISO(job.date!), 'MMM dd, yyyy')}
                    
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {job.customerName}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {job.vehicle}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {job.services?.length <1 
//                       ? `${job.services[0].serviceName} +${job.services.length - 1} more` 
//                       : 
//                       job.services[0]?.serviceName}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {formatCurrency(job.totalPrice)}
//                   </td>
//                   {isAdmin && (
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {job.staffName}
//                     </td>
//                   )}
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <div className="flex justify-end space-x-2">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         icon={Info}
//                         onClick={() => handleViewDetails(job)}
//                         aria-label="View job details"
//                       >
//                         Details
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         icon={Edit}
//                         onClick={() => handleEditJob(job)}
//                         aria-label="Edit job"
//                       >
//                         Edit
//                       </Button>
//                       {isAdmin && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           icon={Trash2}
//                           onClick={() => handleDeleteJob(job._id)}
//                           aria-label="Delete job"
//                         >
//                           Delete
//                         </Button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//               {jobs.length === 0 && (
//                 <tr>
//                   <td colSpan={isAdmin ? 7 : 6} className="px-6 py-4 text-center text-gray-500">
//                     No jobs found. Add your first job to get started.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </Card>
      
//       {/* Job Details Modal */}
//       {jobDetails && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setJobDetails(null)}></div>
//             <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
//             <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
//               <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                 <div className="sm:flex sm:items-start">
//                   <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
//                     <FileText className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
//                     <h3 className="text-lg font-medium leading-6 text-gray-900">
//                       Job Details
//                     </h3>
//                     <div className="mt-4">
//                       <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
//                         <div className="sm:col-span-1">
//                           <dt className="text-sm font-medium text-gray-500">Customer</dt>
//                           <dd className="mt-1 text-sm text-gray-900">{jobDetails.customerName}</dd>
//                         </div>
//                         <div className="sm:col-span-1">
//                           <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
//                           <dd className="mt-1 text-sm text-gray-900">{jobDetails.vehicle}</dd>
//                         </div>
//                         <div className="sm:col-span-1">
//                           <dt className="text-sm font-medium text-gray-500">Date</dt>
//                           <dd className="mt-1 text-sm text-gray-900">{format(parseISO(jobDetails.date), 'MMM dd, yyyy')}</dd>
//                           <dt className="text-sm font-medium text-gray-500 mt-3">Time</dt>
//                           <dd className="mt-1 text-sm text-gray-900">{format(parseISO(jobDetails.date).getTime(), 'HH:mm a')}</dd>
//                         </div>
//                         <div className="sm:col-span-1">
//                           <dt className="text-sm font-medium text-gray-500">Staff</dt>
//                           <dd className="mt-1 text-sm text-gray-900">{jobDetails.staffName}</dd>
//                         </div>
//                         <div className="sm:col-span-2">
//                           <dt className="text-sm font-medium text-gray-500">Services</dt>
//                           <dd className="mt-1 text-sm text-gray-900">
//                             <ul className="border rounded-md divide-y divide-gray-200">
//                               {jobDetails.services.map((service, index) => (
//                                 <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
//                                   <div className="w-0 flex-1 flex items-center">
//                                     <span className="ml-2 flex-1 w-0 truncate">{service.serviceName}</span>
//                                   </div>
//                                   <div className="ml-4 flex-shrink-0 flex space-x-4">
//                                     <span className="text-gray-500">
//                                       {service.quantity > 1 ? `${service.quantity} × ` : ''}
//                                       {formatCurrency(service.price)}
//                                     </span>
//                                     <span className="text-gray-900 font-medium">
//                                       {formatCurrency(service.price * service.quantity)}
//                                     </span>
//                                   </div>
//                                 </li>
//                               ))}
//                             </ul>
//                           </dd>
//                         </div>
//                         <div className="sm:col-span-1">
//                           <dt className="text-sm font-medium text-gray-500">Payment Type</dt>
//                           <dd className="mt-1 text-sm text-gray-900 capitalize">{jobDetails.paymentType}</dd>
//                         </div>
//                         <div className="sm:col-span-1">
//                           <dt className="text-sm font-medium text-gray-500">Total</dt>
//                           <dd className="mt-1 text-sm text-gray-900 font-bold">{formatCurrency(jobDetails.totalPrice)}</dd>
//                         </div>
//                         {jobDetails.notes && (
//                           <div className="sm:col-span-2">
//                             <dt className="text-sm font-medium text-gray-500">Notes</dt>
//                             <dd className="mt-1 text-sm text-gray-900">{jobDetails.notes}</dd>
//                           </div>
//                         )}
//                       </dl>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
//                 <Button
//                   type="button"
//                   variant="primary"
//                   onClick={() => handleEditJob(jobDetails)}
//                   className="sm:ml-3"
//                 >
//                   Edit Job
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="secondary"
//                   onClick={() => setJobDetails(null)}
//                   className="mt-3 sm:mt-0"
//                 >
//                   Close
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Jobs;