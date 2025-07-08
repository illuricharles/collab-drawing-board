import cn from "../lib/utils/cn";

interface IconWrapperProps {
  icon: React.ElementType; // like RectangleHorizontalIcon
  className?: string;
  onClick?: () => void,
  isActive: boolean
}

export function ToolbarButton({ icon: Icon, className, onClick, isActive=false }: IconWrapperProps) {
  return <button className={`cursor-pointer px-0.5 m-0.5 rounded-lg ${cn(isActive? "bg-red-200": "")}`} onClick={onClick}>
    <Icon className={cn("text-black size-7 md:size-9", className)} />
  </button>
}
