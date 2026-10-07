import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

/**
 * Atlassian Design System buttons (@atlaskit/button).
 * 32px height, 3px radius, 500 weight. Variant → ADS appearance:
 *   default/primary       → primary  (B400, hover B300, active B500)
 *   secondary/outline     → default  (neutral subtle fill)
 *   tertiary/link         → link     (blue text, underline on hover)
 *   ghost                 → subtle   (transparent, neutral hover fill)
 *   destructive           → danger   (R400, hover R300)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,border-color,color,transform] duration-100 active:scale-[0.98] disabled:pointer-events-none disabled:bg-[rgba(9,30,66,0.04)] disabled:text-[#ADADAD] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C9AFF]",
  {
    variants: {
      variant: {
        // Primary - bold blue
        default: "bg-[#0052CC] text-white hover:bg-[#0065FF] active:bg-[#0747A6]",
        primary: "bg-[#0052CC] text-white hover:bg-[#0065FF] active:bg-[#0747A6]",

        // Default (ADS) - neutral subtle fill
        secondary: "border border-[#EBEBEB] bg-white text-[#2E2E2E] hover:bg-[#F3F3F5] active:bg-[#EBEBEB]",
        outline: "border border-[#EBEBEB] bg-white text-[#2E2E2E] hover:bg-[#F3F3F5] active:bg-[#EBEBEB]",

        // Link - blue text only
        tertiary: "bg-transparent text-[#0052CC] hover:text-[#0065FF] hover:underline underline-offset-2 active:text-[#0747A6] disabled:bg-transparent",
        link: "bg-transparent text-[#0052CC] hover:text-[#0065FF] hover:underline underline-offset-2 active:text-[#0747A6] disabled:bg-transparent",

        // Subtle - transparent until hovered
        ghost: "bg-transparent text-[#6B7280] hover:bg-[rgba(9,30,66,0.08)] active:bg-[#EBF3FF] active:text-[#0052CC] disabled:bg-transparent",

        // Danger
        destructive: "bg-[#DE350B] text-white hover:bg-[#FF5630] active:bg-[#BF2600]",

        // Legacy alias used by the top navigation
        "demo-primary": "bg-[#0052CC] text-white hover:bg-[#0065FF] active:bg-[#0747A6] border border-[#0052CC] hover:border-[#0065FF]",
      },
      size: {
        default: "h-8 px-3 has-[>svg]:px-2.5",
        sm: "h-8 px-2.5 has-[>svg]:px-2",
        compact: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5",
        lg: "h-10 px-4 has-[>svg]:px-3",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
