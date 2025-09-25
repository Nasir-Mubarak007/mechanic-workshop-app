import { NewUser, User } from '../types';
import api from './axios';

export const fetchUsers = () => api.get<User[]>('/users');

export const fetchUserById = (id: string) => api.get<User>(`/users/${id}`);

export const addUser = (user: NewUser) => api.post<User>('/users', user);

export const updateUser = (id: string, user: Partial<User>) => api.put<User>(`/users/${id}`, user);

export const toggleUserStatus = (id: string) => api.patch<User>(`/users/${id}/toggle`);

export const deleteUser = (id: string) => api.delete<{message:string}>(`/users/${id}`);
