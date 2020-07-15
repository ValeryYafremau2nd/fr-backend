const { Router } = require('express');
const authController = require('./auth-controller');
const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.use(authController.protect);
router.get('/logout', authController.logout);

module.exports = router;