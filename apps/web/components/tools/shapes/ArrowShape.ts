import { ToolTypes } from "../../../types/Shapes";
import { BaseShape } from "./BaseShape";

export default class ArrowShape extends BaseShape {
    type: ToolTypes = ToolTypes.ARROW

    constructor(public startX: number, public startY: number, public endX: number, public endY: number) {
        super()
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const dx = this.endX - this.startX
        const dy = this.endY - this.startY
        const angle = Math.atan2(dy, dx)
        const headLength = 18
        const offset = Math.PI/6
        const leftX = this.endX - headLength*Math.cos(angle-offset)
        const leftY = this.endY - headLength*Math.sin(angle-offset)
        const rightX = this.endX - headLength*Math.cos(angle+offset)
        const rightY = this.endY - headLength*Math.sin(angle+offset)

        ctx.beginPath()
        ctx.strokeStyle = "#fff"
        ctx.moveTo(this.startX, this.startY)
        ctx.lineTo(this.endX, this.endY)

        ctx.lineTo(leftX, leftY)
        ctx.moveTo(this.endX, this.endY)
        ctx.lineTo(rightX, rightY)
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