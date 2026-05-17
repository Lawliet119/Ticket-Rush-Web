require("dotenv").config({ override: true });

const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const CronService = require('./src/services/cron.service')
const QueueService = require('./src/services/queue.service')
const { globalLimiter } = require('./src/middleware/rateLimiter')

const app = express()
const PORT = process.env.PORT || 3000
const { Server } = require('socket.io');

const allowedOrigins = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

// Global Middlewares
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(cookieParser())
app.use(compression())
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(globalLimiter)
app.use(express.static('public'))

// API Routes
app.use('', require('./src/routes'))

// 404 & Error Handling
app.use((req, res, next) => next(new Error('Not Found')))
app.use((error, req, res, next) => {
    const statusCode = error.status || 500  
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error'
    })
})

/**
 * Server startup procedure in correct sequence
 */
async function startServer() {
    // 1. Cleanup old Redis data on startup
    await QueueService.init();

    // 2. Start HTTP Server
    const server = app.listen(PORT, () => {
        console.log('==============================================');
        console.log(`[Server] TicketRush is running on port: ${PORT}`);
        console.log(`[Server] Current Limit: ${process.env.MAX_ACTIVE_USERS} users.`);
        console.log('==============================================');
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`!!! ERROR: Port ${PORT} is already in use by another process !!!`);
            process.exit(1);
        }
    });

    // 3. Initialize Socket.io
    const io = new Server(server, {
        cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true }
    });
    
    require('./src/config/socket').setIO(io);
    require('./src/sockets/seatSocket')(io);

    // 4. Start Background Tasks (Cron & Interval)
    CronService.init(io);

    process.on('SIGINT', () => {
        server.close(() => console.log('Server stopped.'));
    })
}

startServer().catch(err => {
    console.error('[Server] Startup failed:', err);
    process.exit(1);
});

module.exports = app