import { cva, VariantProps } from "class-variance-authority";
import cn from "../../../lib/utils/cn";

const inputVariants = cva(
    "border border-gray-400 py-1.5 px-3 rounded inline-block text-sm text-gray-700 font-semibold",
    {
        variants: {
            variant: {
                default: ""
            }
        },
        defaultVariants: {
            variant: "default"
        }
    }
)

interface InputProps extends VariantProps<typeof inputVariants>, React.InputHTMLAttributes<HTMLInputElement> {

}

export default function Input({variant,className, ...props}: InputProps) {
    return <input {...props} className={cn(inputVariants({variant}), className)}/>
}