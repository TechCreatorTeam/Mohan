// Vite env type fix for TypeScript
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Import Supabase client
import { createClient } from '@supabase/supabase-js';

// 2. Your Supabase project details from .env (Vite style)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 3. Palette variables (copy from your index.html)
const paletteVars: { [key: string]: { [key: string]: string } } = {
  'emerald-green': { '--color-primary': '#10b981', '--color-primary-dark': '#047857', '--color-secondary': '#34d399', '--color-accent': '#065f46', '--bg-primary': '#ecfdf5', '--bg-secondary': '#d1fae5', '--text-primary': '#065f46', '--text-secondary': '#10b981' },
  'default': { '--color-primary': '#b45309', '--color-primary-dark': '#92400e', '--color-secondary': '#a16207', '--color-accent': '#78350f', '--bg-primary': '#fef6e4', '--bg-secondary': '#fde68a', '--text-primary': '#78350f', '--text-secondary': '#a16207' },
  'violet-indigo': { '--color-primary': '#6366f1', '--color-primary-dark': '#4f46e5', '--color-secondary': '#a78bfa', '--color-accent': '#3730a3', '--bg-primary': '#f5f3ff', '--bg-secondary': '#ede9fe', '--text-primary': '#3730a3', '--text-secondary': '#6366f1' },
  'rose-magenta': { '--color-primary': '#ec4899', '--color-primary-dark': '#a21caf', '--color-secondary': '#f472b6', '--color-accent': '#d946ef', '--bg-primary': '#fdf2f8', '--bg-secondary': '#fce7f3', '--text-primary': '#a21caf', '--text-secondary': '#ec4899' },
  'amber-caramel': { '--color-primary': '#fbbf24', '--color-primary-dark': '#d97706', '--color-secondary': '#f59e42', '--color-accent': '#b45309', '--bg-primary': '#fffbeb', '--bg-secondary': '#fef3c7', '--text-primary': '#78350f', '--text-secondary': '#b45309' },
  'cool-cyan': { '--color-primary': '#06b6d4', '--color-primary-dark': '#0e7490', '--color-secondary': '#22d3ee', '--color-accent': '#164e63', '--bg-primary': '#ecfeff', '--bg-secondary': '#cffafe', '--text-primary': '#164e63', '--text-secondary': '#06b6d4' },
  'copper-brown': { '--color-primary': '#b45309', '--color-primary-dark': '#92400e', '--color-secondary': '#a16207', '--color-accent': '#78350f', '--bg-primary': '#fef6e4', '--bg-secondary': '#fde68a', '--text-primary': '#78350f', '--text-secondary': '#a16207' },
  'mint-lime': { '--color-primary': '#6ee7b7', '--color-primary-dark': '#84cc16', '--color-secondary': '#bef264', '--color-accent': '#a7f3d0', '--bg-primary': '#f7fee7', '--bg-secondary': '#ecfccb', '--text-primary': '#365314', '--text-secondary': '#84cc16' },
  'sky-blue': { '--color-primary': '#0ea5e9', '--color-primary-dark': '#0369a1', '--color-secondary': '#7dd3fc', '--color-accent': '#38bdf8', '--bg-primary': '#f0f9ff', '--bg-secondary': '#e0f2fe', '--text-primary': '#0c4a6e', '--text-secondary': '#0ea5e9' },
  'charcoal-orange': { '--color-primary': '#fb923c', '--color-primary-dark': '#f59e42', '--color-secondary': '#334155', '--color-accent': '#1e293b', '--bg-primary': '#f8fafc', '--bg-secondary': '#f1f5f9', '--text-primary': '#1e293b', '--text-secondary': '#fb923c' },
  'platinum-aqua': { '--color-primary': '#06b6d4', '--color-primary-dark': '#64748b', '--color-secondary': '#a5f3fc', '--color-accent': '#e5e7eb', '--bg-primary': '#f0fdfa', '--bg-secondary': '#e0f2fe', '--text-primary': '#334155', '--text-secondary': '#06b6d4' },
  'ruby-gold': { '--color-primary': '#be123c', '--color-primary-dark': '#991b1b', '--color-secondary': '#fbbf24', '--color-accent': '#f59e42', '--bg-primary': '#fff7ed', '--bg-secondary': '#fef3c7', '--text-primary': '#991b1b', '--text-secondary': '#be123c' },
  'sunset-orange': { '--color-primary': '#ff7e5f', '--color-primary-dark': '#d7263d', '--color-secondary': '#feb47b', '--color-accent': '#ff6a00', '--bg-primary': '#fff5e6', '--bg-secondary': '#ffe0b2', '--text-primary': '#d7263d', '--text-secondary': '#ff7e5f' },
  'deep-sea': { '--color-primary': '#003973', '--color-primary-dark': '#005f73', '--color-secondary': '#0a9396', '--color-accent': '#e5e5be', '--bg-primary': '#e0fbfc', '--bg-secondary': '#c2e9fb', '--text-primary': '#003973', '--text-secondary': '#0a9396' },
  'forest-moss': { '--color-primary': '#355c3a', '--color-primary-dark': '#6b8e23', '--color-secondary': '#a7c957', '--color-accent': '#b2ad7f', '--bg-primary': '#f4f9e9', '--bg-secondary': '#e9f5db', '--text-primary': '#355c3a', '--text-secondary': '#6b8e23' },
  'lavender-dream': { '--color-primary': '#b57edc', '--color-primary-dark': '#a0ced9', '--color-secondary': '#c3aed6', '--color-accent': '#f7cac9', '--bg-primary': '#f3e8ff', '--bg-secondary': '#e9d8fd', '--text-primary': '#6d597a', '--text-secondary': '#b57edc' },
  'neon-night': { '--color-primary': '#00f0ff', '--color-primary-dark': '#7c3aed', '--color-secondary': '#ff00ea', '--color-accent': '#0f172a', '--bg-primary': '#18181b', '--bg-secondary': '#27272a', '--text-primary': '#00f0ff', '--text-secondary': '#ff00ea' },
  'peachy-keen': { '--color-primary': '#ffb997', '--color-primary-dark': '#f67e7d', '--color-secondary': '#f6cd61', '--color-accent': '#fff1cf', '--bg-primary': '#fff7f0', '--bg-secondary': '#ffe5d9', '--text-primary': '#f67e7d', '--text-secondary': '#ffb997' },
  'royal-sapphire': { '--color-primary': '#273c75', '--color-primary-dark': '#192a56', '--color-secondary': '#fbc531', '--color-accent': '#e1b382', '--bg-primary': '#f5f6fa', '--bg-secondary': '#dff9fb', '--text-primary': '#192a56', '--text-secondary': '#fbc531' },
  'pearl-white': { '--color-primary': '#f8f8ff', '--color-primary-dark': '#eaeaea', '--color-secondary': '#d6d6d6', '--color-accent': '#f5f3f0', '--bg-primary': '#ffffff', '--bg-secondary': '#f5f3f0', '--text-primary': '#22223b', '--text-secondary': '#a1a1aa' },
  'smoky-plum': { '--color-primary': '#4b2840', '--color-primary-dark': '#212121', '--color-secondary': '#6c3483', '--color-accent': '#b388ff', '--bg-primary': '#f3e6f5', '--bg-secondary': '#e1bee7', '--text-primary': '#212121', '--text-secondary': '#6c3483' },
  'champagne-blush': { '--color-primary': '#f7cac9', '--color-primary-dark': '#f9e4b7', '--color-secondary': '#ffe5b4', '--color-accent': '#f3e6e3', '--bg-primary': '#fffaf3', '--bg-secondary': '#f9e4b7', '--text-primary': '#b08d57', '--text-secondary': '#f7cac9' },
  'electric-coral': { '--color-primary': '#ff6f61', '--color-primary-dark': '#ff3cac', '--color-secondary': '#ffb86b', '--color-accent': '#ff61a6', '--bg-primary': '#fff0f6', '--bg-secondary': '#ffe5ec', '--text-primary': '#ff3cac', '--text-secondary': '#ff6f61' },
  'cyber-lime': { '--color-primary': '#d0ff14', '--color-primary-dark': '#00ffab', '--color-secondary': '#b2ff59', '--color-accent': '#c0c0c0', '--bg-primary': '#f4fff8', '--bg-secondary': '#eaffd0', '--text-primary': '#00ffab', '--text-secondary': '#d0ff14' },
  'volcanic-red': { '--color-primary': '#ff3c38', '--color-primary-dark': '#d7263d', '--color-secondary': '#ff8c42', '--color-accent': '#ff5e13', '--bg-primary': '#fff0eb', '--bg-secondary': '#ffe5d0', '--text-primary': '#d7263d', '--text-secondary': '#ff3c38' },
  'hyper-violet': { '--color-primary': '#7c3aed', '--color-primary-dark': '#3b0764', '--color-secondary': '#00eaff', '--color-accent': '#a21caf', '--bg-primary': '#f3e8ff', '--bg-secondary': '#e0e7ff', '--text-primary': '#3b0764', '--text-secondary': '#7c3aed' },
  'desert-clay': { '--color-primary': '#e2725b', '--color-primary-dark': '#c97d60', '--color-secondary': '#e1b382', '--color-accent': '#f3e9dc', '--bg-primary': '#f9f6f2', '--bg-secondary': '#f3e9dc', '--text-primary': '#c97d60', '--text-secondary': '#e2725b' },
  'olive-grove': { '--color-primary': '#556b2f', '--color-primary-dark': '#7c6f57', '--color-secondary': '#a9a587', '--color-accent': '#b2ad7f', '--bg-primary': '#f6f5ee', '--bg-secondary': '#e9e7da', '--text-primary': '#7c6f57', '--text-secondary': '#556b2f' },
  'autumn-bark': { '--color-primary': '#7c4700', '--color-primary-dark': '#b4654a', '--color-secondary': '#eab464', '--color-accent': '#f6ae2d', '--bg-primary': '#f9f6f2', '--bg-secondary': '#f6ae2d', '--text-primary': '#7c4700', '--text-secondary': '#b4654a' },
  'mossy-stone': { '--color-primary': '#7a918d', '--color-primary-dark': '#6b9080', '--color-secondary': '#b2b1a7', '--color-accent': '#a7c957', '--bg-primary': '#eaf4f4', '--bg-secondary': '#d6e5e3', '--text-primary': '#6b9080', '--text-secondary': '#7a918d' },
  'cotton-candy': { '--color-primary': '#fcbad3', '--color-primary-dark': '#a1c6ea', '--color-secondary': '#b5ead7', '--color-accent': '#c7ceea', '--bg-primary': '#f7faff', '--bg-secondary': '#fcbad3', '--text-primary': '#a1c6ea', '--text-secondary': '#fcbad3' },
  'misty-dawn': { '--color-primary': '#ffe5b4', '--color-primary-dark': '#c3aed6', '--color-secondary': '#fff1cf', '--color-accent': '#f7cac9', '--bg-primary': '#fffaf3', '--bg-secondary': '#fff1cf', '--text-primary': '#c3aed6', '--text-secondary': '#ffe5b4' },
  'powder-blue': { '--color-primary': '#b5d0ec', '--color-primary-dark': '#a2d5f2', '--color-secondary': '#e3f6fc', '--color-accent': '#f6f7f9', '--bg-primary': '#f6f7f9', '--bg-secondary': '#e3f6fc', '--text-primary': '#a2d5f2', '--text-secondary': '#b5d0ec' },
  'whisper-gray': { '--color-primary': '#f5f3f0', '--color-primary-dark': '#eaeaea', '--color-secondary': '#f7cac9', '--color-accent': '#d6d6d6', '--bg-primary': '#f7f7fa', '--bg-secondary': '#f5f3f0', '--text-primary': '#eaeaea', '--text-secondary': '#f5f3f0' },
  'midnight-noir': { '--color-primary': '#18181b', '--color-primary-dark': '#22223b', '--color-secondary': '#4a4e69', '--color-accent': '#9a8c98', '--bg-primary': '#18181b', '--bg-secondary': '#22223b', '--text-primary': '#f2e9e4', '--text-secondary': '#9a8c98' },
  'vampire-wine': { '--color-primary': '#6a0572', '--color-primary-dark': '#2e003e', '--color-secondary': '#ab2346', '--color-accent': '#a83232', '--bg-primary': '#2e003e', '--bg-secondary': '#6a0572', '--text-primary': '#f2e9e4', '--text-secondary': '#ab2346' },
  'obsidian-green': { '--color-primary': '#0b3d20', '--color-primary-dark': '#14532d', '--color-secondary': '#1a4d2e', '--color-accent': '#00ffab', '--bg-primary': '#18181b', '--bg-secondary': '#14532d', '--text-primary': '#00ffab', '--text-secondary': '#0b3d20' },
  'shadow-plum': { '--color-primary': '#3d315b', '--color-primary-dark': '#444554', '--color-secondary': '#6c3483', '--color-accent': '#b388ff', '--bg-primary': '#22223b', '--bg-secondary': '#3d315b', '--text-primary': '#b388ff', '--text-secondary': '#3d315b' },
  '70s-mustard': { '--color-primary': '#e1ad01', '--color-primary-dark': '#ff8800', '--color-secondary': '#ffb627', '--color-accent': '#ffcb9a', '--bg-primary': '#fffbe6', '--bg-secondary': '#ffcb9a', '--text-primary': '#e1ad01', '--text-secondary': '#ff8800' },
  '80s-neon': { '--color-primary': '#ff00c8', '--color-primary-dark': '#00eaff', '--color-secondary': '#fff700', '--color-accent': '#ff61a6', '--bg-primary': '#fff0f6', '--bg-secondary': '#ffe5ec', '--text-primary': '#00eaff', '--text-secondary': '#ff00c8' },
  '90s-denim': { '--color-primary': '#3b5998', '--color-primary-dark': '#8b9dc3', '--color-secondary': '#dfe3ee', '--color-accent': '#f7cac9', '--bg-primary': '#f6f7f9', '--bg-secondary': '#dfe3ee', '--text-primary': '#3b5998', '--text-secondary': '#8b9dc3' },
  'mid-century-teal': { '--color-primary': '#008080', '--color-primary-dark': '#b5651d', '--color-secondary': '#e0a899', '--color-accent': '#f4e285', '--bg-primary': '#f4f9f4', '--bg-secondary': '#e0a899', '--text-primary': '#b5651d', '--text-secondary': '#008080' }
};


