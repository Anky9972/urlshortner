import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold text-sm rounded-xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(230,15%,5%)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"

const variants = {
  default: "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_4px_20px_-4px_hsl(220,90%,56%,0.5)]",
  destructive: "bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_4px_20px_-4px_hsl(0,72%,51%,0.4)]",
  outline: "border border-[hsl(230,10%,20%)] bg-transparent text-slate-300 hover:bg-[hsl(230,10%,12%)] hover:text-white hover:border-[hsl(230,10%,25%)]",
  secondary: "bg-[hsl(230,10%,14%)] text-slate-200 border border-[hsl(230,10%,20%)] hover:bg-[hsl(230,10%,18%)] hover:border-[hsl(230,10%,25%)]",
  ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
  link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300 bg-transparent",
}

const sizes = {
  default: "h-10 px-5 py-2",
  sm: "h-9 px-3.5 text-xs rounded-lg",
  lg: "h-12 px-8 text-base rounded-xl",
  icon: "h-10 w-10 p-0",
}

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(base, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

const buttonVariants = ({ variant = "default", size = "default", className = "" } = {}) =>
  cn(base, variants[variant], sizes[size], className)

export { Button, buttonVariants }
