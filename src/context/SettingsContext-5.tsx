import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface MarketplaceSettings {
  automaticDeliveryEnabled: boolean;
  paymentProcessingEnabled: boolean;
  emailNotificationsEnabled: boolean;
  orderAutoConfirmation: boolean;
  documentAutoGeneration: boolean;
  showPricesOnProjects: boolean;
  enableCheckoutProcess: boolean;
  marketplaceMode: boolean; // Master toggle for marketplace vs portfolio
  colorPalette: string; // Add color palette setting
  lastUpdated: string;
  // Profile/contact fields
  githubUrl?: string;
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  phoneAvailableOnRequest?: boolean;
  showReview1?: boolean;
  showReview2?: boolean;
  showReview3?: boolean;
  // Marketplace payment method toggles
  enableUPI?: boolean;
  enableCard?: boolean;
}

interface SettingsContextType {
  settings: MarketplaceSettings;
  updateSettings: (newSettings: Partial<MarketplaceSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isPortfolioMode: boolean; // Computed property for easy access
  isMarketplaceMode: boolean; // Computed property for easy access
}

const defaultSettings: MarketplaceSettings = {
  automaticDeliveryEnabled: true,
  paymentProcessingEnabled: true,
  emailNotificationsEnabled: true,
  orderAutoConfirmation: true,
  documentAutoGeneration: true,
  showPricesOnProjects: true,
  enableCheckoutProcess: true,
  marketplaceMode: true, // Default to marketplace mode
  colorPalette: 'copper-brown', // Default color palette
  lastUpdated: new Date().toISOString(),
  githubUrl: '',
  linkedinUrl: '',
  email: '',
  phone: '',
  phoneAvailableOnRequest: true,
  showReview1: true,
  showReview2: true,
  showReview3: true,
  enableUPI: false, // Default: UPI disabled
  enableCard: true  // Default: Card enabled
};

// Color palette definitions
const colorPalettes = {
  'default': {
    primary: '#b45309',
    primaryDark: '#92400e',
    secondary: '#78350f',
    accent: '#451a03',
    bgPrimary: '#fefbf3',
    bgSecondary: '#fef3c7',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  },
  'emerald-green': {
    primary: '#10b981',
    primaryDark: '#059669',
    secondary: '#047857',
    accent: '#065f46',
    bgPrimary: '#f0fdf4',
    bgSecondary: '#dcfce7',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  },
  'violet-indigo': {
    primary: '#8b5cf6',
    primaryDark: '#7c3aed',
    secondary: '#6d28d9',
    accent: '#5b21b6',
    bgPrimary: '#faf5ff',
    bgSecondary: '#f3e8ff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  },
  'rose-magenta': {
    primary: '#f43f5e',
    primaryDark: '#e11d48',
    secondary: '#be123c',
    accent: '#9f1239',
    bgPrimary: '#fff1f2',
    bgSecondary: '#ffe4e6',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  },
  'amber-caramel': {
    primary: '#f59e0b',
    primaryDark: '#d97706',
    secondary: '#b45309',
    accent: '#92400e',
    bgPrimary: '#fffbeb',
    bgSecondary: '#fef3c7',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  },
  'cool-cyan': {
    primary: '#06b6d4',
    primaryDark: '#0891b2',
    secondary: '#0e7490',
    accent: '#155e75',
    bgPrimary: '#f0fdfa',
    bgSecondary: '#ccfbf1',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  },
  'copper-brown': {
    primary: '#b45309',
    primaryDark: '#92400e',
    secondary: '#78350f',
    accent: '#451a03',
    bgPrimary: '#fefbf3',
    bgSecondary: '#fef3c7',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  },
  'mint-lime': {
    primary: '#84cc16',
    primaryDark: '#65a30d',
    secondary: '#4d7c0f',
    accent: '#365314',
    bgPrimary: '#f7fee7',
    bgSecondary: '#ecfccb',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  },
  'sky-blue': {
    primary: '#0ea5e9',
    primaryDark: '#0284c7',
    secondary: '#0369a1',
    accent: '#075985',
    bgPrimary: '#f0f9ff',
    bgSecondary: '#e0f2fe',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  },
  'charcoal-orange': {
    primary: '#ea580c',
    primaryDark: '#c2410c',
    secondary: '#9a3412',
    accent: '#7c2d12',
    bgPrimary: '#fafafa',
    bgSecondary: '#f5f5f5',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  },
  'platinum-aqua': {
    primary: '#06b6d4',
    primaryDark: '#0891b2',
    secondary: '#0e7490',
    accent: '#155e75',
    bgPrimary: '#f8fafc',
    bgSecondary: '#f1f5f9',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  },
  'ruby-gold': {
    primary: '#dc2626',
    primaryDark: '#b91c1c',
    secondary: '#991b1b',
    accent: '#7f1d1d',
    bgPrimary: '#fef2f2',
    bgSecondary: '#fee2e2',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  }
};

// Apply color palette to CSS variables
const applyColorPalette = (paletteName: string) => {
  const palette = colorPalettes[paletteName as keyof typeof colorPalettes];
  if (!palette) return;

  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--color-primary', palette.primary);
  root.style.setProperty('--color-primary-dark', palette.primaryDark);
  root.style.setProperty('--color-secondary', palette.secondary);
  root.style.setProperty('--color-accent', palette.accent);
  root.style.setProperty('--bg-primary', palette.bgPrimary);
  root.style.setProperty('--bg-secondary', palette.bgSecondary);
  root.style.setProperty('--text-primary', palette.textPrimary);
  root.style.setProperty('--text-secondary', palette.textSecondary);

  // Apply palette class to body
  document.body.className = document.body.className.replace(/palette-[\w-]+/g, '');
  document.body.classList.add(`palette-${paletteName}`);
  
  console.log(`🎨 Applied color palette: ${paletteName}`);
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};


export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with undefined to avoid applying default palette on first render
  const [settings, setSettings] = useState<MarketplaceSettings | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage and Supabase
  useEffect(() => {
    loadSettings();
  }, []);

  // Only apply color palette if user is authenticated and has a custom palette
  useEffect(() => {
    const checkAndApplyPalette = async () => {
      if (!settings || !settings.colorPalette) return;
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user && settings.colorPalette && settings.colorPalette !== window.__GLOBAL_PALETTE__) {
        applyColorPalette(settings.colorPalette);
      }
      // If not authenticated, do not override the global palette
    };
    checkAndApplyPalette();
  }, [settings?.colorPalette]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to load from localStorage for immediate UI update
      const localSettings = localStorage.getItem('marketplace_settings');
      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        const mergedSettings = { ...defaultSettings, ...parsed };
        setSettings(mergedSettings);
        // Palette will be applied by useEffect above
      }

