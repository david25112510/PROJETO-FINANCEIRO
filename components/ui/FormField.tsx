import { InputHTMLAttributes, forwardRef, useId } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

/**
 * Input com label e validação inline — componente obrigatório do design system.
 * Trata o estado de erro via aria-invalid/aria-describedby para leitores de tela.
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-erro`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-graphite-700">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`rounded-lg border px-3.5 py-2.5 text-sm text-graphite-900 outline-none transition-colors placeholder:text-graphite-400 ${
            error
              ? "border-danger-500 focus:border-danger-500"
              : "border-graphite-200 focus:border-navy-500"
          } ${className}`}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-sm text-danger-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";
