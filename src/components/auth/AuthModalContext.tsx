"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { AuthModal } from "./AuthModal";

interface AuthModalContextType {
  isOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  requireAuth: (callback: () => void) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useUser();

  const openAuthModal = () => setIsOpen(true);
  const closeAuthModal = () => setIsOpen(false);

  const requireAuth = (callback: () => void) => {
    if (isSignedIn) {
      callback();
    } else {
      openAuthModal();
    }
  };

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        openAuthModal,
        closeAuthModal,
        requireAuth,
      }}
    >
      {children}
      <AuthModal isOpen={isOpen} onClose={closeAuthModal} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
