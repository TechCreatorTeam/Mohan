import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Apply saved theme and color palette immediately on page load (before React renders)
const applyInitialTheme = () => {
  try {
    // Apply saved theme first
    const savedTheme = localStorage.getItem('theme') || 'light';
    const resolveTheme = (theme: string) => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme === 'dark' ? 'dark' : 'light';
    };
    
    const actualTheme = resolveTheme(savedTheme);
    
    // Apply theme classes immediately
    document.documentElement.classList.remove('light', 'dark');
    document.body.classList.remove('light', 'dark');
    document.documentElement.classList.add(actualTheme);
    document.body.classList.add(actualTheme);
    document.documentElement.setAttribute('data-theme', actualTheme);
    
    console.log(`🎨 Initial theme applied: ${savedTheme} (resolved: ${actualTheme})`);
    
    // Apply saved color palette
    const savedSettings = localStorage.getItem('marketplace_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.colorPalette) {
        // Apply palette class to body immediately
        document.body.classList.add(`palette-${settings.colorPalette}`);
        document.body.classList.add('palette-default');
      }
    } else {
      // Apply default palette
      document.body.classList.add('palette-default');
    }
  } catch (error) {
    console.error('Error applying initial theme and palette:', error);
    // Apply safe defaults
    document.documentElement.classList.add('light');
    document.body.classList.add('light', 'palette-ocean-blue');
  }
};

// Apply saved color palette immediately on page load (legacy function)
const applySavedColorPalette = () => {
  try {
    const savedSettings = localStorage.getItem('marketplace_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.colorPalette) {
        // Apply palette class to body immediately
        document.body.classList.add(`palette-${settings.colorPalette}`);
        console.log(`🎨 Applied saved color palette on load: ${settings.colorPalette}`);
      }
    }
  } catch (error) {
    console.error('Error applying saved color palette:', error);
    // Apply default palette
    document.body.classList.add('palette-ocean-blue');
  }
};

// Apply theme and color palette before React renders
applyInitialTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);