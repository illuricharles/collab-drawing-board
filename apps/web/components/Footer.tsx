import Link from "next/link";

export default function Footer() {
    return (
    <footer className="bg-gray-900 text-white pt-16 px-4 pb-10">
        <div className="max-w-3xl mx-auto lg:max-w-4xl px-2 md:px-4">
            <div className="grid grid-cols-1 gap-y-4 md:grid-cols-3 md:gap-6">
            <div className="space-y-1.5 md:space-y-2.5">
                <h3 className="text-xl font-bold md:text-2xl">Collab Board</h3>
                <p className="sm:text-sm leading-relaxed md:text-base lg:text-lg text-gray-200">App built with React, Next.js, Node.js with real-time collaboration features</p>
            </div>
            <div className="flex flex-col gap-y-1.5 md:items-center md:gap-y-2.5">
                <h3 className="text-xl font-bold md:text-2xl">Links</h3>
                <Link href={"/canvas"} className="sm:text-sm md:text-base lg:text-lg hover:underline text-gray-200">Live Demo</Link>
                <Link href={"https://github.com/illuricharles/collab-drawing-board"} className="sm:text-sm md:text-base lg:text-lg hover:underline text-gray-200">GitHub Repo</Link>
            </div>
            <div className="flex flex-col gap-y-1.5 md:items-center md:gap-y-2.5">
                <h3 className="text-xl font-bold md:text-2xl">Connect</h3>
                <Link href={"mailto:illuricharles6@gmail.com"} className="sm:text-sm md:text-base lg:text-lg hover:underline text-gray-200">Email</Link>
                <Link href={"https://www.linkedin.com/in/illuri-charles/"} className="sm:text-sm md:text-base lg:text-lg hover:underline text-gray-200">Linkedin</Link>
            </div>
            </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-8 md:text-base md:mt-11">
            © 2025 Charles Illuri. Built for learning and portfolio purposes.
        </div>
    </footer>
    )
}