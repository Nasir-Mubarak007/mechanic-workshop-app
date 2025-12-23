const Job = require('../models/Job');
const InventoryItem = require('../models/InventoryItem');

// Get all jobs
exports.getJobs = async (req, res) => {
  const jobs = await Job.find().populate('consumables.inventoryItem');
  res.json(jobs);
};

// Get jobs by staff
exports.getJobsByStaff = async (req, res) => {
  const jobs = await Job.find({ assignedTo: req.params.staff }).populate('consumables.inventoryItem');
  res.json(jobs);
};

// Get jobs by date
exports.getJobsByDate = async (req, res) => {
  const date = new Date(req.params.date);
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + 1);

  const jobs = await Job.find({
    createdAt: { $gte: date, $lt: nextDate }
  }).populate('consumables.inventoryItem');
  
  res.json(jobs);
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('consumables.inventoryItem');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

// Create new job with inventory deduction
exports.addJob = async (req, res) => {
  const { consumables = [] } = req.body;

  for (const c of consumables) {
    const item = await InventoryItem.findById(c.inventoryItem);
    if (!item || item.quantity < c.quantityUsed) {
      return res.status(400).json({ error: `Insufficient stock for item ${c.inventoryItem}` });
    }
    item.quantity -= c.quantityUsed;
    c.itemName = item.itemName;
    c.unit = item.unit;

    await item.save();
  }

  const job = new Job({
    ...req.body,
    consumables,
    assignedTo: req.body.assignedTo, // make sure frontend sends user._id here
  });
  await job.save();
  res.status(201).json(job);
};

// Update job
exports.updateJob = async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(job);
};


// Delete job
exports.deleteJob = async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: 'Job deleted' });
};

