const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateId, validateBodyId, validatePayment, validatePaymentUpdate } = require('../middleware/validation');

router.get('/', authenticate, authorize(['admin', 'cashier']), paymentController.getAll);
router.get('/daily-revenue/:date', authenticate, authorize(['admin', 'cashier']), paymentController.getDailyRevenue);
router.get('/daily-revenue', authenticate, authorize(['admin', 'cashier']), paymentController.getDailyRevenue);
router.get('/diagnosis/:diagnosisId', authenticate, validateBodyId('diagnosisId'), paymentController.getByDiagnosisId); // Placed before /:id

router.get('/:id', authenticate, validateId, paymentController.getById);
router.post('/', authenticate, authorize(['admin', 'cashier']), validatePayment, paymentController.create);
router.put('/:id', authenticate, authorize(['admin', 'cashier']), validateId, validatePaymentUpdate, paymentController.update);
router.delete('/:id', authenticate, authorize(['admin']), validateId, paymentController.delete);

router.patch('/:id/process', authenticate, authorize(['admin', 'cashier']), validateId, paymentController.processPayment);

module.exports = router;

