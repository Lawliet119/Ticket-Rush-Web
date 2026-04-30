'use strict';
const prisma = require('../config/prisma');

class DashboardService {
    static getStats = async () => {
        // 1. TỔNG QUAN (4 Chỉ số trên cùng)
        const revenueResult = await prisma.orders.aggregate({
            _sum: { total_amount: true },
            where: { status: 'PAID' }
        });
        const totalRevenue = Number(revenueResult._sum.total_amount || 0);
        const ticketsSold = await prisma.tickets.count({ where: { status: 'ACTIVE' } });
        const activeEvents = await prisma.events.count({ where: { status: { in: ['PUBLISHED', 'ON_SALE'] } } });
        const totalCustomers = await prisma.users.count({ where: { role: 'CUSTOMER' } });

        // 2. TỶ LỆ LẤP ĐẦY SỰ KIỆN (5 Sự kiện gần nhất)
        const recentEvents = await prisma.events.findMany({
            take: 5, orderBy: { created_at: 'desc' },
            where: { total_seats: { gt: 0 } },
            select: { title: true, total_seats: true, available_seats: true }
        });
        const eventOccupancy = recentEvents.map(e => ({
            event: e.title,
            occupancy: e.total_seats - e.available_seats,
            total: e.total_seats
        }));

        // 3. THỐNG KÊ GIỚI TÍNH
        const genders = await prisma.users.groupBy({
            by: ['gender'],
            _count: { gender: true },
            where: { role: 'CUSTOMER', gender: { not: null } }
        });
        const genderData = genders.map(g => ({
            name: g.gender === 'MALE' ? 'Nam' : g.gender === 'FEMALE' ? 'Nữ' : 'Khác',
            value: g._count.gender
        }));

        // 4. THỐNG KÊ ĐỘ TUỔI (Tính từ date_of_birth)
        const usersWithDob = await prisma.users.findMany({
            where: { role: 'CUSTOMER', date_of_birth: { not: null } },
            select: { date_of_birth: true }
        });
        
        let ageDemographics = { '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0 };
        const currentYear = new Date().getFullYear();
        
        usersWithDob.forEach(user => {
            const age = currentYear - new Date(user.date_of_birth).getFullYear();
            if (age >= 18 && age <= 24) ageDemographics['18-24']++;
            else if (age >= 25 && age <= 34) ageDemographics['25-34']++;
            else if (age >= 35 && age <= 44) ageDemographics['35-44']++;
            else if (age >= 45) ageDemographics['45+']++;
        });

        const demographicsData = Object.keys(ageDemographics).map(key => ({
            name: key, value: ageDemographics[key]
        }));

        // 5. DOANH THU & VÉ TRONG 7 NGÀY QUA (Group By Date)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const ordersLast7Days = await prisma.orders.findMany({
            where: { status: 'PAID', created_at: { gte: sevenDaysAgo } },
            select: { created_at: true, total_amount: true, _count: { select: { tickets: true } } }
        });

        // Tạo khung 7 ngày (Để ngày nào không có đơn thì doanh thu = 0)
        const revenueMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
            revenueMap[dateStr] = { date: dateStr, revenue: 0, tickets: 0 };
        }

        // Nhồi data thật vào khung 7 ngày
        ordersLast7Days.forEach(order => {
            const d = new Date(order.created_at);
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
            if (revenueMap[dateStr]) {
                revenueMap[dateStr].revenue += Number(order.total_amount);
                revenueMap[dateStr].tickets += order._count.tickets;
            }
        });

         return {
            summary: { totalRevenue, ticketsSold, activeEvents, totalCustomers },
            eventOccupancy,
            genderData,
            demographicsData,
            revenueChart: Object.values(revenueMap)
        };
    }
}
module.exports = DashboardService;