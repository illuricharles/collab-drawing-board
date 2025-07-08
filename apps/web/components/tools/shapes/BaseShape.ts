import {  ToolTypes } from "../../../types/Shapes";
import { v4 as uuidv4 } from 'uuid';
export abstract class BaseShape {
    public id: string 
    constructor() {
        this.id = uuidv4()
    }
    abstract type: ToolTypes
    abstract draw(ctx: CanvasRenderingContext2D): void
    abstract isPointInStroke(ctx: CanvasRenderingContext2D, x:number, y: number): boolean
    
}