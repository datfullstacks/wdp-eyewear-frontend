import React from 'react';
import { Input, Select, Textarea } from '../atoms';

interface FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
  label: string;
  name: string;
  value?: string | number;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  options = [],
  disabled = false,
}) => {
  if (type === 'select') {
    return (
      <Select
        label={label}
        id={name}
        name={name}
        value={value as string}
        onChange={onChange}
        options={options}
        error={error}
        disabled={disabled}
        required={required}
      />
    );
  }

  if (type === 'textarea') {
    return (
      <Textarea
        label={label}
        id={name}
        name={name}
        value={value as string}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        required={required}
      />
    );
  }

  return (
    <Input
      type={type}
      label={label}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      disabled={disabled}
      required={required}
    />
  );
};
