import cn from "../../lib/utils/cn"

export default function AuthContainer({children, className}: {
    children: React.ReactNode,
    className?: string
}) {
    return <div className={cn("bg-white border border-slate-200 rounded-md px-5 py-6 min-w-fit", className)}>
        {children}
    </div>
}

// "bg-white border border-slate-200 rounded-md px-5 py-6 min-w-fit"