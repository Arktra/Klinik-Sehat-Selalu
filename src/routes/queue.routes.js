const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateQueueStatus, validateId } = require('../middleware/validation');

router.get('/', authenticate, authorize(['admin', 'nurse']), queueController.getAll);
router.patch('/take-next', authenticate, authorize(['nurse']), queueController.takeNextQueue); // Placed before /:id
router.get('/status/:status', authenticate, authorize(['admin', 'nurse']), queueController.getByStatus); // Placed before /:id

router.get('/:id', authenticate, validateId, queueController.getById);
router.post('/', authenticate, authorize(['admin', 'nurse']), queueController.create);
router.put('/:id', authenticate, authorize(['admin', 'nurse']), validateId, queueController.update);
router.delete('/:id', authenticate, authorize(['admin']), validateId, queueController.delete);

router.patch('/:id/status', authenticate, authorize(['admin', 'nurse']), validateId, validateQueueStatus, queueController.updateStatus);

module.exports = router;

