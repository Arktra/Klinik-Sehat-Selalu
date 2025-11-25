const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'doctor']), prescriptionController.getAll);
router.get('/:id', authenticate, authorize(['admin', 'cashier', 'doctor']), prescriptionController.getById);
router.post('/', authenticate, authorize(['admin', 'doctor']), prescriptionController.create);
router.put('/:id', authenticate, authorize(['admin', 'cashier']), prescriptionController.update);
router.delete('/:id', authenticate, authorize(['admin']), prescriptionController.delete);
router.get('/diagnosis/:diagnosisId', authenticate, authorize(['admin', 'doctor']), prescriptionController.getByDiagnosisId);
router.patch('/:id/status', authenticate, authorize(['admin', 'doctor']), prescriptionController.updateStatus);

module.exports = router;
