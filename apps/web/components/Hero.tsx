import { Play } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
  <section className=" bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 md:p-15 md:pt-12 relative overflow-hidden">
    
    {/* decoration */}
    <div className="absolute w-42 h-42 left-10 top-5  bg-indigo-100 rounded-full blur-xl opacity-30 mix-blend-multiply 
    animate-pulse duration-1000 lg:top-12 lg:left-70 pointer-events-none"></div>
    
    {/* decoration */}
    <div className="absolute  w-42 h-42 bottom-5 right-10 bg-purple-200 rounded-full blur-xl opacity-30 mix-blend-multiply animate-pulse 
    duration-1000 pointer-events-none lg:top-30 lg:right-40 "></div>
  
    {/* Hero section */}
    <section className="md:max-w-4xl md:m-auto">
      
      <div className="text-center py-3">
          
        <h1 className="text-4xl font-bold mb-5 md:text-4xl md:mb-5 lg:text-6xl lg:mb-8">Collaborative <span className="bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">Drawing</span> Platform</h1>
        <p className="text-center  text-gray-600 mb-9 md:text-xl  md:px-2 leading-relaxed md:mb-6  lg:mb-11">
          A real-time collaborative whiteboard application built with the Nextjs, Nodejs.
          Draw, share and collaborate seamlessly without any login requirements.
        </p>

        {/* Buttons */}
        <div className=" flex  justify-center gap-3 md:gap-x-5 lg:gap-x-6 flex-wrap">
          <Link href={"/canvas"} className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm
            w-fit p-3 rounded-2xl cursor-pointer shadow-lg hover:shadow-xl hover:from-blue-600 transition-all duration-200 transform 
            hover:-translate-y-1 space-x-2 font-semibold md:p-4 md:py-3 md:text-base ">
            <Play className="w-4 h-4"/> <p className="lg:text-lg">Start drawing</p>
          </Link>

          <Link href={"https://github.com/illuricharles/collab-drawing-board"} className="flex items-center justify-center border-blue-600 border-2
            w-fit px-4 py-3 rounded-2xl cursor-pointer shadow-lg hover:shadow-xl text-purple-600 font-semibold transition-all duration-200 transform text-sm
            hover:-translate-y-1 space-x-2 hover:bg-blue-600 hover:text-white md:text-base md:p-4 md:py-3 ">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#FFA000" d="M40,12H22l-4-4H8c-2.2,0-4,1.8-4,4v8h40v-4C44,13.8,42.2,12,40,12z"></path><path fill="#FFCA28" d="M40,12H8c-2.2,0-4,1.8-4,4v20c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V16C44,13.8,42.2,12,40,12z"></path>
            </svg>
            <p className="lg:text-lg">View Code</p>
          </Link>
          
        </div>
      </div>
    </section>
  </section>
  )
}