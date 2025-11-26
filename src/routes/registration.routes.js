const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registration.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'administrative']), registrationController.getAll);
router.get('/:id', authenticate, registrationController.getById);
router.post('/', authenticate, registrationController.create);
router.put('/:id', authenticate, authorize(['admin', 'administrative']), registrationController.update);
router.delete('/:id', authenticate, authorize(['admin']), registrationController.delete);
router.get('/status/:status', authenticate, authorize(['admin', 'administrative']), registrationController.getByStatus);
router.patch('/:id/verify', authenticate, authorize(['admin', 'administrative']), registrationController.verifyRegistration);
router.patch('/:id/reject', authenticate, authorize(['admin', 'administrative']), registrationController.rejectRegistration);

module.exports = router;
