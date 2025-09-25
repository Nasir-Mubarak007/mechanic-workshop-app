import api from "./axios";
import { ScheduledService, AppointmentStatus } from "../types";

// ✅ Get all scheduled services
export const fetchScheduledServices = async (): Promise<ScheduledService[]> => {
  const res = await api.get("/schedule");
  return res.data;
};

// Fetch active services (reuse existing /services endpoint)
export const fetchActiveServices = async () => {
  const res = await api.get("/services");
  // Only keep active services
  return (res.data || []).filter((s: any) => s.isActive);
};

// ✅ Get today's appointments
export const fetchTodaysAppointments = async (): Promise<ScheduledService[]> => {
  const res = await api.get("/schedule/today");
  return res.data;
};

// ✅ Get upcoming appointments
export const fetchUpcomingAppointments = async (): Promise<ScheduledService[]> => {
  const res = await api.get("/schedule/upcoming");
  return res.data;
};

// Add a scheduled service
export const createScheduledService = async (appointment: Partial<ScheduledService>) => {
  const res = await api.post("/schedule", appointment);
  return res.data;
};

// ✅ Update appointment status
export const updateScheduleStatus = async (id: string, status: AppointmentStatus): Promise<ScheduledService> => {
  const res = await api.patch(`/schedule/${id}/status`, { status });
  return res.data;
};

// ✅ Delete appointment
export const deleteSchedule = async (id: string): Promise<{ message: string }> => {
  const res = await api.delete(`/schedule/${id}`);
  return res.data;
};
