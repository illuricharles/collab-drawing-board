import { Move3D, Palette, SaveIcon, Trash2, Users, Zap } from "lucide-react";
import React from "react";

interface Features {
    id: number,
    icon: React.ReactNode,
    title: string,
    description: string,
    color: string
}

export default function Features() {
    const iconClass = "w-8 h-7 text-white lg:w-9 lg:h-8"
    const features: Features[] = [
        {
            id:1,
            icon: <Palette className={iconClass}/>,
            title: "Drawing Tools",
            description: "Create shapes, add text, and sketch freehand on a simple, intuitive canvas.",
            color: "from-blue-500 to-blue-600"
        },
        {
            id:2,
            icon: <Move3D className={iconClass}/>,
            title: "Resize & Transform",
            description: "Easily adjust size or reposition any element on the board.",
            color: "from-purple-500 to-purple-600"
        },
        {
            id: 3,
            icon: <Trash2 className={iconClass}/>,
            title: "Easy Deletion",
            description: "Remove elements effortlessly with Delete or Esc key",
            color: "from-red-500 to-red-600"
        },
        {
            id: 4,
            icon: <Users className={iconClass}/>,
            title: "Real-Time Collaboration",
            description: "Multiple users can work together on the same board simultaneously.",
            color: "from-indigo-500 to-indigo-600"
        },
        {
            id: 5,
            icon: <SaveIcon className={iconClass}/>,
            title: "Data Persistence",
            description: "Drawings are saved automatically and remain available across sessions.",
            color: "from-green-500 to-green-600"
        },
        {
            id: 6,
            icon: <Zap className={iconClass}/>,
            title: "No Login Required",
            description: "Jump right in and start creating. No accounts, no barriers, just pure creativity.",
            color:"from-yellow-500 to-yellow-600"
        }
    ]

    return (
    <section id="features" className="p-5 py-12 md:py-14">
      <div className="mb-8 lg:mb-9">
        <h2 className="text-3xl text-center mb-4 md:mb-5 text-gray-900 lg:mb-6 font-bold md:text-4xl">Bring Your Ideas to 
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Life</span>
        </h2>
        <p className=" text-gray-600 md:text-center leading-relaxed md:text-lg max-w-3xl mx-auto">A whiteboard app that lets you sketch, collaborate in real time, and turn simple ideas into clear visuals.</p>
      </div>
    {/* Features card */}

    

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:max-w-11/12  m-auto ">
        {
            features.map(eachContent => {
                return (
                    <div key={eachContent.id} className="border border-gray-200 p-5 rounded-2xl">
                        <div className={`bg-gradient-to-r ${eachContent.color}  w-fit px-2 py-2 rounded-xl mb-2.5`}>
                            {/* <Palette className="w-9 h-8  text-white"/> */}
                            {eachContent.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-1.5">{eachContent.title}</h3>
                            <p className="sm:text-sm text-gray-600 leading-relaxed md:text-base">{eachContent.description}</p>
                        </div>
                    </div>
                )
            })
        }
        
      </div>
    </section>
    )
}