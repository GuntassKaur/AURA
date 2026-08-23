'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark'; // Lifesphere is locked to dark mode by design

const ThemeContext = createContext<{ theme: Theme }>({ theme: 'dark' });

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    // Inject global theme tags and variables into Document body
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
