"use client"
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import MainDrawingCanvas from "./MainDrawingCanvas";
import IShapeManager from "../tools/manager/IShapeManager";
import useWebSocket, { ConnectionState } from "../../hooks/useWebSocket";
import CollabShapeManager from "../tools/manager/CollabShapeManager";
import { Shapes, ToolTypes } from "../../types/Shapes";
import RectangleShape from "../tools/shapes/RectangleShape";
import EllipseShape from "../tools/shapes/EllipseShape";
import ArrowShape from "../tools/shapes/ArrowShape";
import LineShape from "../tools/shapes/LineShape";
import RhombusShape from "../tools/shapes/RhombusShape";
import { TextShape } from "../tools/shapes/TextShape";
import {BroadcastMessage, MessageType} from "@repo/ws-shared-types"
import { useRouter } from "next/navigation";
import { MenuIcon, X } from "lucide-react";
import { ToolbarButton } from "../ToolBarButton";
import { FaUsers } from "react-icons/fa";

interface UpdateShapeMessage {
    operationOnShape: 'UpdateShape',
    shape: string
}

interface DeleteShapeMessage {
    operationOnShape: 'DeleteShape',
    shapeId: string
}

interface AddShapeMessage {
    operationOnShape: 'AddShape',
    shape: string
}

function getShape(eachShape: Shapes, contextRef: RefObject<CanvasRenderingContext2D | null>) {
    const {type}  = eachShape
    let shape
    if(type === ToolTypes.SELECTION) return 

    if(type === ToolTypes.RECTANGLE) {
        shape = new RectangleShape(eachShape.x, eachShape.y, eachShape.width, eachShape.height)
    }
    else if(type === ToolTypes.ELLIPSE) {
        shape = new EllipseShape(eachShape.x, eachShape.y, eachShape.radiusX, eachShape.radiusY)
    }
    else if(type === ToolTypes.ARROW) {
        shape = new ArrowShape(eachShape.startX, eachShape.startY, eachShape.endX, eachShape.endY)
    }
    else if(type === ToolTypes.LINE) {
        shape = new LineShape(eachShape.startX, eachShape.startY, eachShape.endX, eachShape.endY)
    }
    else if(type === ToolTypes.RHOMBUS) {
        shape = new RhombusShape(eachShape.centerX, eachShape.centerY, eachShape.width, eachShape.height)
    }
    else if(type === ToolTypes.TEXT) {
        const shapeData = TextShape.fromJson(eachShape)
        const ctx = contextRef.current
        if(shapeData && ctx) {
            shape = new TextShape(shapeData.text, shapeData.x, shapeData.y, ctx)
            shape.id = shapeData.id
            shape.fontsize = shapeData.fontSize
            shape.minFontSize = shapeData.minFontSize
            shape.minWidth = shapeData.minWidth
            shape.width = shapeData.width
        }
    } 
    if(shape) {
        shape.id = eachShape.id
        return shape
    }
    return
}

