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
    role: Joi.string().valid('admin', 'patient', 'nurse', 'doctor', 'cashier').required()
  }),
  
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),
  
  update: Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    password: Joi.string().min(6),
    name: Joi.string().min(2).max(100),
    role: Joi.string().valid('admin', 'patient', 'nurse', 'doctor', 'cashier')
  })
};

const patientSchemas = {
  create: Joi.object({
    user_id: Joi.number().integer().positive().required(),
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

module.exports = {
  validate,
  validateId,
  userSchemas,
  patientSchemas,
  validateUser: validate(userSchemas.create),
  validateLogin: validate(userSchemas.login),
  validatePatient: validate(patientSchemas.create)
};
