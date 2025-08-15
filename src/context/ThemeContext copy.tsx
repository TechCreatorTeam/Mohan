import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark'; // The actual applied theme (resolves 'system')
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      try {
        // First check localStorage for saved preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          return savedTheme as Theme;
        }
      } catch (error) {
        console.error('Error reading theme from localStorage:', error);
      }
    }
    // Default to light theme instead of system preference
    return 'light';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Function to resolve the actual theme (handles 'system' preference)
  const resolveActualTheme = (themeValue: Theme): 'light' | 'dark' => {
    if (themeValue === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light'; // Fallback for SSR
    }
    return themeValue;
  };

  // Function to apply theme to DOM
  const applyTheme = (themeValue: Theme) => {
    const resolved = resolveActualTheme(themeValue);
    setActualTheme(resolved);

    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;

      // Remove all theme classes
      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');

      // Add the resolved theme class
      root.classList.add(resolved);
      body.classList.add(resolved);

      // Set data attribute for CSS targeting
      root.setAttribute('data-theme', resolved);

      // Store in localStorage for persistence
      try {
        localStorage.setItem('theme', themeValue);
        console.log(`🎨 Theme applied and saved: ${themeValue} (resolved: ${resolved})`);
      } catch (error) {
        console.error('Error saving theme to localStorage:', error);
      }
    }
  };

  // Custom setTheme function that applies and persists the theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const newActualTheme = e.matches ? 'dark' : 'light';
        setActualTheme(newActualTheme);
        
        const root = document.documentElement;
        const body = document.body;
        
        // Update DOM classes
        root.classList.remove('light', 'dark');
        body.classList.remove('light', 'dark');
        root.classList.add(newActualTheme);
        body.classList.add(newActualTheme);
        root.setAttribute('data-theme', newActualTheme);
        
        console.log(`🎨 System theme changed to: ${newActualTheme}`);
      };

      // Add listener for system theme changes
      mediaQuery.addEventListener('change', handleSystemThemeChange);

      // Cleanup listener
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, [theme]);

  // Apply theme immediately on page load (before React hydration)
  useEffect(() => {
    // This ensures theme is applied as early as possible
    const savedTheme = localStorage.getItem('theme') as Theme || 'light';
    const resolved = resolveActualTheme(savedTheme);
    
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      
      // Force apply the saved theme immediately
      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      root.classList.add(resolved);
      body.classList.add(resolved);
      root.setAttribute('data-theme', resolved);
    }
  }, []);

  const value = {
    theme,
    setTheme,
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};