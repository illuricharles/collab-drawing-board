'use client'
import { useRouter } from "next/navigation"

export default function ErrorMessage({heading, description}: {
    heading: string,
    description: string,
}) {
    const router = useRouter()
    return <div className="h-screen w-screen bg-black  flex justify-center items-center p-4 overflow-auto">
        <div className="bg-[#232329] p-6  rounded-md text-center md:max-w-[450px]">
            <h1 className="text-red-500 text-center text-2xl mb-3">{heading}</h1>
            <p className="text-white mb-4 text-lg">{description}</p>
            <div className="text-center">
                <button className="inline-block px-3 py-1.5 bg-[#A8A5FF] text-[#232329] font-semibold rounded-md cursor-pointer"
                    onClick={() => router.push('/canvas')}
                >
                    Home
                </button>
            </div>
        </div>
    </div>
}