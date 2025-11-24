const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUser, validateLogin } = require('../middleware/validation');

router.post('/login', validateLogin, userController.login);
router.post('/register', validateUser, userController.create);
router.get('/profile', authenticate, userController.getProfile);
router.get('/', authenticate, authorize(['admin']), userController.getAll);
router.get('/:id', authenticate, authorize(['admin']), userController.getById);
router.put('/:id', authenticate, authorize(['admin']), userController.update);
router.delete('/:id', authenticate, authorize(['admin']), userController.delete);
router.get('/role/:role', authenticate, authorize(['admin']), userController.getUsersByRole);

module.exports = router;
