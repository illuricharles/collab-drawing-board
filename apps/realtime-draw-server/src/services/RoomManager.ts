import { CustomWebSocket } from "../types/CustomWebSocket"
import { WebSocket } from "ws"
import { ErrorCodes, Message, MessageType, SendMessage } from "../types/MessageTypes"

export class RoomManager {
    private static instance: RoomManager
    private rooms :Map<string, Set<CustomWebSocket>>
    private roomMessages: Map<string, string[]>
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
        let currentConnections = this.rooms.get(roomId)
        if(!currentConnections) {
            currentConnections = new Set<CustomWebSocket>()
            this.rooms.set(roomId, currentConnections)
        }
        currentConnections.add(ws)
        ws.roomsJoined.push(roomId)
        console.log(ws.id)
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
        if(!sender.roomsJoined.includes(roomId)) {
            this.sendMessageToClient(sender, {
                type: MessageType.Error,
                code: ErrorCodes.RoomNotJoined,
                message: "You didn't joined the room. Please join the room and try again."
            })
            return
        }
        // broadcast the message to all room members
        for(const client of currentRoomConnections) {
            if(client.id !== sender.id && client.readyState === WebSocket.OPEN) {
                this.sendMessageToClient(client, {
                    type: MessageType.BroadcastMessage,
                    message: senderMessage.message,
                    roomId,
                    senderId: sender.id
                })
            }
        }
        
    } 

    public sendMessageToClient(client: CustomWebSocket, message: Message) {
        if(client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    }

}