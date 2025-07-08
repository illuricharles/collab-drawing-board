import { ToolTypes } from "../../../types/Shapes";
import { BaseShape } from "./BaseShape";

export class TextShape extends BaseShape {
    type: ToolTypes = ToolTypes.TEXT;
    public fontsize: number
    static defaultFontSize = 24
    width: number 
    minWidth: number
    static fontStyle = "serif"
    public minFontSize

    constructor(public text: string, public x: number, public y: number, ctx: CanvasRenderingContext2D) {
        super()
        this.fontsize = TextShape.defaultFontSize
        this.minFontSize = 6
        ctx.save()
        ctx.font = "24px serif";
        ctx.textBaseline='top'
        this.width = ctx.measureText(text).width + 3
        const words = text.split(' ')
        let minWidth = 0
        words.forEach(eachWord => {
            const eachWordWidth = ctx.measureText(eachWord).width
            if(eachWordWidth > minWidth) {
                minWidth = Math.ceil(eachWordWidth)
            }
        })
        this.minWidth = minWidth
        this.width = Math.max(this.width, this.minWidth)
        
        ctx.restore()
    }
    

    setWidth(width: number) {
        
        this.width = Math.max(width, this.minWidth)
    }

    setWidthEdit(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = `${this.fontsize}px ${TextShape.fontStyle}`;
        ctx.textBaseline = "top";

        const words = this.text.split(" ");
        let minWidth = 0
        for(const word of words) {
            const currentWidth   = ctx.measureText(word).width
            if(currentWidth > minWidth) {
                minWidth = Math.ceil(currentWidth)
            }
        }
        this.minWidth = minWidth 
        this.width = this.minWidth + 5
        ctx.restore();
        return this.minWidth
    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = `${this.fontsize}px ${TextShape.fontStyle}`;
        ctx.textBaseline = "top";

        const words = this.text.split(" ");
        let line = "";
        const lines: string[] = [];

        for (let i=0;i<words.length; i++) {
            const isLastWord = i === words.length - 1
            const testLine = line + words[i] + (isLastWord ? "" : " ");
            const testWidth = ctx.measureText(testLine).width;

            if (testWidth > this.width && line !== "") {
                lines.push(line.trim());
                line = words[i] + " ";
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        lines.forEach((eachLine, index) => {
            ctx.fillText(eachLine, this.x, this.y + index * this.fontsize);
        })
        ctx.restore();
    }

    getHeight(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = `${this.fontsize}px ${TextShape.fontStyle}`;
        ctx.textBaseline = "top";

        const words = this.text.split(" ");
        let line = "";
        const lines: string[] = [];

        for (let i=0;i<words.length; i++) {
            const isLastWord = i === words.length - 1
            const testLine = line + words[i] + (isLastWord ? "" : " ");
            const testWidth = ctx.measureText(testLine).width;

            if (testWidth > this.width && line !== "") {
                lines.push(line.trim());
                line = words[i] + " ";
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        const height = this.fontsize * lines.length
        

        ctx.restore();
        return height
    }

    getWidth() {
        return Math.max(this.width, this.minWidth)
    }

    setFontSize(fontSize: number, ctx: CanvasRenderingContext2D) {
        this.fontsize = Math.max(this.minFontSize, fontSize)

        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = `${this.fontsize}px ${TextShape.fontStyle}`;
        ctx.textBaseline = "top";

        const words = this.text.split(" ");
        let minWidth = 0
        for(const word of words) {
            const currentWidth   = ctx.measureText(word).width
            if(currentWidth > minWidth) {
                minWidth = Math.ceil(currentWidth)
            }
        }
        this.minWidth = minWidth
        ctx.restore();
    }

    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        ctx.save()
        const ctxFont = `${this.fontsize}px ${TextShape.fontStyle}`
        ctx.font = ctxFont
        const words = this.text.split(' ')
        const lines: string[] = []
        let line=""
        words.forEach(word => {
            const testLine = line + word + " "
            const testLineWidth = ctx.measureText(testLine).width
            if(testLineWidth > this.width && line !== "") {
                lines.push(line.trim())
                line = word + ""
            }
            else {
                line = testLine
            }
        })

        lines.push(line.trim())
        const height = this.fontsize * lines.length
        const path = new Path2D()
        path.rect(this.x, this.y, this.width, height)
        const result = ctx.isPointInStroke(path, x, y) || ctx.isPointInPath(path, x, y)
        ctx.restore()

        return result
    }
}