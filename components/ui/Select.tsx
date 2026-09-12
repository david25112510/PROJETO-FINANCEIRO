import { SelectHTMLAttributes, forwardRef, useId } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = "", children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-erro`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-graphite-700">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`rounded-lg border bg-white px-3.5 py-2.5 text-sm text-graphite-900 outline-none transition-colors ${
            error ? "border-danger-500 focus:border-danger-500" : "border-graphite-200 focus:border-navy-500"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-danger-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
