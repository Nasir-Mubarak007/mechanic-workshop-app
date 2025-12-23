import api from './axios';
import { Job } from '../types';

export const fetchJobs = async (): Promise<Job[]> => {
  const res = await api.get<Job[]>('/jobs');
  return res.data;
};

export const fetchJobsByStaff = async (staffId: string): Promise<Job[]> => {
  const res = await api.get<Job[]>(`/jobs/staff/${staffId}`);
  return res.data;
};

export const fetchJobsByDate = async (date: string): Promise<Job[]> => {
  const res = await api.get<Job[]>(`/jobs/date/${date}`);
  return res.data;
};

export const addJob = async (job: Partial<Job>): Promise<Job> => {
  const res = await api.post<Job>('/jobs', job);
  return res.data;
};

export const updateJob = async (id: string, job: Partial<Job>): Promise<Job> => {
  const res = await api.put<Job>(`/jobs/${id}`, job);
  return res.data;
};

export const deleteJob = async (id: string): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(`/jobs/${id}`);
  return res.data;
};
