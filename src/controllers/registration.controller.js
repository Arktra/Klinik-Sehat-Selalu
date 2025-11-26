const { Registration, Patient, User, Queue } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const registrations = await Registration.findAll({
      include: [{
        model: Patient,
        as: 'patient',
        include: [{
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }]
      }]
    });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const registration = await Registration.findByPk(id, {
      include: [{
        model: Patient,
        as: 'patient',
        include: [{
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }]
      }]
    });
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    res.json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Find patient associated with the authenticated user
    const patient = await Patient.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient profile not found for this user' 
      });
    }

    const patient_id = patient.id;

    const today = new Date().toISOString().split('T')[0];
    const existingRegistration = await Registration.findOne({
      where: {
        patient_id: patient_id,
        registration_date: today,
        status: 'pending'
      }
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'Patient already has a pending registration for today'
      });
    }

    const { complaint, previous_history } = req.body;
    
    const newRegistration = await Registration.create({
      patient_id: patient_id,
      complaint,
      previous_history,
      registration_date: today,
      status: 'pending'
    });
    
    const registration = await Registration.findByPk(newRegistration.id, {
      include: [{
        model: Patient,
        as: 'patient',
        include: [{
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }]
      }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      data: registration
    });
  } catch (err) {
    console.error('Registration creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create registration',
      error: err.message 
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const registration = await Registration.findByPk(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update registration with status: ${registration.status}. Only pending registrations can be updated.`
      });
    }

    const allowedFields = ['complaint', 'previous_history'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '') {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.complaint && updateData.complaint.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'complaint must be at least 5 characters long'
      });
    }

    if (updateData.previous_history && updateData.previous_history.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'previous_history must be at least 3 characters long'
      });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: `No valid fields to update. Allowed fields: ${allowedFields.join(', ')}`
      });
    }

    const forbiddenFields = ['id', 'patient_id', 'nurse_id', 'status', 'verified_at', 'created_at', 'registration_date'];
    const hasForbiddenFields = forbiddenFields.some(field => req.body[field] !== undefined);
    
    if (hasForbiddenFields) {
      return res.status(400).json({
        success: false,
        message: `Cannot update fields: ${forbiddenFields.join(', ')}. Use specific endpoints for status changes.`
      });
    }

    updateData.registration_date = new Date().toISOString().split('T')[0];
    
    const [affectedRows] = await Registration.update(updateData, { where: { id: id } });
    
    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'No rows were updated. Registration may not exist or data is identical.'
      });
    }
    
    const updated = await Registration.findByPk(id, {
      include: [{
        model: Patient,
        as: 'patient',
        include: [{
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }]
      }]
    });

    res.json({
      success: true,
      message: 'Registration updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('Registration update error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update registration',
      error: err.message 
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const registration = await Registration.findByPk(id, {
      include: [{ model: Queue, as: 'queue' }]
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.status === 'verified' && registration.queue) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete verified registration with existing queue. Cancel the registration instead.'
      });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete registration with status: ${registration.status}. Only pending registrations should be deleted.`
      });
    }

    const deleted = await Registration.destroy({ where: { id: id } });

    res.json({
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (err) {
    console.error('Registration deletion error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete registration',
      error: err.message 
    });
  }
};

exports.getByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const registrations = await Registration.findAll({
      where: { status: status },
      include: [{
        model: Patient,
        as: 'patient',
        include: [{
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }]
      }]
    });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyRegistration = async (req, res) => {
  try {
    const id = req.params.id;
    const currentUser = req.user;
    
    if (!currentUser || !currentUser.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or invalid token'
      });
    }
    
    let assignedNurseId = null;
    
    const registration = await Registration.findByPk(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `Registration is already ${registration.status}`
      });
    }

    console.log('Verification by user role:', currentUser.role, '- nurse_id will remain null until nurse takes the queue');

    const t = await sequelize.transaction();
    
    try {
      console.log('Starting verification transaction for registration ID:', id);
      
      console.log('Step 1: Updating status only first...');
      
      await Registration.update({ status: 'verified' }, { 
        where: { id: id },
        transaction: t
      });

      console.log('Step 2: Status updated successfully');

      console.log('Step 3: Updating verified_at only (nurse_id remains null until nurse takes queue)...');
      
      const updateData = {
        verified_at: new Date()
      };
      
      console.log('UPDATE DATA:', { 
        ...updateData,
        where_id: id 
      });
      
      const updateResult = await Registration.update(updateData, { 
        where: { id: id },
        transaction: t
      });
      
      console.log('UPDATE RESULT:', updateResult);
      
      if (updateResult[0] === 0) {
        throw new Error(`Failed to update nurse_id and verified_at for registration ${id} - no rows affected`);
      }
      console.log(`Step 4: nurse_id and verified_at updated successfully (${updateResult[0]} rows affected)`);

      const { Op } = require('sequelize');
      const Queue = require('../models/queue.model');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastQueue = await Queue.findOne({
        order: [['queue_number', 'DESC']],
        where: {
          created_at: {
            [Op.gte]: today
          }
        },
        transaction: t
      });

      const queueNumber = lastQueue ? lastQueue.queue_number + 1 : 1;

      console.log('Step 5: Creating queue with data:', {
        registration_id: parseInt(id),
        queue_number: queueNumber,
        status: 'waiting'
      });

      const createdQueue = await Queue.create({
        registration_id: parseInt(id),
        queue_number: queueNumber,
        status: 'waiting'
      }, { transaction: t });

      if (!createdQueue || !createdQueue.id) {
        throw new Error('Queue creation failed - no ID returned');
      }

      console.log('Step 6: Queue created successfully with ID:', createdQueue.id);

      await t.commit();
      console.log('Transaction committed successfully!');

      console.log('Step 7: Fetching updated registration with includes...');
      
      let updated;
      try {
        updated = await Registration.findByPk(id, {
          include: [
            {
              model: Patient,
              as: 'patient',
              include: [{
                model: User,
                as: 'user',
                attributes: { exclude: ['password'] }
              }]
            },
            {
              model: User,
              as: 'nurse',
              attributes: { exclude: ['password'] }
            },
            {
              model: Queue,
              as: 'queue'
            }
          ]
        });
        console.log('Step 8: Registration with includes fetched successfully');
      } catch (includeError) {
        console.error('Include error:', includeError.message);
        updated = await Registration.findByPk(id, {
          include: [
            {
              model: Patient,
              as: 'patient',
              include: [{
                model: User,
                as: 'user',
                attributes: { exclude: ['password'] }
              }]
            }
          ]
        });
        console.log('Step 8b: Registration fetched with basic includes only');
      }

      res.json({
        success: true,
        message: 'Registration verified and queue created successfully. Waiting for nurse to take the queue.',
        data: updated,
        queue_number: createdQueue.queue_number
      });

    } catch (error) {
      console.error('=== TRANSACTION ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      await t.rollback();
      console.log('Transaction rolled back');
      throw error;
    }

  } catch (err) {
    console.error('Registration verification error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to verify registration',
      error: err.message 
    });
  }
};

exports.rejectRegistration = async (req, res) => {
  try {
    const id = req.params.id;
    await Registration.update({ status: 'rejected' }, { where: { id: id } });
    const updated = await Registration.findByPk(id, {
      include: [{
        model: Patient,
        as: 'patient',
        include: [{
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }]
      }]
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
