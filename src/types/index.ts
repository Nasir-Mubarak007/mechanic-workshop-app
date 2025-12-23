export type UserRole = 'admin' | 'staff';

export interface User {
  _id: string;
  username: string;
  password: string; // In a real app, we'd never store passwords in plain text
  name: string;
  role: UserRole;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export type NewUser = Omit<User, '_id' | 'createdAt'> & { password?: string };

export type ServiceType = 'hourly' | 'fixed' | 'custom';

export interface Service {
  _id: string;
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
  _id: string;
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
  _id: string;
  customerName: string;
  carDetails: string;
  phoneNumber?: string; // Optional for job creation
  services: JobService[];
  consumables?: JobConsumable[];
  status: 'pending' | 'in-progress' | 'completed' | 'scheduled' | 'cancelled';
  totalPrice: number;
  paymentType: PaymentType;
  assignedTo: string;
  staffName: string;
  notes?: string;
  tax?: number; // Percentage
  createdAt: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'missed' | 'cancelled';

export interface ScheduledService {
  _id: string;
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