import { ToolTypes } from "../../../types/Shapes";
import { BaseShape } from "./BaseShape";

export default class RectangleShape extends BaseShape {
    type = ToolTypes.RECTANGLE;
    constructor(public x:number, public y: number, public width: number, public height: number) {
        super()
    }
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath()
        ctx.strokeStyle="#fff"
        ctx.rect(this.x, this.y, this.width, this.height)
        ctx.stroke()
    }
    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        const path = new Path2D()
        path.rect(this.x, this.y, this.width, this.height)
        ctx.save()
        ctx.lineWidth=8
        const result = ctx.isPointInStroke(path, x, y)
        ctx.restore()
        return result
    }
}