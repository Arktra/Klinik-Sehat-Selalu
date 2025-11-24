const { NurseExam, Queue, Registration, Patient, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const nurseExams = await NurseExam.findAll({
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
          as: 'nurse',
          attributes: { exclude: ['password'] }
        }
      ]
    });
    res.json(nurseExams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const nurseExam = await NurseExam.findByPk(id, {
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
          as: 'nurse',
          attributes: { exclude: ['password'] }
        }
      ]
    });
    if (!nurseExam) return res.status(404).json({ message: 'Nurse exam not found' });
    res.json(nurseExam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { queue_id, nurse_id } = req.body;

    const queue = await Queue.findByPk(queue_id);
    if (!queue) {
      return res.status(404).json({ 
        success: false,
        message: `Queue with ID ${queue_id} not found` 
      });
    }

    if (nurse_id) {
      const nurse = await User.findByPk(nurse_id);
      if (!nurse) {
        return res.status(404).json({
          success: false,
          message: `User with ID ${nurse_id} not found`
        });
      }
      
      if (nurse.role !== 'nurse') {
        return res.status(400).json({
          success: false,
          message: `User with ID ${nurse_id} is not a nurse. Role: ${nurse.role}. Only users with role 'nurse' can perform nurse examinations.`
        });
      }
    }

    const existingExam = await NurseExam.findOne({ 
      where: { queue_id: queue_id } 
    });
    if (existingExam) {
      return res.status(409).json({ 
        success: false,
        message: 'Queue already has a nurse examination' 
      });
    }

    const newNurseExam = await NurseExam.create(req.body);
    
    await Queue.update({ status: 'doctor' }, { where: { id: queue_id } });
    
    const nurseExam = await NurseExam.findByPk(newNurseExam.id, {
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
          as: 'nurse',
          attributes: { exclude: ['password'] }
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Nurse examination created successfully',
      data: nurseExam
    });
  } catch (err) {
    console.error('Nurse examination creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create nurse examination',
      error: err.message 
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    await NurseExam.update(req.body, { where: { id: id } });
    const updated = await NurseExam.findByPk(id, {
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
          as: 'nurse',
          attributes: { exclude: ['password'] }
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
    const deleted = await NurseExam.destroy({ where: { id: id } });
    if (deleted === 0) return res.status(404).json({ message: 'Nurse exam not found' });
    res.json({ message: 'Nurse exam deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByQueueId = async (req, res) => {
  try {
    const queueId = req.params.queueId;
    const nurseExam = await NurseExam.findOne({
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
          as: 'nurse',
          attributes: { exclude: ['password'] }
        }
      ]
    });
    if (!nurseExam) return res.status(404).json({ message: 'Nurse exam not found' });
    res.json(nurseExam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
