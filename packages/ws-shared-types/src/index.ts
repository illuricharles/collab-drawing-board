export const WS_ERROR_CODES = {
    INVALID_JSON_TYPE: "INVALID_JSON_TYPE",
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const

export type WsErrorCode = keyof typeof WS_ERROR_CODES;

export const MESSAGE_TYPES = {
    AUTHENTICATION: "authentication",
    JOIN_ROOM: 'joinRoom',
    CHAT: 'chat',
    LEAVE_ROOM: 'leaveRoom'
} as const

export interface ChatMessageTypes {
    id: number,
    message: string,
    createdAt: Date,
    user: {
        id: string,
        username: string,
        name: string
    }
}

export interface ChatMessageResponse{
    type: typeof MESSAGE_TYPES.CHAT,
    chatDetails: ChatMessageTypes
}

export interface LeaveRoom {
    type: typeof MESSAGE_TYPES.LEAVE_ROOM,
    roomName: string
}

export type MessageType = keyof typeof MESSAGE_TYPES