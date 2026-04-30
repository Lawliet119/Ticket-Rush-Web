'use strict';

const DashboardService = require('../services/dashboard.service');
const { OK } = require('../core/success.response');

class DashboardController {
    getDashboardStats = async (req, res, next) => {
        new OK({
            message: 'Lấy dữ liệu thống kê Dashboard thành công!',
            metadata: await DashboardService.getStats()
        }).send(res);
    }
}

module.exports = new DashboardController();