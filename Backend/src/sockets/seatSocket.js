'use strict';

const QueueService = require('../services/queue.service');

/**
 * Socket.io handlers for Seat Map and Virtual Queue
 */
module.exports = (io) => {
    io.on('connection', (socket) => {
        
        // Handle user joining the queue
        socket.on('join_queue', async (eventId, userId) => {
            try {
                const result = await QueueService.joinQueue(eventId, userId, socket.id);
                
                if (result.status === 'GRANTED') {
                    socket.emit('queue_passed', { token: result.token });
                } else {
                    socket.emit('queue_position', { position: result.position });
                }
            } catch (error) {
                console.error('[Socket] Error in join_queue:', error);
            }
        });

        // Handle manual or automatic position updates
        socket.on('request_position', async (eventId, userId) => {
            try {
                const status = await QueueService.checkStatus(eventId, userId);
                if (status.status === 'GRANTED') {
                    socket.emit('queue_passed', { token: status.token });
                } else if (status.status === 'WAITING') {
                    socket.emit('queue_position', { position: status.position });
                }
            } catch (error) {
                console.error('[Socket] Error in request_position:', error);
            }
        });

        // Register seat map to sync socket id
        socket.on('register_seatmap', async (eventId, userId, token) => {
            const isValid = await QueueService.verifyToken(eventId, userId, token);
            if (!isValid) {
                socket.emit('token_expired', { message: 'Invalid or expired session. Please rejoin the queue.' });
                return;
            }
            await QueueService.updateSocketId(eventId, userId, socket.id);
        });

        // Handle user leaving the queue/seatmap area
        socket.on('leave_queue', async (eventId, userId) => {
            await QueueService.removeFromActive(eventId, userId);
        });

        socket.on('disconnect', async () => {
            // Cleanup logic is managed by session tokens and timeouts
        });
    });
};