import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "@/components/ui/Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-gradient-to-r from-ink to-navy-700 text-white shadow-[0_10px_24px_-14px_rgba(11,21,38,.8)] hover:from-navy-900 hover:to-navy-600 focus-visible:outline-aqua-500",
  secondary:
    "bg-white text-graphite-800 border border-graphite-200 shadow-sm hover:bg-graphite-50 focus-visible:outline-aqua-500",
  ghost: "bg-transparent text-graphite-600 hover:bg-graphite-100 focus-visible:outline-aqua-500",
  danger: "bg-danger-500 text-white hover:bg-danger-600 focus-visible:outline-danger-500",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading = false, disabled, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {loading && <Spinner size={16} />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
