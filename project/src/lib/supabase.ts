import { supabase } from '../services/supabaseClient';
import { RESTAURANT_CONFIG } from '../config/restaurant.config';
export type { MenuItem, MenuItemInput } from '../types/menu';

export { supabase };
export const MENU_CATEGORIES = RESTAURANT_CONFIG.categories;
