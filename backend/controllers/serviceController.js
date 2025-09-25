const Service = require('../models/Service');

exports.getServices = async (req, res) => res.json(await Service.find());
exports.getActiveServices = async (req, res) => res.json(await Service.find({ isActive: true }));

exports.addService = async (req, res) => {
  const service = new Service(req.body);
  await service.save();
  res.status(201).json(service);
};

exports.updateService = async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(service);
};

exports.toggleServiceStatus = async (req, res) => {
  const service = await Service.findById(req.params.id);
  service.isActive = !service.isActive;
  await service.save();
  res.json(service);
};
exports.deleteService = async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: 'Service deleted' });
};