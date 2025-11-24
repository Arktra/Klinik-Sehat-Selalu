const { Payment, Diagnosis, Queue, Registration, Patient, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
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
        },
        {
          model: User,
          as: 'cashier',
          attributes: { exclude: ['password'] }
        }
      ]
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const payment = await Payment.findByPk(id, {
      include: [
        {
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
        },
        {
          model: User,
          as: 'cashier',
          attributes: { exclude: ['password'] }
        }
      ]
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { diagnosis_id, cashier_id } = req.body;

    const diagnosis = await Diagnosis.findByPk(diagnosis_id);
    if (!diagnosis) {
      return res.status(404).json({ 
        success: false,
        message: `Diagnosis with ID ${diagnosis_id} not found` 
      });
    }

    if (cashier_id) {
      const cashier = await User.findByPk(cashier_id);
      if (!cashier) {
        return res.status(404).json({
          success: false,
          message: `Cashier with ID ${cashier_id} not found`
        });
      }
      if (cashier.role !== 'cashier') {
        return res.status(403).json({
          success: false,
          message: `User with ID ${cashier_id} does not have cashier role. Current role: ${cashier.role}`
        });
      }
    }

    const existingPayment = await Payment.findOne({ 
      where: { diagnosis_id: diagnosis_id } 
    });
    if (existingPayment) {
      return res.status(409).json({ 
        success: false,
        message: 'Diagnosis already has a payment record' 
      });
    }

    const newPayment = await Payment.create(req.body);
    const payment = await Payment.findByPk(newPayment.id, {
      include: [
        {
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
        },
        {
          model: User,
          as: 'cashier',
          attributes: { exclude: ['password'] }
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create payment',
      error: err.message 
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    await Payment.update(req.body, { where: { id: id } });
    const updated = await Payment.findByPk(id, {
      include: [
        {
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
        },
        {
          model: User,
          as: 'cashier',
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
    const deleted = await Payment.destroy({ where: { id: id } });
    if (deleted === 0) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const id = req.params.id;
    
    await Payment.update({
      status: 'paid',
      paid_at: new Date()
    }, { where: { id: id } });
    
    const payment = await Payment.findByPk(id, {
      include: [{
        model: Diagnosis,
        as: 'diagnosis',
        include: [{
          model: Queue,
          as: 'queue'
        }]
      }]
    });
    
    if (payment && payment.diagnosis && payment.diagnosis.queue) {
      await Queue.update({ status: 'done' }, { where: { id: payment.diagnosis.queue.id } });
    }
    
    const updated = await Payment.findByPk(id, {
      include: [
        {
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
        },
        {
          model: User,
          as: 'cashier',
          attributes: { exclude: ['password'] }
        }
      ]
    });
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByDiagnosisId = async (req, res) => {
  try {
    const diagnosisId = req.params.diagnosisId;
    const payment = await Payment.findOne({
      where: { diagnosis_id: diagnosisId },
      include: [
        {
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
        },
        {
          model: User,
          as: 'cashier',
          attributes: { exclude: ['password'] }
        }
      ]
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDailyRevenue = async (req, res) => {
  try {
    const { date } = req.params;
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { Op } = require('sequelize');
    const payments = await Payment.findAll({
      where: {
        status: 'paid',
        paid_at: {
          [Op.gte]: `${targetDate} 00:00:00`,
          [Op.lte]: `${targetDate} 23:59:59`
        }
      },
      include: [
        {
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
            }
          ]
        },
        {
          model: User,
          as: 'cashier',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    let totalDoctorFee = 0;
    let totalTreatmentFee = 0;
    let totalDrugFee = 0;
    let totalRevenue = 0;
    
    payments.forEach(payment => {
      totalDoctorFee += payment.doctor_fee || 0;
      totalTreatmentFee += payment.treatment_fee || 0;
      totalDrugFee += payment.drug_fee || 0;
      totalRevenue += (payment.doctor_fee || 0) + (payment.treatment_fee || 0) + (payment.drug_fee || 0);
    });

    res.json({
      success: true,
      data: {
        date: targetDate,
        summary: {
          total_transactions: payments.length,
          total_doctor_fee: totalDoctorFee,
          total_treatment_fee: totalTreatmentFee,
          total_drug_fee: totalDrugFee,
          total_revenue: totalRevenue
        },
        payments: payments
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to get daily revenue',
      error: err.message 
    });
  }
};
