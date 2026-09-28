import { supabase } from './supabaseClient';
import type { MenuItem, MenuItemInput } from '../types/menu';

export async function fetchAvailableMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, description, category, price, image_url, available, is_popular')
    .eq('available', true)
    .order('category', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as MenuItem[]) ?? [];
}

export async function fetchAllMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, description, category, price, image_url, available, is_popular')
    .order('category', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as MenuItem[]) ?? [];
}

export async function createMenuItem(input: MenuItemInput): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      name: input.name,
      description: input.description || null,
      category: input.category,
      price: input.price,
      image_url: input.image_url || null,
      available: input.available,
      is_popular: input.is_popular,
    })
    .select('id, name, description, category, price, image_url, available, is_popular')
    .single();

  if (error) throw new Error(error.message);
  return data as MenuItem;
}

export async function updateMenuItem(id: string, input: Partial<MenuItemInput>): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .update(input)
    .eq('id', id)
    .select('id, name, description, category, price, image_url, available, is_popular')
    .single();

  if (error) throw new Error(error.message);
  return data as MenuItem;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function toggleItemAvailability(id: string, currentAvailable: boolean): Promise<MenuItem> {
  return updateMenuItem(id, { available: !currentAvailable });
}

export async function toggleItemPopular(id: string, currentPopular: boolean): Promise<MenuItem> {
  return updateMenuItem(id, { is_popular: !currentPopular });
}
