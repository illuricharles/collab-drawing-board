import { ToolTypes } from "../../../types/Shapes";
import { BaseShape } from "./BaseShape";

export default class EllipseShape extends BaseShape{
    type = ToolTypes.ELLIPSE
    constructor(public x: number, public y: number, public radiusX: number,public radiusY: number) {
        super()
    }
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, 2 * Math.PI)
        ctx.strokeStyle = "#fff"
        ctx.stroke()
    }
    isPointInStroke(ctx: CanvasRenderingContext2D, x:number, y: number): boolean {
        const path = new Path2D()
        path.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, 2*Math.PI)
        ctx.save()
        ctx.lineWidth = 8
        const result = ctx.isPointInStroke(path,x, y)
        ctx.restore()
        return result
    }
}