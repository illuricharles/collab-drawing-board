"use client"

import { useEffect, useState } from "react"
import FieldContainer from "../../../../components/ui/form/FieldContainer"
import Form from "../../../../components/ui/form/Form"
import FormButton from "../../../../components/ui/form/FormButton"
import Input from "../../../../components/ui/form/Input"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import useWebSocket from "../../../../hooks/useWebSocket"
import { MESSAGE_TYPES } from "@repo/ws-shared-types"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import FormErrorMessage from "../../../../components/ui/form/FormErrorMessage"
import { ChatMessageTypes } from "@repo/ws-shared-types"
import { connection } from "next/server"

const SendMessageSchema = z.object({
    message: z.string({message: "Message required"}).min(1, {message: "Message shouldn't be empty."})
}) 

type SendMessageTypes = z.infer<typeof SendMessageSchema>


export default function ChatInterface({slug}: {
    slug: string
}) {
    const {register,handleSubmit,setError,setValue, formState: {errors, isLoading}} = useForm<SendMessageTypes>({
        resolver: zodResolver(SendMessageSchema)
    })
    const [chats, setChats] = useState<ChatMessageTypes[]>([])
    const [chatsError, setChatsError] = useState<string | null>(null)
    const [loadingChats, setLoadingChats] = useState(false)
    const [showConnectionLost, setShowConnectionLost] = useState(false)
    // const webSocket = useRef<WebSocket>(null)0
    const {closeCode, sendMessage,connected, setMessageHandler, webSocket } = useWebSocket()
    
    const router = useRouter()
    
   
    useEffect(() => {
        if(connected) {
            sendMessage({
                type: MESSAGE_TYPES.JOIN_ROOM,
                roomName: slug
            })
        }
    }, [connected, sendMessage, slug])

    useEffect(() => {
        setMessageHandler((data) => {
            if(data.type === 'error' && data.code !== 'ALREADY_JOINED_ROOM') {
                console.log(data)
                setError('root', {message: data.message || "something went wrong"})
            }
            else if(data.type === MESSAGE_TYPES.CHAT) {
                const updatedChats = [data.chatDetails, ...chats]
                setChats(updatedChats)
            }
            else if(data.type === MESSAGE_TYPES.LEAVE_ROOM) {
                if(data.status === 'success') {
                    webSocket.current?.close(1000, MESSAGE_TYPES.LEAVE_ROOM)
                    
                }
            }
        })
    }, [setMessageHandler, setError, chats, router, webSocket])
    
    
    
    useEffect(() => {
        if(closeCode === 1008) {
            localStorage.removeItem('token')
            router.replace('/signin')
        }
        else if(closeCode === 1006 || closeCode === 1005) {
            setShowConnectionLost(true)
        }
        // else if(closeCode === 1000) {
            
        // }
    }, [closeCode, router])

    useEffect(() => {
        if(closeCode === 1000 && webSocket.current?.CLOSED === WebSocket.CLOSED) {
            router.replace('/room')
        }
    }, [closeCode, router, webSocket])


    useEffect(() => {
        setChatsError(null)
        setLoadingChats(true)
        async function getChats() {
            if(!process.env.HTTP_BACKEND) {
                console.error('missing HTTP_BACKEND or check next.config.ts file and make sure to set the env variables.')
                return
            }
            
            try {
                const response = await axios.get(`${process.env.HTTP_BACKEND}/api/v1/room/chats/${slug}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                })
                
                setChats(response.data.chat)
            }
            catch(e) {
                
                if(e instanceof AxiosError) {
                    if(e.response?.status === 500) {
                        setChatsError(e.response.data.message || "Internal server error")
                    }
                    else if(e.response?.status === 404) {
                        router.push('/')
                    }
                    else {
                        setChatsError("Internal Server Error")
                    }

                }
                else {
                    setChatsError("Internal server error")
                }
            }
            finally {
                setLoadingChats(false)
            }
        }

        getChats()


    }, [slug, router])

    if(connection === null) {
        return <div>
            connecting....
        </div>
    }
    

    if(connected !== null && showConnectionLost) {
        return <div className="flex justify-center items-center">
            <div>
                <h1>Connection lost. Please refresh the page.</h1>
                <button onClick={() => window.location.reload()}>Refresh</button>
            </div>
        </div>
    }

    function onSubmit(data: SendMessageTypes) {
        sendMessage({
            type: MESSAGE_TYPES.CHAT,
            roomName: slug,
            payload: {
                message: data.message
            }
        })
        setValue('message', "")
        
    }

    function leaveRoom() {
        sendMessage({
            type: MESSAGE_TYPES.LEAVE_ROOM,
            roomName: slug
        })
        
    }


    return <div>
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FieldContainer>
                <Input {...register('message')} type="text" placeholder="Message"/>
                {errors.message?.message && <FormErrorMessage message={errors.message.message}/>}
            </FieldContainer>
            <FormButton type="submit" disabled={connected === null || isLoading}>{connected || isLoading? "send" : "connecting"}</FormButton>
            {errors.root?.message && <FormErrorMessage message={errors.root.message}/>}
        </Form>
        <FormButton onClick={leaveRoom}>Leave Room</FormButton>

        {loadingChats && <div>loading....</div>}
        {chats && <ul>
            {chats.map(eachChat => {
                return <li key={eachChat.id}>
                    {eachChat.message} - {eachChat.user.username}
                </li>
            })}
        </ul>}

        {chatsError && <div>
            <p className="text-red-600 font-semibold">{chatsError}</p>
        </div>}

        <button onClick={() => {webSocket.current?.close()}}>close ws</button>

    </div>
}