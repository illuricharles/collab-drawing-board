import { BaseShape } from "../shapes/BaseShape";
import AbstractShapeManager from "./AbstractShapeManager";

export default class LocalShapeManager extends AbstractShapeManager {
    addShape(shape: BaseShape): void {
        this.shape.set(shape.id, shape)
    }

    delete(shape: BaseShape): void {
        this.shape.delete(shape.id)
    }
}