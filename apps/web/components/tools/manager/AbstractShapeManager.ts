import { BaseShape } from "../shapes/BaseShape";
import IShapeManager from "./IShapeManager";

export default abstract class AbstractShapeManager implements IShapeManager{
    protected shape: Map<string, BaseShape> = new Map()

    drawAllShapes(ctx: CanvasRenderingContext2D) : void {
         this.shape.forEach(currentShape => currentShape.draw(ctx))
    }
    getAllShapes(): BaseShape[] {
        return Array.from(this.shape.values())
    }
    // addShape(shape: BaseShape): void {
    //     this.shape.set(shape.id, shape)
    // }
    clear(): void  {
         this.shape.clear()
    }

    // delete(shape: BaseShape): void {
    //     this.shape.delete(shape.id)
    // }

    abstract delete(shape: BaseShape): void

    abstract addShape(shape: BaseShape): void;
}