// Add global type for palette
declare global {
  interface Window {
    __GLOBAL_PALETTE__?: string;
  }
}

async function applyGlobalPalette() {
  // Fetch palette name from Supabase
  const { data } = await supabase
    .from('global_settings')
    .select('setting_value')
    .eq('setting_key', 'global_color_theme')
    .single();

  let palette = 'default';
  if (data && data.setting_value) {
    try {
      palette = JSON.parse(data.setting_value);
    } catch {}
  }

  // Store globally for SettingsContext to reference
  window.__GLOBAL_PALETTE__ = palette;

  // Also update the localStorage to match global palette for immediate loading
  const currentLocalSettings = localStorage.getItem('marketplace_settings');
  if (currentLocalSettings) {
    try {
      const settings = JSON.parse(currentLocalSettings);
      // Only update if user doesn't have a custom palette set
      if (!settings.colorPalette || settings.colorPalette === 'default' || settings.colorPalette === 'copper-brown') {
        settings.colorPalette = palette;
        localStorage.setItem('marketplace_settings', JSON.stringify(settings));
      }
    } catch (e) {
      // If parsing fails, create new settings with global palette
      localStorage.setItem('marketplace_settings', JSON.stringify({ colorPalette: palette }));
    }
  } else {
    // No local settings exist, create with global palette
    localStorage.setItem('marketplace_settings', JSON.stringify({ colorPalette: palette }));
  }
  const vars = paletteVars[palette] || paletteVars['default'];
  if (vars) {
    for (const key in vars) {
      document.documentElement.style.setProperty(key, vars[key]);
    }
    document.body.classList.add('palette-' + palette);
  }

  // Trigger a custom event to notify other parts of the app
  window.dispatchEvent(new CustomEvent('globalPaletteApplied', { detail: { palette } }));
  
  // Force favicon update after a small delay to ensure DOM is ready
  setTimeout(() => {
    if (window.updateFaviconColor) {
      console.log('🎨 Triggering favicon update from main.tsx');
      window.updateFaviconColor();
    }
  }, 100);
}

// Block rendering until palette is applied
applyGlobalPalette().then(() => {
  const loader = document.getElementById('palette-loader');
  const root = document.getElementById('root');
  if (loader) loader.style.display = 'none';
  if (root) {
    root.style.display = '';
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
});