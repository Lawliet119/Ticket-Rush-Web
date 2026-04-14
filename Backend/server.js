const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const dotenv = require("dotenv").config()
const PORT = process.env.PORT || 3000

// 1. Init middlewares
app.use(cors())
app.use(compression())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

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

// 4. Handle exit
process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server has been stopped!');
    })
})

module.exports = app
