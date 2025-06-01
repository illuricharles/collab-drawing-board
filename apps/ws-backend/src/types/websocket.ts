import WebSocket from "ws";

export interface CustomWebSocket extends WebSocket {
    userId?: string | null,
    isAuthorized?: boolean
}

export type MessageType = AuthMessage | Chat | JoinRoom | LeaveRoom

export interface AuthMessage {
    type: "authentication",
    token: string
}

export interface LeaveRoom {
    type: "leaveRoom",
    roomName: string
}

export interface Chat {
    type: 'chat',
    payload: {
        message: string,
    },
    roomName: string
}

export interface JoinRoom{
    type: 'joinRoom',
    roomName: string
}