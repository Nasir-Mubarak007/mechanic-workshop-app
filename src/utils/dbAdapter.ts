// src/utils/dbAdapter.ts
import { PrismaClient } from '@prisma/client';
// Importing PrismaClient from the generated Prisma client
const prisma = new PrismaClient();

// User related functions
export const getUsers = async () => {
  return await prisma.user.findMany();
};

export const getUserByCredentials = async (username: string, password: string) => {
  return await prisma.user.findFirst({ where: { username, password, isActive: true } });
};

export const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({ where: { id: userId } });
};

export const addUser = async (user: Omit<any, 'id' | 'createdAt'>) => {
  return await prisma.user.create({ data: { ...user } });
};

export const updateUser = async (user: any) => {
  return await prisma.user.update({ where: { id: user.id }, data: user });
};

export const toggleUserStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  return await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });
};

// Service related functions
export const getServices = async () => {
  return await prisma.service.findMany();
};

export const getActiveServices = async () => {
  return await prisma.service.findMany({ where: { isActive: true } });
};

export const addService = async (service: Omit<any, 'id'>) => {
  return await prisma.service.create({ data: { ...service } });
};

export const updateService = async (service: any) => {
  return await prisma.service.update({ where: { id: service.id }, data: service });
};

export const toggleServiceStatus = async (serviceId: string) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error('Service not found');
  return await prisma.service.update({
    where: { id: serviceId },
    data: { isActive: !service.isActive },
  });
};

// Inventory related functions
export const getInventoryItems = async () => {
  return await prisma.inventoryItem.findMany();
};

export const getAvailableInventoryItems = async () => {
  return await prisma.inventoryItem.findMany({ where: { quantity: { gt: 0 } } });
};

export const getLowStockItems = async () => {
  return await prisma.inventoryItem.findMany({
    where: {
      quantity: {
        lte: prisma.inventoryItem.fields.threshold,
      },
    },
  });
};

export const addInventoryItem = async (item: Omit<any, 'id' | 'lastUpdated'>) => {
  return await prisma.inventoryItem.create({
    data: { ...item, lastUpdated: new Date() },
  });
};

export const updateInventoryItem = async (item: any) => {
  return await prisma.inventoryItem.update({
    where: { id: item.id },
    data: { ...item, lastUpdated: new Date() },
  });
};

export const restockInventoryItem = async (itemId: string, restockAmount: number) => {
  return await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      quantity: { increment: restockAmount },
      lastUpdated: new Date(),
    },
  });
};

export const consumeInventoryItems = async (consumables: { itemId: string; quantityUsed: number }[]) => {
  for (const { itemId, quantityUsed } of consumables) {
    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item || item.quantity < quantityUsed) {
      throw new Error(`Insufficient quantity for ${item?.itemName || itemId}`);
    }
    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        quantity: { decrement: quantityUsed },
        lastUpdated: new Date(),
      },
    });
  }
};

// Job related functions
export const getJobs = async () => {
  return await prisma.job.findMany();
};

export const getJobsByStaff = async (staffId: string) => {
  return await prisma.job.findMany({ where: { staffId } });
};

export const getJobsByDate = async (date: string) => {
  const dateOnly = new Date(date).toISOString().split('T')[0];
  return await prisma.job.findMany({
    where: {
      date: {
        gte: new Date(dateOnly),
        lt: new Date(new Date(dateOnly).setDate(new Date(dateOnly).getDate() + 1))
      }
    }
  });
};

export const addJob = async (job: Omit<any, 'id'>) => {
  if (job.consumables?.length) {
    await consumeInventoryItems(job.consumables);
  }
  return await prisma.job.create({ data: { ...job } });
};

export const updateJob = async (job: any) => {
  return await prisma.job.update({ where: { id: job.id }, data: job });
};

export const deleteJob = async (jobId: string) => {
  await prisma.job.delete({ where: { id: jobId } });
};

// Scheduled Services
export const getScheduledServices = async () => {
  return await prisma.scheduledService.findMany();
};

export const getScheduledServicesByDate = async (date: string) => {
  const dateOnly = new Date(date).toISOString().split('T')[0];
  return await prisma.scheduledService.findMany({
    where: {
      scheduledDate: {
        gte: new Date(dateOnly),
        lt: new Date(new Date(dateOnly).setDate(new Date(dateOnly).getDate() + 1)),
      },
    },
  });
};

export const getUpcomingAppointments = async (days = 7) => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  return await prisma.scheduledService.findMany({
    where: {
      scheduledDate: {
        gte: now,
        lte: futureDate,
      },
      status: 'scheduled',
    },
  });
};

export const getTodaysAppointments = async () => {
  const today = new Date().toISOString().split('T')[0];
  return await getScheduledServicesByDate(today);
};

export const addScheduledService = async (appointment: Omit<any, 'id' | 'createdAt'>) => {
  return await prisma.scheduledService.create({
    data: {
      ...appointment,
      createdAt: new Date(),
    },
  });
};

export const updateScheduledService = async (appointment: any) => {
  return await prisma.scheduledService.update({ where: { id: appointment.id }, data: appointment });
};

export const deleteScheduledService = async (appointmentId: string) => {
  await prisma.scheduledService.delete({ where: { id: appointmentId } });
};

export const updateAppointmentStatus = async (appointmentId: string, status: 'scheduled' | 'completed' | 'missed' | 'cancelled') => {
  return await prisma.scheduledService.update({
    where: { id: appointmentId },
    data: { status },
  });
};
