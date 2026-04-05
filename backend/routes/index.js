const express = require('express');
const authRoutes = require('./auth.routes')

const mainRouter = express.Router();


mainRouter.use('/auth', authRoutes);

module.exports = mainRouter;