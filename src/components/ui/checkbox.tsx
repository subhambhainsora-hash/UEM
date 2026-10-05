"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "./utils";

/**
 * Atlassian Design System checkbox - 16px, 3px radius, 2px N40 border,
 * N10 fill; checked → B400 fill with white check.
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border-2 border-[#EBEBEB] bg-[#FAFAFB] transition-colors duration-150 outline-none",
        "hover:bg-[#F2F2F2]",
        "data-[state=checked]:border-[#0052CC] data-[state=checked]:bg-[#0052CC] data-[state=checked]:text-white data-[state=checked]:hover:border-[#0065FF] data-[state=checked]:hover:bg-[#0065FF]",
        "data-[state=indeterminate]:border-[#0052CC] data-[state=indeterminate]:bg-[#0052CC] data-[state=indeterminate]:text-white",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C9AFF]",
        "disabled:cursor-not-allowed disabled:border-[#F3F3F5] disabled:bg-[#F3F3F5]",
        "aria-invalid:border-[#DE350B]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
