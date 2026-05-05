'use strict';
const DashboardRepo = require('../repositories/dashboard.repo');

class DashboardService {
    static getStats = async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const [
            revenueResult,
            ticketsSold,
            activeEvents,
            totalCustomers,
            recentEvents,
            genders,
            usersWithAge,
            ordersLast7Days
        ] = await Promise.all([
            DashboardRepo.getRevenueResult(),
            DashboardRepo.getTicketsSold(),
            DashboardRepo.getActiveEvents(),
            DashboardRepo.getTotalCustomers(),
            DashboardRepo.getRecentEvents(),
            DashboardRepo.getGenders(),
            DashboardRepo.getUsersWithAge(),
            DashboardRepo.getOrdersLast7Days(sevenDaysAgo)
        ]);

        const totalRevenue = Number(revenueResult._sum.total_amount || 0);

        const eventOccupancy = recentEvents.map(e => ({
            event: e.title,
            occupancy: e.exact_occupancy,
            total: e.total_seats
        }));

        const genderData = genders.map(g => ({
            name: g.gender === 'MALE' ? 'Male' : g.gender === 'FEMALE' ? 'Female' : 'Other',
            value: g._count.gender
        }));

        let ageDemographics = { '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0 };
        
        usersWithAge.forEach(user => {
            const age = user.age;
            if (age >= 18 && age <= 24) ageDemographics['18-24']++;
            else if (age >= 25 && age <= 34) ageDemographics['25-34']++;
            else if (age >= 35 && age <= 44) ageDemographics['35-44']++;
            else if (age >= 45) ageDemographics['45+']++;
        });

        const demographicsData = Object.keys(ageDemographics).map(key => ({
            name: key, value: ageDemographics[key]
        }));

        // 5. Revenue & tickets sold in the last 7 days (Group by Date)
        // Create a 7-day frame (days with no orders default to revenue = 0)
        const revenueMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
            revenueMap[dateStr] = { date: dateStr, revenue: 0, tickets: 0 };
        }

        // Fill actual data into the 7-day frame
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