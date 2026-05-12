
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const controller = require("../controllers/authController")

router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);
router.get('/profile', protect, controller.getProfile);

module.exports = router;
