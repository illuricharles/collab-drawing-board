export interface ResizeHandle  {
    x: number,
    y: number,
    direction: ResizeDirection | LineResizeDirection
}

export type ResizeDirection = 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export const HANDLER_SIZE = 8

export type LineResizeDirection = 'startPoint' | 'endPoint'

export interface LineResizeHandle {
    x: number,
    y: number,
    direction: LineResizeDirection
}

export function getHandleBarPoints(x: number, y: number, width: number, height: number): ResizeHandle[] {
    const centerX = x + width/2 
    const centerY = y + height/2
    return [
        {x, y, direction: 'top-left'},
        {direction: 'top', x:centerX, y},
        {direction: 'top-right', x:x+width, y},
        {direction: 'left', x, y: centerY},
        {direction: 'right', x:x+width, y: centerY},
        {direction: 'bottom-left', x, y:y+height},
        {direction: 'bottom', x: centerX, y: y+height},
        {direction: 'bottom-right', x:x+width, y:y+height}
    ] 
}

export function getHandleBarPointLine(startX: number, startY: number, endX: number, endY: number): LineResizeHandle[] {
        return [
            {direction: 'startPoint' , x: startX, y: startY},
            {direction: 'endPoint', x: endX, y: endY}
        ]
    }

export function drawRectangleHandleBarPoints(handlers: ResizeHandle[], ctx: CanvasRenderingContext2D) {
    const hhz = HANDLER_SIZE/2
    handlers.forEach(eachHandler => {
    ctx.save()
    ctx.strokeStyle = "blue"
    ctx.fillStyle = "blue"
    ctx.fillRect(eachHandler.x- hhz, eachHandler.y - hhz, HANDLER_SIZE, HANDLER_SIZE )
    ctx.stroke()
    ctx.restore()
    })
}