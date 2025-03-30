"use client";
import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'light' | 'dark';

export interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  toggleTheme: () => { },
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');

  // Apply the theme to the document and persist it in localStorage
  useEffect(() => {
    // Check for stored theme preference
    const storedTheme = localStorage.getItem('theme') as ThemeType | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else {
      // Default to 'light' theme
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Function to toggle between 'light' and 'dark' themes
  const toggleTheme = () => {
    const newTheme: ThemeType = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

