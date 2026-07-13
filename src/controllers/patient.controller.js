const { Patient, User, Registration } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const patient = await Patient.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('📝 Creating patient with data:', req.body);
    console.log('👤 Requested by user:', req.user.role, req.user.username);
    
    let targetUserId = req.body.user_id;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Only admin can create patient records via this endpoint. Patients should use /patients/register' 
      });
    }
    
    console.log('✅ Admin access - can create patient for specified user');
    
    if (!req.body.user_id) {
      return res.status(400).json({ 
        error: 'user_id is required when admin creates patient records' 
      });
    }
    
    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(400).json({ error: `User with ID ${targetUserId} not found` });
    }
    
    if (targetUser.role !== 'patient') {
      return res.status(400).json({ 
        error: `Cannot create patient record for user with role: ${targetUser.role}. Only users with 'patient' role can have patient records.` 
      });
    }
    
    const existingPatient = await Patient.findOne({ where: { user_id: targetUserId } });
    if (existingPatient) {
      return res.status(409).json({ 
        error: `Patient record already exists for user: ${targetUser.username}` 
      });
    }
    
    console.log('✅ Target user found:', targetUser.username, `(${targetUser.role})`);
    
    const patientData = { ...req.body, user_id: targetUserId };
    
    const newPatient = await Patient.create(patientData);
    console.log('✅ Patient created successfully:', newPatient.id);
    
    const patient = await Patient.findByPk(newPatient.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });
    
    res.status(201).json(patient);
  } catch (err) {
    console.error('❌ Error creating patient:', err.message);
    console.error('❌ Error details:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('📝 Updating patient ID:', id);
    console.log('👤 Requested by user:', req.user.role, req.user.username);
    
    const existingPatient = await Patient.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!existingPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (req.user.role === 'admin') {
      console.log('✅ Admin access - can update any patient');
    } else if (req.user.role === 'patient') {
      if (existingPatient.user_id !== req.user.id) {
        return res.status(403).json({ 
          error: 'Patients can only update their own records' 
        });
      }
      console.log('✅ Patient self-update access granted');
    } else {
      return res.status(403).json({ 
        error: 'Insufficient permissions to update patient records' 
      });
    }
    
    const allowedFields = ['nik', 'gender', 'birth_date', 'phone', 'address'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await Patient.update(updateData, { where: { id: id } });
    const updated = await Patient.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
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
    const deleted = await Patient.destroy({ where: { id: id } });
    if (deleted === 0) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatientByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const patient = await Patient.findOne({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatientByNik = async (req, res) => {
  try {
    console.log('🔍 Searching patient by NIK:', req.params.nik);
    const nik = req.params.nik;
    
    const patient = await Patient.findOne({
      where: { nik: nik },
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });
    
    if (!patient) {
      console.log('❌ Patient not found with NIK:', nik);
      return res.status(404).json({ message: 'Patient not found with this NIK' });
    }
    
    console.log('✅ Patient found:', patient.id);
    res.json(patient);
  } catch (err) {
    console.error('❌ Error getting patient by NIK:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    console.log(" Getting registrations for user:", req.user.username);

    const patient = await Patient.findOne({
      where: { user_id: req.user.id },
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: { exclude: ['password'] }
        },
        {
          model: Registration,
          as: 'registrations'
        }
      ]
    });

    if (!patient) {
      console.log("❌ Patient record not found for user:", req.user.username);
      return res.status(404).json({ 
        success: false,
        message: 'Patient record not found. Please complete patient registration first.' 
      });
    }

    console.log("✅ Found patient with registrations:", patient.registrations?.length || 0);

    res.json({
      success: true,
      message: 'Patient registrations retrieved successfully',
      data: {
        patient: {
          id: patient.id,
          nik: patient.nik,
          gender: patient.gender,
          birth_date: patient.birth_date,
          phone: patient.phone,
          address: patient.address,
          user: patient.user
        },
        registrations: patient.registrations || []
      },
      total: patient.registrations?.length || 0
    });
  } catch (err) {
    console.error("❌ Error getting patient registrations:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.register = async (req, res) => {
  try {
    console.log('👤 Patient self-registration by:', req.user.username);
    console.log('📝 Registration data:', req.body);
    
    const userId = req.user.id;
    
    const existingPatient = await Patient.findOne({ where: { user_id: userId } });
    if (existingPatient) {
      return res.status(409).json({ 
        success: false,
        message: 'Patient record already exists. Use update endpoint to modify your information.',
        data: existingPatient
      });
    }
    
    const patientData = { 
      ...req.body, 
      user_id: userId
    };
    
    const newPatient = await Patient.create(patientData);
    console.log('✅ Patient self-registered successfully:', newPatient.id);
    
    const patient = await Patient.findByPk(newPatient.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Patient registration completed successfully',
      data: patient
    });
    
  } catch (err) {
    console.error('❌ Error in patient self-registration:', err.message);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
