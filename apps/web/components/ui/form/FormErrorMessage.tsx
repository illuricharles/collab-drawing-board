import cn from "../../../lib/utils/cn";

export default function FormError({message, className}: {message: string, className?:string}) {
    return <p className={cn("text-xs text-red-600 font-medium -my-1.5  bottom-0 pl-1.5", className)}>{message}</p>
}