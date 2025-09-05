import React from 'react';

interface TextareaFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  rows?: number;
  className?: string;
  required?: boolean;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  rows = 4,
  className = "",
  required = false 
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-vertical"
      />
    </div>
  );
};

export default TextareaField;