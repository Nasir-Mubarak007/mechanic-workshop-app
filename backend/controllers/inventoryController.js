const InventoryItem = require('../models/InventoryItem');

// get all inventory items
exports.getInventoryItems = async (req, res) => {
  const items = await InventoryItem.find();
  res.json(items);
};

// Get only available items (quantity > 0)
exports.getAvailableItems = async (req, res) => {
  const items = await InventoryItem.find({ quantity: { $gt: 0 } });
  res.json(items);
};

// Get low stock items (<= threshold)
exports.getLowStockItems = async (req, res) => {
  const items = await InventoryItem.find({
    $expr: { $lte: ['$quantity', '$threshold'] }
  });
  res.json(items);
};

// add a new inventory item
exports.addInventoryItem = async (req, res) => {
  const item = new InventoryItem(req.body);
  await item.save();
  res.status(201).json(item);
};

// update an existing inventory item
exports.updateInventoryItem = async (req, res) => {
  const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
};

// Restock item
exports.restockInventoryItem = async (req, res) => {
  const { quantity } = req.body;
  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  item.quantity += quantity;
  item.lastUpdated = new Date();
  await item.save();
  res.json({ message: 'Inventory item restocked successfully', item });
};


// delete an inventory item
exports.deleteInventoryItem = async (req, res) => {
  await InventoryItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Inventory item deleted' });
};

// toggle availability status of an inventory item
exports.toggleInventoryItemStatus = async (req, res) => {
  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  item.isAvailable = !item.isAvailable;
  await item.save();
  res.json({ message: 'Inventory item status toggled', item });
}