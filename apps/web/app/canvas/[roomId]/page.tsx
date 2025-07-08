// import DrawingCanvas from "../../../components/draw/DrawingCanvas"
import MainDrawingCanvas from "../../../components/draw/MainDrawingCanvas"

export default async function Page({params}: {
    params: Promise<{roomId: string}>
}) {
    const {roomId} = await params
    console.log(roomId)
    return <>
        <MainDrawingCanvas/>
    </>
}