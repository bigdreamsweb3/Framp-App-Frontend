import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[max(0.25rem,0.5vw)] md:gap-2 whitespace-nowrap text-[max(0.85rem,1.6vw)] md:text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[max(0.9rem,1.8vw)] [&_svg:not([class*='size-'])]:md:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[max(0.15rem,0.3vw)] md:focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        soft_gradient: "bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold border border-primary/10 hover:border-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[max(2rem,4vh)] px-[max(0.75rem,1.5vw)] py-[max(0.5rem,1vh)] has-[>svg]:px-[max(0.6rem,1.2vw)] md:h-9 md:px-4 md:py-2 md:has-[>svg]:px-3",
        sm: "h-[max(1.75rem,3.5vh)] rounded-md gap-[max(0.2rem,0.4vw)] px-[max(0.6rem,1.2vw)] has-[>svg]:px-[max(0.5rem,1vw)] md:h-8 md:gap-1.5 md:px-3 md:has-[>svg]:px-2.5",
        lg: "h-[max(2.25rem,4.5vh)] rounded-md px-[max(1rem,2vw)] has-[>svg]:px-[max(0.8rem,1.6vw)] md:h-10 md:px-6 md:has-[>svg]:px-4",
        icon: "size-[max(2rem,4vh)] md:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }