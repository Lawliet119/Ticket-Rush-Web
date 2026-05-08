'use strict';

const DashboardService = require('../services/dashboard.service');
const { OK } = require('../core/success.response');

class DashboardController {
    /**
     * Handle request for dashboard analytics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    getDashboardStats = async (req, res, next) => {
        new OK({
            message: 'Dashboard statistics retrieved successfully!',
            metadata: await DashboardService.getStats()
        }).send(res);
    }
}

module.exports = new DashboardController();