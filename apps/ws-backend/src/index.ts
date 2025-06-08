import { ConnectionManager } from "./services/connectionManager";
import { WebSocketServer } from "ws";
import { CustomWebSocket, MessageType } from "./types/websocket";
import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import { Prisma, prisma } from "@repo/db";
import path from "path";
import { error } from "console";

dotenv.config({path: path.resolve(__dirname, "../../../.env")})

const wss = new WebSocketServer({port: 8080})
const activeUsers = ConnectionManager.getInstance()

function handlePrismaErrors(e:unknown, ws:CustomWebSocket) {
    if(e instanceof Prisma.PrismaClientInitializationError) {
        ws.send(JSON.stringify({
                type: "error",
                message: "unable to reach the database. Please try again later.",
                code: "DB_INITIALIZATION_ERROR"
            }))
            return
    }
    else if(e instanceof Prisma.PrismaClientKnownRequestError) {
        if(e.code === 'P1001') {
            ws.send(JSON.stringify({
                type: "error",
                message: "unable to reach the database. Please try again later.",
                code: "DB_INITIALIZATION_ERROR"
            }))
            return
        }
        else if(e.code === 'P1017') {
            ws.send(JSON.stringify({
                type: "error",
                message: "Database connection lost. Please try again later.",
                code: "DB_CONNECTION_LOST"
            }))
            return
        }
    }
    else {
        ws.send(JSON.stringify({
            type: 'error',
            message: "Internal server error",
            code: 'INTERNAL_SERVER_ERROR'
        }))
        return
    }
}

function handleWebSocketAuth(ws: CustomWebSocket, message: MessageType) {
    
    if(message.type === 'authentication') {
        const {token} = message
        if(!token) {
            ws.close(1008, "Invalid token or token is missing")
            return false
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!)
            if(typeof decoded === 'string' || !decoded || !('id' in decoded)) {
                ws.close(1008, "Invalid authentication")
                return false
            }
            ws.userId = decoded.id
            activeUsers.addUserConnection(decoded.id, ws)
            ws.isAuthorized= true
            return true
        }
        catch(e) {
            console.log(e)
            ws.close(1008, "Token verification failed")
            return false
        }    
    }
    else {
        ws.close(1008, "Authorization required")
        return false
    }
    
}

wss.on('connection', (ws:CustomWebSocket, req: IncomingMessage) => {

    ws.userId = null 
    ws.isAuthorized = false

    ws.on('message',async(data)  => {

        // check the json format
        let message: MessageType
        try {
            message = JSON.parse(data.toString())
        }
        catch(e) {
            console.log(e)
            ws.send(JSON.stringify({
                type: "error",
                message: "invalid json format"
            }))
            return
        }

        if(!ws.isAuthorized) {
            ws.isAuthorized = handleWebSocketAuth(ws, message)
            return
        }
        
        else if(message.type === 'joinRoom') {

            if(message.roomName === null || message.roomName === undefined) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Room name required.",
                    code: "ROOM_REQUIRED"
                }))
                return
            }

            try {
                const roomDetails = await prisma.room.findUnique({
                    where: {
                        slug: message.roomName
                    }
                })
                if(roomDetails === null) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Room doesn't exists. Please check the room name again.",
                        code: "ROOM_NOT_FOUND"
                    }))
                    return
                }
            }
            catch(e) {
                console.log(e)
                handlePrismaErrors(e, ws)
                return
            }

            if(ws.userId){
                activeUsers.addUserToRoom(ws.userId, message.roomName, ws)
            }
            else {
                 ws.send(JSON.stringify({
                    type: "error",
                    message: "User doesn't exist.",
                    code: "AUTHENTICATION_REQUIRED"
                }))
                ws.close(1008, 'AUTHENTICATION_REQUIRED')
                return
            }
        }

        else if(message.type === 'chat') {
            
            if(message.roomName === null || message.roomName === undefined) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Room name required.",
                    code: "ROOM_REQUIRED"
                }))
                return 
            }

            if(!message.payload || !message.payload.message) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'User message is required',
                    code: 'MESSAGE_REQUIRED'
                }))
                return
            }

            if(!ws.userId) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "You don't have the required authorization to send the chat. Login required.",
                    code: "AUTHENTICATION_REQUIRED"
                }))
                ws.close(1008, 'AUTHENTICATION_REQUIRE')
                return
            }
            try {
                const roomDetails = await prisma.room.findUnique({
                    where: {
                        slug: message.roomName
                    }
                })
                if(roomDetails === null) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Invalid Room Name.",
                        code: "ROOM_NOT_FOUND"
                    }))
                    return
                }

                const chatDetails = await prisma.chats.create({
                    data: {
                        message: message.payload.message,
                        senderId: ws.userId,
                        roomId: roomDetails.id
                    }
                })

                activeUsers.sendMessageToRoom(ws.userId, message.roomName, message.payload.message, ws)
            }
            catch(e) {
                console.log(e)
                if(e instanceof Prisma.PrismaClientKnownRequestError) {
                    if(e.code === 'P2003') {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: `Foreign key constrain failed. ${e.meta?.target || "user or room name doesn't exists."}`,
                            code: "FOREIGN_KEY_CONSTRAIN_FAILED"
                        }))
                        return
                    }
                }
                handlePrismaErrors(e, ws)
                return
            }
            
        }

        else if(message.type === 'leaveRoom') {
            if(message.roomName === null || message.roomName === undefined) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Room Name required.",
                    code: "ROOM_REQUIRED"
                }))
                return
            }
            if(!ws.userId) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Invalid user"
                }))
                ws.close(1008, 'Authentication required')
                return 
            }
            activeUsers.removeUserFromRoom(ws.userId, message.roomName, ws)
        }
        else {
            if(ws.isAuthorized && message?.type === 'authentication') {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: "Already authorized."
                }))
                return
            }
            
            ws.send(JSON.stringify({
                type: 'error',
                message: "Invalid message type"
            }))
            return
        }
        
    })

    ws.on('close', (code, reason) => {
        console.log(code, reason.toString())
        if(ws.userId) {
            activeUsers.removeUserConnection(ws.userId, ws)
        }
    })

    ws.on('error', (error) => {
        console.log(error)
        if(ws.readyState === ws.OPEN) {
            ws.close(1011,  "Internal server error.")
        }
    })
})

// todo 
// check user left the room or not