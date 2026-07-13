const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosis.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateId, validateBodyId, validateDiagnosis, validateDiagnosisUpdate } = require('../middleware/validation');

router.get('/', authenticate, authorize(['admin', 'doctor', 'nurse']), diagnosisController.getAll);
router.get('/queue/:queueId', authenticate, authorize(['admin', 'doctor', 'nurse']), validateBodyId('queueId'), diagnosisController.getByQueueId); // Placed before /:id

router.get('/:id', authenticate, validateId, diagnosisController.getById);
router.post('/', authenticate, authorize(['admin', 'doctor']), validateDiagnosis, diagnosisController.create);
router.put('/:id', authenticate, authorize(['admin', 'doctor']), validateId, validateDiagnosisUpdate, diagnosisController.update);
router.delete('/:id', authenticate, authorize(['admin']), validateId, diagnosisController.delete);

module.exports = router;

