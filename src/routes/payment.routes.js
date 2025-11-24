const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'cashier']), paymentController.getAll);
router.get('/daily-revenue/:date', authenticate, authorize(['admin', 'cashier']), paymentController.getDailyRevenue);
router.get('/daily-revenue', authenticate, authorize(['admin', 'cashier']), paymentController.getDailyRevenue);
router.get('/:id', authenticate, paymentController.getById);
router.post('/', authenticate, authorize(['admin', 'cashier']), paymentController.create);
router.put('/:id', authenticate, authorize(['admin', 'cashier']), paymentController.update);
router.delete('/:id', authenticate, authorize(['admin']), paymentController.delete);
router.get('/diagnosis/:diagnosisId', authenticate, paymentController.getByDiagnosisId);
router.patch('/:id/process', authenticate, authorize(['admin', 'cashier']), paymentController.processPayment);

module.exports = router;
