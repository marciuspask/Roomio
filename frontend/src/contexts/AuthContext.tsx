import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockCurrentUser } from "@/data/mockData";

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: typeof mockCurrentUser;
  toggleLogin: () => void;
  setPhoneVerified: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(mockCurrentUser.isPhoneVerified);

  const currentUser = { ...mockCurrentUser, isPhoneVerified: phoneVerified };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      currentUser,
      toggleLogin: () => setIsLoggedIn(p => !p),
      setPhoneVerified,
    }}>
      {children}
      <button
        onClick={() => setIsLoggedIn(p => !p)}
        className="fixed bottom-4 right-4 z-50 rounded-lg border border-border bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-sm hover:bg-accent transition-colors"
      >
        Dev: {isLoggedIn ? "Logged in ✓" : "Logged out"}
      </button>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
