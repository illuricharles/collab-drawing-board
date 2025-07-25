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
  type : ToolTypes.RECTANGLE,
  x: number,
  y: number,
  width: number,
  height: number
}

export interface Arrow {
  type: ToolTypes.ARROW,
  startX: number,
  startY: number
  endX: number,
  endY: number
}

export interface Rhombus {
  type: ToolTypes.RHOMBUS,
  centerX: number,
  centerY: number,
  width: number,
  height: number
}

export interface Ellipse {
  type:ToolTypes.ELLIPSE,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number
}

export interface Line {
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
  type: ToolTypes.TEXT
}

export type Shapes = Rectangle | Ellipse | Line | Rhombus | Arrow | Selection | TEXT