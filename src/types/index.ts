export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, we'd never store passwords in plain text
  name: string;
  role: UserRole;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export type ServiceType = 'hourly' | 'fixed' | 'custom';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  price: number;
  estimatedTime?: number; // in minutes
  isActive: boolean;
}

export type PaymentType = 'cash' | 'card' | 'transfer' | 'check';

export interface JobService {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
  isCustom?: boolean;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  threshold: number;
  pricePerUnit?: number;
  lastUpdated: string;
}

export interface JobConsumable {
  itemId: string;
  itemName: string;
  quantityUsed: number;
  unit: string;
}

export interface Job {
  id: string;
  customerName: string;
  vehicle: string;
  services: JobService[];
  consumables?: JobConsumable[];
  totalPrice: number;
  paymentType: PaymentType;
  date: string; // ISO date string
  staffId: string;
  staffName: string;
  notes?: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'missed' | 'cancelled';

export interface ScheduledService {
  id: string;
  customerName: string;
  phoneNumber: string;
  carDetails: string;
  serviceType: string;
  customServiceType?: string; // For "Other" option
  scheduledDate: string; // ISO date string
  status: AppointmentStatus;
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  totalJobs: number;
  totalRevenue: number;
  serviceBreakdown: {
    [key: string]: {
      count: number;
      revenue: number;
    };
  };
  staffPerformance: {
    [key: string]: {
      jobs: number;
      revenue: number;
    };
  };
}