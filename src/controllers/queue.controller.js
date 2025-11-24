const { Queue, Registration, Patient, User } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const queues = await Queue.findAll({
      include: [{
        model: Registration,
        as: 'registration',
        include: [{
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: { exclude: ['password'] }
          }]
        }]
      }]
    });
    res.json(queues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const queue = await Queue.findByPk(id, {
      include: [{
        model: Registration,
        as: 'registration',
        include: [{
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: { exclude: ['password'] }
          }]
        }]
      }]
    });
    if (!queue) return res.status(404).json({ message: 'Queue not found' });
    res.json(queue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { registration_id } = req.body;

    const registration = await Registration.findByPk(registration_id);
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: `Registration with ID ${registration_id} not found` 
      });
    }

    const existingQueue = await Queue.findOne({ 
      where: { registration_id: registration_id } 
    });
    if (existingQueue) {
      return res.status(409).json({ 
        success: false,
        message: 'Registration already has a queue entry' 
      });
    }

    const lastQueue = await Queue.findOne({
      order: [['created_at', 'DESC']],
      where: {
        created_at: {
          [Op.gte]: new Date().toISOString().slice(0, 10)
        }
      }
    });
    
    const queueNumber = lastQueue ? lastQueue.queue_number + 1 : 1;
    
    const newQueue = await Queue.create({
      ...req.body,
      queue_number: queueNumber
    });
    
    const queue = await Queue.findByPk(newQueue.id, {
      include: [{
        model: Registration,
        as: 'registration',
        include: [{
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: { exclude: ['password'] }
          }]
        }]
      }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Queue entry created successfully',
      data: queue
    });
  } catch (err) {
    console.error('Queue creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create queue entry',
      error: err.message 
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    await Queue.update(req.body, { where: { id: id } });
    const updated = await Queue.findByPk(id, {
      include: [{
        model: Registration,
        as: 'registration',
        include: [{
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: { exclude: ['password'] }
          }]
        }]
      }]
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Queue.destroy({ where: { id: id } });
    if (deleted === 0) return res.status(404).json({ message: 'Queue not found' });
    res.json({ message: 'Queue deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const queues = await Queue.findAll({
      where: { status: status },
      include: [{
        model: Registration,
        as: 'registration',
        include: [{
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: { exclude: ['password'] }
          }]
        }]
      }],
      order: [['queue_number', 'ASC']]
    });
    res.json(queues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    
    const queue = await Queue.findByPk(id);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    const validStatuses = ['waiting', 'nurse', 'doctor', 'cashier', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values are: ${validStatuses.join(', ')}`,
        current_status: queue.status,
        valid_statuses: validStatuses
      });
    }
    
    await Queue.update({ status: status }, { where: { id: id } });
    
    const updated = await Queue.findByPk(id, {
      include: [{
        model: Registration,
        as: 'registration',
        include: [{
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: { exclude: ['password'] }
          }]
        }]
      }]
    });
    
    res.json({
      success: true,
      message: 'Queue status updated successfully',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update queue status',
      error: err.message 
    });
  }
};

exports.getNext = async (req, res) => {
  try {
    const { status } = req.params;
    const queue = await Queue.findOne({
      where: { status: status },
      include: [{
        model: Registration,
        as: 'registration',
        include: [{
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user',
            attributes: { exclude: ['password'] }
          }]
        }]
      }],
      order: [['queue_number', 'ASC']]
    });
    
    if (!queue) return res.status(404).json({ message: 'No queue found' });
    res.json(queue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
