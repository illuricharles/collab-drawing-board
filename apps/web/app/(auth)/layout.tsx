export default function Layout({children}: {children: React.ReactNode}) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center p-3 sm:p-5">
        {children}
    </div>
}