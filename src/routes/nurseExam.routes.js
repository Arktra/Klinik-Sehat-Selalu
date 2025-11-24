const express = require('express');
const router = express.Router();
const nurseExamController = require('../controllers/nurseExam.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'nurse', 'doctor']), nurseExamController.getAll);
router.get('/:id', authenticate, nurseExamController.getById);
router.post('/', authenticate, authorize(['admin', 'nurse']), nurseExamController.create);
router.put('/:id', authenticate, authorize(['admin', 'nurse']), nurseExamController.update);
router.delete('/:id', authenticate, authorize(['admin']), nurseExamController.delete);
router.get('/queue/:queueId', authenticate, authorize(['admin', 'nurse', 'doctor']), nurseExamController.getByQueueId);

module.exports = router;
