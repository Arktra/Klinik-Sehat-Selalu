const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'nurse']), queueController.getAll);
router.get('/:id', authenticate, queueController.getById);
router.post('/', authenticate, authorize(['admin', 'nurse']), queueController.create);
router.put('/:id', authenticate, authorize(['admin', 'nurse']), queueController.update);
router.delete('/:id', authenticate, authorize(['admin']), queueController.delete);
router.get('/status/:status', authenticate, authorize(['admin', 'nurse']), queueController.getByStatus);
router.patch('/:id/status', authenticate, authorize(['admin', 'nurse']), queueController.updateStatus);
router.patch('/take-next', authenticate, authorize(['nurse']), queueController.takeNextQueue);

module.exports = router;
