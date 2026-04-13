import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-zinc-100 text-zinc-900 hover:bg-zinc-200": variant === "default",
            "bg-red-500/10 text-red-500 hover:bg-red-500/20": variant === "destructive",
            "border border-zinc-800 bg-transparent hover:bg-zinc-800 text-zinc-100": variant === "outline",
            "bg-zinc-800 text-zinc-100 hover:bg-zinc-700": variant === "secondary",
            "hover:bg-zinc-800 hover:text-zinc-100 text-zinc-400": variant === "ghost",
            "text-zinc-100 underline-offset-4 hover:underline": variant === "link",
            "h-12 px-4 py-2": size === "default",
            "h-9 rounded-lg px-3": size === "sm",
            "h-14 rounded-2xl px-8 text-base": size === "lg",
            "h-12 w-12": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
