"use client"
import { useEffect, useRef, useState } from "react"
import MainDrawingCanvas from "./MainDrawingCanvas"
import IShapeManager from "../tools/manager/IShapeManager"
import LocalShapeManager from "../tools/manager/LocalShapeManager"
import { MenuIcon, X } from "lucide-react"
import { ToolbarButton } from "../ToolBarButton"
import { FaUsers } from "react-icons/fa"
import getHex from "../../lib/utils/getHex"

export default function DrawingBoard() {
    const shapesManagerRef = useRef<IShapeManager>(new LocalShapeManager())
    const [showMenu, setShowMenu] = useState(false)
    const [showCollabPrompt, setShowCollabPrompt] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const [showCollabLink, setShowCollabLink] = useState(false)
    const [isLinkCopied, setIsLinkCopied] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [origin, setOrigin] = useState("")

    
    
    useEffect(() => {
        const origin = window.location.origin
        if(origin !== undefined) {
            setOrigin(origin)
        }
        return () => {
            if(timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    function handleCopy() {
        if(inputRef.current) {
            navigator.clipboard.writeText(inputRef.current.value)
            setIsLinkCopied(true)
        }
        timeoutRef.current = setTimeout(() => {
            setIsLinkCopied(false)
        }, 2000)
    }

    return <div className="relative">
        <div className="fixed text-black bg-white right-2 top-3 rounded-md p-0.5">
            <div className="flex justify-center items-center">
                <ToolbarButton icon={MenuIcon} isActive={false} onClick={() => setShowMenu((prev) => !prev)} className=" size-7 md:size-7"/>
            </div>
        </div>

        {showMenu && 
        <div className="absolute top-14 right-3 p-1 px-2 bg-white text-slate-900 font-medium rounded-md">
            <div className="flex justify-center items-center gap-x-2 cursor-pointer hover:text-black ">
                <FaUsers size={21}/>
                <button className="cursor-pointer" onClick={() => {
                    setShowCollabPrompt(true)
                    setShowMenu(false)
                }}>Live Collab</button>
            </div>
        </div>}

        {showCollabLink && <div className="fixed h-screen w-screen flex justify-center items-center text-center">

            <div className="text-white bg-[#232329]  rounded-2xl max-w-[480px]">
                <div className="w-full flex justify-end p-4 pb-3">
                    <button className="cursor-pointer" onClick={() => setShowCollabLink(false)}>
                        <X/>
                    </button>
                </div>
                <div className="p-8 pt-0">
                <h2 className="font-semibold text-2xl mb-4 text-center">Live collaboration</h2>
                <div className="flex flex-col justify-start items-start w-full ">
                    <label className="mb-3 font-semibold" htmlFor="collabLink">Link</label>
                    <div className="flex justify-between w-full gap-x-4">
                        <input id="collabLink" type="text" ref={inputRef} readOnly value={`${origin}/collab/canvas#room=${getHex()}`}
                         className=" py-2 px-3 bg-[#2e2d39] rounded-md border-red-50 border-[1px] flex-grow focus:outline-none focus:ring-0"
                        />
                        <button className="bg-[#A8A5FF] text-[#232329] font-semibold px-3 rounded-md cursor-pointer inline-block w-28" onClick={handleCopy} disabled={isLinkCopied}>{isLinkCopied? "Copied": "Copy Link"}</button>
                    </div>
                    <hr className="h-px my-5 bg-white border-0 w-full"/>
                    <div className="text-[##e3e3e8] text-left text-xs space-y-2.5">
                        <p className="">
                            The canvas is shared only with users who have the link, and all updates are transmitted directly between clients using WebSockets, with no data stored on any server.
                        </p>
                        <p className="">
                            If you leave the session, you&apos;ll disconnect from live collaboration, but can continue editing your current canvas locally. Other participants can still work on their version independently.
                        </p>
                        <p className="">
                            This ensures a lightweight, secure, and temporary collaborative space — ideal for spontaneous sketching, brainstorming, or whiteboarding without any sign-up.
                        </p>
                    </div>
                </div>
            </div>
            </div>
        </div>}



        {showCollabPrompt && <div className="fixed h-screen w-screen flex justify-center items-center text-center">
            <div className="text-white bg-[#232329]  rounded-2xl max-w-[480px]">
                <div className="flex justify-end p-4 pb-0">
                    <button className="cursor-pointer" onClick={() => setShowCollabPrompt(false)}>
                        <X/>
                    </button>
                </div>
                <div className="p-8 pt-0">
                    <h2 className="text-[#A8A5FF] text-2xl font-semibold text-center mb-3">Live collaboration</h2>
                    <p className="mb-3">Invite people to collaborate on your drawing.</p>
                    <p className="mb-5">If everyone left from the room then the chat gets deleted automatically.</p>
                    <button className="text-[#232329] bg-[#A8A5FF] p-3 py-1.5 inline-block font-semibold rounded-md cursor-pointer"
                        onClick={() => {
                            // setLoading(true)
                            // router.push(`/collab/canvas/#room=1`)
                            setShowCollabPrompt(false)
                            setShowCollabLink(true)
                        }}
                    >
                        Start Session
                    </button>
                </div>
            </div>
        </div>}
        <MainDrawingCanvas shapesManagerRef={shapesManagerRef}/>
    </div>
    
}
