import { Palette } from "lucide-react";
import Link from "next/link";

export default function CTA() {
    return (
    <section id="cta" className="py-18 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-5 md:mb-6">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Start
                    <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">Creating?</span>
                </h2>
            </div>

            <p className="text-blue-100 max-w-xl mb-8 mx-auto px-3 leading-relaxed text-center md:text-lg">
            Try out the app and bring your ideas to life with simple drawing and collaboration tools.
            </p>

            <div className="flex justify-center">
                <Link href={"/canvas"} className="w-fit bg-white flex justify-center items-center  font-semibold text-gray-900
                    px-5 py-4 rounded-2xl gap-x-1.5 shadow-xl md:text-lg transition-all md:gap-x-2 cursor-pointer duration-200 hover:-translate-y-1 
                    hover:shadow-2xl hover:bg-gray-50">
                    <Palette className="w-6 h-6 text-blue-600 md:w-6 md:h-6"/>
                    <span>Start Drawing</span>
                </Link>
            </div>
        </div>
    </section>
    )
}