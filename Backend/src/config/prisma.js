// f:\ticket_rush\Backend\src\config\prisma.js

'use strict'
const { PrismaClient } = require('../generated/prisma') 
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

// 1. Create a connection pool using the native 'pg' library
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// 2. Wrap the connection pool in a Prisma adapter
const adapter = new PrismaPg(pool)

// 3. Initialize Prisma with this adapter
const prisma = new PrismaClient({ 
    adapter,
    log: ['error']
})

module.exports = prisma
