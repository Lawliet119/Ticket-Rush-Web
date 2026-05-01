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

        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });
};