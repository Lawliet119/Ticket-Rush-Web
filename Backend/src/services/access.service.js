'use strict'
const prisma = require('../config/prisma')
const bcrypt = require('bcrypt')
const { BadRequestError, ConflictRequestError } = require('../core/error.response')

class AccessService {
    static signUp = async ({name, email, password}) => {
        // 1. Check if user already exists
        const holderUser = await prisma.users.findUnique({
            where: { email: email }
        })
        if(holderUser){
            throw new ConflictRequestError('User already exists')
        }

        // 2. Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // 3. Create new user
        const newUser = await prisma.users.create({
            data: {
                full_name: name,
                email: email,
                password_hash: passwordHash
            }
        })

        if(!newUser){
            throw new BadRequestError('Failed to create user')
        }

        // 4. Return data (Controller will wrap in CREATED response)
        return {
            user: newUser
        }
    }
}

module.exports = AccessService