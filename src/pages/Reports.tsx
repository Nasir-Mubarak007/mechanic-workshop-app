import React, { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { BarChart3, FileText, Download, Printer, BarChart2 } from 'lucide-react';
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext"; // 👈 import your auth context


import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth(); // 👈 also grab loading state

  // 🔒 Redirect non-admins
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login"); // not logged in
      } else if (!isAdmin) {
        navigate("/jobs"); // logged in but not admin
      }
    }
  }, [user, loading,isAdmin, navigate]);

  
  const [jobs, setJobs] = useState<any[]>([]);
  const [reportDate, setReportDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs");
        setJobs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, startDate, endDate, reportDate]);

  // Filter jobs based on date selection
  const filterJobs = () => {
    let filtered = jobs;

    if (reportDate && !startDate && !endDate) {
      // single date mode
      const target = new Date(reportDate);
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate.toDateString() === target.toDateString();
      });
    } else if (startDate && endDate) {
      // range mode
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= start && jobDate <= end;
      });
    }

    setFilteredJobs(filtered);
  };

  // Quick Date Filters
  const handleToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setReportDate(today);
    setStartDate("");
    setEndDate("");
  };

  const handleYesterday = () => {
    const yest = format(subDays(new Date(), 1), "yyyy-MM-dd");
    setReportDate(yest);
    setStartDate("");
    setEndDate("");
  };

  // KPIs
  const totalJobs = filteredJobs.length;
  const totalRevenue = filteredJobs.reduce(
    (sum, job) => sum + (job.totalPrice || 0),
    0
  );
  const avgServiceValue =
    totalJobs > 0 ? (totalRevenue / totalJobs).toFixed(2) : 0;

  // --- SERVICE BREAKDOWN ---
  const serviceAgg: Record<string, { count: number; revenue: number }> = {};
  filteredJobs.forEach((job) => {
    job.services.forEach((s: any) => {
      if (!serviceAgg[s.serviceName]) {
        serviceAgg[s.serviceName] = { count: 0, revenue: 0 };
      }
      serviceAgg[s.serviceName].count += s.quantity || 1;
      serviceAgg[s.serviceName].revenue += (s.price || 0) * (s.quantity || 1);
    });
  });

  const serviceChartData = {
    labels: Object.keys(serviceAgg),
    datasets: [
      {
        label: "Revenue by Service",
        data: Object.values(serviceAgg).map((s) => s.revenue),
        backgroundColor: "rgba(37, 99, 235, 0.7)", // blue
      },
    ],
  };

  

  // --- STAFF PERFORMANCE ---
  const staffAgg: Record<string, { jobs: number; revenue: number }> = {};
  filteredJobs.forEach((job) => {
    const staff = job.staffName || "Unassigned";
    if (!staffAgg[staff]) {
      staffAgg[staff] = { jobs: 0, revenue: 0 };
    }
    staffAgg[staff].jobs += 1;
    staffAgg[staff].revenue += job.totalPrice || 0;
  });

  const staffChartData = {
    labels: Object.keys(staffAgg),
    datasets: [
      {
        label: "Revenue by Staff",
        data: Object.values(staffAgg).map((s) => s.revenue),
        backgroundColor: "rgba(249, 115, 22, 0.7)", // orange
      },
    ],
  };

  // Export CSV
  const exportCSV = () => {
    const rows = filteredJobs.map((job: any) => ({
      Date: format(new Date(job.createdAt), "MMM dd, yyyy HH:mm"),
      Customer: job.customerName,
      Car: job.carDetails,
      Services: job.services.map((s: any) => s.serviceName).join(", "),
      Total: job.totalPrice,
      Payment: job.paymentType,
      Staff: job.staffName,
    }));

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `jobs_${reportDate || startDate}_to_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Jobs Report", 14, 15);
    doc.text(
      `Report Date: ${reportDate || `${startDate} to ${endDate}`}`,
      14,
      25
    );
    doc.text(`Total Jobs: ${totalJobs}`, 14, 35);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 45);
    doc.text(`Average Service Value: $${avgServiceValue}`, 14, 55);

    autoTable(doc, {
      startY: 65,
      head: [["Date", "Customer", "Car", "Services", "Total", "Staff"]],
      body: filteredJobs.map((job: any) => [
        format(new Date(job.createdAt), "MMM dd, yyyy HH:mm"),
        job.customerName,
        job.carDetails,
        job.services.map((s: any) => s.serviceName).join(", "),
        `$${job.totalPrice.toFixed(2)}`,
        job.staffName,
      ]),
    });

    doc.save(`jobs_${reportDate || startDate}_to_${endDate}.pdf`);
  };

  const summary = totalJobs && totalRevenue && avgServiceValue;

  // Show loading spinner while waiting for auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="flex space-x-2">
          <Button icon={Download} variant="secondary" disabled={!summary} onClick={exportCSV}>
            Export CSV
          </Button>
          <Button icon={Printer}  variant="primary" onClick={exportPDF}>
            Export PDF
          </Button>
        </div>
      </div>
      
      
      {/* Date Filter Card */}
      <Card title="Select Date" icon={FileText}>
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Report Date */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <label className="text-sm whitespace-nowrap">Report Date</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => {
                setReportDate(e.target.value);
                setStartDate("");
                setEndDate("");
              }}
              className="px-3 py-2 border rounded-md"
            />
          </div>

          {/* From */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <label className="text-sm whitespace-nowrap">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setReportDate("");
              }}
              className="px-3 py-2 border rounded-md"
            />
          </div>

          {/* To */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <label className="text-sm whitespace-nowrap">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setReportDate("");
              }}
              className="px-3 py-2 border rounded-md"
            />
          </div>

          {/* Quick Buttons */}
          <div className="flex items-end space-x-2 flex-shrink-0">
            <Button variant="secondary" onClick={handleToday} className="flex-shrink-0">
              Today
            </Button>
            <Button variant="secondary" onClick={handleYesterday} className="flex-shrink-0">
              Yesterday
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      {summary ?(

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Card className="transform transition-transform hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <FileText size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{totalJobs}</p>
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
              <p className="text-2xl font-semibold text-gray-900">${totalRevenue.toFixed(2)}</p>
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
                    ${avgServiceValue}
                  </p>
                </div>
              </div>
            </Card>
      </div>
      ):""}

      {/* Detailed Reports */}
      <div className="w-full flex flex-col lg:flex-row gap-3">
        {/* Service Breakdown */}
        <Card title="Service Breakdown" icon={BarChart3} className="w-full lg:w-1/2">
          {Object.keys(serviceAgg).length > 0 ? (
            <>
              <Bar data={serviceChartData} />
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(serviceAgg).map(([service, data]) => (
                      <tr key={service}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {service}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {data.count}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${data.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">
              No services recorded for this date
            </p>
          )}
        </Card>

        {/* Staff Performance */}
        <Card title="Staff Performance" icon={BarChart3} className="w-full lg:w-1/2">
          {Object.keys(staffAgg).length > 0 ? (
            <>
              <Bar data={staffChartData} />
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Staff
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Jobs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(staffAgg).map(([staff, data]) => (
                      <tr key={staff}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {staff}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {data.jobs}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${data.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">
              No staff activity recorded for this date
            </p>
          )}
        </Card>

      </div>

      {/* Work for the Day */}
      <Card title="Work for the Day">
        

        {filteredJobs.length === 0 ?
          (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center flex flex-1 flex-col items-center justify-center border">
              <div className="mb-4">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no jobs recorded for the selected date.
              </p>
            </div>
          )
          :
          (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Car
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Services
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Staff
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {job.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {job.carDetails}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {job.services.map((s: any) => s.serviceName).join(", ")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${job.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {job.staffName}
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )
        }
      </Card>
    </div>
  );
};

export default Reports;

