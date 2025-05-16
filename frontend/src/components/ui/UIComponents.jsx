import React from 'react';

/**
 * Button component with different variants
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (primary, secondary, accent, outline, text)
 * @param {boolean} props.fullWidth - Whether the button should take full width
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element}
 */
export const Button = ({
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs rounded-md',
    md: 'px-4 py-3 text-sm rounded-lg',
    lg: 'px-6 py-4 text-base rounded-lg',
  };

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 border border-transparent',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400 border border-transparent',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400 border border-transparent',
    outline: 'border-2 border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-500',
    text: 'text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-500 border border-transparent',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Input component
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {string} props.type - Input type
 * @param {string} props.id - Input id
 * @param {string} props.name - Input name
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Whether the input is required
 * @returns {JSX.Element}
 */
export const Input = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        className={`block w-full px-4 py-3 border ${error ? 'border-red-300' : 'border-gray-300'}
          rounded-lg shadow-input focus:outline-none focus:ring-2
          ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-primary-500 focus:border-primary-500'}
          text-base ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

/**
 * Card component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional classes
 * @returns {JSX.Element}
 */
export const Card = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-soft p-6 transition-all duration-200 hover:shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Select component
 * @param {Object} props - Component props
 * @param {string} props.label - Select label
 * @param {string} props.error - Error message
 * @param {Array} props.options - Select options
 * @param {string} props.id - Select id
 * @param {string} props.name - Select name
 * @param {boolean} props.required - Whether the select is required
 * @returns {JSX.Element}
 */
export const Select = ({
  label,
  error,
  options = [],
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        className={`block w-full pl-4 pr-10 py-3 text-base border
          ${error ? 'border-red-300' : 'border-gray-300'}
          rounded-lg shadow-input focus:outline-none focus:ring-2
          ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-primary-500 focus:border-primary-500'}
          ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

/**
 * Badge component
 * @param {Object} props - Component props
 * @param {string} props.variant - Badge variant (primary, secondary, accent, success, warning, error)
 * @param {React.ReactNode} props.children - Badge content
 * @returns {JSX.Element}
 */
export const Badge = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    accent: 'bg-accent-100 text-accent-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default {
  Button,
  Input,
  Card,
  Select,
  Badge,
};
