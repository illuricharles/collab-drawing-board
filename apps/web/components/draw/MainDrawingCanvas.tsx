"use client"

import { ArrowRight, CircleIcon, DiamondIcon, Hand, LetterTextIcon, LineChartIcon, RectangleHorizontalIcon } from "lucide-react"
import {  useCallback, useEffect, useRef, useState } from "react"
import { ToolTypes } from "../../types/Shapes"
import { ToolbarButton } from "../ToolBarButton";
import RectangleShape from "../tools/shapes/RectangleShape";
import { BaseShape } from "../tools/shapes/BaseShape";
import ShapeManager from "../tools/ShapesManager";
import LineShape from "../tools/shapes/LineShape";
import EllipseShape from "../tools/shapes/EllipseShape";
import RhombusShape from "../tools/shapes/RhombusShape";
import ArrowShape from "../tools/shapes/ArrowShape";
import { drawRectangleHandleBarPoints, getHandleBarPointLine, getHandleBarPoints, HANDLER_SIZE, ResizeHandle } from "../tools/utils/handleBarUtils";
import { TextShape } from "../tools/shapes/TextShape";

type selectedShapeHandlerType = ResizeHandle & {
    selectedShape: BaseShape,
    startX: number,
    startY: number
}

const TEXT_SHAPE_OUTLINE_OFFSET_X = 10
const TEXT_SHAPE_OUTLINE_OFFSET_Y = 4
const TEXT_SHAPE_OUTLINE_OFFSET_WIDTH = TEXT_SHAPE_OUTLINE_OFFSET_X + 8
const TEXT_SHAPE_OUTLINE_OFFSET_HEIGHT = 5

