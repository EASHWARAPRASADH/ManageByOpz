import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 1. Load saved theme during application startup before page render
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Log "Theme Loaded From Storage"
    console.log(`[Theme System] Theme Loaded From Storage: ${savedTheme}`);
    
    // Default to 'dark' if no saved preference
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  });

  const applyTheme = (targetTheme: Theme) => {
    // Apply dark mode using classList.add / remove
    if (targetTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Console verification logs
    console.log(`[Theme System] Current Theme: ${targetTheme}`);
    console.log(`[Theme System] Root HTML Dark Class Status: ${document.documentElement.classList.contains('dark')}`);
  };

  // Sync state changes to localStorage and DOM
  useEffect(() => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
