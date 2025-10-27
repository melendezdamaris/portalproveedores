import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className = '', ...props }, ref) => {
    const inputClasses = `w-full px-3 py-2 border rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent focus:border-transparent transition-colors ${
      error 
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-neo-gray-300 hover:border-neo-gray-400'
    } ${className}`;

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-neo-gray-700 mb-1 font-montserrat">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 font-montserrat">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-1 text-sm text-neo-gray-500 font-montserrat">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, className = '', ...props }, ref) => {
    const textareaClasses = `w-full px-3 py-2 border rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent focus:border-transparent transition-colors resize-none ${
      error 
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-neo-gray-300 hover:border-neo-gray-400'
    } ${className}`;

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-neo-gray-700 mb-1 font-montserrat">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={textareaClasses}
          rows={4}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 font-montserrat">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-1 text-sm text-neo-gray-500 font-montserrat">{helper}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helper, options, className = '', ...props }, ref) => {
    const selectClasses = `w-full px-3 py-2 border rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-neo-accent focus:border-transparent transition-colors ${
      error 
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-neo-gray-300 hover:border-neo-gray-400'
    } ${className}`;

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-neo-gray-700 mb-1 font-montserrat">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          <option value="">Seleccionar...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600 font-montserrat">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-1 text-sm text-neo-gray-500 font-montserrat">{helper}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';