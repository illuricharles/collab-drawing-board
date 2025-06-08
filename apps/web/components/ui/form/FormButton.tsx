import { cva, VariantProps } from "class-variance-authority";
import cn from "../../../lib/utils/cn";

const formButtonVariants = cva(
    "border-none px-2 py-1.5 rounded-md inline-block mt-2 cursor-pointer",
    {
        variants: {
            variant: {
                default: "text-white bg-black"
            },
        },
        defaultVariants: {
            variant: "default"
        }
    }
)

interface Props extends VariantProps<typeof formButtonVariants>, React.ButtonHTMLAttributes<HTMLButtonElement> {

}

export default function FormButton({children,className,variant, ...props}: Props) {
    return <button {...props} className={cn(formButtonVariants({variant}), className)}>
        {children}
    </button>
}