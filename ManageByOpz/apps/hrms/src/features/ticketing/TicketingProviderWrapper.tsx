import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { TicketsProvider } from './contexts/TicketsContext';
import { ActivityTrackerProvider } from './contexts/ActivityTrackerContext';

export const TicketingProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <BrandingProvider>
        <TicketsProvider>
          <ActivityTrackerProvider>
            {children}
          </ActivityTrackerProvider>
        </TicketsProvider>
      </BrandingProvider>
    </AuthProvider>
  );
};
