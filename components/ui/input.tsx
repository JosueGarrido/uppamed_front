import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-medical-200 bg-white px-3 py-2 text-sm text-medical-900 placeholder:text-medical-400",
        "focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-medical-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors duration-200",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "selection:bg-medical-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
