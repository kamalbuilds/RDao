import React from 'react';

const Button: React.FC<{
  children: React.ReactElement | string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-500 px-2 py-2 rounded-lg text-white ${
        disabled ? 'opacity-50' : ''
      }`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