      // Then try to load from Supabase (if user is authenticated)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.auth.getUser();
          if (data.user?.user_metadata?.marketplace_settings) {
            const cloudSettings = data.user.user_metadata.marketplace_settings;
            const mergedSettings = { ...defaultSettings, ...cloudSettings };
            setSettings(mergedSettings);
            // Update localStorage with cloud settings
            localStorage.setItem('marketplace_settings', JSON.stringify(mergedSettings));
            // Palette will be applied by useEffect above
          }
        }
      } catch (cloudError) {
        console.log('Could not load cloud settings, using local settings');
      }

      // If nothing found, fallback to defaultSettings but do NOT apply palette (let main.tsx handle it)
      if (!localSettings) {
        setSettings(defaultSettings);
      }

    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
      // Do not apply default palette here
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const updateSettings = async (newSettings: Partial<MarketplaceSettings>) => {
    try {
      setError(null);
      const updatedSettings = {
        ...settings,
        ...newSettings,
        lastUpdated: new Date().toISOString()
      };

      // Update local state immediately for real-time effect

      // Ensure all required fields are present (no undefined)
      const fullSettings: MarketplaceSettings = {
        ...defaultSettings,
        ...settings,
        ...newSettings,
        lastUpdated: new Date().toISOString()
      };
      setSettings(fullSettings);

      // Apply color palette if it changed
      if (newSettings.colorPalette && (!settings || newSettings.colorPalette !== settings.colorPalette)) {
        applyColorPalette(newSettings.colorPalette);
      }

      // Save to localStorage
      localStorage.setItem('marketplace_settings', JSON.stringify(updatedSettings));

      // Try to save to Supabase (if authenticated)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({
            data: {
              marketplace_settings: updatedSettings
            }
          });
        }
      } catch (cloudError) {
        console.log('Could not save to cloud, settings saved locally');
      }

    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings');
      throw error;
    }
  };

  // Computed properties for easy access
  const isPortfolioMode = !settings?.marketplaceMode;
  const isMarketplaceMode = !!settings?.marketplaceMode;

  const value = {
    settings: settings || defaultSettings,
    updateSettings,
    refreshSettings,
    loading,
    error,
    isPortfolioMode,
    isMarketplaceMode
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Export color palettes and utility function for use in components
export { colorPalettes, applyColorPalette };