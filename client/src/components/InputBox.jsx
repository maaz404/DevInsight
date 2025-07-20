import React from 'react';

const InputBox = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text', 
  required = false,
  disabled = false,
  helperText,
  error
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-300 ${
          error 
            ? 'border-red-300 bg-red-50' 
            : disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      />
      {(helperText || error) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}

export default InputBox;
