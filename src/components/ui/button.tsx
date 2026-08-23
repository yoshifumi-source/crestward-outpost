import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-xl font-bold transition-all outline-none select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
        outline: "border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 shadow-2xs",
        secondary: "bg-stone-100 text-stone-800 hover:bg-stone-200",
        ghost: "hover:bg-stone-100 text-stone-600 hover:text-stone-900",
        destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
        link: "text-emerald-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs",
        xs: "h-6 px-2 text-[10px] rounded-lg",
        sm: "h-7 px-2.5 text-xs rounded-lg",
        lg: "h-11 px-6 text-sm rounded-2xl",
        icon: "h-8 w-8 rounded-xl",
        "icon-sm": "h-7 w-7 rounded-lg",
        "icon-lg": "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
