import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl active:bg-blue-800 transform hover:-translate-y-0.5",
        destructive:
          "bg-red-500 text-white shadow-lg hover:bg-red-600 hover:shadow-xl active:bg-red-700 transform hover:-translate-y-0.5",
        outline:
          "border border-gray-300 bg-white text-gray-700 shadow-md hover:bg-gray-50 hover:text-gray-900 hover:shadow-lg transform hover:-translate-y-0.5",
        secondary:
          "bg-gray-100 text-gray-900 shadow-md hover:bg-gray-200 hover:shadow-lg active:bg-gray-300 transform hover:-translate-y-0.5",
        ghost:
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md transform hover:-translate-y-0.5",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-800",
        success:
          "bg-green-500 text-white shadow-lg hover:bg-green-600 hover:shadow-xl active:bg-green-700 transform hover:-translate-y-0.5",
        warning:
          "bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 hover:shadow-xl active:bg-yellow-700 transform hover:-translate-y-0.5",
        info:
          "bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl active:bg-blue-700 transform hover:-translate-y-0.5",
        medical:
          "bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl active:bg-blue-800 transform hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
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
