export enum ToolTypes {
  RECTANGLE = "RECTANGLE",
  ELLIPSE = "ELLIPSE",
  LINE = "LINE",
  RHOMBUS = "RHOMBUS",
  ARROW = "ARROW",
  SELECTION = "SELECTION",
  TEXT = "TEXT"
}

export interface Rectangle {
  id: string,
  type : ToolTypes.RECTANGLE,
  x: number,
  y: number,
  width: number,
  height: number
}

export interface Arrow {
  id: string,
  type: ToolTypes.ARROW,
  startX: number,
  startY: number
  endX: number,
  endY: number
}

export interface Rhombus {
  id: string,
  type: ToolTypes.RHOMBUS,
  centerX: number,
  centerY: number,
  width: number,
  height: number
}

export interface Ellipse {
  id: string,
  type:ToolTypes.ELLIPSE,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number
}

export interface Line {
  id: string,
  type: ToolTypes.LINE,
  startX: number,
  startY: number,
  endX: number,
  endY: number
}

export interface Selection {
  type: ToolTypes.SELECTION
}

export interface TEXT {
  id: string,
  type: ToolTypes.TEXT
}

export type Shapes = Rectangle | Ellipse | Line | Rhombus | Arrow | Selection | TEXT