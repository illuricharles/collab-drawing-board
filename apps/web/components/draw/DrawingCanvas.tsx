"use client"

import { ArrowRight, CircleIcon, DiamondIcon, Hand, LineChartIcon, RectangleHorizontalIcon, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Shapes, ToolTypes } from "../../types/Shapes"
import { ToolbarButton } from "../ToolBarButton"
// thought process
// on mouse down fist find that shape,
//  if shape exist then next is change the x, y values by copying it to another ref 
// if tool is selection and selected shape is not null then mousemove change the x, y, based on that 
// onmousedown add the shape and set the ref to null



// camera system
// Redhwan Nacef tutorial watch videos 


export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D>(null)
  const currentShape = useRef<Shapes>(null)
  const selectedShapeRef = useRef<Shapes>(null)
  const [tool, setTool] = useState<ToolTypes | null>(null)
  const dragOffSetRef = useRef<{x:number, y: number}>(null)
  // updated
  const existingShapesRef= useRef<Shapes[]>([
    {
      type: ToolTypes.RECTANGLE,
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    {
      type: ToolTypes.ELLIPSE,
      x: 10,
      y: 10,
      radiusX: 10,
      radiusY: 10
    },
    {
      type: ToolTypes.LINE,
      startX: 200,
      startY: 200,
      endX: 600,
      endY: 600
    },
    {
      type: ToolTypes.RHOMBUS,
      centerX: 200,
      centerY: 200,
      width: 50,
      height: 50
    },
    {
      type: ToolTypes.ARROW,
      startX: 200,
      startY: 200,
      endX: 200,
      endY: 400

    }
  ]) 

  let clicked = false
  let startX: number
  let startY: number

  function drawRhombus(centerX: number, centerY: number, width: number, height: number, ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.moveTo(centerX, centerY-height/2)
    ctx.lineTo(centerX+width/2, centerY)
    ctx.lineTo(centerX, centerY+height/2)
    ctx.lineTo(centerX-width/2, centerY)
    ctx.closePath()
    ctx.strokeStyle = "#fff"
    ctx.stroke()
  }

  function drawLine(startX: number, startY: number, endX: number, endY: number, ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }

  function drawEllipse(x: number, y: number, radiusX: number, radiusY: number, ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI)
    ctx.strokeStyle = "#fff"
    ctx.stroke()
  }

  function drawArrow(startX: number, startY: number, endX: number, endY: number, ctx: CanvasRenderingContext2D){
    // line logic
    ctx.beginPath()
    ctx.strokeStyle="#fff"
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    //arrow head
    const dx = endX - startX
    const dy = endY - startY
    const angle = Math.atan2(dy, dx) // calculate the angle with respect to x
    const offset = Math.PI/6
    const headLength = 20
    const leftX = endX - (headLength * Math.cos(angle - offset)) // calculate angle with projection to x 
    const leftY = endY - (headLength * Math.sin(angle - offset))
    const rightX = endX - (headLength * Math.cos(angle + offset))
    const rightY = endY - (headLength * Math.sin(angle + offset))
    
    ctx.beginPath()
    ctx.strokeStyle = "#fff"
    ctx.moveTo(endX, endY)
    ctx.lineTo(leftX, leftY)
    ctx.moveTo(endX, endY)
    ctx.lineTo(rightX, rightY)
    ctx.stroke()
  }

  function drawRectangle(x: number, y: number, width: number, height: number, ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#fff"
    ctx.strokeRect(x, y, width, height)
  }

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = contextRef.current
    if(canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle="#000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  const drawAllShapes = useCallback(() => {
    const ctx = contextRef.current
    if(ctx) {
      existingShapesRef.current.forEach(shape => {
        if(shape.type === ToolTypes.RECTANGLE) {
          const {x, y, width, height} = shape
          drawRectangle(x, y, width, height, ctx)
        }
        if (shape.type === ToolTypes.ELLIPSE) {
          const { x, y, radiusX, radiusY } = shape;
          drawEllipse(x, y, radiusX, radiusY, ctx)
        }
        if(shape.type === ToolTypes.LINE) {
          const {startX, startY, endX, endY} = shape
          drawLine(startX, startY, endX, endY, ctx)
        }
        if(shape.type === ToolTypes.RHOMBUS) {
          const {centerX, centerY, width, height} = shape
          drawRhombus(centerX, centerY, width, height, ctx)
        }
        if(shape.type === ToolTypes.ARROW) {
          const {startX, startY, endX, endY} = shape
          drawArrow(startX, startY, endX, endY, ctx)
        }
      })
    }

  }, [existingShapesRef])

  // initial draw function 
  const initDraw = useCallback(() => {
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

  useEffect(() => {
    initDraw()
    drawAllShapes()
  }, [initDraw, drawAllShapes])

  useEffect(() => {
    const canvas = canvasRef.current
    function handleResize() {
      console.log('resized')
      if(canvas) {
        initDraw()
        clearCanvas()
        drawAllShapes()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
    
  }, [initDraw, drawAllShapes, clearCanvas])

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    const {clientX, clientY} = e
    const ctx = contextRef.current

    if(ctx && clicked && tool === ToolTypes.SELECTION && selectedShapeRef.current) {
      clearCanvas()
      drawAllShapes()
      if(selectedShapeRef.current.type === ToolTypes.RECTANGLE && dragOffSetRef.current) {
        selectedShapeRef.current.x = clientX - dragOffSetRef.current.x
        selectedShapeRef.current.y = clientY - dragOffSetRef.current.y
      }
    }
    
    else if( ctx && clicked && tool !== null) {
      clearCanvas()
      drawAllShapes()
      
      if(tool === ToolTypes.RECTANGLE) {
        const x = startX
        const y = startY
        const width = clientX - startX
        const height = clientY - startY
        drawRectangle(x, y, width, height, ctx)
        currentShape.current = {type: ToolTypes.RECTANGLE, x, y, width, height}
      }
      if(tool === ToolTypes.ELLIPSE) {
        const centerX = (startX + clientX)/2 
        const centerY = (startY + clientY)/2

        const radiusX = Math.abs(centerX - startX)
        const radiusY = Math.abs(centerY - startY)
        drawEllipse(centerX, centerY, radiusX, radiusY, ctx)
        currentShape.current = {
          type: ToolTypes.ELLIPSE,
          x: centerX,
          y: centerY,
          radiusX,
          radiusY
        }
      }

      if(tool === ToolTypes.LINE) {
        const endX = clientX
        const endY = clientY
        drawLine(startX, startY, endX, endY, ctx)
        currentShape.current = {
          type: ToolTypes.LINE,
          startX,
          startY,
          endX,
          endY
        }
      }

      if(tool === ToolTypes.RHOMBUS) {
        const endX = clientX
        const endY = clientY

        const centerX = (startX + endX)/2
        const centerY = (startY + endY)/2
        const width = Math.abs(endX - startX)
        const height = Math.abs(endY- startY)
        
        drawRhombus(centerX, centerY, width, height, ctx)
        currentShape.current = {
          type: ToolTypes.RHOMBUS,
          centerX,
          centerY,
          width,
          height
        }
      }

      if(tool === ToolTypes.ARROW) {
        const endX = clientX
        const endY = clientY
        drawArrow(startX, startY, endX, endY, ctx)
        currentShape.current = {
          type: ToolTypes.ARROW,
          startX,
          startY,
          endX,
          endY
        }
      }
    }
  }

  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement, MouseEvent> ) {
    clicked = false
    if(selectedShapeRef.current) {
      selectedShapeRef.current = null
    }
    if(currentShape.current) {
      const {type} = currentShape.current
      if(currentShape.current.type === ToolTypes.RECTANGLE) {
        const {x, y, width, height, type} = currentShape.current
        existingShapesRef.current.push({type,x, y, width, height})
      }
      if(currentShape.current.type === ToolTypes.ELLIPSE) {
        const {x, y, radiusX, radiusY, type} = currentShape.current
        existingShapesRef.current.push({type, x, y, radiusX, radiusY})
      }
      if(currentShape.current.type === ToolTypes.LINE) {
        const {startX, startY, endX, endY, type} =  currentShape.current
        existingShapesRef.current.push({type, startX, startY, endX, endY})
      }
      if(currentShape.current.type === ToolTypes.RHOMBUS) {
        const {centerX, centerY, width, height, type} = currentShape.current
        existingShapesRef.current.push({type, centerX, centerY, width, height})
      }
      if(type === ToolTypes.ARROW) {
        const {startX, startY, endX, endY} = currentShape.current
        existingShapesRef.current.push({type, startX, startY, endX, endY})
      }
    }

    currentShape.current = null
    console.log(existingShapesRef.current)
  }

  function isRectangleSelected(currentX: number, currentY: number,x:number, y:number, width:number, height:number) {
    return currentX >= x && currentY >= y && currentX <= (x + width) && currentY <= (y + height)
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    clicked = true
    startX = e.clientX
    startY = e.clientY
    if(tool === ToolTypes.SELECTION) {
      const shapes = existingShapesRef.current
      for(const shape of shapes) {

        if(shape.type === ToolTypes.RECTANGLE) {
          const {x, y, width, height} = shape
          if(isRectangleSelected(startX, startY, x, y, width, height)) {
            console.log(startX-x, startY-y, x, y, width, height, startX, startY)
            selectedShapeRef.current = shape
            
            dragOffSetRef.current = {
              x:startX - x,
              y: startY - y
            }
            
          }
        }

      }
    }
  }
  

  return <div className="h-screen w-screen overflow-hidden">
   <div className="fixed bg-white flex justify-center items-center gap-x-0.5 top-1 left-3 rounded p-1">
      <ToolbarButton isActive={tool===ToolTypes.RECTANGLE} icon={RectangleHorizontalIcon} onClick={() => setTool(ToolTypes.RECTANGLE)}/>
      <ToolbarButton isActive={tool === ToolTypes.ELLIPSE} icon = {CircleIcon} onClick={() => setTool(ToolTypes.ELLIPSE)} className="size-7 md:size-7"/>
      <ToolbarButton isActive={tool === ToolTypes.LINE} icon={LineChartIcon} onClick={() => setTool(ToolTypes.LINE)} className="size-6 md:size-6"/>
      <ToolbarButton isActive={tool === ToolTypes.RHOMBUS} icon = {DiamondIcon} onClick={() => setTool(ToolTypes.RHOMBUS)} className="size-7 md:size-7"/>
      <ToolbarButton isActive={tool === ToolTypes.ARROW} icon = {ArrowRight} onClick={() => setTool(ToolTypes.ARROW)} className="md:size-6"/>
      <ToolbarButton isActive={tool === ToolTypes.SELECTION} icon = {Hand} onClick={() => setTool(ToolTypes.SELECTION)} className="size-6 md:size-6"/>
      <button className="cursor-pointer" onClick={() => setTool(null)}>
        null
      </button>
    </div>
    <canvas ref={canvasRef} onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}/>
  </div>
}



