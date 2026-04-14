// f:\ticket_rush\Backend\src\config\prisma.js

'use strict'
const { PrismaClient } = require('../generated/prisma') 
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

// 1. Tạo một bể kết nối (Pool) bằng thư viện 'pg' thuần
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// 2. Bọc bể kết nối này vào Adapter của Prisma
const adapter = new PrismaPg(pool)

// 3. Khởi tạo Prisma với Adapter này
const prisma = new PrismaClient({ 
    adapter,
    log: ['query', 'info', 'warn', 'error']
})

module.exports = prisma
