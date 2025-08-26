"use client"
import { JoinRoomMessage, MessageType } from "@repo/ws-shared-types";
import { useCallback, useEffect, useRef, useState } from "react";
import isHex from "../lib/utils/isHex";

const defaultHandler = () => {}

export enum ConnectionState  {
    Connecting = "Connecting",
    Error = "Error",
    Connected = "Connected",
    NotConnected = "NotConnected"
}

export default function useWebSocket() {
    const websocketRef = useRef<WebSocket | null>(null)
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Connecting)
    const messageRef = useRef<string[]>([])
    const messageHandlerRef = useRef<(data: string) => void>(defaultHandler)
    const [error, setError] = useState<string | null>(null)
    const [roomId, setRoomId] = useState<string | null>(null)
    useEffect(() => {
        setError(null)
        const roomId = window.location.hash.split('#room=')[1]
        if(roomId === undefined) {
            setConnectionState(ConnectionState.Error)
            setError('Invalid RoomId. Please check the url and try again.')
            return
        }

        if(roomId.length < 20 || !isHex(roomId, roomId.length)) {
            setConnectionState(ConnectionState.Error)
            setError("Invalid RoomId format. Please check the url and try again.")
            return
        }

        setRoomId(roomId)
        const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_BACKEND!)
        websocketRef.current = ws 

        ws.onopen = () => {
            setConnectionState(ConnectionState.Connected)
            const message: JoinRoomMessage = {
                type: MessageType.JoinRoom,
                roomId,
            }
            ws.send(JSON.stringify(message))
        }
        ws.onmessage = (event) => {
            if(messageHandlerRef.current === defaultHandler) {
                messageRef.current.push(event.data)
            }
            else {
                if(messageRef.current.length !== 0) {
                    messageRef.current.forEach(message => messageHandlerRef.current(message))
                    messageRef.current = []
                }
                messageHandlerRef.current(event.data)
            }
        }
        ws.onclose = (event) => {
            console.log(event.reason, event.code)
            websocketRef.current = null 
            setConnectionState(ConnectionState.NotConnected)
        }
        ws.onerror = (err) => {
            console.log('socket error')
            console.log(err)
            setError("Something went wrong. please try again later.")
        }
        return () => {
            ws.close()
            websocketRef.current = null
            setConnectionState(ConnectionState.NotConnected)
        }
    }, [])

    const sendMessage = useCallback((message: string)  => {
        if(websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(message)
        }
    }, [])

    const setOnMessageHandler = useCallback((handler: (data: string) => void) => {
        messageHandlerRef.current = handler
    }, [])

    function closeConnection(){
        if(websocketRef.current) {
            websocketRef.current.close()
        }
    }

    return {connectionState, sendMessage, setOnMessageHandler, error, roomId, closeConnection}
}