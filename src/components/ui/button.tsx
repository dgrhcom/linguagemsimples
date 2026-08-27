import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "success" | "info" | "warning";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper border border-slate hover:bg-ink-light text-charcoal",
  secondary: "bg-transparent text-charcoal border border-sand hover:bg-sand/50",
  ghost: "text-stone hover:text-ink hover:bg-sand/40",
  destructive: "bg-error-light hover:bg-error text-error-dark border border-error-border",
  success: "bg-success hover:bg-success-dark text-white border border-success-dark",
  info: "bg-info-light hover:bg-info text-info-dark border border-info-border",
  warning: "bg-warning-light hover:bg-warning text-warning-dark border border-warning-border",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "text-[10px] px-2 py-1 rounded-btn gap-1",
  sm: "text-xs px-2.5 py-1.5 rounded-btn gap-1.5",
  md: "text-xs px-3.5 py-2 rounded-btn gap-1.5",
  lg: "text-sm px-5 py-2.5 rounded-btn gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "font-semibold transition-all inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <button
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
