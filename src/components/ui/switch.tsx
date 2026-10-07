"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

/**
 * Atlassian Design System toggle (@atlaskit/toggle).
 * Blue (B400) track with a check glyph when on; neutral (N200) track
 * with a cross glyph when off. 40x20 (large) sizing, 16px thumb.
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group peer relative inline-flex h-5 w-10 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-150 outline-none",
        "data-[state=checked]:bg-[#0052CC] data-[state=checked]:hover:bg-[#0065FF]",
        "data-[state=unchecked]:bg-[#6B7280] data-[state=unchecked]:hover:bg-[#6B7280]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C9AFF]",
        "disabled:cursor-not-allowed disabled:bg-[#F3F3F5] disabled:hover:bg-[#F3F3F5]",
        className,
      )}
      {...props}
    >
      {/* check glyph (left, visible when on) */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute left-[3px] size-3 text-white opacity-0 transition-opacity duration-150 group-data-[state=checked]:opacity-100"
      >
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* cross glyph (right, visible when off) */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute right-[3px] size-3 text-white opacity-0 transition-opacity duration-150 group-data-[state=unchecked]:opacity-100"
      >
        <path
          d="M6.5 6.5l11 11M17.5 6.5l-11 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-white shadow-[0_1px_1px_rgba(9,30,66,0.25)] transition-transform duration-150 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
