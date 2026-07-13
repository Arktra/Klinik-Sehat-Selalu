const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registration.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRegistration, validateRegistrationUpdate, validateId } = require('../middleware/validation');

router.get('/', authenticate, authorize(['admin', 'administrative']), registrationController.getAll);
router.get('/status/:status', authenticate, authorize(['admin', 'administrative']), registrationController.getByStatus); // Placed before /:id

router.get('/:id', authenticate, validateId, registrationController.getById);
router.post('/', authenticate, validateRegistration, registrationController.create);
router.put('/:id', authenticate, authorize(['admin', 'administrative']), validateId, validateRegistrationUpdate, registrationController.update);
router.delete('/:id', authenticate, authorize(['admin']), validateId, registrationController.delete);

router.patch('/:id/verify', authenticate, authorize(['admin', 'administrative']), validateId, registrationController.verifyRegistration);
router.patch('/:id/reject', authenticate, authorize(['admin', 'administrative']), validateId, registrationController.rejectRegistration);

module.exports = router;

