import api from './axios';
import { Service } from '../types';

export const fetchServices = () => api.get<Service[]>('/services');
export const fetchActiveServices = () => api.get<Service[]>('/services/active');
export const addService = (service: Partial<Service>) =>
  api.post<Service>('/services', service);

export const toggleServiceStatus = (id: string) =>
  api.patch<Service>(`/services/${id}/toggle`);

export const updateService = (
  id: string,
  service: Partial<Service>
) => api.put<Service>(`/services/${id}`, service);

export const deleteService = (id: string) =>
  api.delete<{message:string}>(`/services/${id}`);
