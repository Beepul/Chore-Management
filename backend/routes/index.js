const express = require('express');
const authRoutes = require('./auth.routes')
const householdRoutes = require('./household.routes')

const mainRouter = express.Router();


mainRouter.use('/auth', authRoutes);
mainRouter.use('/household', householdRoutes);

module.exports = mainRouter;