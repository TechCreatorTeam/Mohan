import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Code, ChevronDown, Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // Import your ThemeContext
import { useSettings } from '../../context/SettingsContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { theme, setTheme, actualTheme } = useTheme(); // Get theme context
  const { settings, updateSettings } = useSettings();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const toggleAdminMenu = () => setIsAdminMenuOpen(!isAdminMenuOpen);
  const toggleThemeMenu = () => setIsThemeMenuOpen(!isThemeMenuOpen);
  const toggleColorMenu = () => setIsColorMenuOpen(!isColorMenuOpen);

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Theme options
  const themeOptions = [
    { id: 'light', name: 'Light', icon: Sun, description: 'Light theme' },
    { id: 'dark', name: 'Dark', icon: Moon, description: 'Dark theme' },
    { id: 'system', name: 'System', icon: Monitor, description: 'Follow system preference' }
  ];

  // Color palette options
  const colorPalettes = [
    { id: 'default', name: 'Default', color: '#3b82f6' },
    { id: 'emerald-green', name: 'Emerald Green', color: '#10b981' },
    { id: 'violet-indigo', name: 'Violet Indigo', color: '#8b5cf6' },
    { id: 'rose-magenta', name: 'Rose Magenta', color: '#f43f5e' },
    { id: 'amber-caramel', name: 'Amber Caramel', color: '#f59e0b' },
    { id: 'cool-cyan', name: 'Cool Cyan', color: '#06b6d4' },
    { id: 'copper-brown', name: 'Copper Brown', color: '#b45309' },
    { id: 'mint-lime', name: 'Mint Lime', color: '#84cc16' },
    { id: 'sky-blue', name: 'Sky Blue', color: '#0ea5e9' },
    { id: 'charcoal-orange', name: 'Charcoal Orange', color: '#ea580c' },
    { id: 'platinum-aqua', name: 'Platinum Aqua', color: '#06b6d4' },
    { id: 'ruby-gold', name: 'Ruby Gold', color: '#dc2626' }
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);
  };

  const handleColorChange = async (paletteId: string) => {
    try {
      await updateSettings({ colorPalette: paletteId });
      setIsColorMenuOpen(false);
    } catch (error) {
      console.error('Failed to update color palette:', error);
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-slate-900 dark:bg-slate-800 shadow-lg py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-white" 
            onClick={closeMenu}
          >
            <Code className="h-8 w-8 text-blue-500" />
            <span>TechCreator</span>
          </Link>

          <div className="flex items-center space-x-6">
            {/* Theme Menu */}
            <div className="relative">
              <button
                onClick={toggleThemeMenu}
                className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-700"
                aria-label="Theme options"
              >
                {theme === 'system' ? (
                  <Monitor className="h-5 w-5 text-slate-300" />
                ) : actualTheme === 'dark' ? (
                  <Moon className="h-5 w-5 text-slate-300" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-300" />
                )}
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      Theme Preference
                    </div>
                    {themeOptions.map((option) => {
                      const IconComponent = option.icon;
                      const isSelected = theme === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleThemeChange(option.id as any)}
                          className={`w-full flex items-center px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <IconComponent className={`h-5 w-5 mr-3 ${
                            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                          }`} />
                          <div className="text-left">
                            <div className="font-medium">{option.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
                          </div>
                          {isSelected && (
                            <div className="ml-auto">
                              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Color Palette Menu */}
            {/* Color Palette Menu - Hidden as requested */}
            {/* 
            <div className="relative">
              <button
                onClick={toggleColorMenu}
                className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-700"
                aria-label="Color palette options"
              >
                <Palette className="h-5 w-5 text-slate-300" />
              </button>

              {isColorMenuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      Color Palette
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {colorPalettes.map((palette) => {
                        const isSelected = settings.colorPalette === palette.id;
                        return (
                          <button
                            key={palette.id}
                            onClick={() => handleColorChange(palette.id)}
                            className={`flex items-center p-3 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : ''
                            }`}
                          >
                            <div 
                              className="w-4 h-4 rounded-full mr-3 border border-slate-300 dark:border-slate-600"
                              style={{ backgroundColor: palette.color }}
                            ></div>
                            <div className="text-left">
                              <div className={`font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                {palette.name}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="ml-auto">
                                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            */}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'text-blue-500' 
                    : 'text-white hover:text-blue-400'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/projects" 
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/projects') 
                    ? 'text-blue-500' 
                    : 'text-white hover:text-blue-400'
                }`}
              >
                Projects
              </Link>
              <Link 
                to="/contact" 
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/contact') 
                    ? 'text-blue-500' 
                    : 'text-white hover:text-blue-400'
                }`}
              >
                Contact
              </Link>
              
              {isAuthenticated ? (
                <div className="relative inline-block text-left">
                  <div>
                    <button 
                      type="button" 
                      className="inline-flex items-center gap-x-1 text-sm font-medium text-white hover:text-blue-400"
                      onClick={toggleAdminMenu}
                    >
                      Admin
                      <ChevronDown className={`h-4 w-4 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {isAdminMenuOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Link 
                          to="/admin" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                          onClick={() => {
                            closeMenu();
                            setIsAdminMenuOpen(false);
                          }}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to="/admin/project-requests" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                          onClick={() => {
                            closeMenu();
                            setIsAdminMenuOpen(false);
                          }}
                        >
                          Project Requests
                        </Link>
                        <Link 
                          to="/admin/projects" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                          onClick={() => {
                            closeMenu();
                            setIsAdminMenuOpen(false);
                          }}
                        >
                          Manage Projects
                        </Link>
                        <Link 
                          to="/admin/orders" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                          onClick={() => {
                            closeMenu();
                            setIsAdminMenuOpen(false);
                          }}
                        >
                          Orders
                        </Link>
                        <Link 
                          to="/admin/settings" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                          onClick={() => {
                            closeMenu();
                            setIsAdminMenuOpen(false);
                          }}
                        >
                          Settings
                        </Link>
                        <button 
                          onClick={() => {
                            logout();
                            closeMenu();
                            setIsAdminMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/admin/login" 
                  className="text-sm font-medium text-white hover:text-blue-400"
                >
                  Admin Login
                </Link>
              )}
            </div>

            {/* Close menus when clicking outside */}
            {isThemeMenuOpen && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => {
                  setIsThemeMenuOpen(false);
                }}
              ></div>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <button 
            className="md:hidden text-white focus:outline-none" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 bg-slate-800 rounded-lg shadow-xl p-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`text-base font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'text-blue-500' 
                    : 'text-white hover:text-blue-400'
                }`}
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                to="/projects" 
                className={`text-base font-medium transition-colors duration-200 ${
                  isActive('/projects') 
                    ? 'text-blue-500' 
                    : 'text-white hover:text-blue-400'
                }`}
                onClick={closeMenu}
              >
                Projects
              </Link>
              <Link 
                to="/contact" 
                className={`text-base font-medium transition-colors duration-200 ${
                  isActive('/contact') 
                    ? 'text-blue-500' 
                    : 'text-white hover:text-blue-400'
                }`}
                onClick={closeMenu}
              >
                Contact
              </Link>
              
              {/* Theme Toggle for Mobile */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Theme</div>
                {themeOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = theme === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        handleThemeChange(option.id as any);
                        closeMenu();
                      }}
                      className={`w-full flex items-center text-base font-medium transition-colors duration-200 ${
                        isSelected ? 'text-blue-400' : 'text-white hover:text-blue-400'
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mr-2" />
                      {option.name}
                      {isSelected && <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>}
                    </button>
                  );
                })}
              </div>

              <hr className="border-slate-700" />

              {/* Color Palette for Mobile */}
              {/* Color Palette for Mobile - Hidden as requested */}
              {/* 
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Color Palette</div>
                <div className="grid grid-cols-2 gap-2">
                  {colorPalettes.map((palette) => {
                    const isSelected = settings.colorPalette === palette.id;
                    return (
                      <button
                        key={palette.id}
                        onClick={() => {
                          handleColorChange(palette.id);
                          closeMenu();
                        }}
                        className={`flex items-center p-2 text-sm rounded-md transition-colors duration-200 ${
                          isSelected ? 'bg-blue-600 text-white' : 'text-white hover:bg-slate-700'
                        }`}
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-2 border border-slate-500"
                          style={{ backgroundColor: palette.color }}
                        ></div>
                        <span className="text-xs">{palette.name}</span>
                        {isSelected && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
              */}
              
              {isAuthenticated ? (
                <>
                  <hr className="border-slate-700" />
                  <Link 
                    to="/admin" 
                    className="text-base font-medium text-white hover:text-blue-400"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/admin/project-requests" 
                    className="text-base font-medium text-white hover:text-blue-400"
                    onClick={closeMenu}
                  >
                    Project Requests
                  </Link>
                  <Link 
                    to="/admin/projects" 
                    className="text-base font-medium text-white hover:text-blue-400"
                    onClick={closeMenu}
                  >
                    Manage Projects
                  </Link>
                  <Link 
                    to="/admin/orders" 
                    className="text-base font-medium text-white hover:text-blue-400"
                    onClick={closeMenu}
                  >
                    Orders
                  </Link>
                  <Link 
                    to="/admin/settings" 
                    className="text-base font-medium text-white hover:text-blue-400"
                    onClick={closeMenu}
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="text-left text-base font-medium text-red-500 hover:text-red-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/admin/login" 
                  className="text-base font-medium text-white hover:text-blue-400"
                  onClick={closeMenu}
                >
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;