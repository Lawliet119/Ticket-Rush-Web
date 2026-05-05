'use strict';


const lockedSeats = new Set();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

       
        socket.emit('sync_seats', Array.from(lockedSeats));

        
        socket.on('toggle_seat', (seatId, isLocking) => {
            if (isLocking) {
                lockedSeats.add(seatId);
            } else {
                lockedSeats.delete(seatId);
            }

            socket.broadcast.emit('seat_updated', seatId, isLocking);
        });

        // VIRTUAL QUEUE HANDLERS
        socket.on('join_queue', async (eventId, userId) => {
            try {
                const QueueService = require('../services/queue.service');
                const result = await QueueService.joinQueue(eventId, userId, socket.id);
                if (result.status === 'GRANTED') {
                    socket.emit('queue_passed', { token: result.token });
                } else {
                    socket.emit('queue_position', { position: result.position });
                }
            } catch (error) {
                console.error('[Socket] join_queue error:', error);
            }
        });

        socket.on('leave_queue', async (eventId, userId) => {
            try {
                const QueueService = require('../services/queue.service');
                await QueueService.removeFromActive(eventId, userId);
            } catch (error) {
                console.error('[Socket] leave_queue error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });
};