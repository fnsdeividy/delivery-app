import { cn } from "@/lib/utils"
import * as React from "react"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "gradient" | "dark"
  children: React.ReactNode
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-white",
      gradient: "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50",
      dark: "bg-gradient-to-br from-gray-800 via-gray-900 to-indigo-900 text-white"
    }

    return (
      <section
        ref={ref}
        className={cn(
          "py-20 relative overflow-hidden",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </section>
    )
  }
)
Section.displayName = "Section"

export { Section }
