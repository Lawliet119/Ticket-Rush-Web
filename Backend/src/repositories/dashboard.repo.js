'use strict';
const prisma = require('../config/prisma');

class DashboardRepo {
    /**
     * Get total revenue from all paid orders
     * @returns {Promise<Object>} Aggregation result with sum of total_amount
     */
    static getRevenueResult = async () => {
        return await prisma.orders.aggregate({
            _sum: { total_amount: true },
            where: { status: 'PAID' }
        });
    }

    /**
     * Get total number of active tickets sold
     * @returns {Promise<number>} Count of tickets
     */
    static getTicketsSold = async () => {
        return await prisma.tickets.count({ where: { status: 'ACTIVE' } });
    }

    /**
     * Get count of currently active or upcoming events
     * @returns {Promise<number>} Count of active events
     */
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

    /**
     * Get total number of customers registered in the system
     * @returns {Promise<number>} Count of customers
     */
    static getTotalCustomers = async () => {
        return await prisma.users.count({ where: { role: 'CUSTOMER' } });
    }

    /**
     * Get the 5 most recently created events with their occupancy data
     * @returns {Promise<Array>} List of events with occupancy stats
     */
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

    /**
     * Group customers by gender for demographic stats
     * @returns {Promise<Array>} List of gender counts
     */
    static getGenders = async () => {
        return await prisma.users.groupBy({
            by: ['gender'],
            _count: { gender: true },
            where: { role: 'CUSTOMER', gender: { not: null } }
        });
    }

    /**
     * Get age data for all customers
     * @returns {Promise<Array>} List of user ages
     */
    static getUsersWithAge = async () => {
        return await prisma.users.findMany({
            where: { role: 'CUSTOMER', age: { not: null } },
            select: { age: true }
        });
    }

    /**
     * Get orders created within the last 7 days
     * @param {Date} sevenDaysAgo - Starting date for the filter
     * @returns {Promise<Array>} List of recent orders
     */
    static getOrdersLast7Days = async (sevenDaysAgo) => {
        return await prisma.orders.findMany({
            where: { status: 'PAID', created_at: { gte: sevenDaysAgo } },
            select: { created_at: true, total_amount: true, _count: { select: { tickets: true } } }
        });
    }
}

module.exports = DashboardRepo;
