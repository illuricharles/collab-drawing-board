"use client"
import { JoinRoomMessage, MessageType } from "@repo/ws-shared-types";
import { useCallback, useEffect, useRef, useState } from "react";

const defaultHandler = () => {}

export default function useWebSocket() {
    const websocketRef = useRef<WebSocket | null>(null)
    const [connected, setConnected] = useState(false)
    const messageRef = useRef<string[]>([])
    const messageHandlerRef = useRef<(data: string) => void>(defaultHandler)

    useEffect(() => {
        const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_BACKEND!)
        websocketRef.current = ws 

        ws.onopen = () => {
            setConnected(true)
            const message: JoinRoomMessage = {
                type: MessageType.JoinRoom,
                roomId: "1"
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
            setConnected(false)
        }
        ws.onerror = (err) => {
            console.log(err)
        }
        return () => {
            ws.close()
            websocketRef.current = null
            setConnected(false)
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


    return {connected, sendMessage, setOnMessageHandler}
}