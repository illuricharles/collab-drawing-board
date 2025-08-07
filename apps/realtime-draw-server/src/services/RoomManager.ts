import { CustomWebSocket } from "../types/CustomWebSocket"
import { WebSocket } from "ws"
import { BroadcastMessage, ErrorCodes, Message, MessageType, SendMessage } from "@repo/ws-shared-types"

export class RoomManager {
    private static instance: RoomManager
    private rooms :Map<string, Set<CustomWebSocket>>
    private roomMessages: Map<string, BroadcastMessage[]>
    private constructor(){
        this.rooms = new Map()
        this.roomMessages = new Map()
    }
    public static getInstance () {
        if(!RoomManager.instance) {
            RoomManager.instance = new RoomManager()
        }
        return RoomManager.instance
    }

    public addUser(roomId: string, ws:CustomWebSocket) {

        if(ws.roomsJoined.includes(roomId)) {
            this.sendMessageToClient(ws, {
                type: MessageType.Error,
                code: ErrorCodes.AlreadyJoinedRoom,
                message: "You already joined the room."
            })
            return
        }

        let currentConnections = this.rooms.get(roomId)
        if(!currentConnections) {
            currentConnections = new Set<CustomWebSocket>()
            this.rooms.set(roomId, currentConnections)
        }
        currentConnections.add(ws)
        ws.roomsJoined.push(roomId)
        const roomMessages = this.roomMessages.get(roomId)
        if(roomMessages !== undefined) {
            for(const messages of roomMessages) {
                this.sendMessageToClient(ws, messages)
            }
        }
        
    }

    public sendMessageToRoom(sender: CustomWebSocket, roomId: string, senderMessage: SendMessage) {
        const currentRoomConnections = this.rooms.get(roomId)
        // check room exist or user joined the room
        if(!currentRoomConnections) {
            this.sendMessageToClient(sender, {
                type: MessageType.Error,
                code: ErrorCodes.RoomNotFound,
                message: "Invalid roomId, Please check the roomId and try again."
            })
            return
        }
        // check user joined the room
        if(!sender.roomsJoined.includes(roomId) && !currentRoomConnections.has(sender)) {
            this.sendMessageToClient(sender, {
                type: MessageType.Error,
                code: ErrorCodes.RoomNotJoined,
                message: "You didn't joined the room. Please join the room and try again."
            })
            return
        }
        // broadcast the message to all room members
        const broadcastMessage : Message =  {
            type: MessageType.BroadcastMessage,
            message: senderMessage.message,
            roomId,
            senderId: sender.id,
            timestamp: Date.now()
        }
        
        let currentRoomMessages = this.roomMessages.get(roomId)
        if(!currentRoomMessages) {
            currentRoomMessages = []
            this.roomMessages.set(roomId, currentRoomMessages)
        }

        currentRoomMessages.push(broadcastMessage)

        for(const client of currentRoomConnections) {
            if(client.id !== sender.id && client.readyState === WebSocket.OPEN) {
                this.sendMessageToClient(client, broadcastMessage)
            }
        }
        
    } 

    public sendMessageToClient(client: CustomWebSocket, message: Message) {
        if(client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    }

    public handleClientDisconnection(client: CustomWebSocket) {
        const roomJoined = client.roomsJoined
        for(const roomId of roomJoined) {
            this.removeClientFromRoom(client, roomId)
        }
        
    }

    public removeClientFromRoom(client:CustomWebSocket, roomId: string) {
        const currentConnections = this.rooms.get(roomId)
        if(!currentConnections) {
            this.sendMessageToClient(client, {
                type: MessageType.Error,
                code: ErrorCodes.RoomNotFound,
                message: "Room not Found"
            })
            return
        }
        const isUserJoinedRoom = client.roomsJoined.includes(roomId)
        if(!isUserJoinedRoom) {
            this.sendMessageToClient(client, {
                type: MessageType.Error,
                code: ErrorCodes.RoomNotJoined,
                message: "Room not joined."
            })
            return
        }

        // remove the roomId from the client
        client.roomsJoined = client.roomsJoined.filter(x => x !== roomId)
        currentConnections.delete(client) // remove the client from room 

        // remove the room if no one left
        if(currentConnections.size === 0) {
            this.rooms.delete(roomId)
            this.roomMessages.delete(roomId)
        }

        // send the message
        this.sendMessageToClient(client, {
            type: MessageType.LeaveRoom,
            roomId
        })
        
    }

}