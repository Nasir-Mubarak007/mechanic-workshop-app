import api from "./axios";
import { format } from "date-fns";

// ✅ Get all jobs for today
export const fetchTodayJobs = async () => {
  const today = format(new Date(), "yyyy-MM-dd");
  const res = await api.get("/jobs");
  return (res.data || []).filter((job: any) => {
    const jobDate = new Date(job.createdAt);
    return jobDate.toISOString().slice(0, 10) === today;
  });
};

// ✅ Get all services
export const fetchServices = async () => {
  const res = await api.get("/services");
  return res.data || [];
};

// ✅ Get low stock items
// export const fetchLowStockItems = async (threshold: number = 5) => {
//   const res = await api.get("/inventory");
//   return (res.data || []).filter((item: any) => item.quantity <= threshold);
// };
export const fetchLowStockItems = async (threshold: number = 5) => {
  const res = await api.get("/inventory");
  return (res.data || []).filter((item: any) => 
    typeof item.quantity === "number" && item.quantity <= threshold
  );
};


// ✅ Get today's appointments
export const fetchTodaysAppointments = async () => {
  const res = await api.get("/schedule/today");
  return res.data || []
};

// ✅ Get upcoming appointments (after today)
export const fetchUpcomingAppointments = async () => {
  const res = await api.get("/schedule/upcoming");
  return res.data || []
};

// ✅ Get jobs by staff (optionally filter by date)
export const fetchJobsByStaff = async (staffId: string, date?: string) => {
  const res = await api.get(`/jobs/staff/${staffId}`);
  let jobs = res.data || [];

  if (date) {
    const target = new Date(date);
    jobs = jobs.filter((job: any) => {
      const jobDate = new Date(job.createdAt);
      return jobDate.toISOString().slice(0, 10) === target.toISOString().slice(0, 10);
    });
  }

  return jobs;
};
