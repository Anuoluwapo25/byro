import React from "react";

interface SignupButtonProps {
  onClick: () => void;
  text?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const SignupButton: React.FC<SignupButtonProps> = ({ 
  onClick, 
  text = "Sign In",
  disabled = false,
  loading = false,
  className = "",
  type = "button"
}) => {
  const baseClasses = "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out shadow-md hover:shadow-lg";
  const disabledClasses = "opacity-50 cursor-not-allowed";
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${disabled ? disabledClasses : ''} ${className}`}
      aria-label={text}
    >
      {text}
    </button>
  );
};

export default SignupButton; 