import { ToolTypes } from "../../../types/Shapes";
import { BaseShape } from "./BaseShape";

export default class RhombusShape extends BaseShape {
    type: ToolTypes = ToolTypes.RHOMBUS 
    constructor(public centerX: number, public centerY: number, public width: number, public height: number) {
        super()
    }
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath()
        ctx.strokeStyle = "#fff"
        ctx.moveTo(this.centerX, this.centerY - this.height/2)
        ctx.lineTo((this.centerX + this.width/2) ,this.centerY)
        ctx.lineTo(this.centerX, this.centerY+this.height/2)
        ctx.lineTo(this.centerX - this.width/2,this.centerY)
        ctx.closePath()
        ctx.stroke()
    }
    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        const path = new Path2D()
        path.moveTo(this.centerX, this.centerY - this.height/2)
        path.lineTo((this.centerX + this.width/2) ,this.centerY)
        path.lineTo(this.centerX, this.centerY+this.height/2)
        path.lineTo(this.centerX - this.width/2,this.centerY)
        path.closePath()

        ctx.save()
        ctx.lineWidth = 8
        const result = ctx.isPointInStroke(path, x, y)
        ctx.restore()
        return result
    }
}