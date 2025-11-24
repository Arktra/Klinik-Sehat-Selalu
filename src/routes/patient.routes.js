const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'nurse', 'doctor']), patientController.getAll);
router.get('/nik/:nik', authenticate, authorize(['admin', 'nurse', 'doctor']), patientController.getPatientByNik);
router.get('/user/:userId', authenticate, authorize(['admin', 'nurse', 'doctor']), patientController.getPatientByUserId);
router.get('/my-registrations', authenticate, authorize(['patient']), patientController.getMyRegistrations);
router.get('/:id', authenticate, authorize(['admin', 'nurse', 'doctor']), patientController.getById);
router.put('/:id', authenticate, authorize(['admin', 'patient']), patientController.update);
router.delete('/:id', authenticate, authorize(['admin']), patientController.delete);
router.post('/register', authenticate, authorize(['patient']), patientController.register);
router.post('/', authenticate, authorize(['admin']), patientController.create);

module.exports = router;
