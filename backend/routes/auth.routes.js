
const express = require('express');
const router = express.Router();
const controller = require("../controllers/authController")
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);
router.get('/profile', authMiddleware.protect, controller.getProfile);

module.exports = router;
