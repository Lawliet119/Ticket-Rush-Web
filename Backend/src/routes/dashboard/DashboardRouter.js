'use strict';
const express = require('express');
const router = express.Router();
const DashboardController = require('../../controllers/Dashboard.controller');
const { authentication, checkRole } = require('../../utils/authUtils');
const asyncHandler = require('../../middleware/asyncHandler');

// Authentication required
router.use(asyncHandler(authentication));

// Only Admin can view dashboard statistics
router.get('/stats', checkRole(['ADMIN']), asyncHandler(DashboardController.getDashboardStats));

module.exports = router;