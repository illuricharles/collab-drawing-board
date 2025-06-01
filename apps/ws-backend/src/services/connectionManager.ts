import WebSocket from "ws";
import { CustomWebSocket } from "../types/websocket";

interface UserConnections {
    connections: Set<CustomWebSocket>,
    rooms: Set<String>
}

export class ConnectionManager {
    private static instance: ConnectionManager
    private activeUsers: Map<string, UserConnections>

    private constructor() {
        this.activeUsers = new Map<string, UserConnections>()
    }

    public static getInstance() {
        if(!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager()
        }
        return ConnectionManager.instance
    }

    public addUserConnection(userId: string, ws: CustomWebSocket) {
        let userEntry: UserConnections | undefined = this.activeUsers.get(userId)
        if(!userEntry) {
            userEntry = {
                connections: new Set<WebSocket>(),
                rooms: new Set<String>()
            }
            this.activeUsers.set(userId, userEntry)
        }
        userEntry.connections.add(ws)
        ws.userId = userId
        console.log(`user ${ws.userId} have ${this.activeUsers.get(userId)?.connections.size} active users`)
    }

    public addUserToRoom(userId:string, room: string) {
        this.activeUsers.get(userId)?.rooms.add(room)
    }

    public removeUserFromRoom(userId: string, room:string, ws:CustomWebSocket) {
        const userEntry = this.activeUsers.get(userId)
        if(!userEntry) {
            ws.send(JSON.stringify({
                type: "error",
                message: "User doesn't exist.",
                code: "AUTHENTICATION_REQUIRED"
            }))
            ws.close(1008, 'Authentication required')
            return 
        }
        if(userEntry.rooms.has(room)) {
            this.activeUsers.get(userId)?.rooms.delete(room)
            ws.send(JSON.stringify({
                type: 'success',
                message: `You left from the room ${room}` 
            }))
            return 
        }
        else {
            ws.send(JSON.stringify({
                type: "error",
                message: `you are not in room ${room}`,
                code: "NOT_IN_ROOM"
            }))
            return
        }
    }

    public sendMessageToRoom(userId:string, roomName:string, message:string, userWs: CustomWebSocket) {
        const senderConnections = this.activeUsers.get(userId)
        if(!senderConnections) {
            userWs.close(1008, "Invalid session state.")
            return
        }

        if(!senderConnections.rooms.has(roomName)) {
            userWs.send(JSON.stringify({
                type: "error",
                message: `Your are not a member of ${roomName}`,
                code: "NOT_IN_ROOM"
            }))
            return
        }
        
        this.activeUsers.forEach((userConnections, userId) => {
            if(userConnections.rooms.has(roomName)) {
                userConnections.connections.forEach(ws => {
                    if(ws.readyState === ws.OPEN) {
                        ws.send(JSON.stringify(message))
                    }
                    else {
                        console.log(`trying to sending message to the closed connection`)
                    }
                })
            }
        })
    }

    public removeUserConnection(userId:string, ws:CustomWebSocket) {
        const userEntry = this.activeUsers.get(userId)
        if(userEntry) {
            userEntry.connections.delete(ws)
            if(userEntry.connections.size === 0) {
                this.activeUsers.delete(userId)
            }
        }
    }

}