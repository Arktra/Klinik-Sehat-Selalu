const { Diagnosis, Queue, Registration, Patient, User, Prescription } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const diagnoses = await Diagnosis.findAll({
      include: [
        {
          model: Queue,
          as: 'queue',
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
        },
        {
          model: User,
          as: 'doctor',
          attributes: { exclude: ['password'] }
        },
        {
          model: Prescription,
          as: 'prescriptions'
        }
      ]
    });
    res.json(diagnoses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const diagnosis = await Diagnosis.findByPk(id, {
      include: [
        {
          model: Queue,
          as: 'queue',
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
        },
        {
          model: User,
          as: 'doctor',
          attributes: { exclude: ['password'] }
        },
        {
          model: Prescription,
          as: 'prescriptions'
        }
      ]
    });
    if (!diagnosis) return res.status(404).json({ message: 'Diagnosis not found' });
    res.json(diagnosis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required'
      });
    }

    const { queue_id } = req.body;

    if (!queue_id) {
      return res.status(400).json({
        success: false,
        message: 'queue_id is required'
      });
    }

    const queue = await Queue.findByPk(queue_id);
    if (!queue) {
      return res.status(404).json({ 
        success: false,
        message: `Queue with ID ${queue_id} not found` 
      });
    }

    if (queue.status !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: `Cannot record diagnosis for queue in status: ${queue.status}. Queue must be in 'doctor' status.`
      });
    }

    // Automatically use logged-in user as doctor_id
    const doctor_id = req.user.id;
    
    // Verify that the logged-in user is actually a doctor or admin (double check)
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Only doctors can create diagnoses. Your role: ${req.user.role}`
      });
    }

    const existingDiagnosis = await Diagnosis.findOne({ 
      where: { queue_id: queue_id } 
    });
    if (existingDiagnosis) {
      return res.status(409).json({ 
        success: false,
        message: 'Queue already has a diagnosis' 
      });
    }

    const { diagnosis_text, action, actions, notes } = req.body;
    
    const newDiagnosis = await Diagnosis.create({
      queue_id,
      doctor_id,
      diagnosis_text,
      actions: actions || action,
      notes
    });
    
    await Queue.update({ status: 'cashier' }, { where: { id: queue_id } });
    
    const diagnosis = await Diagnosis.findByPk(newDiagnosis.id, {
      include: [
        {
          model: Queue,
          as: 'queue',
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
        },
        {
          model: User,
          as: 'doctor',
          attributes: { exclude: ['password'] }
        },
        {
          model: Prescription,
          as: 'prescriptions'
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Diagnosis created successfully',
      data: diagnosis
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const allowedFields = ['diagnosis_text', 'actions', 'action', 'notes'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await Diagnosis.update(updateData, { where: { id: id } });
    const updated = await Diagnosis.findByPk(id, {
      include: [
        {
          model: Queue,
          as: 'queue',
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
        },
        {
          model: User,
          as: 'doctor',
          attributes: { exclude: ['password'] }
        },
        {
          model: Prescription,
          as: 'prescriptions'
        }
      ]
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Diagnosis.destroy({ where: { id: id } });
    if (deleted === 0) return res.status(404).json({ message: 'Diagnosis not found' });
    res.json({ message: 'Diagnosis deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByQueueId = async (req, res) => {
  try {
    const queueId = req.params.queueId;
    const diagnosis = await Diagnosis.findOne({
      where: { queue_id: queueId },
      include: [
        {
          model: Queue,
          as: 'queue',
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
        },
        {
          model: User,
          as: 'doctor',
          attributes: { exclude: ['password'] }
        },
        {
          model: Prescription,
          as: 'prescriptions'
        }
      ]
    });
    if (!diagnosis) return res.status(404).json({ message: 'Diagnosis not found' });
    res.json(diagnosis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
