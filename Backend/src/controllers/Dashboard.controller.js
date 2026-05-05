'use strict';

const DashboardService = require('../services/dashboard.service');
const { OK } = require('../core/success.response');

class DashboardController {
    getDashboardStats = async (req, res, next) => {
        new OK({
            message: 'Dashboard statistics retrieved successfully!',
            metadata: await DashboardService.getStats()
        }).send(res);
    }
}

module.exports = new DashboardController();