import React from 'react';
import { Button as BootstrapButton, Form, Card as BootstrapCard, Badge as BootstrapBadge } from 'react-bootstrap';

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
  // Map our custom variants to Bootstrap variants
  const variantMap = {
    primary: 'purple',
    secondary: 'pink',
    accent: 'green',
    outline: 'outline-purple',
    text: 'link',
    error: 'danger'
  };

  // Map our custom sizes to Bootstrap sizes
  const sizeMap = {
    sm: 'sm',
    md: '',
    lg: 'lg'
  };

  const bootstrapVariant = variantMap[variant] || 'primary';
  const bootstrapSize = sizeMap[size];

  return (
    <BootstrapButton
      variant={bootstrapVariant}
      size={bootstrapSize}
      disabled={disabled}
      className={`${fullWidth ? 'w-100' : ''} ${className}`}
      {...props}
    >
      {children}
    </BootstrapButton>
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
    <Form.Group className="mb-3">
      {label && (
        <Form.Label htmlFor={props.id}>
          {label} {props.required && <span className="text-danger">*</span>}
        </Form.Label>
      )}
      <Form.Control
        className={className}
        isInvalid={!!error}
        {...props}
      />
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
    </Form.Group>
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
    <BootstrapCard
      className={`custom-card ${className}`}
      {...props}
    >
      <BootstrapCard.Body>
        {children}
      </BootstrapCard.Body>
    </BootstrapCard>
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
    <Form.Group className="mb-3">
      {label && (
        <Form.Label htmlFor={props.id}>
          {label} {props.required && <span className="text-danger">*</span>}
        </Form.Label>
      )}
      <Form.Select
        className={className}
        isInvalid={!!error}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
    </Form.Group>
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
  // Map our custom variants to Bootstrap variants
  const variantMap = {
    primary: 'primary',
    secondary: 'secondary',
    accent: 'success',
    success: 'success',
    warning: 'warning',
    error: 'danger',
  };

  const bootstrapVariant = variantMap[variant] || 'primary';

  return (
    <BootstrapBadge
      bg={bootstrapVariant}
      className={`${className}`}
      pill
      {...props}
    >
      {children}
    </BootstrapBadge>
  );
};

export default {
  Button,
  Input,
  Card,
  Select,
  Badge,
};
