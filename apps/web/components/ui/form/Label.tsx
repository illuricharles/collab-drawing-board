import { cva, VariantProps } from "class-variance-authority";
import cn from "../../../lib/utils/cn";

const labelVariants = cva(
    "font-medium text-sm inline-block",
    {
        variants: {
            variant: {
                default: ""
            },
            size: {
                default: ""
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
)

export interface LabelTypes extends VariantProps<typeof labelVariants>, React.LabelHTMLAttributes<HTMLLabelElement>{

}

export default function Label({children,className,variant, size, ...props}: LabelTypes) {
    return <label className={cn(labelVariants({variant, size}), className)} {...props}>{children}</label>
}