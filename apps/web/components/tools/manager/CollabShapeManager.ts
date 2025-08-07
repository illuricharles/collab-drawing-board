import { BaseShape } from "../shapes/BaseShape";
import AbstractShapeManager from "./AbstractShapeManager";
import {SendMessage, MessageType} from "@repo/ws-shared-types"

export default class CollabShapeManager extends AbstractShapeManager {
    
    constructor(private roomId: string, private sendMessage: (message: string) => void) {
        super()
    }

    addShape(shape: BaseShape): void {
        this.shape.set(shape.id, shape)
        const message:SendMessage = {
            type: MessageType.SendMessage,
            roomId: this.roomId,
            message: JSON.stringify({
                operationOnShape: 'AddShape',
                shape: JSON.stringify(shape)
            })
        }
        this.sendMessage(JSON.stringify(message))

    }
    onUpdateMessage(shape:BaseShape) {
        this.shape.set(shape.id, shape)
    }

    onAddShapeMessage(shape:BaseShape) {
        this.shape.set(shape.id, shape)
    }

    updateShape(shape:BaseShape): void {
        const message: SendMessage = {
            type: MessageType.SendMessage,
            roomId: this.roomId,
            message: JSON.stringify({
                operationOnShape: 'UpdateShape',
                shape: JSON.stringify(shape)
            })
        }
        this.sendMessage(JSON.stringify(message))
    }

    delete(shape: BaseShape): void {
        this.shape.delete(shape.id)
        const message: SendMessage = {
            type: MessageType.SendMessage,
            roomId: this.roomId,
            message: JSON.stringify({
                operationOnShape: 'DeleteShape',
                shapeId: shape.id
            })
        }
        this.sendMessage(JSON.stringify(message))
    }

    onDeleteMessage(shapeId: string) {
        this.shape.delete(shapeId)
    }
}