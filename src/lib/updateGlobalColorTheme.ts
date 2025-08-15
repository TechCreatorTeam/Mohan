import { supabase } from './supabase';

export async function updateGlobalColorTheme(paletteId: string) {
  // Update the global_color_theme row in global_settings
  const { error } = await supabase
    .from('global_settings')
    .update({ setting_value: JSON.stringify(paletteId) })
    .eq('setting_key', 'global_color_theme');
  if (error) throw error;
}