function CollabDrawingBoard() {
    const {connectionState, sendMessage, setOnMessageHandler, error, roomId}= useWebSocket()
    const shapesManagerRef = useRef<IShapeManager | null>(null)
    const contextRef = useRef<CanvasRenderingContext2D | null>(null)
    const handleClearCanvas = useRef<() => void>(() => {})
    const router = useRouter()
    const [showMenu, setShowMenu] = useState(false)
    const [showCollabLink, setShowCollabLink] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const [hash, setHash] = useState("")
    const [isLinkCopied, setIsLinkCopied] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    function handleCopy() {
        if(inputRef.current) {
            navigator.clipboard.writeText(inputRef.current.value)
            setIsLinkCopied(true)
        }
        timeoutRef.current = setTimeout(() => {
            setIsLinkCopied(false)
        }, 2000)
    }

    const handleContext = useCallback((ctx: CanvasRenderingContext2D) => {
        contextRef.current = ctx
    }, [])

    const setClearCanvas = useCallback((handler: () => void) => {
        handleClearCanvas.current = handler
    }, [])

    useEffect(() => {
        if(connectionState === ConnectionState.NotConnected) return 
        if(roomId === null) return

        if(shapesManagerRef.current === null) {
            shapesManagerRef.current = new CollabShapeManager(roomId, sendMessage)
        }

        
        setOnMessageHandler((data) => {
            let parsedData: BroadcastMessage
            try {
                parsedData = JSON.parse(data)
            }
            catch(e) {
                console.error(e)
                return
            }

            switch (parsedData.type) {
                case MessageType.BroadcastMessage: {
                    let parsedMessageShape: UpdateShapeMessage | DeleteShapeMessage | AddShapeMessage;

                    try {
                        parsedMessageShape = JSON.parse(parsedData.message);

                        if (
                            'operationOnShape' in parsedMessageShape &&
                            (parsedMessageShape.operationOnShape === 'UpdateShape' ||
                            parsedMessageShape.operationOnShape === 'AddShape')
                        ) 
                        {
                            const parsedShape: Shapes = JSON.parse(parsedMessageShape.shape);

                            const shape = getShape(parsedShape, contextRef);
                            if (shape && shapesManagerRef.current instanceof CollabShapeManager) {
                                if (parsedMessageShape.operationOnShape === 'UpdateShape') {
                                    shapesManagerRef.current.onUpdateMessage(shape);
                                } else if (parsedMessageShape.operationOnShape === 'AddShape') {
                                    shapesManagerRef.current.onAddShapeMessage(shape);
                                }
                                handleClearCanvas.current();
                            }
                        }
                        else if('operationOnShape' in parsedMessageShape && 
                            (parsedMessageShape.operationOnShape === 'DeleteShape' && shapesManagerRef.current instanceof CollabShapeManager)
                        ) {
                            shapesManagerRef.current.onDeleteMessage(parsedMessageShape.shapeId)
                            handleClearCanvas.current()
                        }
                    } 
                    catch (e) {
                        console.error(e);
                        return;
                    }
                    break;
                }

                default:
                    console.warn('Invalid message type');
            }

        })

    }, [connectionState, sendMessage, setOnMessageHandler, roomId])

    useEffect(() => {
        setHash(window.location.hash)
    }, [])

    if(connectionState === ConnectionState.Connecting) {
        return <div className="h-screen w-screen bg-black flex justify-center items-center">
            <div role="status">
                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    }

    if(connectionState === ConnectionState.NotConnected) {
        return <div className="h-screen w-screen bg-black  flex justify-center items-center">
            <div className="bg-[#232329] p-6  rounded-md max-w-[450px] text-center">
                <h1 className="text-red-500 text-center text-2xl mb-3">Oops! There Was a Problem</h1>
                <p className="text-white mb-4 text-lg">unable to connect. Please try again later after sometime.</p>
                <div className="text-center">
                    <button className="inline-block px-3 py-1.5 bg-[#A8A5FF] text-[#232329] font-semibold rounded-md cursor-pointer"
                        onClick={() => router.push('/canvas')}
                    >
                        Home
                    </button>
                </div>
            </div>
        </div>
    }

    if(connectionState === ConnectionState.Error) {
        return <div className="h-screen w-screen bg-black  flex justify-center items-center">
            <div className="bg-[#232329] p-6  rounded-md  max-w-[450px] text-center">
                <h1 className="text-red-500 text-center text-2xl mb-3">Oops! There Was a Problem</h1>
                <p className="text-white mb-4 text-lg">{error}</p>
                <div className="text-center">
                    <button className="inline-block px-3 py-1.5 bg-[#A8A5FF] text-[#232329] font-semibold rounded-md cursor-pointer"
                        onClick={() => router.push('/canvas')}
                    >
                        Home
                    </button>
                </div>
            </div>
        </div>
    }

    if(connectionState === ConnectionState.Connected && shapesManagerRef.current !== null) {
        return <div className="relative">
            <div className="fixed text-black bg-white right-2 top-3 rounded-md p-0.5">
                <div className="flex justify-center items-center">
                    <ToolbarButton icon={MenuIcon} isActive={false} onClick={() => setShowMenu(prev => !prev)} className=" size-7 md:size-7"/>
                </div>
            </div>

            {showMenu && 
                <div className="absolute top-14 right-3 p-1 px-2 bg-white text-slate-900 font-medium rounded-md">
                    <div className=" cursor-pointer hover:text-black">
                        <button className="cursor-pointer flex justify-center items-center gap-x-2" onClick={() => {
                            setShowMenu(false)
                            setShowCollabLink(true)
                        }}><FaUsers size={21}/> Live Collab</button>
                    </div>
                </div>
            }

                {showCollabLink && <div className="fixed h-screen w-screen flex justify-center items-center text-center">

                <div className="text-white bg-[#232329]  rounded-2xl max-w-[480px]">
                    <div className="w-full flex justify-end p-4 pb-3">
                        <button className="cursor-pointer" onClick={() => setShowCollabLink(false)}>
                            <X/>
                        </button>
                    </div>
                    <div className="p-8 pt-0">
                    <h2 className="font-semibold text-2xl mb-4 text-center">Live collaboration</h2>
                    <div className="flex flex-col justify-start items-start w-full ">
                        <label className="mb-3 font-semibold" htmlFor="collabLink">Link</label>
                        <div className="flex justify-between w-full gap-x-4">
                            <input id="collabLink" type="text" ref={inputRef} readOnly value={`${origin}/collab/canvas${hash}`}
                            className=" py-2 px-3 bg-[#2e2d39] rounded-md border-red-50 border-[1px] flex-grow focus:outline-none focus:ring-0"
                            />
                            <button className="bg-[#A8A5FF] text-[#232329] font-semibold px-3 rounded-md cursor-pointer inline-block w-28" onClick={handleCopy} disabled={isLinkCopied}>{isLinkCopied? "Copied": "Copy Link"}</button>
                        </div>
                        <hr className="h-px my-5 bg-white border-0 w-full"/>
                        <div className="text-[##e3e3e8] text-left text-xs space-y-2.5">
                            <p className="">
                                The canvas is shared only with users who have the link, and all updates are transmitted directly between clients using WebSockets, with no data stored on any server.
                            </p>
                            <p className="">
                                If you leave the session, you&apos;ll disconnect from live collaboration, but can continue editing your current canvas locally. Other participants can still work on their version independently.
                            </p>
                            <p className="">
                                This ensures a lightweight, secure, and temporary collaborative space — ideal for spontaneous sketching, brainstorming, or whiteboarding without any sign-up.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>}

            {(connectionState === ConnectionState.Connected) && <MainDrawingCanvas shapesManagerRef={shapesManagerRef as React.RefObject<IShapeManager>} handleContext={handleContext} setClearCanvas={setClearCanvas}/>}
        </div>
    }

    return  <div className="h-screen w-screen bg-black  flex justify-center items-center">
            <div className="bg-[#232329] p-6  rounded-md  max-w-[450px] text-center">
                <h1 className="text-red-500 text-center text-2xl mb-3">Oops! There Was a Problem</h1>
                <p className="text-white mb-4 text-lg">Something went wrong. please try again later after sometime.</p>
                <div className="text-center">
                    <button className="inline-block px-3 py-1.5 bg-[#A8A5FF] text-[#232329] font-semibold rounded-md cursor-pointer"
                        onClick={() => router.push('/canvas')}
                    >
                        Home
                    </button>
                </div>
            </div>
        </div>
}

export default React.memo(CollabDrawingBoard)