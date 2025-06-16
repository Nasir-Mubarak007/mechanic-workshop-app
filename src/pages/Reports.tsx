import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getJobs, getServices } from '../utils/localStorage';
import { Job, Service, DailySummary } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { BarChart3, FileText, Download, Printer, BarChart2 } from 'lucide-react';
import { format, parseISO, isToday, startOfDay, endOfDay, subDays } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports: React.FC = () => {
  const { isAdmin } = useAuth();
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  
  useEffect(() => {
    if (isAdmin) {
      loadServices();
      generateReport();
    }
  }, [isAdmin, date]);
  
  const loadServices = () => {
    const allServices = getServices();
    setServices(allServices);
  };
  
  const generateReport = () => {
    const allJobs = getJobs();
    const selectedDate = date ? new Date(date) : new Date();
    
    // Filter jobs for the selected date
    const dateStart = startOfDay(selectedDate);
    const dateEnd = endOfDay(selectedDate);
    
    const filteredJobs = allJobs.filter(job => {
      const jobDate = new Date(job.date);
      return jobDate >= dateStart && jobDate <= dateEnd;
    });
    
    // Calculate summary data
    const serviceBreakdown: { [key: string]: { count: number; revenue: number } } = {};
    const staffPerformance: { [key: string]: { jobs: number; revenue: number } } = {};
    
    // Initialize service breakdown
    services.forEach(service => {
      serviceBreakdown[service.name] = { count: 0, revenue: 0 };
    });
    
    // Process jobs
    filteredJobs.forEach(job => {
      // Update staff performance
      if (!staffPerformance[job.staffId]) {
        staffPerformance[job.staffId] = { jobs: 0, revenue: 0 };
      }
      staffPerformance[job.staffId].jobs += 1;
      staffPerformance[job.staffId].revenue += job.totalPrice;
      
      // Update service breakdown
      job.services.forEach(service => {
        if (serviceBreakdown[service.serviceName]) {
          serviceBreakdown[service.serviceName].count += service.quantity;
          serviceBreakdown[service.serviceName].revenue += service.price * service.quantity;
        } else {
          serviceBreakdown[service.serviceName] = {
            count: service.quantity,
            revenue: service.price * service.quantity,
          };
        }
      });
    });
    
    // Create summary object
    const summaryData: DailySummary = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      totalJobs: filteredJobs.length,
      totalRevenue: filteredJobs.reduce((sum, job) => sum + job.totalPrice, 0),
      serviceBreakdown,
      staffPerformance,
    };
    
    setSummary(summaryData);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };
  
  const setToday = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };
  
  const setYesterday = () => {
    setDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const getServiceChartData = () => {
    if (!summary) return null;
    
    const labels = Object.keys(summary.serviceBreakdown);
    const data = labels.map(label => summary.serviceBreakdown[label].revenue);
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue by Service',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  
  const getStaffChartData = () => {
    if (!summary) return null;
    
    const staffIds = Object.keys(summary.staffPerformance);
    const labels = staffIds.map(id => {
      if (id === '1') return 'Admin User';
      if (id === '2') return 'John Mechanic';
      if (id === '3') return 'Jane Technician';
      return `Staff ${id}`;
    });
    
    const data = staffIds.map(id => summary.staffPerformance[id].revenue);
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue by Staff',
          data,
          backgroundColor: 'rgba(249, 115, 22, 0.7)',
          borderColor: 'rgba(249, 115, 22, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  
  const exportAsPdf = () => {
    if (!summary) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Daily Report: ${format(new Date(summary.date), 'MMMM dd, yyyy')}`, 14, 22);
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 35);
    doc.setFontSize(10);
    doc.text(`Total Jobs: ${summary.totalJobs}`, 14, 45);
    doc.text(`Total Revenue: ${formatCurrency(summary.totalRevenue)}`, 14, 52);
    
    // Service breakdown table
    doc.setFontSize(14);
    doc.text('Service Breakdown', 14, 65);
    
    const serviceTableData = Object.entries(summary.serviceBreakdown)
      .map(([name, data]) => [name, data.count.toString(), formatCurrency(data.revenue)]);
    
    (doc as any).autoTable({
      startY: 70,
      head: [['Service', 'Count', 'Revenue']],
      body: serviceTableData,
    });
    
    // Staff performance table
    const staffTableY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Staff Performance', 14, staffTableY);
    
    const staffTableData = Object.entries(summary.staffPerformance)
      .map(([id, data]) => {
        let name = 'Unknown';
        if (id === '1') name = 'Admin User';
        if (id === '2') name = 'John Mechanic';
        if (id === '3') name = 'Jane Technician';
        return [name, data.jobs.toString(), formatCurrency(data.revenue)];
      });
    
    (doc as any).autoTable({
      startY: staffTableY + 5,
      head: [['Staff', 'Jobs', 'Revenue']],
      body: staffTableData,
    });
    
    // Save the PDF
    doc.save(`daily-report-${summary.date}.pdf`);
  };
  
  const exportAsCsv = () => {
    if (!summary) return;
    
    // Create CSV content
    let csvContent = `Daily Report: ${format(new Date(summary.date), 'MMMM dd, yyyy')}\n\n`;
    
    // Summary section
    csvContent += `Summary\n`;
    csvContent += `Total Jobs,${summary.totalJobs}\n`;
    csvContent += `Total Revenue,${summary.totalRevenue}\n\n`;
    
    // Service breakdown
    csvContent += `Service Breakdown\n`;
    csvContent += `Service,Count,Revenue\n`;
    Object.entries(summary.serviceBreakdown).forEach(([name, data]) => {
      csvContent += `${name},${data.count},${data.revenue}\n`;
    });
    csvContent += `\n`;
    
    // Staff performance
    csvContent += `Staff Performance\n`;
    csvContent += `Staff,Jobs,Revenue\n`;
    Object.entries(summary.staffPerformance).forEach(([id, data]) => {
      let name = 'Unknown';
      if (id === '1') name = 'Admin User';
      if (id === '2') name = 'John Mechanic';
      if (id === '3') name = 'Jane Technician';
      csvContent += `${name},${data.jobs},${data.revenue}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `daily-report-${summary.date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={exportAsCsv}
            icon={Download}
            disabled={!summary}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={exportAsPdf}
            icon={Printer}
            disabled={!summary}
          >
            Export PDF
          </Button>
        </div>
      </div>
      
      <Card title="Select Date" icon={FileText}>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-full sm:w-auto">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Report Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={date}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={setToday}
            >
              Today
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={setYesterday}
            >
              Yesterday
            </Button>
          </div>
        </div>
      </Card>
      
      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="transform transition-transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                  <FileText size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary.totalJobs}</p>
                </div>
              </div>
            </Card>
            
            <Card className="transform transition-transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-800">
                  <BarChart3 size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalRevenue)}</p>
                </div>
              </div>
            </Card>
            
            <Card className="transform transition-transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-100 text-amber-800">
                  <BarChart2 size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg. Service Value</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {summary.totalJobs > 0
                      ? formatCurrency(summary.totalRevenue / summary.totalJobs)
                      : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Service Breakdown" icon={BarChart3}>
              {getServiceChartData() && (
                <div className="h-64">
                  <Bar
                    data={getServiceChartData()!}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              )}
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Count
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(summary.serviceBreakdown)
                      .filter(([_, data]) => data.count > 0)
                      .sort((a, b) => b[1].revenue - a[1].revenue)
                      .map(([name, data]) => (
                        <tr key={name}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {data.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(data.revenue)}
                          </td>
                        </tr>
                      ))}
                    {Object.keys(summary.serviceBreakdown).filter(key => summary.serviceBreakdown[key].count > 0).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          No services recorded for this date
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            
            <Card title="Staff Performance" icon={BarChart3}>
              {getStaffChartData() && (
                <div className="h-64">
                  <Bar
                    data={getStaffChartData()!}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              )}
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jobs
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(summary.staffPerformance)
                      .sort((a, b) => b[1].revenue - a[1].revenue)
                      .map(([id, data]) => {
                        let name = 'Unknown';
                        if (id === '1') name = 'Admin User';
                        if (id === '2') name = 'John Mechanic';
                        if (id === '3') name = 'Jane Technician';
                        
                        return (
                          <tr key={id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {data.jobs}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(data.revenue)}
                            </td>
                          </tr>
                        );
                      })}
                    {Object.keys(summary.staffPerformance).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          No staff activity recorded for this date
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
      
      {!summary?.totalJobs && (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="mb-4">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no jobs recorded for the selected date.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;