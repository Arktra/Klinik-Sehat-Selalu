const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    next();
  };
};

const userSchemas = {
  create: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('admin', 'patient', 'nurse', 'doctor', 'cashier', 'administrative', 'pharmacist').required()
  }),
  
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),
  
  update: Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    password: Joi.string().min(6),
    name: Joi.string().min(2).max(100),
    role: Joi.string().valid('admin', 'patient', 'nurse', 'doctor', 'cashier', 'administrative', 'pharmacist')
  })
};

const patientSchemas = {
  create: Joi.object({
    user_id: Joi.number().integer().positive(), // Optional for self-registration, validated in controller for admin
    nik: Joi.string().length(16).pattern(/^[0-9]+$/),
    gender: Joi.string().valid('L', 'P'),
    birth_date: Joi.date().iso(),
    phone: Joi.string().pattern(/^(\+62|62|0)8[1-9][0-9]{6,9}$/),
    address: Joi.string().max(500)
  }),
  
  update: Joi.object({
    nik: Joi.string().length(16).pattern(/^[0-9]+$/),
    gender: Joi.string().valid('L', 'P'),
    birth_date: Joi.date().iso(),
    phone: Joi.string().pattern(/^(\+62|62|0)8[1-9][0-9]{6,9}$/),
    address: Joi.string().max(500)
  })
};

const registrationSchemas = {
  create: Joi.object({
    complaint: Joi.string().min(5).required(),
    previous_history: Joi.string().min(3).allow(null, '')
  }),
  
  update: Joi.object({
    complaint: Joi.string().min(5),
    previous_history: Joi.string().min(3).allow(null, '')
  })
};

const queueSchemas = {
  updateStatus: Joi.object({
    status: Joi.string().valid('waiting', 'nurse', 'doctor', 'cashier', 'done').required()
  })
};

const nurseExamSchemas = {
  create: Joi.object({
    queue_id: Joi.number().integer().positive().required(),
    bp_systolic: Joi.number().integer().min(40).max(300).allow(null),
    bp_diastolic: Joi.number().integer().min(30).max(200).allow(null),
    blood_pressure: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/).allow(null),
    temperature: Joi.number().min(30).max(45).allow(null),
    spo2: Joi.number().integer().min(50).max(100).allow(null),
    height: Joi.number().min(30).max(300).allow(null),
    weight: Joi.number().min(1).max(500).allow(null),
    notes: Joi.string().max(1000).allow(null, '')
  }),
  
  update: Joi.object({
    bp_systolic: Joi.number().integer().min(40).max(300).allow(null),
    bp_diastolic: Joi.number().integer().min(30).max(200).allow(null),
    blood_pressure: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/).allow(null),
    temperature: Joi.number().min(30).max(45).allow(null),
    spo2: Joi.number().integer().min(50).max(100).allow(null),
    height: Joi.number().min(30).max(300).allow(null),
    weight: Joi.number().min(1).max(500).allow(null),
    notes: Joi.string().max(1000).allow(null, '')
  })
};

const diagnosisSchemas = {
  create: Joi.object({
    queue_id: Joi.number().integer().positive().required(),
    diagnosis_text: Joi.string().min(3).required(),
    actions: Joi.string().allow(null, ''),
    action: Joi.string().allow(null, ''),
    notes: Joi.string().allow(null, '')
  }),
  
  update: Joi.object({
    diagnosis_text: Joi.string().min(3),
    actions: Joi.string().allow(null, ''),
    action: Joi.string().allow(null, ''),
    notes: Joi.string().allow(null, '')
  })
};

const prescriptionSchemas = {
  create: Joi.object({
    diagnosis_id: Joi.number().integer().positive().required(),
    medicine_name: Joi.string().min(2).required(),
    medication: Joi.string().min(2),
    dosage: Joi.string().required(),
    instructions: Joi.string().allow(null, ''),
    advice: Joi.string().allow(null, '')
  }),
  
  update: Joi.object({
    medicine_name: Joi.string().min(2),
    dosage: Joi.string(),
    instructions: Joi.string().allow(null, ''),
    advice: Joi.string().allow(null, '')
  })
};

const paymentSchemas = {
  create: Joi.object({
    diagnosis_id: Joi.number().integer().positive().required(),
    cashier_id: Joi.number().integer().positive().allow(null),
    doctor_fee: Joi.number().integer().min(0),
    treatment_fee: Joi.number().integer().min(0),
    drug_fee: Joi.number().integer().min(0)
  }),
  
  update: Joi.object({
    cashier_id: Joi.number().integer().positive(),
    doctor_fee: Joi.number().integer().min(0),
    treatment_fee: Joi.number().integer().min(0),
    drug_fee: Joi.number().integer().min(0),
    status: Joi.string().valid('unpaid', 'paid')
  })
};

const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID parameter'
    });
  }
  req.params.id = id;
  next();
};

const validateBodyId = (paramName) => {
  return (req, res, next) => {
    const val = parseInt(req.params[paramName]);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} parameter`
      });
    }
    req.params[paramName] = val;
    next();
  };
};

module.exports = {
  validate,
  validateId,
  validateBodyId,
  userSchemas,
  patientSchemas,
  registrationSchemas,
  queueSchemas,
  nurseExamSchemas,
  diagnosisSchemas,
  prescriptionSchemas,
  paymentSchemas,
  
  validateUser: validate(userSchemas.create),
  validateUserUpdate: validate(userSchemas.update),
  validateLogin: validate(userSchemas.login),
  validatePatient: validate(patientSchemas.create),
  validatePatientUpdate: validate(patientSchemas.update),
  validateRegistration: validate(registrationSchemas.create),
  validateRegistrationUpdate: validate(registrationSchemas.update),
  validateQueueStatus: validate(queueSchemas.updateStatus),
  validateNurseExam: validate(nurseExamSchemas.create),
  validateNurseExamUpdate: validate(nurseExamSchemas.update),
  validateDiagnosis: validate(diagnosisSchemas.create),
  validateDiagnosisUpdate: validate(diagnosisSchemas.update),
  validatePrescription: validate(prescriptionSchemas.create),
  validatePrescriptionUpdate: validate(prescriptionSchemas.update),
  validatePayment: validate(paymentSchemas.create),
  validatePaymentUpdate: validate(paymentSchemas.update)
};

