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
  primary: "bg-clay text-white border border-clay-deep hover:bg-clay-deep",
  secondary: "bg-transparent text-slate-dark border border-cloud-dark hover:bg-oat-warm/50",
  ghost: "text-cloud-medium hover:text-slate-dark hover:bg-oat-warm/40",
  destructive: "bg-error-light hover:bg-error text-error-dark border border-error-border",
  success: "bg-success hover:bg-success-dark text-white border border-success-dark",
  info: "bg-info-light hover:bg-info text-info-dark border border-info-border",
  warning: "bg-warning-light hover:bg-warning text-warning-dark border border-warning-border",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "text-[10px] px-2 py-1 rounded-[8px] gap-1",
  sm: "text-[12px] px-2.5 py-1.5 rounded-[8px] gap-1.5",
  md: "text-[12px] px-3.5 py-2 rounded-[8px] gap-1.5",
  lg: "text-[16px] px-5 py-2.5 rounded-[8px] gap-2",
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
