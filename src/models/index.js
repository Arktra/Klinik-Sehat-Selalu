const sequelize = require('../config/database');

const User = require('./user.model');
const Patient = require('./patient.model');
const Registration = require('./registration.model');
const Queue = require('./queue.model');
const NurseExam = require('./nurseExam.model');
const Diagnosis = require('./diagnosis.model');
const Prescription = require('./prescription.model');
const Payment = require('./payment.model');

User.hasOne(Patient, { foreignKey: 'user_id', as: 'patient' });
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Patient.hasMany(Registration, { foreignKey: 'patient_id', as: 'registrations' });
Registration.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Registration.hasOne(Queue, { foreignKey: 'registration_id', as: 'queue' });
Queue.belongsTo(Registration, { foreignKey: 'registration_id', as: 'registration' });

Queue.hasOne(NurseExam, { foreignKey: 'queue_id', as: 'nurseExam' });
NurseExam.belongsTo(Queue, { foreignKey: 'queue_id', as: 'queue' });

Queue.hasOne(Diagnosis, { foreignKey: 'queue_id', as: 'diagnosis' });
Diagnosis.belongsTo(Queue, { foreignKey: 'queue_id', as: 'queue' });

User.hasMany(Registration, { foreignKey: 'nurse_id', as: 'verifiedRegistrations' });
Registration.belongsTo(User, { foreignKey: 'nurse_id', as: 'nurse' });

User.hasMany(NurseExam, { foreignKey: 'nurse_id', as: 'nurseExams' });
NurseExam.belongsTo(User, { foreignKey: 'nurse_id', as: 'nurse' });

User.hasMany(Diagnosis, { foreignKey: 'doctor_id', as: 'diagnoses' });
Diagnosis.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

Diagnosis.hasMany(Prescription, { foreignKey: 'diagnosis_id', as: 'prescriptions' });
Prescription.belongsTo(Diagnosis, { foreignKey: 'diagnosis_id', as: 'diagnosis' });

Diagnosis.hasOne(Payment, { foreignKey: 'diagnosis_id', as: 'payment' });
Payment.belongsTo(Diagnosis, { foreignKey: 'diagnosis_id', as: 'diagnosis' });

User.hasMany(Payment, { foreignKey: 'cashier_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'cashier_id', as: 'cashier' });

module.exports = {
  sequelize,
  User,
  Patient,
  Registration,
  Queue,
  NurseExam,
  Diagnosis,
  Prescription,
  Payment
};
