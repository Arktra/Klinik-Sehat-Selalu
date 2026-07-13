const express = require('express');
const router = express.Router();
const nurseExamController = require('../controllers/nurseExam.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateNurseExam, validateNurseExamUpdate, validateId, validateBodyId } = require('../middleware/validation');

router.get('/', authenticate, authorize(['admin', 'nurse', 'doctor']), nurseExamController.getAll);
router.get('/queue/:queueId', authenticate, authorize(['admin', 'nurse', 'doctor']), validateBodyId('queueId'), nurseExamController.getByQueueId); // Placed before /:id

router.get('/:id', authenticate, validateId, nurseExamController.getById);
router.post('/', authenticate, authorize(['admin', 'nurse']), validateNurseExam, nurseExamController.create);
router.put('/:id', authenticate, authorize(['admin', 'nurse']), validateId, validateNurseExamUpdate, nurseExamController.update);
router.delete('/:id', authenticate, authorize(['admin']), validateId, nurseExamController.delete);

module.exports = router;

