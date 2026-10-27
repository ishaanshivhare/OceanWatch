"use client";

import React, { createContext, useContext, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured, CLERK_PUBLISHABLE_KEY } from "@/lib/auth-config";

interface DemoAuthContextType {
  isClerkActive: boolean;
  demoUser: {
    name: string;
    email: string;
    role: string;
    avatar: string;
  } | null;
  loginDemo: (name?: string) => void;
  logoutDemo: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType>({
  isClerkActive: false,
  demoUser: null,
  loginDemo: () => {},
  logoutDemo: () => {},
});

export const useAppAuth = () => useContext(DemoAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [demoUser, setDemoUser] = useState<{
    name: string;
    email: string;
    role: string;
    avatar: string;
  } | null>({
    name: "Commander Arjun Rao",
    email: "arjun.rao@oceanwatch.org",
    role: "Certified Coastal Observer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  });

  const loginDemo = (name = "Commander Arjun Rao") => {
    setDemoUser({
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@oceanwatch.org`,
      role: "Certified Coastal Observer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    });
  };

  const logoutDemo = () => {
    setDemoUser(null);
  };

  // If valid Clerk keys exist, wrap with ClerkProvider
  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <DemoAuthContext.Provider
          value={{ isClerkActive: true, demoUser: null, loginDemo, logoutDemo }}
        >
          {children}
        </DemoAuthContext.Provider>
      </ClerkProvider>
    );
  }

  // Fallback demo auth context when Clerk keys are placeholders
  return (
    <DemoAuthContext.Provider
      value={{ isClerkActive: false, demoUser, loginDemo, logoutDemo }}
    >
      {children}
    </DemoAuthContext.Provider>
  );
}
