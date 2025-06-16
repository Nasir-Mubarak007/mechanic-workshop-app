import { User, Service, Job, InventoryItem, ScheduledService } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Initial data for the app
const initialUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    email: 'admin@mechshop.com',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'staff1',
    password: 'staff123',
    name: 'John Mechanic',
    role: 'staff',
    email: 'john@mechshop.com',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'staff2',
    password: 'staff123',
    name: 'Jane Technician',
    role: 'staff',
    email: 'jane@mechshop.com',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const initialServices: Service[] = [
  {
    id: '1',
    name: 'Oil Change',
    type: 'fixed',
    price: 45,
    estimatedTime: 30,
    isActive: true,
  },
  {
    id: '2',
    name: 'Brake Inspection',
    type: 'fixed',
    price: 65,
    estimatedTime: 45,
    isActive: true,
  },
  {
    id: '3',
    name: 'Engine Diagnostic',
    type: 'hourly',
    price: 120,
    isActive: true,
  },
  {
    id: '4',
    name: 'Tire Rotation',
    type: 'fixed',
    price: 35,
    estimatedTime: 30,
    isActive: true,
  },
];

const initialInventoryItems: InventoryItem[] = [
  {
    id: '1',
    itemName: 'Engine Oil - 5W30',
    category: 'oil',
    quantity: 25,
    unit: 'litres',
    threshold: 10,
    pricePerUnit: 8.50,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    itemName: 'Oil Filter - Standard',
    category: 'filter',
    quantity: 15,
    unit: 'pcs',
    threshold: 5,
    pricePerUnit: 12.00,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    itemName: 'Brake Fluid - DOT 4',
    category: 'fluid',
    quantity: 8,
    unit: 'bottles',
    threshold: 3,
    pricePerUnit: 15.00,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    itemName: 'Air Filter - Universal',
    category: 'filter',
    quantity: 2,
    unit: 'pcs',
    threshold: 5,
    pricePerUnit: 18.00,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '5',
    itemName: 'Coolant - Green',
    category: 'coolant',
    quantity: 12,
    unit: 'litres',
    threshold: 8,
    pricePerUnit: 6.75,
    lastUpdated: new Date().toISOString(),
  },
];

// Initialize data in localStorage if not present
export const initializeData = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(initialUsers));
  }
  
  if (!localStorage.getItem('services')) {
    localStorage.setItem('services', JSON.stringify(initialServices));
  }
  
  if (!localStorage.getItem('jobs')) {
    localStorage.setItem('jobs', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('inventory')) {
    localStorage.setItem('inventory', JSON.stringify(initialInventoryItems));
  }
  
  if (!localStorage.getItem('scheduledServices')) {
    localStorage.setItem('scheduledServices', JSON.stringify([]));
  }
};

// User related functions
export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const getUserByCredentials = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(user => user.username === username && user.password === password);
  return user && user.isActive ? user : null;
};

export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === userId) || null;
};

export const addUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const newUser = { 
    ...user, 
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem('users', JSON.stringify([...users, newUser]));
  return newUser;
};

export const updateUser = (user: User): User => {
  const users = getUsers();
  const updatedUsers = users.map(u => u.id === user.id ? user : u);
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  return user;
};

export const toggleUserStatus = (userId: string): User => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) throw new Error('User not found');
  
  const user = users[userIndex];
  const updatedUser = { ...user, isActive: !user.isActive };
  users[userIndex] = updatedUser;
  
  localStorage.setItem('users', JSON.stringify(users));
  return updatedUser;
};

// Service related functions
export const getServices = (): Service[] => {
  return JSON.parse(localStorage.getItem('services') || '[]');
};

export const getActiveServices = (): Service[] => {
  const services = getServices();
  return services.filter(service => service.isActive);
};

export const addService = (service: Omit<Service, 'id'>): Service => {
  const services = getServices();
  const newService = { ...service, id: uuidv4() };
  localStorage.setItem('services', JSON.stringify([...services, newService]));
  return newService;
};

export const updateService = (service: Service): Service => {
  const services = getServices();
  const updatedServices = services.map(s => s.id === service.id ? service : s);
  localStorage.setItem('services', JSON.stringify(updatedServices));
  return service;
};

export const toggleServiceStatus = (serviceId: string): Service => {
  const services = getServices();
  const serviceIndex = services.findIndex(s => s.id === serviceId);
  if (serviceIndex === -1) throw new Error('Service not found');
  
  const service = services[serviceIndex];
  const updatedService = { ...service, isActive: !service.isActive };
  services[serviceIndex] = updatedService;
  
  localStorage.setItem('services', JSON.stringify(services));
  return updatedService;
};

// Inventory related functions
export const getInventoryItems = (): InventoryItem[] => {
  return JSON.parse(localStorage.getItem('inventory') || '[]');
};

export const getAvailableInventoryItems = (): InventoryItem[] => {
  const items = getInventoryItems();
  return items.filter(item => item.quantity > 0);
};

export const getLowStockItems = (): InventoryItem[] => {
  const items = getInventoryItems();
  return items.filter(item => item.quantity <= item.threshold);
};

