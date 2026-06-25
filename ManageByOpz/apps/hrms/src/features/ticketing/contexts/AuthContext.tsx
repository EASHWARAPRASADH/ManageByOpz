import { SafeAny } from '../types';
import React, { createContext, useContext, useEffect, useState } from "react";
import { Role } from "../lib/roles";

interface AuthContextType {
  user: SafeAny | null;
  profile: SafeAny | null;
  loading: boolean;
  demoLogin: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  demoLogin: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveUser = () => {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      if (userStr && token) {
        try {
          const platformUser = JSON.parse(userStr);
          
          // Map platform role (e.g., ROLE_ADMIN -> admin, ROLE_EMPLOYEE -> user)
          let mappedRole: Role = 'user';
          const platformRole = platformUser.role || '';
          if (platformRole.includes('ADMIN')) {
            mappedRole = 'admin';
          } else if (platformRole.includes('HR')) {
            mappedRole = 'admin';
          } else if (platformRole.includes('MANAGER')) {
            mappedRole = 'sub_admin';
          } else if (platformRole.includes('AGENT')) {
            mappedRole = 'agent';
          }

          const ticketingUser = {
            uid: platformUser.id,
            name: platformUser.name || 'User',
            email: platformUser.email,
            role: mappedRole,
            restrictedModules: platformUser.permissions || [],
            phone: platformUser.phone || '',
            tenantId: platformUser.tenantId || 'default',
          };
          
          setUser({
            uid: platformUser.id,
            email: platformUser.email,
            displayName: platformUser.name,
          });
          setProfile(ticketingUser);
        } catch (e) {
          setUser(null);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    resolveUser();

    // Listen to storage changes or custom login events to keep in sync
    const handleStorageChange = () => {
      resolveUser();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll/check briefly on interval in case storage event doesn't fire on same window
    const interval = setInterval(resolveUser, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const demoLogin = async (role: Role) => {
    console.warn("demoLogin is disabled in unified mode — authentication is handled by the platform");
  };

  const signOut = async () => {
    console.warn("signOut is handled by the platform");
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, demoLogin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
