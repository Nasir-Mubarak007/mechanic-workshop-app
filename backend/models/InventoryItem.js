const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  itemName: String,
  category: String,
  quantity: Number,
  unit: String,
  threshold: Number,
  pricePerUnit: Number,
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
// This code defines a Mongoose schema for an InventoryItem model in a Node.js application.
// The InventoryItem model includes fields for item name, category, quantity, unit, threshold,