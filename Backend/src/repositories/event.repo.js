'use strict'

const prisma = require('../config/prisma')

class EventRepository {
    
    static createEvent = async ({ 
        title, description, venue, address, event_date, 
        event_end_date, sale_start_at, sale_end_at, created_by, zones, banner_url 
    }) => {
        return await prisma.$transaction(async (tx) => {
            // 1. Create Event
            const newEvent = await tx.events.create({
                data: {
                    title,
                    description,
                    venue,
                    address,
                    event_date: new Date(event_date),
                    event_end_date: event_end_date ? new Date(event_end_date) : null,
                    sale_start_at: new Date(sale_start_at),
                    sale_end_at: new Date(sale_end_at),
                    created_by,
                    status: 'DRAFT',
                    banner_url: banner_url || null
                }
            })

            let totalSeatsCount = 0;

            // 2. Create Zones and their Seats
            if (zones && zones.length > 0) {
                for (const zone of zones) {
                    const newZone = await tx.zones.create({
                        data: {
                            event_id: newEvent.id,
                            name: zone.name,
                            description: zone.description,
                            rows: zone.rows,
                            seats_per_row: zone.seats_per_row,
                            price: zone.price,
                            color_hex: zone.color_hex || '#3B82F6'
                        }
                    })

                    // 3. Generate Seats for this zone
                    const seatsData = []
                    for (let r = 1; r <= zone.rows; r++) {
                        for (let s = 1; s <= zone.seats_per_row; s++) {
                            seatsData.push({
                                zone_id: newZone.id,
                                row_number: r,
                                seat_number: s,
                                label: `${String.fromCharCode(64 + r)}${s}`, // Ví dụ: A1, A2, B1...
                                status: 'AVAILABLE'
                            })
                        }
                    }

                    // Bulk insert seats to optimize performance
                    await tx.seats.createMany({
                        data: seatsData
                    })

                    totalSeatsCount += (zone.rows * zone.seats_per_row);
                }
            }

            // Update the event with the total seats count
            await tx.events.update({
                where: { id: newEvent.id },
                data: { 
                    total_seats: totalSeatsCount,
                    available_seats: totalSeatsCount
                 }
            })

            return newEvent
        })
    }

    static findAllEvents = async ({ limit, offset, status }) => {
        return await prisma.events.findMany({
            where: status ? { status } : {},
            take: limit,
            skip: offset,
            orderBy: { created_at: 'desc' },
            include: {
                zones: true
            }
        })
    }

    static findEventById = async (id) => {
        return await prisma.events.findUnique({
            where: { id },
            include: {
                zones: {
                    include: {
                        seats: {
                            orderBy: [
                                { row_number: 'asc' },
                                { seat_number: 'asc' }
                            ]
                        }
                    }
                }
            }
        })
    }

    static updateEvent = async (id, payload) => {
        return await prisma.events.update({
            where: { id },
            data: payload
        })
    }

    static deleteEvent = async (id) => {
        return await prisma.events.delete({
            where: { id }
        })
    }
}

module.exports = EventRepository
