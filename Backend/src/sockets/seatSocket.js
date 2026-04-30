'use strict';

//  manages real-time seat locking using Socket.IO. (In-memory cache)
const lockedSeats = new Set();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket] Khách hàng kết nối: ${socket.id}`);

        // 1. Send locked seats list when a new client connects
        socket.emit('sync_seats', Array.from(lockedSeats));

        // 2. Listen for seat lock/unlock events from clients
        socket.on('toggle_seat', (seatId, isLocking) => {
            if (isLocking) {
                lockedSeats.add(seatId); // add into locked set
            } else {
                lockedSeats.delete(seatId); // remove from locked set
            }

            // 3. Broadcast the update to all other clients except the one who triggered it
            // their FE will update the UI based on the new lockedSeats list
            socket.broadcast.emit('seat_updated', seatId, isLocking);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Khách hàng ngắt kết nối: ${socket.id}`);
        });
    });
};