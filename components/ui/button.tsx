import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[max(0.25rem,0.5vw)] md:gap-2 whitespace-nowrap text-sm md:text-[15px] font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[max(0.9rem,1.8vw)] [&_svg:not([class*='size-'])]:md:size-4 shrink-0 [&_svg]:shrink-0 outline-none rounded-xl backdrop-blur-sm relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_2px_8px_rgba(var(--primary-rgb),0.25)] hover:shadow-[0_4px_14px_rgba(var(--primary-rgb),0.35)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-[0_2px_6px_rgba(var(--destructive-rgb),0.25)]",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[0_0_8px_rgba(var(--border-rgb),0.3)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_2px_8px_rgba(var(--secondary-rgb),0.2)]",
        ghost:
          "hover:bg-accent/30 hover:text-accent-foreground dark:hover:bg-accent/40 shadow-[0_0_10px_rgba(var(--primary-rgb),0.15)] hover:shadow-[0_0_14px_rgba(var(--primary-rgb),0.25)] transition-all duration-200",
        soft_gradient:
          "bg-gradient-to-r from-primary/15 to-primary/10 border border-primary/20 text-foreground/90 dark:text-foreground font-semibold hover:from-primary/25 hover:to-primary/15 hover:border-primary/50 shadow-[0_0_10px_rgba(var(--primary-rgb),0.15)] hover:shadow-[0_0_14px_rgba(var(--primary-rgb),0.25)]",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-[max(2rem,4vh)] px-[max(0.75rem,1.5vw)] py-[max(0.5rem,1vh)] md:h-9 md:px-4 md:py-2",
        sm: "h-[max(1.75rem,3.5vh)] px-[max(0.6rem,1.2vw)] md:h-8 md:px-3 rounded-lg",
        lg: "h-[max(2.25rem,4.5vh)] px-[max(1rem,2vw)] md:h-10 md:px-6 rounded-xl",
        icon: "size-[max(2rem,4vh)] md:size-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
