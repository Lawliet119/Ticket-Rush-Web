'use strict'
const { Prisma } = require('../generated/prisma')
const prisma = require('../config/prisma')

class BookingRepository {
    
    static holdSeats = async (userId, eventId, seatIds, holdDurationSeconds = 30) => {
        return await prisma.$transaction(async (tx) => {
            const seats = await tx.$queryRaw`
                SELECT id, status 
                FROM seats 
                WHERE id IN (${Prisma.join(seatIds)}) 
                FOR UPDATE
            `;

            if (seats.length !== seatIds.length) {
                throw new Error('Seats do not exist in the system.');
            }

            const unavailableSeat = seats.find(seat => seat.status !== 'AVAILABLE');
            if (unavailableSeat) {
                throw new Error('Some seats in the list are already held or purchased by someone else.');
            }

            await tx.seats.updateMany({
                where: { id: { in: seatIds } },
                data: { status: 'LOCKED' }
            });

            const expiresAt = new Date(Date.now() + holdDurationSeconds * 1000);
            const lockData = seatIds.map(seatId => ({
                seat_id: seatId,
                user_id: userId,
                expires_at: expiresAt
            }));

            await tx.seat_locks.createMany({ data: lockData });

            return { locked_seats: seatIds, expires_at: expiresAt };
        });
    }

    // Cancel/release held seats when user leaves Checkout page
    static cancelHold = async (userId, seatIds) => {
        return await prisma.$transaction(async (tx) => {
            // Only delete locks that belong to this user
            const deleted = await tx.seat_locks.deleteMany({
                where: { 
                    user_id: userId, 
                    seat_id: { in: seatIds } 
                }
            });

            if (deleted.count > 0) {
                // Set seats back to AVAILABLE (only if still LOCKED, not SOLD)
                await tx.seats.updateMany({
                    where: { 
                        id: { in: seatIds }, 
                        status: 'LOCKED' 
                    },
                    data: { status: 'AVAILABLE' }
                });
            }

            return { released_seats: seatIds, count: deleted.count };
        });
    }

    // Create order and tickets from held seats
    static checkout = async (userId, eventId, seatIds) => {
        return await prisma.$transaction(async (tx) => {
            // Get seat info for pricing
            const seats = await tx.$queryRaw`
                SELECT s.id, s.status, s.label as seat_label, z.name as zone_name, z.price 
                FROM seats s
                JOIN zones z ON s.zone_id = z.id
                WHERE s.id IN (${Prisma.join(seatIds)})
                FOR UPDATE
            `;

            if (seats.length !== seatIds.length) {
                throw new Error('Some seats do not exist.');
            }

            // Check if seats are held by this user
            const locks = await tx.seat_locks.findMany({
                where: { user_id: userId, seat_id: { in: seatIds } }
            });

            if (locks.length !== seatIds.length) {
                throw new Error('Your seat holding session has expired or is invalid.');
            }

            // Calculate total amount
            const totalAmount = seats.reduce((sum, seat) => sum + Number(seat.price), 0);
            // order_code max length is 20 in schema
            const orderCode = `ORD-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;

            // Delete seat locks after successful payment
            await tx.seat_locks.deleteMany({
                where: { user_id: userId, seat_id: { in: seatIds } }
            });

            // Update seat status to SOLD
            await tx.seats.updateMany({
                where: { id: { in: seatIds } },
                data: { status: 'SOLD' }
            });

            // Decrease available_seats for the event
            await tx.events.update({
                where: { id: eventId },
                data: {
                    available_seats: { decrement: seatIds.length }
                }
            });

            // 3. Create Order
            const order = await tx.orders.create({
                data: {
                    user_id: userId,
                    event_id: eventId,
                    order_code: orderCode,
                    total_amount: totalAmount,
                    status: 'PAID',
                    expires_at: new Date(Date.now() + 10 * 60000), // Not important because already PAID
                    paid_at: new Date()
                }
            });

            // 4. Create Order Items and Tickets
            for (const seat of seats) {
                const orderItem = await tx.order_items.create({
                    data: {
                        order_id: order.id,
                        seat_id: seat.id,
                        price: seat.price,
                        zone_name: seat.zone_name,
                        seat_label: seat.seat_label
                    }
                });

                await tx.tickets.create({
                    data: {
                        order_id: order.id,
                        order_item_id: orderItem.id,
                        user_id: userId,
                        ticket_code: `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        qr_data: `QR-${order.id}-${seat.id}`
                    }
                });
            }

            return order;
        });
    }

    // Get list of tickets for User
    static getMyTickets = async (userId) => {
        // Get all tickets with event, order, and order_items
        return await prisma.tickets.findMany({
            where: { user_id: userId },
            include: {
                orders: {
                    include: {
                        events: true
                    }
                },
                order_items: true
            },
            orderBy: { created_at: 'desc' }
        });
    }
}

module.exports = BookingRepository
