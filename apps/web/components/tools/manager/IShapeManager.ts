import { BaseShape } from "../shapes/BaseShape"

export default interface IShapeManager {
    drawAllShapes(ctx: CanvasRenderingContext2D) : void;
    getAllShapes(): BaseShape[];
    addShape(shape: BaseShape): void
    clear(): void 
    delete(shape: BaseShape): void
}