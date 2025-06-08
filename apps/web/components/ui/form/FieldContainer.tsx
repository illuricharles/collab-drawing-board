import cn from "../../../lib/utils/cn";


export default function FieldContainer({children, className}: {children: React.ReactNode, className?: string}) {
    return <div className={cn("flex flex-col gap-y-2", className)}>
        {children}
    </div>
}

// "flex flex-col gap-y-2"