export const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem => {
  const items = getInventoryItems();
  const newItem = { 
    ...item, 
    id: uuidv4(),
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem('inventory', JSON.stringify([...items, newItem]));
  return newItem;
};

export const updateInventoryItem = (item: InventoryItem): InventoryItem => {
  const items = getInventoryItems();
  const updatedItem = { ...item, lastUpdated: new Date().toISOString() };
  const updatedItems = items.map(i => i.id === item.id ? updatedItem : i);
  localStorage.setItem('inventory', JSON.stringify(updatedItems));
  return updatedItem;
};

export const restockInventoryItem = (itemId: string, restockAmount: number): InventoryItem => {
  const items = getInventoryItems();
  const itemIndex = items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) throw new Error('Inventory item not found');
  
  const item = items[itemIndex];
  const updatedItem = { 
    ...item, 
    quantity: item.quantity + restockAmount,
    lastUpdated: new Date().toISOString(),
  };
  items[itemIndex] = updatedItem;
  
  localStorage.setItem('inventory', JSON.stringify(items));
  return updatedItem;
};

export const consumeInventoryItems = (consumables: { itemId: string; quantityUsed: number }[]): void => {
  const items = getInventoryItems();
  
  // Validate all items have sufficient quantity first
  for (const consumable of consumables) {
    const item = items.find(i => i.id === consumable.itemId);
    if (!item) {
      throw new Error(`Inventory item not found: ${consumable.itemId}`);
    }
    if (item.quantity < consumable.quantityUsed) {
      throw new Error(`Insufficient quantity for ${item.itemName}. Available: ${item.quantity}, Required: ${consumable.quantityUsed}`);
    }
  }
  
  // Update quantities
  const updatedItems = items.map(item => {
    const consumable = consumables.find(c => c.itemId === item.id);
    if (consumable) {
      return {
        ...item,
        quantity: item.quantity - consumable.quantityUsed,
        lastUpdated: new Date().toISOString(),
      };
    }
    return item;
  });
  
  localStorage.setItem('inventory', JSON.stringify(updatedItems));
};

// Job related functions
export const getJobs = (): Job[] => {
  return JSON.parse(localStorage.getItem('jobs') || '[]');
};

export const getJobsByStaff = (staffId: string): Job[] => {
  const jobs = getJobs();
  return jobs.filter(job => job.staffId === staffId);
};

export const getJobsByDate = (date: string): Job[] => {
  const jobs = getJobs();
  // Compare just the date part (not time)
  return jobs.filter(job => job.date.split('T')[0] === date.split('T')[0]);
};

export const addJob = (job: Omit<Job, 'id'>): Job => {
  const jobs = getJobs();
  const newJob = { ...job, id: uuidv4() };
  
  // Consume inventory items if any consumables were used
  if (job.consumables && job.consumables.length > 0) {
    const consumables = job.consumables.map(c => ({
      itemId: c.itemId,
      quantityUsed: c.quantityUsed,
    }));
    consumeInventoryItems(consumables);
  }
  
  localStorage.setItem('jobs', JSON.stringify([...jobs, newJob]));
  return newJob;
};

export const updateJob = (job: Job): Job => {
  const jobs = getJobs();
  const updatedJobs = jobs.map(j => j.id === job.id ? job : j);
  localStorage.setItem('jobs', JSON.stringify(updatedJobs));
  return job;
};

export const deleteJob = (jobId: string): void => {
  const jobs = getJobs();
  const updatedJobs = jobs.filter(j => j.id !== jobId);
  localStorage.setItem('jobs', JSON.stringify(updatedJobs));
};

// Scheduled Services related functions
export const getScheduledServices = (): ScheduledService[] => {
  return JSON.parse(localStorage.getItem('scheduledServices') || '[]');
};

export const getScheduledServicesByDate = (date: string): ScheduledService[] => {
  const appointments = getScheduledServices();
  return appointments.filter(appointment => 
    appointment.scheduledDate.split('T')[0] === date.split('T')[0]
  );
};

export const getUpcomingAppointments = (days: number = 7): ScheduledService[] => {
  const appointments = getScheduledServices();
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduledDate);
    return appointmentDate >= now && appointmentDate <= futureDate && appointment.status === 'scheduled';
  });
};

export const getTodaysAppointments = (): ScheduledService[] => {
  const today = new Date().toISOString().split('T')[0];
  return getScheduledServicesByDate(today);
};

export const addScheduledService = (appointment: Omit<ScheduledService, 'id' | 'createdAt'>): ScheduledService => {
  const appointments = getScheduledServices();
  const newAppointment = { 
    ...appointment, 
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem('scheduledServices', JSON.stringify([...appointments, newAppointment]));
  return newAppointment;
};

export const updateScheduledService = (appointment: ScheduledService): ScheduledService => {
  const appointments = getScheduledServices();
  const updatedAppointments = appointments.map(a => a.id === appointment.id ? appointment : a);
  localStorage.setItem('scheduledServices', JSON.stringify(updatedAppointments));
  return appointment;
};

export const deleteScheduledService = (appointmentId: string): void => {
  const appointments = getScheduledServices();
  const updatedAppointments = appointments.filter(a => a.id !== appointmentId);
  localStorage.setItem('scheduledServices', JSON.stringify(updatedAppointments));
};

export const updateAppointmentStatus = (appointmentId: string, status: 'scheduled' | 'completed' | 'missed' | 'cancelled'): ScheduledService => {
  const appointments = getScheduledServices();
  const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
  if (appointmentIndex === -1) throw new Error('Appointment not found');
  
  const appointment = appointments[appointmentIndex];
  const updatedAppointment = { ...appointment, status };
  appointments[appointmentIndex] = updatedAppointment;
  
  localStorage.setItem('scheduledServices', JSON.stringify(appointments));
  return updatedAppointment;
};