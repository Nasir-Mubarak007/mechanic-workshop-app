const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ['hourly', 'fixed', 'custom'],
    required: true,
  },
  price: Number,
  estimatedTime: Number, // optional, in minutes
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Service', serviceSchema);
