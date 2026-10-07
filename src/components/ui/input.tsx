import * as React from "react";

import { cn } from "./utils";

/**
 * Atlassian Design System textfield (@atlaskit/textfield):
 * 40px height, 3px radius, 2px N40 border, N10 fill;
 * hover N30 fill; focus → white fill + B200 border. No focus ring.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-lg border border-[#EBEBEB] bg-[#FAFAFB] px-3 py-1.5 text-sm text-[#6B7280] transition-[background-color,border-color] duration-150 outline-none",
        "placeholder:text-[#8F8F8F]",
        "hover:bg-[#F2F2F2]",
        "focus:border-[#0052CC] focus:bg-white",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#6B7280]",
        "read-only:bg-[#F3F3F5] read-only:text-[#6B7280]",
        "disabled:pointer-events-none disabled:border-[#F3F3F5] disabled:bg-[#F3F3F5] disabled:text-[#ADADAD]",
        "aria-invalid:border-[#DE350B]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
