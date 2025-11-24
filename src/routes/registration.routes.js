const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registration.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'nurse']), registrationController.getAll);
router.get('/:id', authenticate, registrationController.getById);
router.post('/', authenticate, registrationController.create);
router.put('/:id', authenticate, authorize(['admin', 'nurse']), registrationController.update);
router.delete('/:id', authenticate, authorize(['admin']), registrationController.delete);
router.get('/status/:status', authenticate, authorize(['admin', 'nurse']), registrationController.getByStatus);
router.patch('/:id/verify', authenticate, authorize(['admin', 'nurse']), registrationController.verifyRegistration);
router.patch('/:id/reject', authenticate, authorize(['admin', 'nurse']), registrationController.rejectRegistration);

module.exports = router;
