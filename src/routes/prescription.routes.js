const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateId, validateBodyId, validatePrescription, validatePrescriptionUpdate } = require('../middleware/validation');

router.get('/', authenticate, authorize(['admin', 'pharmacist', 'doctor']), prescriptionController.getAll);
router.get('/diagnosis/:diagnosisId', authenticate, authorize(['admin', 'pharmacist', 'doctor', 'patient']), validateBodyId('diagnosisId'), prescriptionController.getByDiagnosisId); // Placed before /:id

router.get('/:id', authenticate, authorize(['admin', 'pharmacist', 'doctor', 'patient']), validateId, prescriptionController.getById);
router.post('/', authenticate, authorize(['admin', 'doctor']), validatePrescription, prescriptionController.create); // Doctor writes prescription
router.put('/:id', authenticate, authorize(['admin', 'doctor']), validateId, validatePrescriptionUpdate, prescriptionController.update);
router.delete('/:id', authenticate, authorize(['admin']), validateId, prescriptionController.delete);

module.exports = router;

