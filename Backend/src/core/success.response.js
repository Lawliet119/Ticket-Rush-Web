'use strict'
const StatusCode = {
        OK: 200,
        CREATED: 201,
        
    }

    const ReasonStatusCode = {
        OK: 'Success',
        CREATED: 'Created!'
    }

/**
 * Base success response class
 */
class SuccessResponse {
    constructor({message, statusCode = StatusCode.OK, reasonStatusCode = ReasonStatusCode.OK, metadata = {}}){
        this.message = !message ? reasonStatusCode : message
        this.status  = statusCode
        this.metadata = metadata
        
        }

        send(res, headers = {}){
            return res.status (this.status).json(this)
        }

}

/**
 * 200 OK Response
 */
class OK extends SuccessResponse {
    constructor({message, metadata}){
        super({message, metadata})
    }
}

/**
 * 201 Created Response
 */
class CREATED extends SuccessResponse {
    constructor({message, statusCode = StatusCode.CREATED, reasonStatusCode = ReasonStatusCode.CREATED, metadata}){
        super({message, statusCode, reasonStatusCode, metadata})

    }
}


module.exports = {
    OK,
    CREATED
}
        




