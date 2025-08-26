'use client'

import { useEffect, useState } from "react"
import Loading from "../ui/Loading"
import ErrorMessage from "../ui/ErrorMessage"

export default function DeviceSupportWrapper({children}: {
    children: React.ReactNode
}) {
    const [isTouchDevice, setIsTouchDevice] = useState<boolean | null>(null)

    useEffect(() => {
        setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
    }, [])
    
    if (isTouchDevice === null) {
        return <Loading />
    }

    if (isTouchDevice) {
        return (
            <ErrorMessage
            heading="Oops! There Was a Problem"
            description="Currently optimized for desktop. For the best experience, use a mouse. Touch support is in progress."
            />
        )
    }

    return <>{children}</>
}
