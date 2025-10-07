import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700",
        gradientGreen:
          "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700",
        white: "bg-white text-purple-700 hover:bg-gray-50",
        purple: "bg-purple-500 text-white hover:bg-purple-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 px-12 py-5 text-xl",
        icon: "h-10 w-10",
      },
      loading: {
        true: "relative",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  preventDoubleClick?: boolean;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void | Promise<void>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      preventDoubleClick = true,
      onClick,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleClick = React.useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading || isProcessing) {
          event.preventDefault();
          return;
        }

        if (preventDoubleClick) {
          setIsProcessing(true);
        }

        try {
          if (onClick) {
            const result = onClick(event);
            if (result && typeof result.then === "function") {
              setIsLoading(true);
              await result;
            }
          }
        } catch (error) {
          console.error("Erro no clique do botão:", error);
          throw error;
        } finally {
          setIsLoading(false);
          setIsProcessing(false);
        }
      },
      [disabled, isLoading, isProcessing, preventDoubleClick, onClick]
    );

    const isDisabled = disabled || isLoading || isProcessing;
    const showLoading = loading || isLoading;
    const displayText = showLoading && loadingText ? loadingText : children;

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, loading: showLoading, className })
        )}
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {showLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {displayText}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
