"use client"
import { useRef } from "react"
import MainDrawingCanvas from "./MainDrawingCanvas"
import IShapeManager from "../tools/manager/IShapeManager"
import LocalShapeManager from "../tools/manager/LocalShapeManager"

export default function DrawingBoard() {
    const shapesManagerRef = useRef<IShapeManager>(new LocalShapeManager())
    return <MainDrawingCanvas shapesManagerRef={shapesManagerRef}/>
    
}