import { ToolTypes } from "../../../types/Shapes";
import { BaseShape } from "./BaseShape";

export default class LineShape extends BaseShape {
    type: ToolTypes = ToolTypes.LINE
    constructor(public startX: number, public startY: number, public endX: number, public endY: number) {
        super()
    }
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath()
        ctx.strokeStyle = "#fff"
        ctx.moveTo(this.startX, this.startY)
        ctx.lineTo(this.endX, this.endY)
        ctx.stroke()
    }
    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        const path = new Path2D()
        path.moveTo(this.startX, this.startY)
        path.lineTo(this.endX, this.endY)

        ctx.save()
        ctx.lineWidth = 8
        const result = ctx.isPointInStroke(path, x, y)
        ctx.restore()
        return result
    }
}