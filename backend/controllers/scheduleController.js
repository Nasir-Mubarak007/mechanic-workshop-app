const ScheduledService = require('../models/ScheduledService');

// Get all scheduled services
exports.getScheduledServices = async (req, res) => {
  const services = await ScheduledService.find();
  res.json(services);
};

// Get services scheduled on a specific date
exports.getByDate = async (req, res) => {
  const date = new Date(req.params.date);
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);

  const services = await ScheduledService.find({
    scheduledDate: { $gte: date, $lt: nextDay }
  });
  res.json(services);
};

// Get today's appointments
exports.getTodaysAppointments = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const appointments = await ScheduledService.find({
    scheduledDate: { $gte: today, $lt: tomorrow }
  });

  res.json(appointments);
};

// Get upcoming appointments
exports.getUpcomingAppointments = async (req, res) => {
  const today = new Date();
  const services = await ScheduledService.find({
    scheduledDate: { $gt: today },
    status: 'pending',
  });
  res.json(services);
};

// Add a new scheduled service
exports.addScheduledService = async (req, res) => {
  const service = new ScheduledService(req.body);
  await service.save();
  res.status(201).json(service);
};

// Update scheduled service
exports.updateScheduledService = async (req, res) => {
  const service = await ScheduledService.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(service);
};

// Update only status (e.g., mark completed)
exports.updateAppointmentStatus = async (req, res) => {
  const service = await ScheduledService.findById(req.params.id);
  if (!service) return res.status(404).json({ error: 'Not found' });

  service.status = req.body.status || 'completed';
  await service.save();
  res.json(service);
};

// Delete scheduled service
exports.deleteScheduledService = async (req, res) => {
  await ScheduledService.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
