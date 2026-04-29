const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()
const dotenv = require("dotenv").config()
const PORT = process.env.PORT || 3000
const { Server } = require('socket.io');

// 1. Init middlewares
app.use(cors({
    origin: 'http://localhost:5173', // Địa chỉ Frontend của bạn (Vite mặc định là 5173)
    credentials: true
}))
app.use(cookieParser())
app.use(compression())
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 1.5 Serve static files
app.use(express.static('public'))

// 2. Init routes
app.use('',require('./src/routes'))

app.use((req,res,next)=> {
    const error = new Error ('Not Found')
    error.status = 404
    next(error)
})

app.use((error,req,res,next)=> {
    return res.status(error.status || 500).json({
        status: 'error',
        code: error.status || 500,
        message: error.message || 'Internal Server Error'
    })
})

// 3. Start server
const server = app.listen(PORT, () => {
    console.log(`Server TicketRush is starting with port ${PORT}`);
})

// 3.5 Init Socket.IO
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Cho phép Frontend gọi tới
        methods: ["GET", "POST"],
        credentials: true
    }
});
// Gọi file xử lý logic Socket
require('./src/sockets/seatSocket')(io);

// 4. Handle exit
process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server has been stopped!');
    })
})

module.exports = app
