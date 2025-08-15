import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Eye,
  ShoppingCart,
  Mail,
  CreditCard,
  Smartphone,
  Palette,
  Monitor,
  Sun,
  Moon,
  Github,
  Linkedin,
  Phone,
  User,
  Globe,
  FileText,
  Download
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';

const AdminSettingsPage = () => {
  const { settings, updateSettings, loading, error } = useSettings();
  const { theme, setTheme } = useTheme();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      await updateSettings(localSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError('Failed to save settings. Please try again.');
      console.error('Settings save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setSaveError(null);
  };

  const handleInputChange = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Color palette options with new palettes
  const colorPalettes = [
    { id: 'default', name: 'Default', description: 'Original website colors', color: '#3b82f6' },
    { id: 'emerald-green', name: 'Emerald Green', description: 'Fresh, modern, and vibrant green palette', color: '#10b981' },
    { id: 'violet-indigo', name: 'Violet Indigo', description: 'Deep violet and indigo for a creative, bold look', color: '#8b5cf6' },
    { id: 'rose-magenta', name: 'Rose Magenta', description: 'Modern rose and magenta for a lively, energetic style', color: '#f43f5e' },
    { id: 'amber-caramel', name: 'Amber Caramel', description: 'Warm, rich amber and caramel tones', color: '#f59e0b' },
    { id: 'cool-cyan', name: 'Cool Cyan', description: 'Clean, modern cyan and teal palette', color: '#06b6d4' },
    { id: 'copper-brown', name: 'Copper Brown', description: 'Earthy copper and brown tones for a grounded look', color: '#b45309' },
    { id: 'mint-lime', name: 'Mint Lime', description: 'Bright mint and lime for a fresh, energetic vibe', color: '#84cc16' },
    { id: 'sky-blue', name: 'Sky Blue', description: 'Airy sky blue and azure for a calm, modern feel', color: '#0ea5e9' },
    { id: 'charcoal-orange', name: 'Charcoal Orange', description: 'Bold charcoal with vibrant orange accents', color: '#ea580c' },
    { id: 'platinum-aqua', name: 'Platinum Aqua', description: 'Elegant platinum with cool aqua highlights', color: '#06b6d4' },
    { id: 'ruby-gold', name: 'Ruby Gold', description: 'Luxurious ruby red paired with gold highlights', color: '#dc2626' }
  ];

  // Theme options
  const themeOptions = [
    { id: 'light', name: 'Light', description: 'Light theme for better visibility', icon: Sun },
    { id: 'dark', name: 'Dark', description: 'Dark theme for reduced eye strain', icon: Moon },
    { id: 'system', name: 'System', description: 'Follow system preference', icon: Monitor }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-8 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-200">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Configure your marketplace settings, appearance, and contact information
          </p>
        </div>

        {/* Save Status */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-green-800 dark:text-green-300">Settings saved successfully!</span>
            </div>
          </div>
        )}

        {saveError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
              <span className="text-red-800 dark:text-red-300">{saveError}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Appearance Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <Palette className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Appearance</h2>
              </div>

              {/* Theme Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-4">Theme</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Choose your preferred theme. This setting is synchronized with the navbar theme toggle.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themeOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = theme === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id as any)}
                        className={`p-4 border rounded-lg text-left transition-colors duration-200 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <IconComponent className={`h-5 w-5 mr-2 ${
                            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                          }`} />
                          <span className={`font-medium ${
                            isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-200'
                          }`}>
                            {option.name}
                          </span>
                          {isSelected && (
                            <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Palette Selection */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-4">Color Palette</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Choose a color scheme that will be applied to the entire website, similar to how dark/light mode works.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {colorPalettes.map((palette) => {
                    const isSelected = localSettings.colorPalette === palette.id;
                    return (
                      <button
                        key={palette.id}
                        onClick={() => handleInputChange('colorPalette', palette.id)}
                        className={`p-4 border rounded-lg text-left transition-colors duration-200 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <div 
                            className="w-5 h-5 rounded-full mr-3 border border-slate-300 dark:border-slate-600"
                            style={{ backgroundColor: palette.color }}
                          ></div>
                          <span className={`font-medium ${
                            isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-200'
                          }`}>
                            {palette.name}
                          </span>
                          {isSelected && (
                            <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {palette.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Marketplace Mode Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Marketplace Mode</h2>
              </div>

              <div className="space-y-6">
                {/* Master Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    {localSettings.marketplaceMode ? (
                      <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                    ) : (
                      <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                    )}
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-200">
                        {localSettings.marketplaceMode ? 'Marketplace Mode' : 'Portfolio Mode'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {localSettings.marketplaceMode 
                          ? 'Enable purchasing and checkout functionality'
                          : 'Display projects as portfolio showcase only'
                        }
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.marketplaceMode}
                      onChange={(e) => handleInputChange('marketplaceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Marketplace Features */}
                {localSettings.marketplaceMode && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-200">Show Prices on Projects</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Display project prices on cards and detail pages</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.showPricesOnProjects}
                          onChange={(e) => handleInputChange('showPricesOnProjects', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-200">Enable Checkout Process</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Allow customers to purchase projects</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.enableCheckoutProcess}
                          onChange={(e) => handleInputChange('enableCheckoutProcess', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Payment Processing Master Toggle */}
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-200">Payment Processing</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Master toggle for all payment methods. When ON, both UPI and Card payments are enabled.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.paymentProcessingEnabled}
                          onChange={(e) => handleInputChange('paymentProcessingEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    {/* Individual Payment Method Toggles */}
                    <div className="ml-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-3" />
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-200">Credit/Debit Cards</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {localSettings.paymentProcessingEnabled 
                                ? 'Enabled via Payment Processing toggle' 
                                : 'Enable card payments via Stripe'
                              }
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localSettings.paymentProcessingEnabled || localSettings.enableCard}
                            onChange={(e) => handleInputChange('enableCard', e.target.checked)}
                            disabled={localSettings.paymentProcessingEnabled}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 ${
                            localSettings.paymentProcessingEnabled ? 'opacity-50' : ''
                          }`}></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Smartphone className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-3" />
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-200">UPI Payments</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {localSettings.paymentProcessingEnabled 
                                ? 'Enabled via Payment Processing toggle' 
                                : 'Enable UPI payments for Indian customers'
                              }
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localSettings.paymentProcessingEnabled || localSettings.enableUPI}
                            onChange={(e) => handleInputChange('enableUPI', e.target.checked)}
                            disabled={localSettings.paymentProcessingEnabled}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 ${
                            localSettings.paymentProcessingEnabled ? 'opacity-50' : ''
                          }`}></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-200">Automatic Document Delivery</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Automatically send project documents after purchase</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.automaticDeliveryEnabled}
                          onChange={(e) => handleInputChange('automaticDeliveryEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-200">Email Notifications</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Send email notifications for orders and inquiries</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.emailNotificationsEnabled}
                          onChange={(e) => handleInputChange('emailNotificationsEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Project Display Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Project Display</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-200">Show Review 1 Documents</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Display Review 1 stage documents in project details</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.showReview1 !== false}
                      onChange={(e) => handleInputChange('showReview1', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-200">Show Review 2 Documents</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Display Review 2 stage documents in project details</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.showReview2 !== false}
                      onChange={(e) => handleInputChange('showReview2', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-200">Show Review 3 Documents</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Display Review 3 stage documents in project details</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.showReview3 !== false}
                      onChange={(e) => handleInputChange('showReview3', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Contact Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={localSettings.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={localSettings.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                    placeholder="+91-0000000000"
                  />
                  <div className="mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localSettings.phoneAvailableOnRequest}
                        onChange={(e) => handleInputChange('phoneAvailableOnRequest', e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                        Show "Available upon request" instead of actual number
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Github className="h-4 w-4 inline mr-2" />
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={localSettings.githubUrl || ''}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Linkedin className="h-4 w-4 inline mr-2" />
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={localSettings.linkedinUrl || ''}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Settings
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Reset Changes
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start">
                  <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Settings Info</p>
                    <ul className="space-y-1">
                      <li>• Settings are saved locally and synced to cloud when logged in</li>
                      <li>• Theme changes apply immediately across the site</li>
                      <li>• Color palette changes affect the entire website appearance</li>
                      <li>• Marketplace mode controls pricing and checkout features</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;