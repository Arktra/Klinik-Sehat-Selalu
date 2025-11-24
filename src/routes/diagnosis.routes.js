const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosis.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'doctor', 'nurse']), diagnosisController.getAll);
router.get('/:id', authenticate, diagnosisController.getById);
router.post('/', authenticate, authorize(['admin', 'doctor']), diagnosisController.create);
router.put('/:id', authenticate, authorize(['admin', 'doctor']), diagnosisController.update);
router.delete('/:id', authenticate, authorize(['admin']), diagnosisController.delete);
router.get('/queue/:queueId', authenticate, authorize(['admin', 'doctor', 'nurse']), diagnosisController.getByQueueId);

module.exports = router;
