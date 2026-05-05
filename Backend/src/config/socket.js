'use strict'

/**
 * Socket.IO Singleton
 * Stores the io instance so any module can import and use it
 * without relying on global variables.
 */
let _io = null;

const setIO = (io) => {
    _io = io;
};

const getIO = () => {
    if (!_io) {
        throw new Error('Socket.IO has not been initialized. Call setIO() first.');
    }
    return _io;
};

module.exports = { setIO, getIO };
