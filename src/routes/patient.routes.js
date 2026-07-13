const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validatePatient, validatePatientUpdate, validateId, validateBodyId } = require('../middleware/validation');

router.get('/', authenticate, authorize(['admin', 'nurse', 'doctor']), patientController.getAll);
router.get('/nik/:nik', authenticate, authorize(['admin', 'nurse', 'doctor']), patientController.getPatientByNik);
router.get('/user/:userId', authenticate, authorize(['admin', 'nurse', 'doctor']), validateBodyId('userId'), patientController.getPatientByUserId);
router.get('/my-registrations', authenticate, authorize(['patient']), patientController.getMyRegistrations);
router.get('/:id', authenticate, authorize(['admin', 'nurse', 'doctor']), validateId, patientController.getById);

router.put('/:id', authenticate, authorize(['admin', 'patient']), validateId, validatePatientUpdate, patientController.update);
router.delete('/:id', authenticate, authorize(['admin']), validateId, patientController.delete);

router.post('/register', authenticate, authorize(['patient']), validatePatient, patientController.register);
router.post('/', authenticate, authorize(['admin']), validatePatient, patientController.create);

module.exports = router;

