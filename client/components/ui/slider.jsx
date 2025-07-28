import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      {...props}
      className={cn(
        "relative z-10 flex w-full items-center touch-none select-none",
        className
      )}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-[#B7B7B7]">
        <SliderPrimitive.Range className="absolute h-full bg-[#B91E1E] rounded-full" />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb asChild>
        <div className="block h-3.5 w-3.5 rounded-full border border-[#B91E1E] bg-[#B91E1E] ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-[#B91E1E] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
      </SliderPrimitive.Thumb>
      <SliderPrimitive.Thumb asChild>
        <div className="block h-3.5 w-3.5 rounded-full border border-[#B91E1E] bg-[#B91E1E] ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-[#B91E1E] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});

Slider.displayName = "Slider";
export { Slider };
