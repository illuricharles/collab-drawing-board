import DeviceSupportWrapper from "../../components/draw/DeviceSupportWrapper"
import DrawingBoard from "../../components/draw/DrawingBoard"

export default async function Page() {
    
    return <DeviceSupportWrapper>
        <DrawingBoard/>
    </DeviceSupportWrapper>
}