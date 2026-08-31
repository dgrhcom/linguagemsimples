"use client";

import React, { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "w-[400px]",
  md: "w-[600px]",
  lg: "w-[800px]",
  xl: "w-[1100px]"
};

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
  size = "lg",
  showCloseButton = true
}: DrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const borderStyle = side === "right" ? { borderLeft: "1px solid #cccbc8" } : { borderRight: "1px solid #cccbc8" };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ backgroundColor: "rgba(20, 20, 19, 0.6)", backdropFilter: "blur(4px)" }}
        />
        <Dialog.Content
          className={`fixed top-0 ${side === "right" ? "right-0" : "left-0"} z-50 h-full ${sizeClasses[size]} focus:outline-none flex flex-col`}
          style={{ backgroundColor: "#faf9f5", ...borderStyle, boxShadow: "-4px 0 24px rgba(0,0,0,0.15)" }}
          onEscapeKeyDown={onClose}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 p-6 shrink-0" style={{ backgroundColor: "#f0eee6", borderBottom: "1px solid #cccbc8" }}>
              <div className="space-y-1">
                {title && (
                  <Dialog.Title className="text-[20px] font-semibold" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="text-[14px]" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#b0aea5" }}>
                    {description}
                  </Dialog.Description>
                )}
              </div>
              {showCloseButton && (
                <Dialog.Close asChild>
                  <button
                    className="p-2 rounded-[8px] transition-colors"
                    style={{ color: "#b0aea5" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#141413"; e.currentTarget.style.backgroundColor = "rgba(227, 218, 204, 0.4)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#b0aea5"; e.currentTarget.style.backgroundColor = "transparent"; }}
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="shrink-0" style={{ backgroundColor: "#f0eee6", borderTop: "1px solid #cccbc8" }}>
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Sub-components for structured drawer content
export function DrawerHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 shrink-0 ${className}`} style={{ backgroundColor: "#f0eee6", borderBottom: "1px solid #cccbc8" }}>
      {children}
    </div>
  );
}

export function DrawerBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex-1 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}

export function DrawerFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 shrink-0 ${className}`} style={{ backgroundColor: "#f0eee6", borderTop: "1px solid #cccbc8" }}>
      {children}
    </div>
  );
}
