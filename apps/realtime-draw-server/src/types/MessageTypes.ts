// Shorter and more extensible enum
export enum MessageType {
  Error = 'Error',
  Success = 'Success',
  SendMessage = 'SendMessage',
  JoinRoom = 'JoinRoom',
  BroadcastMessage = "BroadcastMessage"
}

export enum ErrorCodes {
    InvalidRoomId = "InvalidRoomId",
    AlreadyJoinedRoom = "AlreadyJoinedRoom",
    InvalidMessage = "InvalidMessage",
    RoomNotJoined = "RoomNotJoined",
    RoomNotFound = "RoomNotFound"
}

interface BaseMessage {
  type: MessageType;
  message: string;
}

export interface ErrorMessage extends BaseMessage {
  type: MessageType.Error;
  code?: ErrorCodes
}

export interface SuccessMessage extends BaseMessage {
  type: MessageType.Success;
}

export interface SendMessage extends BaseMessage {
  type: MessageType.SendMessage,
  roomId: string
}

export interface BroadcastMessage extends BaseMessage{
  type: MessageType.BroadcastMessage,
  message: string,
  roomId: string,
  senderId: string
}


export interface JoinRoomMessage{
  type: MessageType.JoinRoom,
  roomId: string
}

// Union of all messages
export type Message = ErrorMessage | SuccessMessage | SendMessage | JoinRoomMessage | BroadcastMessage;
