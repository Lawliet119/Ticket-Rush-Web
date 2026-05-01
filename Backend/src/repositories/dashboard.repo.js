'use strict';
const prisma = require('../config/prisma');

class DashboardRepo {
    static getRevenueResult = async () => {
        return await prisma.orders.aggregate({
            _sum: { total_amount: true },
            where: { status: 'PAID' }
        });
    }

    static getTicketsSold = async () => {
        return await prisma.tickets.count({ where: { status: 'ACTIVE' } });
    }

    static getActiveEvents = async () => {
        const now = new Date();
        return await prisma.events.count({ 
            where: { 
                status: { in: ['PUBLISHED', 'ON_SALE'] },
                OR: [
                    { event_end_date: { gte: now } },
                    { 
                        event_end_date: null,
                        event_date: { gte: now }
                    }
                ]
            } 
        });
    }

    static getTotalCustomers = async () => {
        return await prisma.users.count({ where: { role: 'CUSTOMER' } });
    }

    static getRecentEvents = async () => {
        const events = await prisma.events.findMany({
            take: 5, orderBy: { created_at: 'desc' },
            where: { total_seats: { gt: 0 } },
            select: { id: true, title: true, total_seats: true, available_seats: true }
        });

        return await Promise.all(events.map(async (e) => {
            const soldCount = await prisma.seats.count({
                where: {
                    status: 'SOLD',
                    zones: { event_id: e.id }
                }
            });
            return {
                ...e,
                exact_occupancy: soldCount
            };
        }));
    }

    static getGenders = async () => {
        return await prisma.users.groupBy({
            by: ['gender'],
            _count: { gender: true },
            where: { role: 'CUSTOMER', gender: { not: null } }
        });
    }

    static getUsersWithAge = async () => {
        return await prisma.users.findMany({
            where: { role: 'CUSTOMER', age: { not: null } },
            select: { age: true }
        });
    }

    static getOrdersLast7Days = async (sevenDaysAgo) => {
        return await prisma.orders.findMany({
            where: { status: 'PAID', created_at: { gte: sevenDaysAgo } },
            select: { created_at: true, total_amount: true, _count: { select: { tickets: true } } }
        });
    }
}

module.exports = DashboardRepo;
