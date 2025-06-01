import { ConnectionManager } from "./services/connectionManager";
import { WebSocketServer } from "ws";
import { CustomWebSocket, MessageType } from "./types/websocket";
import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import path from "path";

dotenv.config({path: path.resolve(__dirname, "../../../.env")})

const wss = new WebSocketServer({port: 8080})
const activeUsers = ConnectionManager.getInstance()

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

    ws.on('message', (data)  => {

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
            //check user already joined the room
            //check room exists

            try {
                
                if(ws.userId && message.roomName){
                    activeUsers.addUserToRoom(ws.userId, message.roomName)
                    if(ws.readyState === ws.OPEN) {
                        ws.send(JSON.stringify({
                            type: "success",
                            message: `user joined ${message.roomName} room successfully.`
                        }))
                        return
                    }
                }
                else {
                    if(!ws.userId) {
                        ws.close(1008, 'Authentication Required')
                        return
                    }
                    else if(!message.roomName) {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "Invalid json data",
                            code: "INVALID_JSON_DATA_FORMAT"
                        }))
                        return
                    }
                }
            }catch(e) {
                console.log(e)
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Failed to join to room",
                    code: "INTERNAL_SERVER_ERROR"
                }))
                return
            }
        }
        else if(message.type === 'chat') {
            if(!message.payload || !message.payload.message || !message.roomName ) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid json data',
                    code: 'INVALID_JSON_FORMAT'
                }))
                return
            }
            if(!ws.userId) {
                ws.close(1008, 'Authentication Required')
                return
            }

            activeUsers.sendMessageToRoom(ws.userId, message.roomName, message.payload.message, ws)
        }
        else if(message.type === 'leaveRoom') {
            if(!message.roomName) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Invalid required json format.",
                    code: "INVALID_DATA"
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