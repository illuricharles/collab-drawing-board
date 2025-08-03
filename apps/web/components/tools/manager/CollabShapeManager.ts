import { BaseShape } from "../shapes/BaseShape";
import AbstractShapeManager from "./AbstractShapeManager";

export default class CollabShapeManager extends AbstractShapeManager {
    constructor(private sendMessage: (message: string) => void) {
        super()
    }

    addShape(shape: BaseShape, isBroadCastedMessage=false): void {
        this.shape.set(shape.id, shape)
        if(!isBroadCastedMessage) {
            this.sendMessage(JSON.stringify({
                type: 'SendMessage',
                roomId: "1",
                message: JSON.stringify({
                    operationOnShape: 'AddShape',
                    shape: JSON.stringify(shape)
                })
            }))
        }
    }
    onUpdateMessage(shape:BaseShape) {
        this.shape.set(shape.id, shape)
    }

    updateShape(shape:BaseShape): void {
        this.sendMessage(JSON.stringify({
            type: 'SendMessage',
            roomId: '1',
            message: JSON.stringify({
                operationOnShape: 'UpdateShape',
                shape: JSON.stringify(shape)
            })
        }))
    }

    delete(shape: BaseShape): void {
        this.shape.delete(shape.id)
        this.sendMessage(JSON.stringify({
            type: "SendMessage",
            roomId: '1',
            message: JSON.stringify({
                operationOnShape: 'DeleteShape',
                shapeId: shape.id
            })
        }))
    }

    onDeleteMessage(shapeId: string) {
        this.shape.delete(shapeId)
    }
}