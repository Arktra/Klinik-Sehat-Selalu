const { Prescription, Diagnosis, Queue, Registration, Patient, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      include: [{
        model: Diagnosis,
        as: 'diagnosis',
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
          }
        ]
      }]
    });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const prescription = await Prescription.findByPk(id, {
      include: [{
        model: Diagnosis,
        as: 'diagnosis',
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
          }
        ]
      }]
    });
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { diagnosis_id } = req.body;

    const diagnosis = await Diagnosis.findByPk(diagnosis_id);
    if (!diagnosis) {
      return res.status(404).json({ 
        success: false,
        message: `Diagnosis with ID ${diagnosis_id} not found` 
      });
    }

    const newPrescription = await Prescription.create(req.body);
    const prescription = await Prescription.findByPk(newPrescription.id, {
      include: [{
        model: Diagnosis,
        as: 'diagnosis',
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
          }
        ]
      }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });
  } catch (err) {
    console.error('Prescription creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create prescription',
      error: err.message 
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    await Prescription.update(req.body, { where: { id: id } });
    const updated = await Prescription.findByPk(id, {
      include: [{
        model: Diagnosis,
        as: 'diagnosis',
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
          }
        ]
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
    const deleted = await Prescription.destroy({ where: { id: id } });
    if (deleted === 0) return res.status(404).json({ message: 'Prescription not found' });
    res.json({ message: 'Prescription deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByDiagnosisId = async (req, res) => {
  try {
    const diagnosisId = req.params.diagnosisId;
    const prescriptions = await Prescription.findAll({
      where: { diagnosis_id: diagnosisId },
      include: [{
        model: Diagnosis,
        as: 'diagnosis',
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
          }
        ]
      }]
    });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    
    await Prescription.update({ status: status }, { where: { id: id } });
    const updated = await Prescription.findByPk(id, {
      include: [{
        model: Diagnosis,
        as: 'diagnosis',
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
          }
        ]
      }]
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
