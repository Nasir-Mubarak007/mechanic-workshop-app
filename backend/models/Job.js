const mongoose = require('mongoose');

const jobServiceSchema = new mongoose.Schema({
  serviceId: String,
  serviceName: String,
  price: Number,
  quantity: Number,
  isCustom: Boolean,
}, { _id: false });

const jobConsumableSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
  },
  itemName: String,
  unit: String,
  quantityUsed: Number,
}, { _id: false });


const jobSchema = new mongoose.Schema({
  customerName: String,
  phoneNumber: String,
  carDetails: String,
  services: [jobServiceSchema],
  consumables: [jobConsumableSchema],
  totalPrice: Number,
  paymentType: { type: String, enum: ['cash', 'card', 'transfer', 'check'], default: 'cash' },
  status: { type: String, enum: ['scheduled', 'completed'], default: 'scheduled' },
  notes: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  staffName: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
// This model defines the structure of a job document in the MongoDB database.
// It includes fields for customer information, services, consumables, total price, payment type,