import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Bell, 
  Shield, 
  User, 
  Palette,
  ShoppingCart,
  Eye,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Moon,
  Sun,
  Monitor,
  Lock,
  Key,
  UserCheck,
  Globe,
  Phone,
  MapPin,
  Camera,
  Edit3
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AdminSettingsPage = () => {
  const { settings, updateSettings, loading, error } = useSettings();
  const { user, updateProfile, updatePassword, updateEmail } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('marketplace');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: settings.email || '',
    phone: settings.phone || '',
    website: user?.website || '',
    bio: user?.bio || '',
    githubUrl: settings.githubUrl || '',
    linkedinUrl: settings.linkedinUrl || '',
    phoneAvailableOnRequest: settings.phoneAvailableOnRequest ?? true
  });

  // Keep profileData in sync with settings for real-time updates
  React.useEffect(() => {
    setProfileData(prev => ({
      ...prev,
      email: settings.email || '',
      phone: settings.phone || '',
      githubUrl: settings.githubUrl || '',
      linkedinUrl: settings.linkedinUrl || '',
      phoneAvailableOnRequest: settings.phoneAvailableOnRequest ?? true
    }));
  }, [settings.email, settings.phone, settings.githubUrl, settings.linkedinUrl, settings.phoneAvailableOnRequest]);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    inquiryNotifications: true,
    systemNotifications: false,
    marketingEmails: false,
    weeklyReports: true,
    instantAlerts: true,
    soundEnabled: true
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: '24',
    passwordExpiry: '90',
    allowMultipleSessions: true,
    requireStrongPassword: true,
    logSecurityEvents: true
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Email change state
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: '',
    password: ''
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Color palette definitions
  const colorPalettes = [
    {
      id: 'default',
      name: 'Default',
      description: 'Original website colors',
      colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
      cssVars: {
        '--color-primary': '#3b82f6',
        '--color-primary-dark': '#1d4ed8',
        '--color-secondary': '#1e40af',
        '--color-accent': '#1e3a8a',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8fafc',
        '--text-primary': '#1f2937',
        '--text-secondary': '#6b7280'
      }
    },
    {
      id: 'emerald-green',
      name: 'Emerald Green',
      description: 'Fresh, modern, and vibrant green palette',
      colors: ['#34d399', '#10b981', '#047857', '#065f46'],
      cssVars: {
        '--color-primary': '#10b981',
        '--color-primary-dark': '#047857',
        '--color-secondary': '#34d399',
        '--color-accent': '#065f46',
        '--bg-primary': '#ecfdf5',
        '--bg-secondary': '#d1fae5',
        '--text-primary': '#065f46',
        '--text-secondary': '#10b981'
      }
    },
    {
      id: 'violet-indigo',
      name: 'Violet Indigo',
      description: 'Deep violet and indigo for a creative, bold look',
      colors: ['#a78bfa', '#6366f1', '#4f46e5', '#3730a3'],
      cssVars: {
        '--color-primary': '#6366f1',
        '--color-primary-dark': '#4f46e5',
        '--color-secondary': '#a78bfa',
        '--color-accent': '#3730a3',
        '--bg-primary': '#f5f3ff',
        '--bg-secondary': '#ede9fe',
        '--text-primary': '#3730a3',
        '--text-secondary': '#6366f1'
      }
    },
    {
      id: 'rose-magenta',
      name: 'Rose Magenta',
      description: 'Modern rose and magenta for a lively, energetic style',
      colors: ['#f472b6', '#ec4899', '#d946ef', '#a21caf'],
      cssVars: {
        '--color-primary': '#ec4899',
        '--color-primary-dark': '#a21caf',
        '--color-secondary': '#f472b6',
        '--color-accent': '#d946ef',
        '--bg-primary': '#fdf2f8',
        '--bg-secondary': '#fce7f3',
        '--text-primary': '#a21caf',
        '--text-secondary': '#ec4899'
      }
    },
    {
      id: 'amber-caramel',
      name: 'Amber Caramel',
      description: 'Warm, rich amber and caramel tones',
      colors: ['#fbbf24', '#f59e42', '#d97706', '#b45309'],
      cssVars: {
        '--color-primary': '#fbbf24',
        '--color-primary-dark': '#d97706',
        '--color-secondary': '#f59e42',
        '--color-accent': '#b45309',
        '--bg-primary': '#fffbeb',
        '--bg-secondary': '#fef3c7',
        '--text-primary': '#78350f',
        '--text-secondary': '#b45309'
      }
    },
    {
      id: 'cool-cyan',
      name: 'Cool Cyan',
      description: 'Clean, modern cyan and teal palette',
      colors: ['#22d3ee', '#06b6d4', '#0e7490', '#164e63'],
      cssVars: {
        '--color-primary': '#06b6d4',
        '--color-primary-dark': '#0e7490',
        '--color-secondary': '#22d3ee',
        '--color-accent': '#164e63',
        '--bg-primary': '#ecfeff',
        '--bg-secondary': '#cffafe',
        '--text-primary': '#164e63',
        '--text-secondary': '#06b6d4'
      }
    },
    {
      id: 'copper-brown',
      name: 'Copper Brown',
      description: 'Earthy copper and brown tones for a grounded look',
      colors: ['#b45309', '#92400e', '#78350f', '#a16207'],
      cssVars: {
        '--color-primary': '#b45309',
        '--color-primary-dark': '#92400e',
        '--color-secondary': '#a16207',
        '--color-accent': '#78350f',
        '--bg-primary': '#fef6e4',
        '--bg-secondary': '#fde68a',
        '--text-primary': '#78350f',
        '--text-secondary': '#a16207'
      }
    },
    {
      id: 'mint-lime',
      name: 'Mint Lime',
      description: 'Bright mint and lime for a fresh, energetic vibe',
      colors: ['#a7f3d0', '#6ee7b7', '#bef264', '#84cc16'],
      cssVars: {
        '--color-primary': '#6ee7b7',
        '--color-primary-dark': '#84cc16',
        '--color-secondary': '#bef264',
        '--color-accent': '#a7f3d0',
        '--bg-primary': '#f7fee7',
        '--bg-secondary': '#ecfccb',
        '--text-primary': '#365314',
        '--text-secondary': '#84cc16'
      }
    },
    {
      id: 'sky-blue',
      name: 'Sky Blue',
      description: 'Airy sky blue and azure for a calm, modern feel',
      colors: ['#38bdf8', '#0ea5e9', '#0369a1', '#7dd3fc'],
      cssVars: {
        '--color-primary': '#0ea5e9',
        '--color-primary-dark': '#0369a1',
        '--color-secondary': '#7dd3fc',
        '--color-accent': '#38bdf8',
        '--bg-primary': '#f0f9ff',
        '--bg-secondary': '#e0f2fe',
        '--text-primary': '#0c4a6e',
        '--text-secondary': '#0ea5e9'
      }
    },
    {
      id: 'charcoal-orange',
      name: 'Charcoal Orange',
      description: 'Bold charcoal with vibrant orange accents',
      colors: ['#1e293b', '#334155', '#fb923c', '#f59e42'],
      cssVars: {
        '--color-primary': '#fb923c',
        '--color-primary-dark': '#f59e42',
        '--color-secondary': '#334155',
        '--color-accent': '#1e293b',
        '--bg-primary': '#f8fafc',
        '--bg-secondary': '#f1f5f9',
        '--text-primary': '#1e293b',
        '--text-secondary': '#fb923c'
      }
    },
    {
      id: 'platinum-aqua',
      name: 'Platinum Aqua',
      description: 'Elegant platinum with cool aqua highlights',
      colors: ['#e5e7eb', '#a5f3fc', '#06b6d4', '#64748b'],
      cssVars: {
        '--color-primary': '#06b6d4',
        '--color-primary-dark': '#64748b',
        '--color-secondary': '#a5f3fc',
        '--color-accent': '#e5e7eb',
        '--bg-primary': '#f0fdfa',
        '--bg-secondary': '#e0f2fe',
        '--text-primary': '#334155',
        '--text-secondary': '#06b6d4'
      }
    },
    {
      id: 'ruby-gold',
      name: 'Ruby Gold',
      description: 'Luxurious ruby red paired with gold highlights',
      colors: ['#be123c', '#fbbf24', '#f59e42', '#991b1b'],
      cssVars: {
        '--color-primary': '#be123c',
        '--color-primary-dark': '#991b1b',
        '--color-secondary': '#fbbf24',
        '--color-accent': '#f59e42',
        '--bg-primary': '#fff7ed',
        '--bg-secondary': '#fef3c7',
        '--text-primary': '#991b1b',
        '--text-secondary': '#be123c'
      }
    }
  ];

  const handleSaveSettings = async (newSettings: any) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateSettings(newSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError('Failed to save settings. Please try again.');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Save to global settings for Footer/ContactPage
      await updateSettings({
        githubUrl: profileData.githubUrl,
        linkedinUrl: profileData.linkedinUrl,
        email: profileData.email,
        phone: profileData.phone,
        phoneAvailableOnRequest: profileData.phoneAvailableOnRequest
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError('Failed to update profile. Please try again.');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarketplaceModeToggle = async () => {
    const newSettings = {
      ...settings,
      marketplaceMode: !settings.marketplaceMode,
      // When switching to portfolio mode, disable marketplace features
      ...(settings.marketplaceMode ? {
        showPricesOnProjects: false,
        enableCheckoutProcess: false
      } : {})
    };
    await handleSaveSettings(newSettings);
  };

  const handleSettingToggle = async (settingKey: string, value: boolean) => {
    const newSettings = {
      ...settings,
      [settingKey]: value
    };
    await handleSaveSettings(newSettings);
  };

  // Enhanced color palette application function
  const applyColorPalette = async (paletteId: string) => {
    const palette = colorPalettes.find(p => p.id === paletteId);
    if (!palette) return;

    // Apply CSS custom properties to the root element
    const root = document.documentElement;
    
    // Apply all CSS variables from the palette
    Object.entries(palette.cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Remove existing palette classes and add new one
    document.body.className = document.body.className.replace(/palette-[\w-]+/g, '');
    document.body.classList.add(`palette-${paletteId}`);

    // Store the selection in localStorage for persistence
    localStorage.setItem('selectedColorPalette', paletteId);

    // Save to settings
    await handleSaveSettings({
      ...settings,
      colorPalette: paletteId
    });

    console.log(`Applied color palette: ${palette.name}`);
  };

  // Load saved color palette on component mount
  React.useEffect(() => {
    const savedPalette = localStorage.getItem('selectedColorPalette') || settings.colorPalette || 'default';
    const palette = colorPalettes.find(p => p.id === savedPalette);
    
    if (palette) {
      const root = document.documentElement;
      Object.entries(palette.cssVars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
      document.body.className = document.body.className.replace(/palette-[\w-]+/g, '');
      document.body.classList.add(`palette-${savedPalette}`);
    }
  }, []);

  const getCurrentPalette = () => {
    const savedPalette = localStorage.getItem('selectedColorPalette') || settings.colorPalette;
    return colorPalettes.find(p => p.id === savedPalette) || colorPalettes[0]; // Default to first palette
  };

  // Password change handler with real Supabase integration
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      // Call the real updatePassword function from AuthContext
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Email change handler with real Supabase integration
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!emailForm.newEmail || !emailForm.confirmEmail || !emailForm.password) {
      setEmailError('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (emailForm.newEmail !== emailForm.confirmEmail) {
      setEmailError('Email addresses do not match');
      return;
    }

    if (emailForm.newEmail === user?.email) {
      setEmailError('New email must be different from current email');
      return;
    }

    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(false);

    try {
      // Call the real updateEmail function from AuthContext
      await updateEmail(emailForm.newEmail, emailForm.password);
      
      setEmailSuccess(true);
      setEmailForm({
        newEmail: '',
        confirmEmail: '',
        password: ''
      });
      
      // Removed the setTimeout to make the success message persistent
    } catch (error: any) {
      setEmailError(error.message || 'Failed to update email address. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const tabs = [
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Eye },
    { id: 'color-palette', label: 'Color Palette', icon: Palette }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  const sendConfirmationMail = async (request) => {
    // Replace with your actual email sending logic (API call or integration)
    try {
      // Example: await sendMailAPI(request.email, ...);
      alert(`Confirmation mail sent to ${request.email}`);
    } catch (err) {
      alert('Failed to send confirmation mail.');
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-8 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-200">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your application settings and preferences
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Settings saved successfully!
          </div>
        )}

        {saveError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {saveError}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav
              className="flex overflow-x-auto whitespace-nowrap sm:space-x-8 space-x-4 px-2 sm:px-6 scrollbar-hide"
              aria-label="Tabs"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm flex items-center space-x-2 flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                    style={{ minWidth: '120px' }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Marketplace Settings */}
            {activeTab === 'marketplace' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-4">
                    Marketplace Configuration
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Configure how your website operates - as a marketplace for selling projects or as a portfolio showcase.
                  </p>
                </div>

                {/* Mode Toggle */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${settings.marketplaceMode ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                        {settings.marketplaceMode ? (
                          <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-200">
                          {settings.marketplaceMode ? 'Marketplace Mode' : 'Portfolio Mode'}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {settings.marketplaceMode 
                            ? 'Full e-commerce functionality with payments and checkout'
                            : 'Portfolio showcase mode for displaying work samples'
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleMarketplaceModeToggle}
                      disabled={isSaving}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        settings.marketplaceMode ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.marketplaceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Marketplace Features */}
                {settings.marketplaceMode && (
                  <div className="space-y-8">
                    {/* E-Commerce Core */}
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-4">E-Commerce Core</h4>
                      <div className="space-y-2">
                        {[
                          {
                            key: 'showPricesOnProjects',
                            title: 'Show Prices on Projects',
                            description: 'Display project prices on cards and detail pages'
                          },
                          {
                            key: 'enableCheckoutProcess',
                            title: 'Enable Checkout Process',
                            description: 'Allow customers to purchase projects through the checkout flow'
                          },
                          {
                            key: 'orderAutoConfirmation',
                            title: 'Order Auto-Confirmation',
                            description: 'Automatically confirm orders after payment'
                          }
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-600 last:border-0">
                            <div>
                              <h5 className="font-medium text-slate-900 dark:text-slate-200">{setting.title}</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{setting.description}</p>
                            </div>
                            <button
                              onClick={() => handleSettingToggle(setting.key, !settings[setting.key as keyof typeof settings])}
                              disabled={isSaving}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                settings[setting.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings[setting.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment & Delivery */}
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-4">Payment & Delivery</h4>
                      <div className="space-y-2">
                        {[
                          {
                            key: 'paymentProcessingEnabled',
                            title: 'Payment Processing',
                            description: 'Enable payment methods globally (UPI, card, etc.)'
                          },
                          {
                            key: 'enableUPI',
                            title: 'Enable UPI Payments',
                            description: 'Allow customers to pay using UPI (if available in Stripe account)'
                          },
                          {
                            key: 'enableCard',
                            title: 'Enable Card Payments',
                            description: 'Allow customers to pay using credit/debit cards'
                          },
                          {
                            key: 'automaticDeliveryEnabled',
                            title: 'Automatic Document Delivery',
                            description: 'Automatically send project documents after successful payment'
                          }
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-600 last:border-0">
                            <div>
                              <h5 className="font-medium text-slate-900 dark:text-slate-200">{setting.title}</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{setting.description}</p>
                            </div>
                            <button
                              onClick={() => handleSettingToggle(setting.key, !settings[setting.key as keyof typeof settings])}
                              disabled={isSaving}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                settings[setting.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings[setting.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-4">Notifications</h4>
                      <div className="space-y-2">
                        {[
                          {
                            key: 'emailNotificationsEnabled',
                            title: 'Email Notifications',
                            description: 'Send order confirmations and delivery notifications'
                          }
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-600 last:border-0">
                            <div>
                              <h5 className="font-medium text-slate-900 dark:text-slate-200">{setting.title}</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{setting.description}</p>
                            </div>
                            <button
                              onClick={() => handleSettingToggle(setting.key, !settings[setting.key as keyof typeof settings])}
                              disabled={isSaving}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                settings[setting.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings[setting.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review Stages */}
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-4">Review Stages</h4>
                      <div className="space-y-2">
                        {[
                          {
                            key: 'showReview1',
                            title: 'Review 1',
                            description: 'Initial project review and requirements\n\n0 docs'
                          },
                          {
                            key: 'showReview2',
                            title: 'Review 2',
                            description: 'Mid-project review and progress assessment\n\n0 docs'
                          },
                          {
                            key: 'showReview3',
                            title: 'Review 3',
                            description: 'Final review and project completion\n\n0 docs'
                          }
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-600 last:border-0">
                            <div>
                              <h5 className="font-medium text-slate-900 dark:text-slate-200">{setting.title}</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{setting.description}</p>
                            </div>
                            <button
                              onClick={() => handleSettingToggle(setting.key, !settings[setting.key as keyof typeof settings])}
                              disabled={isSaving}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                settings[setting.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings[setting.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-4">
                    Profile Information
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Update your personal information and profile details.
                  </p>
                </div>

                {/* Profile Picture */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <button className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-2 shadow-md border border-slate-200 dark:border-slate-600">
                        <Camera className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-200">Profile Picture</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Upload a new profile picture</p>
                      <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                        Change Picture
                      </button>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Website</label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                  <div className="mb-6 mt-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">GitHub URL</label>
                      <input
                        type="url"
                        value={profileData.githubUrl}
                        onChange={(e) => setProfileData({ ...profileData, githubUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="https://github.com/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">LinkedIn URL</label>
                      <input
                        type="url"
                        value={profileData.linkedinUrl}
                        onChange={(e) => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                          placeholder="Enter your phone number"
                        />
                        <div className="flex items-center">
                          <input
                            id="phoneAvailableOnRequest"
                            type="checkbox"
                            checked={profileData.phoneAvailableOnRequest}
                            onChange={e => setProfileData({ ...profileData, phoneAvailableOnRequest: e.target.checked })}
                            className="mr-2"
                          />
                          <label htmlFor="phoneAvailableOnRequest" className="text-sm text-slate-700 dark:text-slate-300">
                            Phone available upon request
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleProfileSave}
                      disabled={isSaving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-4">
                    Notification Preferences
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Configure how and when you receive notifications.
                  </p>
                </div>

                {/* Email Notifications */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Notifications
                  </h4>
                  <div className="space-y-4">
                    {[
                      {
                        key: 'emailNotifications',
                        title: 'Email Notifications',
                        description: 'Receive notifications via email'
                      },
                      {
                        key: 'orderNotifications',
                        title: 'Order Notifications',
                        description: 'Get notified about new orders and payments'
                      },
                      {
                        key: 'inquiryNotifications',
                        title: 'Inquiry Notifications',
                        description: 'Receive alerts for new project inquiries'
                      },
                      {
                        key: 'weeklyReports',
                        title: 'Weekly Reports',
                        description: 'Get weekly summary reports via email'
                      },
                      {
                        key: 'marketingEmails',
                        title: 'Marketing Emails',
                        description: 'Receive promotional and marketing emails'
                      }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between py-2">
                        <div>
                          <h5 className="font-medium text-slate-900 dark:text-slate-200">{setting.title}</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{setting.description}</p>
                        </div>
                        <button
                          onClick={() => setNotificationSettings({
                            ...notificationSettings,
                            [setting.key]: !notificationSettings[setting.key as keyof typeof notificationSettings]
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            notificationSettings[setting.key as keyof typeof notificationSettings] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings[setting.key as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Notifications */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-4 flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    System Notifications
                  </h4>
                  <div className="space-y-4">
                    {[
                      {
                        key: 'systemNotifications',
                        title: 'System Notifications',
                        description: 'Receive system alerts and updates'
                      },
                      {
                        key: 'instantAlerts',
                        title: 'Instant Alerts',
                        description: 'Get real-time notifications for urgent matters'
                      },
                      {
                        key: 'soundEnabled',
                        title: 'Sound Notifications',
                        description: 'Play sound for new notifications'
                      }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between py-2">
                        <div>
                          <h5 className="font-medium text-slate-900 dark:text-slate-200">{setting.title}</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{setting.description}</p>
                        </div>
                        <button
                          onClick={() => setNotificationSettings({
                            ...notificationSettings,
                            [setting.key]: !notificationSettings[setting.key as keyof typeof notificationSettings]
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            notificationSettings[setting.key as keyof typeof notificationSettings] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings[setting.key as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-4">
                    Security & Privacy
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Manage your account security and access controls.
                  </p>
                </div>

                {/* Change Password Section */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-4 flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Change Password
                  </h4>
                  
                  {passwordSuccess && (
                    <div className="mb-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-3 rounded-lg flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Password updated successfully!
                    </div>
                  )}

                  {passwordError && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-lg flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="Enter your current password"
                        disabled={passwordLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="Enter your new password"
                        disabled={passwordLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="Confirm your new password"
                        disabled={passwordLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {passwordLoading ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Change Email Address Section */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Change Email Address
                  </h4>
                  
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Current Email:</strong> {user?.email}
                    </p>
                  </div>

                  {emailSuccess && (
                    <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg flex items-start relative">
                      <CheckCircle className="h-5 w-5 mr-3 mt-1 text-blue-600 dark:text-blue-300" />
                      <div>
                        <div className="font-semibold mb-1">Email address updated!</div>
                        <div className="text-sm">
                          Please check your new email inbox for a confirmation link to verify your new address.<br />
                          <span className="font-medium">You must confirm your new email to complete the update.</span><br />
                          If you do not see the email, check your spam or promotions folder.
                        </div>
                      </div>
                      <button
                        onClick={() => setEmailSuccess(false)}
                        className="absolute top-2 right-2 text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-100 text-xs px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="Dismiss"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {emailError && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-lg flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {emailError}
                    </div>
                  )}

                  <form onSubmit={handleEmailChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        New Email Address
                      </label>
                      <input
                        type="email"
                        value={emailForm.newEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="Enter your new email address"
                        disabled={emailLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Confirm New Email Address
                      </label>
                      <input
                        type="email"
                        value={emailForm.confirmEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="Confirm your new email address"
                        disabled={emailLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Current Password (for verification)
                      </label>
                      <input
                        type="password"
                        value={emailForm.password}
                        onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        placeholder="Enter your current password"
                        disabled={emailLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={emailLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {emailLoading ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Updating Email...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Update Email
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Authentication */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Authentication
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h5 className="font-medium text-slate-900 dark:text-slate-200">Two-Factor Authentication</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Add an extra layer of security to your account</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({
                          ...securitySettings,
                          twoFactorEnabled: !securitySettings.twoFactorEnabled
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          securitySettings.twoFactorEnabled ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h5 className="font-medium text-slate-900 dark:text-slate-200">Login Alerts</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Get notified of new login attempts</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({
                          ...securitySettings,
                          loginAlerts: !securitySettings.loginAlerts
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          securitySettings.loginAlerts ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Session Management */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Session Management
                    Password Policy
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Password Expiry (days)
                      </label>
                      <select
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          passwordExpiry: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="never">Never</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h5 className="font-medium text-slate-900 dark:text-slate-200">Require Strong Password</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Enforce strong password requirements</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({
                          ...securitySettings,
                          requireStrongPassword: !securitySettings.requireStrongPassword
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          securitySettings.requireStrongPassword ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.requireStrongPassword ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-4">
                    Appearance & Display
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Customize the look and feel of your application.
                  </p>
                </div>

                {/* Theme Selection */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Theme Preference
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light', icon: Sun, description: 'Light theme' },
                      { id: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme' },
                      { id: 'system', label: 'System', icon: Monitor, description: 'Follow system preference' }
                    ].map((themeOption) => {
                      const Icon = themeOption.icon;
                      const isSelected = theme === themeOption.id;
                      return (
                        <button
                          key={themeOption.id}
                          onClick={() => setTheme(themeOption.id as any)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                          }`}
                        >
                          <Icon className={`h-8 w-8 mx-auto mb-2 ${
                            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                          }`} />
                          <div className={`font-medium ${
                            isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-200'
                          }`}>
                            {themeOption.label}
                            {isSelected && <CheckCircle className="inline-block w-4 h-4 ml-2" />}
                          </div>
                          <p className={`text-sm mt-1 ${
                            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {themeOption.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Display Options */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-4">Display Options</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Font Size
                      </label>
                      <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200">
                        <option value="small">Small</option>
                        <option value="medium" selected>Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Sidebar Width
                      </label>
                      <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200">
                        <option value="compact">Compact</option>
                        <option value="normal" selected>Normal</option>
                        <option value="wide">Wide</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h5 className="font-medium text-slate-900 dark:text-slate-200">Reduced Motion</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Minimize animations and transitions</p>
                      </div>
                      <button
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-slate-200 dark:bg-slate-600"
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Color Palette Settings */}
            {activeTab === 'color-palette' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-4">
                    Color Palette
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Choose a color scheme that will be applied to the entire website, similar to how dark/light mode works.
                  </p>
                </div>

                {/* Color Palette Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colorPalettes.map((palette) => {
                    const currentPalette = getCurrentPalette();
                    const isSelected = currentPalette.id === palette.id;
                    return (
                      <div
                        key={palette.id}
                        onClick={() => applyColorPalette(palette.id)}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {/* Color Swatches */}
                        <div className="flex space-x-1 mb-3">
                          {palette.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        
                        {/* Palette Info */}
                        <div>
                          <h4 className={`font-medium mb-1 flex items-center ${
                            isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-200'
                          }`}>
                            {palette.name}
                            {isSelected && (
                              <CheckCircle className="inline-block w-4 h-4 ml-2 text-blue-600" />
                            )}
                          </h4>
                          <p className={`text-sm ${
                            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {palette.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Current Selection */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      {getCurrentPalette().colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-200">
                        Current: {getCurrentPalette().name}
                      </span>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getCurrentPalette().description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reset Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => applyColorPalette('default')}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Status */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Saving settings...
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;