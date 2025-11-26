const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'pharmacist']), prescriptionController.getAll);
router.get('/:id', authenticate, authorize(['admin', 'pharmacist']), prescriptionController.getById);
router.post('/', authenticate, authorize(['admin', 'patient']), prescriptionController.create);
router.put('/:id', authenticate, authorize(['admin']), prescriptionController.update);
router.delete('/:id', authenticate, authorize(['admin']), prescriptionController.delete);
router.get('/diagnosis/:diagnosisId', authenticate, authorize(['admin', 'pharmacist']), prescriptionController.getByDiagnosisId);
router.patch('/:id/status', authenticate, authorize(['admin', 'pharmacist']), prescriptionController.updateStatus);

module.exports = router;
