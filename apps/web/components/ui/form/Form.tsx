import { cva, VariantProps } from "class-variance-authority";
import cn from "../../../lib/utils/cn";

const formVariants = cva(
    "flex flex-col gap-y-4",
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

interface Props extends React.FormHTMLAttributes<HTMLFormElement>, VariantProps<typeof formVariants> {

}

export default function Form({children, variant, className, ...props}: Props) {
    return <form className={cn(formVariants({variant}), className)} {...props}>
        {children}
    </form>
}