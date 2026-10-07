"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "./utils";

/**
 * Atlassian Design System tabs.
 * Left-aligned text row, 2px underline indicator on the selected tab,
 * blue (B400) selected/hover text - matching @atlaskit/tabs.
 */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "flex w-full items-center justify-start gap-1 overflow-x-auto shadow-[inset_0_-2px_0_0_#F2F2F2]",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap bg-transparent px-2 py-2 text-sm font-medium text-[#6B7280] outline-none transition-colors duration-150",
        "hover:text-[#0065FF]",
        "data-[state=active]:text-[#0052CC]",
        // 2px underline indicator
        "after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-t-[1px] after:bg-transparent after:content-['']",
        "data-[state=active]:after:bg-[#0052CC]",
        "focus-visible:rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4C9AFF]",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
