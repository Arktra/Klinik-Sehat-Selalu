const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUser, validateUserUpdate, validateLogin, validateId } = require('../middleware/validation');

router.post('/login', validateLogin, userController.login);
router.post('/register', validateUser, userController.register); // Public registration
router.post('/', authenticate, authorize(['admin']), validateUser, userController.create); // Admin-only creation

router.get('/profile', authenticate, userController.getProfile);
router.get('/role/:role', authenticate, authorize(['admin']), userController.getUsersByRole); // Placed before /:id

router.get('/', authenticate, authorize(['admin']), userController.getAll);
router.get('/:id', authenticate, authorize(['admin']), validateId, userController.getById);
router.put('/:id', authenticate, authorize(['admin']), validateId, validateUserUpdate, userController.update);
router.delete('/:id', authenticate, authorize(['admin']), validateId, userController.delete);

module.exports = router;

