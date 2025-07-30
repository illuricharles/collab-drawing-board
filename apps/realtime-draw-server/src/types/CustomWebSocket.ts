import { WebSocket } from "ws";
export interface CustomWebSocket extends WebSocket {
    id: string,
    roomsJoined: string[],
    isAlive: boolean
}