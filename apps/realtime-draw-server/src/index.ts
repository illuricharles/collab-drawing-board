import { WebSocketServer, WebSocket } from "ws";
import { RoomManager } from "./services/RoomManager";
import { CustomWebSocket } from "./types/CustomWebSocket";
import { ErrorCodes, Message, MessageType } from "@repo/ws-shared-types";
import {v4 as uuidv4} from 'uuid'

const wss = new WebSocketServer({port: 8080})
const HEART_BEAT_INTERVAL = 30000

const roomManager = RoomManager.getInstance()

// heartBeat 

const heartBeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        const client = ws as CustomWebSocket
        if(!client.isAlive) {
            roomManager.handleClientDisconnection(client)
            return client.terminate()
        }
        client.isAlive = false
        client.ping()
    })
}, HEART_BEAT_INTERVAL)

wss.on('connection', (ws) => {

    const client = ws as CustomWebSocket
    client.id = uuidv4()
    client.roomsJoined = [],
    client.isAlive = true

    client.on('pong', () => {
        client.isAlive = true
    })

    client.on('message', (data) => {
        const userData = data.toString()
        let parsedData: Message

        try {
            parsedData = JSON.parse(userData)
        }

        catch(e) {
            console.log(e)
            if(client.readyState === client.OPEN) {
                const message = "unable to parse the message. Please check the message and try again."
                if(client.id) {
                    sendMessageToClient(client.id, {
                        type: MessageType.Error,
                        message
                    })
                }
            }
            return
        }

        switch(parsedData.type) {
            case MessageType.JoinRoom:
                if(parsedData.roomId && typeof parsedData.roomId === 'string') {
                    const alreadyJoined = client.roomsJoined.find(x => x === parsedData.roomId)
                    if(!alreadyJoined) {
                        roomManager.addUser(parsedData.roomId, client)
                    }
                    else {
                        sendMessageToClient(client.id, {
                            type: MessageType.Error,
                            code: ErrorCodes.AlreadyJoinedRoom,
                            message: "You already joined the room"
                        })
                    }
                }
                else {
                    sendMessageToClient(client.id, {
                        type: MessageType.Error,
                        code: ErrorCodes.InvalidRoomId,
                        message: "Invalid roomId"
                    })
                }
                break

            case MessageType.SendMessage:
                if(typeof parsedData.roomId === 'string' && typeof parsedData.message === 'string' &&
                    parsedData.roomId.trim() !== "" &&
                    parsedData.message.trim() !== ""
                 ) {
                    roomManager.sendMessageToRoom(client, parsedData.roomId, parsedData)
                }
                else {
                    sendMessageToClient(client.id, {
                        type: MessageType.Error,
                        code: ErrorCodes.InvalidMessage,
                        message: "Invalid message format."
                    })
                }

                break
            case MessageType.LeaveRoom: 
                if(typeof parsedData.roomId === 'string' && parsedData.roomId.trim() !== "") {
                    roomManager.removeClientFromRoom(client, parsedData.roomId)
                }
                else {
                    roomManager.sendMessageToClient(client, {
                        type: MessageType.Error,
                        code: ErrorCodes.InvalidMessage,
                        message: "Invalid message format"
                    })
                }
                break;
            default:
                sendMessageToClient(client.id, {
                    type: MessageType.Error,
                    message: "invalid message type"
                })
        }
        
    })

    client.on('close', (code, reason) => {
        roomManager.handleClientDisconnection(client)
        console.log(code, reason.toString())
    })

    client.on('error', (error) => {
        if(client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({error}))
        }
    })
})

wss.on('error', (error) => {
    console.log(error)
})


// use map
function sendMessageToClient(clientId: string | undefined, message: Message) {
    if(clientId) {
        wss.clients.forEach((ws) => {
            const client = ws as CustomWebSocket
            if(client.id === clientId && client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(message))
            }
        })
    }
}

// use map
function sendMessageToRoom(clientId: string, message: Message) {
    wss.clients.forEach((ws) => {
        const client = ws as CustomWebSocket
        if(client.id !== clientId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    })
}