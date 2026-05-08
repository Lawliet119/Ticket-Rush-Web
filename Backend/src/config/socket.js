'use strict'

/**
 * Socket.IO Singleton
 * Stores the io instance so any module can import and use it
 * without relying on global variables.
 */
let _io = null;

/**
 * Initialize the global Socket.io instance
 * @param {Object} io - Socket.io server instance
 */
const setIO = (io) => {
    _io = io;
};

/**
 * Retrieve the global Socket.io instance
 * @returns {Object} Socket.io server instance
 * @throws {Error} If socket has not been initialized
 */
const getIO = () => {
    if (!_io) {
        throw new Error('Socket.IO has not been initialized. Call setIO() first.');
    }
    return _io;
};

module.exports = { setIO, getIO };
