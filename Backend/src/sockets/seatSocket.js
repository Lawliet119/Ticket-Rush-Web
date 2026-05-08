'use strict';


const lockedSeats = new Set();

/**
 * Socket.io handlers for real-time seat selection and virtual queue
 * @param {Object} io - Socket.io server instance
 */
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
                // Attach info to socket for disconnect cleanup
                socket.eventId = eventId;
                socket.userId = userId;

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

        socket.on('register_seatmap', (eventId, userId) => {
            socket.eventId = eventId;
            socket.userId = userId;
        });

        socket.on('transitioning_to_seatmap', () => {
            socket.transitioning = true;
        });

        socket.on('disconnect', async () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
            if (socket.eventId && socket.userId && !socket.transitioning) {
                try {
                    const QueueService = require('../services/queue.service');
                    await QueueService.removeFromActive(socket.eventId, socket.userId);
                } catch (error) {
                    console.error('[Socket] disconnect cleanup error:', error);
                }
            }
        });
    });
};