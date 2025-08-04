"use client"
import { RefObject, useCallback, useEffect, useRef } from "react";
import MainDrawingCanvas from "./MainDrawingCanvas";
import IShapeManager from "../tools/manager/IShapeManager";
import useWebSocket from "../../hooks/useWebSocket";
import CollabShapeManager from "../tools/manager/CollabShapeManager";
import { Shapes, ToolTypes } from "../../types/Shapes";
import RectangleShape from "../tools/shapes/RectangleShape";
import EllipseShape from "../tools/shapes/EllipseShape";
import ArrowShape from "../tools/shapes/ArrowShape";
import LineShape from "../tools/shapes/LineShape";
import RhombusShape from "../tools/shapes/RhombusShape";
import { TextShape } from "../tools/shapes/TextShape";
import {BroadcastMessage, MessageType} from "@repo/ws-shared-types"

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

// write ws logic
export default function CollabDrawingBoard() {
    const {connected, sendMessage, setOnMessageHandler}= useWebSocket()
    const shapesManagerRef = useRef<IShapeManager>(new CollabShapeManager(sendMessage))
    const contextRef = useRef<CanvasRenderingContext2D | null>(null)
    const handleClearCanvas = useRef<() => void>(() => {})

    const handleContext = useCallback((ctx: CanvasRenderingContext2D) => {
        contextRef.current = ctx
    }, [])

    const setClearCanvas = useCallback((handler: () => void) => {
        handleClearCanvas.current = handler
    }, [])

    useEffect(() => {
        console.log(connected)
        if(!connected) return 
        
        setOnMessageHandler((data) => {
            let parsedData: BroadcastMessage
            try {
                parsedData = JSON.parse(data)
            }
            catch(e) {
                console.log(e)
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
                        console.log(e);
                        return;
                    }
                    break;
                }

                default:
                    console.log('Invalid message type');
            }

        })

    }, [connected, sendMessage, setOnMessageHandler])

    if(!connected) {
        return <div>
            connecting....
        </div>
    }

    return <div className="relative">
        <div className="bg-white text-black text-2xl absolute right-0">
            collab
        </div>
        {connected && <MainDrawingCanvas shapesManagerRef={shapesManagerRef} handleContext={handleContext} setClearCanvas={setClearCanvas}/>}
    </div>
}