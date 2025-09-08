import { ArrowRight, Play, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Demo() {
    return (
    <section id="demo" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    See It in
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Action</span>
                </h2>
                <p className=" text-gray-600 max-w-3xl mx-auto md:text-lg">
                    Experience the power of collaborative drawing. Watch how easy it is to create, 
                    share, and collaborate in real-time.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative w-full h-64 lg:h-96 md:max-w-9/12 mx-auto">
                    <Image
                    src="/images/img-3.png"
                    alt="screenshot"
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    priority
                    className="bg-cover rounded-xl shadow-lg"
                    />
                </div>

                <div className="space-y-8">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Play className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Start</h3>
                            <p className="text-gray-600">
                            No registration, no setup. Just open the app and start drawing immediately. 
                            Your creativity shouldn&apos;t wait for paperwork.
                            </p>
                        </div>
                    </div>

                    <div className="flex space-x-4 items-center justify-center">
                        <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Share & Collaborate</h3>
                            <p className="text-gray-600">
                            Generate a unique link and share it with anyone. They can join instantly and 
                            see your changes in real-time as you work together.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 justify-center">
                        <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Tools</h3>
                            <p className="text-gray-600">
                            Full-featured drawing tools with shape creation, selection, resizing, 
                            and deletion. Everything you need for professional diagrams and sketches.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Link href={"/canvas"} className=" w-fit cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white px-7 py-3 md:px-8 md:py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            <span>Try It Now</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </section>
    )
}