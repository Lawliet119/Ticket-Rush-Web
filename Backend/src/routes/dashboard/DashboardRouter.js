'use strict';
const express = require('express');
const router = express.Router();
const DashboardController = require('../../controllers/Dashboard.controller');
const { authentication, checkRole } = require('../../utils/authUtils');
const asyncHandler = require('../../middleware/errorHandler');

// Bắt buộc đăng nhập
router.use(authentication);

// Chỉ Admin mới được xem thống kê
router.get('/stats', checkRole(['ADMIN']), asyncHandler(DashboardController.getDashboardStats));

module.exports = router;