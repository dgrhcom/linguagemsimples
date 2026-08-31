"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw] max-h-[95vh]"
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ backgroundColor: "rgba(20, 20, 19, 0.6)", backdropFilter: "blur(4px)" }}
        />
        <Dialog.Content
          className={`fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full ${sizeClasses[size]} rounded-[24px] shadow-lg p-6 focus:outline-none`}
          style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}
          onEscapeKeyDown={onClose}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 mb-4">
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
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Sub-components for structured modal content
export function ModalHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function ModalBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-end gap-3 mt-6 pt-4 ${className}`} style={{ borderTop: "1px solid #cccbc8" }}>
      {children}
    </div>
  );
}
