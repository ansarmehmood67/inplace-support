import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:bg-gradient-primary-hover hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] shadow-card",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-card",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-card hover:scale-[1.02]",
        secondary: "bg-gradient-secondary text-secondary-foreground hover:bg-secondary/80 shadow-card hover:shadow-elevated",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] font-semibold shadow-elevated animate-pulse-glow",
        success: "bg-success text-success-foreground hover:bg-success/90 hover:shadow-glow shadow-card",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-card",
        info: "bg-info text-info-foreground hover:bg-info/90 shadow-card",
        tab: "bg-card text-card-foreground hover:bg-gradient-primary hover:text-primary-foreground hover:shadow-glow hover:scale-[1.02] shadow-card border border-border",
        "tab-active": "bg-gradient-primary text-primary-foreground shadow-glow scale-[1.02] border border-primary-glow animate-pulse-glow",
        glass: "bg-gradient-glass text-foreground backdrop-blur-lg hover:bg-gradient-primary hover:text-primary-foreground hover:shadow-glow border border-white/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-12 rounded-xl px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
