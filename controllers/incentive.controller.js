import { IncentiveModel } from '../models/incentive.model.js';

export const IncentiveController = {
  async create(req, res) {
    try {
      const incentive = await IncentiveModel.create(req.body);
      res.status(201).json(incentive);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const incentives = await IncentiveModel.getAll();
      res.json(incentives);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const incentive = await IncentiveModel.getById(req.params.id);
      if (!incentive) return res.status(404).json({ error: 'Not found' });
      res.json(incentive);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await IncentiveModel.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Not found' });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const deleted = await IncentiveModel.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      res.json(deleted);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
};
