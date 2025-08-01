import { BaseShape } from "../shapes/BaseShape";

export default class ShapeManager {
    private shape: Map<string, BaseShape> = new Map()

    drawAllShapes(ctx: CanvasRenderingContext2D) {
        this.shape.forEach(currentShape => currentShape.draw(ctx))
    }

    getAllShapes(): BaseShape[] {
        return Array.from(this.shape.values())
    }

    addShape(shape: BaseShape) {
        this.shape.set(shape.id, shape)
        console.log(shape)
    }
    
    clear() {
        this.shape.clear()
    }
    delete(shape: BaseShape) {
        this.shape.delete(shape.id)
    }
}