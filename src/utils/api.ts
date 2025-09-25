import axios from 'axios';
import { Job, Service, ScheduledService } from '../types';

// const API_BASE = '/api';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // 👈 THIS is critical for sending cookies
});



export const fetchServices = async (): Promise<Service[]> => {
  const res = await api.get(`/services`);
  return res.data;
};

export const fetchAllJobs = async (): Promise<Job[]> => {
  const res = await api.get(`/jobs`);
  return res.data;
};

export const fetchJobsByStaff = async (staffId: string): Promise<Job[]> => {
  const res = await api.get(`/jobs/staff/${staffId}`);
  return res.data;
};

export const fetchLowStockItems = async (): Promise<any[]> => {
  const res = await api.get(`/stock/low`);
  return res.data;
};

export const fetchTodaysAppointments = async (): Promise<ScheduledService[]> => {
  const res = await api.get(`/appointments/today`);
  return res.data;
};

export const fetchUpcomingAppointments = async (): Promise<ScheduledService[]> => {
  const res = await api.get(`/appointments/upcoming`);
  return res.data;
};

export const fetchTodayJobs = async (): Promise<Job[]> => {
  const res = await api.get(`/jobs/today`);
  return res.data;
};