export default function MainDrawingCanvas() {
    const [tool, setTool] = useState<ToolTypes | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const contextRef = useRef<CanvasRenderingContext2D>(null)
    const drawingShapeRef = useRef<BaseShape | null>(null)
    const shapesManagerRef = useRef<ShapeManager>(new ShapeManager())
    const selectedShapeRef = useRef<BaseShape>(null)
    const offsetRef = useRef<{x: number, y: number}>({x: 0, y: 0})
    const selectedShapeHandlersRef = useRef<selectedShapeHandlerType>(null)

    let startX: number
    let startY: number
    let clicked = false
    let isHandlerSelected = false

    // init canvas
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if(canvas) {
            canvas.height = window.innerHeight
            canvas.width = window.innerWidth
            const ctx = canvas.getContext('2d')
            if(ctx) {  
                contextRef.current = ctx 
                ctx.fillStyle = "#000000"
                ctx.fillRect(0,0, canvas.width, canvas.height)
            }
        }
    }, [])

    const drawHandlersRectangle = useCallback((shape: BaseShape,ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = "blue"
        ctx.strokeRect(x, y, width, height)
        ctx.stroke()
        ctx.restore()
        const handlers = getHandleBarPoints(x, y, width, height)
        drawRectangleHandleBarPoints(handlers, ctx)
    }, [])

    
    const drawHandlersLine = useCallback((shape: LineShape, ctx: CanvasRenderingContext2D) => {
        const {startX, endX, startY, endY} = shape
        const handler = getHandleBarPointLine(startX, startY, endX, endY)
        const hhs = HANDLER_SIZE/2
        handler.forEach(eachHandler => {
            const {x, y} = eachHandler
            ctx.save()
            ctx.beginPath()
            ctx.fillStyle = "blue"
            ctx.fillRect(x - hhs, y - hhs, HANDLER_SIZE, HANDLER_SIZE)
            ctx.restore()
        })
    }, [])

    const drawHandlersRhombus = useCallback((shape: RhombusShape, ctx: CanvasRenderingContext2D) => {
        const {centerX, centerY, width, height} = shape
        const x = centerX - width/2 
        const y = centerY - height/2 

        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = "blue"
        ctx.strokeRect(x, y, width, height)
        ctx.stroke()
        ctx.restore()

        const handlers = getHandleBarPoints(x, y, width, height)
        drawRectangleHandleBarPoints(handlers, ctx)
        
    }, [])

    
    const drawOutline = useCallback(() => {
        const shape = selectedShapeRef.current
        const ctx = contextRef.current
        if(ctx && shape) {
            if(shape instanceof RectangleShape) {
                drawHandlersRectangle(shape, ctx, shape.x, shape.y, shape.width, shape.height)
            } 
            else if(shape instanceof EllipseShape) {
                const x = shape.x - shape.radiusX
                const y = shape.y - shape.radiusY
                const width = shape.radiusX * 2 
                const height = shape.radiusY * 2 
                drawHandlersRectangle(shape, ctx, x, y, width, height)
            }
            else if(shape instanceof LineShape || shape instanceof ArrowShape) {
                drawHandlersLine(shape, ctx)
            }
            else if( shape instanceof RhombusShape) {
                drawHandlersRhombus(shape, ctx)
            }
            else if(shape instanceof TextShape) {
                
                drawHandlersRectangle(shape, ctx, shape.x - TEXT_SHAPE_OUTLINE_OFFSET_X , shape.y - TEXT_SHAPE_OUTLINE_OFFSET_Y, shape.getWidth() + TEXT_SHAPE_OUTLINE_OFFSET_WIDTH, shape.getHeight(ctx) + TEXT_SHAPE_OUTLINE_OFFSET_HEIGHT)
            }

        }
    }, [drawHandlersRectangle, drawHandlersLine, drawHandlersRhombus]) 

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = contextRef.current
        if(canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle="#000"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        shapesManagerRef.current.drawAllShapes(ctx)
        drawOutline()
        }
  }, [drawOutline])

    // initial canvas
    useEffect(() => {
       initCanvas()
       clearCanvas()
    },[initCanvas, clearCanvas])

    // handle resize
    useEffect(() => {
    const canvas = canvasRef.current
    function handleResize() {
      console.log('resized')
      if(canvas) {
        initCanvas()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
    
  }, [initCanvas])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
        if(e.key === 'Escape' || e.key === "Delete") {
            if(selectedShapeRef.current) {
                shapesManagerRef.current.delete(selectedShapeRef.current)
                selectedShapeRef.current = null
                clearCanvas()
            }
        }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
        window.removeEventListener('keydown', handleKeyDown)
    }
  }, [clearCanvas])



    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        const ctx = contextRef.current
        const {clientX, clientY} = e
        if(clicked && ctx) {
            clearCanvas()
            if(tool === ToolTypes.RECTANGLE && drawingShapeRef.current instanceof RectangleShape) {
                const rectangle = drawingShapeRef.current
                rectangle.width = clientX - rectangle.x
                rectangle.height = clientY - rectangle.y
                rectangle.draw(ctx)
            }
            else if(tool === ToolTypes.ELLIPSE && drawingShapeRef.current instanceof EllipseShape) {
                const ellipse = drawingShapeRef.current
                ellipse.x = (clientX + startX)/2
                ellipse.y = (clientY + startY)/2
                ellipse.radiusX = Math.abs(ellipse.x -startX)
                ellipse.radiusY = Math.abs(ellipse.y - startY)
                ellipse.draw(ctx)
            }
            else if(tool === ToolTypes.LINE && drawingShapeRef.current instanceof LineShape) {
                const line = drawingShapeRef.current
                line.startX = startX
                line.startY = startY
                line.endX = clientX
                line.endY = clientY
                line.draw(ctx)
            }
            else if(tool === ToolTypes.RHOMBUS && drawingShapeRef.current instanceof RhombusShape) {
                const rhombus = drawingShapeRef.current
                rhombus.centerX = (clientX + startX)/2
                rhombus.centerY = (clientY + startY)/2
                rhombus.width = (clientX - startX)
                rhombus.height = clientY - startY
                rhombus.draw(ctx)
            }
            else if(tool === ToolTypes.ARROW && drawingShapeRef.current instanceof ArrowShape) {
                
                const arrow = drawingShapeRef.current
                
                arrow.endX = clientX
                arrow.endY = clientY
                arrow.draw(ctx)
                
            }
            else if(isHandlerSelected && selectedShapeHandlersRef.current) {
                const {selectedShape, startX, startY, direction, y, x} = selectedShapeHandlersRef.current
                if(selectedShape instanceof RectangleShape) {
                    if(direction === 'right') {
                        const dw = clientX - startX 
                        selectedShape.width += dw
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            startX: clientX
                        }
                    }
                    else if(direction === 'bottom') {
                        const dh = clientY - startY
                        selectedShape.height += dh
                        selectedShapeHandlersRef.current = {
                            ... selectedShapeHandlersRef.current,
                            startY: clientY
                        }
                    }
                    else if(direction === 'top') {
                        const dh = startY - clientY
                        selectedShape.height += dh
                        selectedShape.y -= dh
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            startY: clientY
                        }

                    }
                    else if(direction === 'left') {
                        const dw = startX - clientX
                        selectedShape.width += dw 
                        selectedShape.x -= dw 
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            startX: clientX
                        }
                    }
                    else if(direction === 'top-left') {
                        const dw = selectedShape.x - startX
                        const dh = selectedShape.y - startY
                        selectedShape.x -= dw 
                        selectedShape.y -= dh
                        selectedShape.width += dw 
                        selectedShape.height += dh 
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            startX: clientX,
                            startY: clientY
                        }
                    }
                    else if(direction === 'top-right') {
                        const dw = clientX - startX
                        const dh = startY - clientY
                        selectedShape.width += dw 
                        selectedShape.height += dh 
                        selectedShape.y -= dh
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            startX: clientX,
                            startY: clientY
                        }
                    }
                    else if(direction === 'bottom-left') {
                        const dh = clientY - startY
                        const dw = startX - clientX
                        selectedShape.height += dh 
                        selectedShape.width += dw 
                        selectedShape.x -= dw
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            startY: clientY,
                            startX: clientX
                        }
                    }
                    else if(direction === 'bottom-right') {
                        const dh = clientY - startY
                        const dw = clientX - startX
                        selectedShape.height += dh 
                        selectedShape.width += dw
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current, 
                            startY: clientY,
                            startX: clientX
                        }
                    }
                }
                else if(selectedShape instanceof EllipseShape) {
                    if(direction === 'top') {
                        let isRadiusNeg = false
                        const dh = y - clientY
                        let radiusY = selectedShape.radiusY + dh/2 
                        let centerY = selectedShape.y - dh/2 
                        if(radiusY < 3) {
                            isRadiusNeg = true
                            radiusY = 3 
                            centerY = selectedShape.y
                        }
                        selectedShape.radiusY = radiusY
                        selectedShape.y = centerY
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: isRadiusNeg ? y : clientY
                        }
                    }

                    else if (direction === 'bottom') {
                        const dh = clientY - y;
                        let isRadiusNeg = false
                        let newRadius = selectedShape.radiusY +  dh/2 
                        console.log(newRadius)
                        let newCenter = selectedShape.y + dh/2
                        if(newRadius < 3) {
                            newRadius = 3 
                            newCenter = selectedShape.y 
                            isRadiusNeg = true
                        }
                        selectedShape.radiusY = newRadius
                        selectedShape.y = newCenter

                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: isRadiusNeg? y: clientY
                        }
                    }
                    else if(direction === 'right') {
                        let isRadiusNeg = false
                        const dw = clientX - x 

                        let radiusX = selectedShape.radiusX + dw/2 
                        let centerX = selectedShape.x + dw/2
                        if(radiusX < 5) {
                            radiusX = 5 
                            centerX = selectedShape.x
                            isRadiusNeg = true
                        }

                        selectedShape.radiusX = radiusX
                        selectedShape.x = centerX
                        if(isRadiusNeg !== true) {
                            selectedShapeHandlersRef.current = {
                                ...selectedShapeHandlersRef.current,
                                x: clientX
                            }
                        }
                    }
                    else if(direction === 'left') {
                        let isRadiusNeg = false
                        const dw = x - clientX
                        let radiusX = selectedShape.radiusX + dw/2 
                        let centerX = selectedShape.x - dw/2 
                        if(radiusX < 5) {
                            radiusX = 5 
                            centerX = selectedShape.x
                            isRadiusNeg = true
                        }
                        selectedShape.radiusX = radiusX 
                        selectedShape.x = centerX
                        if(isRadiusNeg !== true) {
                            selectedShapeHandlersRef.current = {
                                ...selectedShapeHandlersRef.current,
                                x: clientX
                            }
                        }
                    }

                    else if(direction === 'top-right') {
                        let isRadiusYNeg = false
                        let isRadiusXNeg = false
                        const dh = y - clientY
                        const dw = clientX - x 
                        let radiusX = selectedShape.radiusX + dw/2 
                        let centerX = selectedShape.x + dw/2
                        
                        let radiusY = selectedShape.radiusY + dh/2 
                        let centerY = selectedShape.y - dh/2 

                        if(radiusY < 5) {
                            isRadiusYNeg = true
                            radiusY = 5
                            centerY = selectedShape.y
                        }
                        selectedShape.radiusY = radiusY
                        selectedShape.y = centerY
                        if(radiusX < 5) {
                            radiusX = 5 
                            centerX = selectedShape.x
                            isRadiusXNeg = true
                        }
                        selectedShape.radiusX = radiusX 
                        selectedShape.x = centerX
                        
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: isRadiusYNeg ? y : clientY,
                            x: isRadiusXNeg ? x: clientX
                        }

                    }

                    else if(direction === 'bottom-right') {
                        let isRadiusXNeg = false
                        let isRadiusYNeg = false

                        const dw = clientX - x 
                        const dh = clientY - y;

                        let radiusX = selectedShape.radiusX + dw/2 
                        let centerX = selectedShape.x + dw/2
                        let radiusY = selectedShape.radiusY +  dh/2 
                        let centerY = selectedShape.y + dh/2

                        if(radiusX < 5) {
                            radiusX = 5 
                            centerX = selectedShape.x
                            isRadiusXNeg = true
                        }

                        selectedShape.radiusX = radiusX
                        selectedShape.x = centerX

                        if(radiusY < 3) {
                            radiusY = 3 
                            centerY = selectedShape.y 
                            isRadiusYNeg = true
                        }
                        selectedShape.radiusY = radiusY
                        selectedShape.y = centerY

                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: isRadiusYNeg? y: clientY,
                            x: isRadiusXNeg? x: clientX
                        }
                    }

                    else if(direction === 'bottom-left') {
                        let isRadiusXNeg = false
                        const dw = x - clientX
                        let radiusX = selectedShape.radiusX + dw/2 
                        let centerX = selectedShape.x - dw/2 
                        if(radiusX < 5) {
                            radiusX = 5 
                            centerX = selectedShape.x
                            isRadiusXNeg = true
                        }
                        selectedShape.radiusX = radiusX 
                        selectedShape.x = centerX

                        const dh = clientY - y;
                        let isRadiusYNeg = false
                        let radiusY = selectedShape.radiusY +  dh/2 
                        
                        let centerY = selectedShape.y + dh/2
                        if(radiusY < 5) {
                            radiusY = 5
                            centerY = selectedShape.y 
                            isRadiusYNeg = true
                        }
                        selectedShape.radiusY = radiusY
                        selectedShape.y = centerY

                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: isRadiusYNeg? y: clientY,
                            x: isRadiusXNeg? x: clientX
                        }
                    }
                    else if(direction === 'top-left') {
                        let isRadiusXNeg = false
                        const dw = x - clientX
                        let radiusX = selectedShape.radiusX + dw/2 
                        let centerX = selectedShape.x - dw/2 
                        if(radiusX < 5) {
                            radiusX = 5 
                            centerX = selectedShape.x
                            isRadiusXNeg = true
                        }
                        selectedShape.radiusX = radiusX 
                        selectedShape.x = centerX
                        let isRadiusYNeg = false
                        const dh = y - clientY
                        let radiusY = selectedShape.radiusY + dh/2 
                        let centerY = selectedShape.y - dh/2 
                        if(radiusY < 3) {
                            isRadiusYNeg = true
                            radiusY = 3 
                            centerY = selectedShape.y
                        }
                        selectedShape.radiusY = radiusY
                        selectedShape.y = centerY
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: isRadiusYNeg ? y : clientY,
                            x: isRadiusXNeg ? x: clientX
                        }
                    }
                    
                }
                else if(selectedShape instanceof TextShape) {
                    if(direction === 'right') {
                        const dw = clientX - x 
                        const width = selectedShape.width + dw 
                        if(selectedShape.minWidth < width) {
                            selectedShape.setWidth(width)

                            selectedShapeHandlersRef.current = {
                                ...selectedShapeHandlersRef.current,
                                x: clientX
                            }
                        }
                    }
                    else if(direction === 'left') {
                        const dw = x - clientX
                        const width = selectedShape.width + dw 
                        if(selectedShape.minWidth < width) {
                            selectedShape.setWidth(width)
                            selectedShape.x = selectedShape.x - dw
                            selectedShapeHandlersRef.current = {
                                ...selectedShapeHandlersRef.current,
                                x: clientX
                            }
                        }
                    }
                    else if(direction === 'bottom') {
                        const dh = clientY - y 
                        const fontSize = selectedShape.fontsize + dh/4
                        if(selectedShape.minFontSize < fontSize) {
                            selectedShape.setFontSize(fontSize, ctx)
                            selectedShapeHandlersRef.current = {
                                ...selectedShapeHandlersRef.current,
                                y: clientY
                            }
                        }

                    }
                    else if(direction === 'top') {
                        const dh = y - clientY
                        const fontSize = selectedShape.fontsize + dh/4 
                        const oldHeight = selectedShape.getHeight(ctx)
                        selectedShape.setFontSize(fontSize, ctx)
                        const newHeight = selectedShape.getHeight(ctx)

                        selectedShape.y = selectedShape.y + oldHeight - newHeight
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: clientY
                        }
                    }
                    else if(direction === 'top-right') {
                        const dh = y - clientY
                        const fontSize = selectedShape.fontsize + dh/4 
                        const oldHeight = selectedShape.getHeight(ctx)
                        selectedShape.setFontSize(fontSize, ctx)
                        const newHeight = selectedShape.getHeight(ctx)

                        selectedShape.y = selectedShape.y + oldHeight - newHeight
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: clientY
                        }
                    }
                    else if(direction === 'bottom-right') {
                        const dh = clientY - y 
                        const fontSize = selectedShape.fontsize + dh/4
                        if(selectedShape.minFontSize < fontSize) {
                            selectedShape.setFontSize(fontSize, ctx)
                            selectedShapeHandlersRef.current = {
                                ...selectedShapeHandlersRef.current,
                                y: clientY
                            }
                        }
                    }
                    else if(direction === 'bottom-left') {
                        const dh = clientY - y 
                        const fontSize = selectedShape.fontsize + dh/4
                        if(selectedShape.minFontSize < fontSize) {
                            selectedShape.setFontSize(fontSize, ctx)
                            selectedShapeHandlersRef.current = {
                                ...selectedShapeHandlersRef.current,
                                y: clientY
                            }
                        }
                    }
                    else if (direction === 'top-left') {
                        const dh = y - clientY
                        const fontSize = selectedShape.fontsize + dh/4 
                        const oldHeight = selectedShape.getHeight(ctx)
                        selectedShape.setFontSize(fontSize, ctx)
                        const newHeight = selectedShape.getHeight(ctx)

                        selectedShape.y = selectedShape.y + oldHeight - newHeight
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: clientY
                        }
                    }

                }
                else if(selectedShape instanceof RhombusShape) {
                    if(direction === 'top') {
                        const dh = y - clientY
                        // calculate the change in height 
                        selectedShape.height += dh
                        selectedShape.centerY -= dh/2 // both sides changes value width/2 both sides move down so move the center up so that bottom constant
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: clientY
                        }
                    }
                    else if(direction === 'bottom') {
                        const dh = clientY - y 
                        selectedShape.height += dh
                        selectedShape.centerY += dh/2
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: clientY
                        }
                    }
                    else if(direction === 'right') {
                        const dw = clientX - x 
                        selectedShape.width += dw 
                        selectedShape.centerX += dw/2 
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            x: clientX
                        }
                    }
                    else if(direction === 'left') {
                        const dw = x - clientX 
                        selectedShape.width += dw 
                        selectedShape.centerX -= dw/2 
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            x: clientX
                        }
                    }
                    else if(direction === 'top-right') {
                        const dh = y - clientY
                        const dw = clientX - x 

                        selectedShape.width += dw 
                        selectedShape.centerX += dw/2 
                         
                        selectedShape.height += dh
                        selectedShape.centerY -= dh/2 

                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            y: clientY,
                            x: clientX
                        }
                    }
                    else if(direction === 'bottom-right') {
                        const dh = clientY - y 
                        const dw = clientX - x 
                        selectedShape.height += dh
                        selectedShape.centerY += dh/2
                        selectedShape.width += dw 
                        selectedShape.centerX += dw/2 
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            x: clientX,
                            y: clientY
                        }
                    }
                    else if(direction === 'top-left') {
                        const dh = y - clientY
                        const dw = x - clientX 
                        selectedShape.height += dh
                        selectedShape.centerY -= dh/2 
                        selectedShape.width += dw 
                        selectedShape.centerX -= dw/2 
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            x: clientX,
                            y: clientY
                        }
                    }
                    else if(direction === 'bottom-left') {
                        const dh = clientY - y 
                        const dw = x - clientX 
                        selectedShape.height += dh
                        selectedShape.centerY += dh/2
                        selectedShape.width += dw 
                        selectedShape.centerX -= dw/2 
                        selectedShapeHandlersRef.current = {
                            ...selectedShapeHandlersRef.current,
                            x: clientX,
                            y: clientY
                        }
                    }
                }
                else if(selectedShape instanceof LineShape) {
                    if(direction === 'startPoint') {
                        selectedShape.startX = clientX
                        selectedShape.startY = clientY
                    }
                    else if(direction === 'endPoint') {
                        selectedShape.endX = clientX 
                        selectedShape.endY = clientY
                    }
                }
                else if(selectedShape instanceof ArrowShape) {
                    if(direction === 'startPoint') {
                        selectedShape.startX = clientX
                        selectedShape.startY = clientY
                    }
                    else if(direction === 'endPoint') {
                        selectedShape.endX = clientX
                        selectedShape.endY = clientY
                    }
                }

            }
            else if(tool === ToolTypes.SELECTION && selectedShapeRef.current) {
                const shape = selectedShapeRef.current
                if(shape instanceof RectangleShape) {
                    shape.x = clientX - offsetRef.current.x
                    shape.y = clientY - offsetRef.current.y
                }
                else if(shape instanceof TextShape) {
                    shape.x = clientX - offsetRef.current.x
                    shape.y = clientY - offsetRef.current.y
                }
                
                else if(shape instanceof EllipseShape) {
                    shape.x = clientX - offsetRef.current.x
                    shape.y = clientY - offsetRef.current.y
                }
                else if( shape instanceof LineShape){
                    const dx = clientX - offsetRef.current.x
                    const dy = clientY - offsetRef.current.y 
                    shape.startX += dx 
                    shape.startY += dy 
                    shape.endX += dx 
                    shape.endY += dy
                    offsetRef.current = {
                        x: clientX,
                        y: clientY
                    }
                }
                else if( shape instanceof ArrowShape) {
                    const dx = clientX - offsetRef.current.x
                    const dy = clientY - offsetRef.current.y 
                    shape.startX += dx 
                    shape.startY += dy 
                    shape.endX += dx 
                    shape.endY += dy
                    offsetRef.current = {
                        x: clientX,
                        y: clientY
                    }
                }
                else if( shape instanceof RhombusShape) {
                    console.log('rhombus selected')
                    shape.centerX = clientX - offsetRef.current.x
                    shape.centerY = clientY - offsetRef.current.y
                }
            }
            
            
        }
        
    }

    function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        clicked = true
        startX = e.clientX
        startY = e.clientY
        const ctx = contextRef.current

        if(tool === ToolTypes.RECTANGLE) {
            const shape = new RectangleShape(startX, startY, 0, 0)
            drawingShapeRef.current = shape
        }
        else if(tool === ToolTypes.ELLIPSE) {
            const shape = new EllipseShape(startX, startY, 0, 0)
            drawingShapeRef.current = shape
        }
        else if(tool === ToolTypes.LINE) {
            const shape = new LineShape(startX, startY, startX, startY)
            drawingShapeRef.current = shape
        }
        else if(tool === ToolTypes.RHOMBUS) {
            const shape = new RhombusShape(startX, startY, 0, 0)
            drawingShapeRef.current = shape
        }
        else if(tool === ToolTypes.TEXT && ctx && canvasRef.current) {
            if(selectedShapeRef.current) {
                selectedShapeRef.current = null
            }
            clearCanvas()
            const canvasRect = canvasRef.current.getBoundingClientRect();

            // Convert viewport coordinates to canvas-relative
            const x = startX - canvasRect.left;
            const y = startY - canvasRect.top;
            
            const input = document.createElement('input')
            input.type = 'text'
           

            // Position input in viewport coordinates
            input.style.position = 'fixed';
            input.style.top = `${startY}px`;
            input.style.left = `${startX}px`;
            input.style.color = 'white'
            input.style.background = 'transparent'
            input.style.border = 'none'
            input.style.outline = "none"
            input.style.zIndex = '10'
            input.style.fontFamily = "serif"
            input.style.fontSize = "24px"
            input.style.font = `${TextShape.defaultFontSize}px ${TextShape.fontStyle}`; 
            input.style.lineHeight = "normal";
            input.style.padding = "0px";
            input.style.margin = "0px";
            input.style.height = "auto";
            input.style.display = "inline";
            input.style.letterSpacing = "normal";
            input.style.boxSizing = "content-box";
            input.value = ''
            input.focus()
            document.body.appendChild(input)
            setTimeout(() => input.focus(), 0)

            input.addEventListener('input', () => {
                const text = input.value
                ctx.save()
                ctx.font = `${TextShape.defaultFontSize}px ${TextShape.fontStyle}`
                const width = ctx.measureText(text).width
                input.style.width = `${width}px`
                ctx.restore()
            })

            input.addEventListener('blur', () => {
                const text = input.value
                if(text.trim()) {
                    const textShape = new TextShape(text, x, y, ctx)
                    shapesManagerRef.current.addShape(textShape)
                    clearCanvas()
                    
                }
                input.remove()
            })
            
            
        }
        else if(tool === ToolTypes.ARROW) {
            const shape = new ArrowShape(startX, startY, startX, startY)
            drawingShapeRef.current = shape
        }
        else if(tool === ToolTypes.SELECTION && ctx) {
            // check handler points
            const currentShape = selectedShapeRef.current
            let selectedHandler
            
            if(currentShape instanceof RectangleShape) {
                const {x, y, width, height} = currentShape
                const handlers = getHandleBarPoints(x, y, width, height)
                selectedHandler = handlers.find(eachHandlerPoint => {
                    const {x, y} = eachHandlerPoint
                    const path = new Path2D()
                    path.rect(x, y, HANDLER_SIZE, HANDLER_SIZE)
                    ctx.save()
                    ctx.lineWidth=5
                    const result = ctx.isPointInPath(path, startX, startY) || ctx.isPointInStroke(path, startX, startY)
                    ctx.restore()
                    return result
                })
                if(selectedHandler) {
                    isHandlerSelected = true
                    const {x, y, direction} = selectedHandler
                    selectedShapeHandlersRef.current = {
                        startX,
                        startY,
                        x,
                        y,
                        direction,
                        selectedShape: currentShape
                    }
                    console.log(selectedShapeHandlersRef.current)
                    return
                }
        
            }
            else if(currentShape instanceof TextShape) {
                const {x, y} = currentShape
                const width = currentShape.getWidth()
                const height = currentShape.getHeight(ctx) + TEXT_SHAPE_OUTLINE_OFFSET_HEIGHT
                const currentOutlineX = x - TEXT_SHAPE_OUTLINE_OFFSET_X
                const currentOutlineY = y - TEXT_SHAPE_OUTLINE_OFFSET_Y
                const currentOutlineWidth = width + TEXT_SHAPE_OUTLINE_OFFSET_WIDTH 
                const handlers = getHandleBarPoints(currentOutlineX, currentOutlineY, currentOutlineWidth, height)
                selectedHandler = handlers.find(eachHandler => {
                    const {x, y} = eachHandler
                    const path = new Path2D
                    path.rect(x, y, HANDLER_SIZE, HANDLER_SIZE)
                    ctx.save()
                    ctx.lineWidth = 5 
                    const result = ctx.isPointInStroke(path, startX, startY) || ctx.isPointInPath(path, startX, startY)
                    ctx.restore()
                    return result
                })
                if(selectedHandler) {
                    isHandlerSelected = true
                    const {x, y, direction} = selectedHandler
                    selectedShapeHandlersRef.current = {
                        startX,
                        startY,
                        x,
                        y,
                        direction,
                        selectedShape: currentShape
                    }
                    console.log(selectedShapeHandlersRef.current)
                    return
                }
            }
            else if(currentShape instanceof EllipseShape) {
                const {x, y, radiusX, radiusY} = currentShape
                const startX = x - radiusX
                const startY = y - radiusY
                const width = 2 * radiusX
                const height = 2 * radiusY
                const handlers = getHandleBarPoints(startX, startY, width, height) 
                selectedHandler = handlers.find(eachHandlerPoint => {
                    const {x, y} = eachHandlerPoint
                    const path = new Path2D()
                    path.rect(x, y, HANDLER_SIZE, HANDLER_SIZE)
                    ctx.save()
                    ctx.lineWidth=5
                    const result = ctx.isPointInPath(path, e.clientX, e.clientY) || ctx.isPointInStroke(path, e.clientX, e.clientY)
                    ctx.restore()
                    return result
                })
                if(selectedHandler) {
                    isHandlerSelected = true
                    const {x, y, direction} = selectedHandler
                    selectedShapeHandlersRef.current = {
                        startX,
                        startY,
                        x,
                        y,
                        direction,
                        selectedShape: currentShape
                    }
                    console.log(selectedShapeHandlersRef.current)
                    return
                }
            }
            else if(currentShape instanceof RhombusShape) {
                const {centerX, centerY, width, height} = currentShape 
                const handlers = getHandleBarPoints(centerX - width/2, centerY - height/2, width, height)
                selectedHandler = handlers.find(eachHandler => {

                    const {x, y} = eachHandler
                    const path = new Path2D()
                    path.rect(x,y, HANDLER_SIZE, HANDLER_SIZE)
                    ctx.save()
                    ctx.lineWidth=5
                    const result = ctx.isPointInPath(path, e.clientX, e.clientY) || ctx.isPointInStroke(path, e.clientX, e.clientY)
                    ctx.restore()
                    return result
                })
                if(selectedHandler) {
                    isHandlerSelected = true 
                    const {x, y, direction} = selectedHandler 
                    selectedShapeHandlersRef.current = {
                        startX,
                        startY,
                        x,
                        y,
                        direction,
                        selectedShape: currentShape
                    }
                    console.log(selectedShapeHandlersRef.current)
                    return
                }
            }
            else if(currentShape instanceof LineShape) {
                const {startX, startY, endX, endY} = currentShape
                const handlers = getHandleBarPointLine(startX, startY, endX, endY)
                selectedHandler = handlers.find(eachHandlerPoint => {
                    const {x, y} = eachHandlerPoint
                    const path = new Path2D()
                    path.rect(x, y, HANDLER_SIZE, HANDLER_SIZE)
                    ctx.save()
                    ctx.lineWidth=5
                    const result = ctx.isPointInPath(path, e.clientX, e.clientY) || ctx.isPointInStroke(path, e.clientX, e.clientY)
                    ctx.restore()
                    return result
                })
                if(selectedHandler) {
                    isHandlerSelected = true 
                    const {x, y, direction} = selectedHandler 
                    selectedShapeHandlersRef.current = {
                        startX,
                        startY,
                        x,
                        y,
                        direction,
                        selectedShape: currentShape
                    }
                    console.log(selectedShapeHandlersRef.current)
                    return
                }
                
            }
            else if(currentShape instanceof ArrowShape) {
                const {startX, startY, endX, endY} = currentShape
                const handler = getHandleBarPointLine(startX, startY, endX, endY)
                selectedHandler = handler.find(eachHandler => {
                    const {x,y} = eachHandler
                    const path = new Path2D()
                    path.rect(x, y, HANDLER_SIZE, HANDLER_SIZE)
                    ctx.save()
                    ctx.lineWidth=5
                    const result = ctx.isPointInPath(path, e.clientX, e.clientY) || ctx.isPointInStroke(path, e.clientX, e.clientY)
                    ctx.restore()
                    return result
                })
                if(selectedHandler) {
                    isHandlerSelected = true 
                    const {x, y, direction} = selectedHandler 
                    selectedShapeHandlersRef.current = {
                        startX,
                        startY,
                        x,
                        y,
                        direction,
                        selectedShape: currentShape
                    }
                    console.log(selectedShapeHandlersRef.current)
                    return
                }
            }
            checkShapeSelected()
        }
        
    }

    

    function handleMouseUp() {
        clicked = false
        const ctx = contextRef.current
        if(drawingShapeRef.current && drawingShapeRef.current && ctx) {
            const currentShape = drawingShapeRef.current
            let isLineShape = false 
            let isLineAllowed = true
            // check if the shape is line and also have some distance between points
            if(currentShape instanceof ArrowShape || currentShape instanceof LineShape) {
                isLineShape = true
                if((currentShape.startX === currentShape.endX || currentShape.startY === currentShape.endY)) {
                    isLineAllowed = false
                }
            }
            console.log(drawingShapeRef.current)
            if(isLineShape) {
                
                if(isLineAllowed) {
                    shapesManagerRef.current.addShape(drawingShapeRef.current)
                }
            }
            else {
                if(drawingShapeRef.current instanceof BaseShape) {
                    shapesManagerRef.current.addShape(drawingShapeRef.current)
                }
            }
        }
        drawingShapeRef.current = null
        isHandlerSelected =false 
        selectedShapeHandlersRef.current = null
    }

    function onClickTool(type: ToolTypes) {
        
        if(type !== ToolTypes.SELECTION){
            selectedShapeRef.current = null 
            offsetRef.current = {x:0, y: 0}
        } 

        setTool(type)
        
    }

    function checkShapeSelected() {
        const ctx = contextRef.current
        if(ctx) {
        const shape = shapesManagerRef.current.getAllShapes().find(eachShape => eachShape.isPointInStroke(ctx,startX, startY))
            if(shape) {
                selectedShapeRef.current = shape
                setTool(ToolTypes.SELECTION)
                if(shape instanceof RectangleShape) {
                    offsetRef.current = {
                        x: startX - shape.x,
                        y: startY - shape.y
                    }
                }
                else if(shape instanceof TextShape) {
                    offsetRef.current = {
                        x: startX - shape.x,
                        y: startY - shape.y
                    }
                }
                else if(shape instanceof EllipseShape) {
                    offsetRef.current = {
                        x: startX - shape.x,
                        y: startY - shape.y
                    }
                }
                else if(shape instanceof LineShape) {
                    offsetRef.current = {
                        x: startX,
                        y: startY
                    }
                }
                else if(shape instanceof ArrowShape) {
                    offsetRef.current = {
                        x: startX,
                        y: startY
                    }
                }
                else if(shape instanceof RhombusShape) {
                    offsetRef.current = {
                        x: startX - shape.centerX,
                        y: startY - shape.centerY
                    }
                }

            }
            else {
                selectedShapeRef.current = null
            }
            clearCanvas()
        }
    }

    function handleDoubleClick() { 
        checkShapeSelected()
        const ctx = contextRef.current
        const shape = selectedShapeRef.current
        
        if(shape) {
            if((shape instanceof TextShape)) {
                console.log(shape)
                if(ctx && shape && canvasRef.current) {
                    console.log('text')
                    clearCanvas()
                    const canvasRect = canvasRef.current.getBoundingClientRect();

                    const input = document.createElement('textarea')
                
                    input.style.position = 'fixed';
                    input.style.top = `${shape.y + canvasRect.top}px`;
                    input.style.left = `${shape.x + canvasRect.left}px`;
                    input.style.color = 'white'
                    input.style.background = 'black'

                    input.style.border = 'none'
                    input.style.outline = "none"
                    input.style.zIndex = '100'
                    input.style.fontFamily = `${TextShape.fontStyle}`
                    input.style.fontSize = `${shape.fontsize}px`
                    input.style.font = `${shape.fontsize}px ${TextShape.fontStyle}`; 
                    input.style.lineHeight = `${shape.fontsize *0.95}px`
                    input.style.padding = "0px";
                    input.style.margin = "0px";
                    input.style.height = `${shape.getHeight(ctx)}px`;
                    input.style.display = "inline";
                    input.style.letterSpacing = "normal";
                    input.style.boxSizing = "content-box";
                    input.style.overflow = "hidden"
                    input.style.width = `${shape.getWidth()}px`
                    
                    
                    input.value = `${shape.text}`
                    input.focus()
                    document.body.appendChild(input)
                    setTimeout(() => input.focus(), 0)

                    input.addEventListener('input', () => {
                        const text = input.value
                        shape.text = text
                        const width = shape.setWidthEdit(ctx)
                        console.log(width)
                        input.style.width = `${width}px `
                        input.style.height = `${shape.getHeight(ctx)}px`
                        
                        clearCanvas()
                        
                    })
                    input .addEventListener('blur', () => {
                        input.remove()
                    })

                }
            }
            else {
                return
            }
        }
        else {
            if(canvasRef.current && ctx) {
                clearCanvas()
                const canvasRect = canvasRef.current.getBoundingClientRect();

                // Convert viewport coordinates to canvas-relative
                const x = startX - canvasRect.left;
                const y = startY - canvasRect.top;
                
                const input = document.createElement('input')
                input.type = 'text'
            

                // Position input in viewport coordinates
                input.style.position = 'fixed';
                input.style.top = `${startY}px`;
                input.style.left = `${startX}px`;
                input.style.color = 'white'
                input.style.background = 'transparent'
                input.style.border = 'none'
                input.style.outline = "none"
                input.style.zIndex = '10'
                input.style.fontFamily = "serif"
                input.style.fontSize = "24px"
                input.style.font = `${TextShape.defaultFontSize}px ${TextShape.fontStyle}`; 
                input.style.lineHeight = "normal";
                input.style.padding = "0px";
                input.style.margin = "0px";
                input.style.height = "auto";
                input.style.display = "inline";
                input.style.letterSpacing = "normal";
                input.style.boxSizing = "content-box";
                input.value = ''
                input.focus()
                document.body.appendChild(input)
                setTimeout(() => input.focus(), 0)

                input.addEventListener('input', () => {
                    const text = input.value
                    ctx.save()
                    ctx.font = `${TextShape.defaultFontSize}px ${TextShape.fontStyle}`
                    const width = ctx.measureText(text).width
                    input.style.width = `${width}px`
                    ctx.restore()
                })

                input.addEventListener('blur', () => {
                    const text = input.value
                    if(text.trim()) {
                        const textShape = new TextShape(text, x, y, ctx)
                        shapesManagerRef.current.addShape(textShape)
                        clearCanvas()
                        
                    }
                    input.remove()
                })
            }
        }        
    }

    

    return <div className="h-screen w-screen overflow-hidden">
    <div className="fixed bg-white flex justify-center items-center gap-x-0.5 top-1 left-3 rounded p-1">
        <ToolbarButton isActive={tool===ToolTypes.RECTANGLE} icon={RectangleHorizontalIcon} onClick={() => onClickTool(ToolTypes.RECTANGLE)}/>
        <ToolbarButton isActive={tool === ToolTypes.ELLIPSE} icon = {CircleIcon} onClick={() => onClickTool(ToolTypes.ELLIPSE)} className="size-7 md:size-7"/>
        <ToolbarButton isActive={tool === ToolTypes.LINE} icon={LineChartIcon} onClick={() => onClickTool(ToolTypes.LINE)} className="size-6 md:size-6"/>
        <ToolbarButton isActive={tool === ToolTypes.RHOMBUS} icon = {DiamondIcon} onClick={() => onClickTool(ToolTypes.RHOMBUS)} className="size-7 md:size-7"/>
        <ToolbarButton isActive={tool === ToolTypes.ARROW} icon = {ArrowRight} onClick={() => onClickTool(ToolTypes.ARROW)} className="md:size-6"/>
        <ToolbarButton isActive={tool === ToolTypes.SELECTION} icon = {Hand} onClick={() => onClickTool(ToolTypes.SELECTION)} className="size-6 md:size-6"/>
        <ToolbarButton isActive={tool === ToolTypes.TEXT} icon = {LetterTextIcon} onClick={() => onClickTool(ToolTypes.TEXT)} className="size-6 md:size-6"/>
        
        </div>
        <canvas ref={canvasRef} onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onDoubleClick={handleDoubleClick}/>
    </div>
}