const mongoose = require('mongoose');

const scheduledServiceSchema = new mongoose.Schema({
  customerName: String,
  phoneNumber: String,
  carDetails: String,
  serviceName: String,
  scheduledDate: Date,
  scheduledTime: String,
  assignedTo: String,
  status: { type: String, enum: ['scheduled','pending', 'completed','missed', 'cancelled'], default: 'pending' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScheduledService', scheduledServiceSchema);
