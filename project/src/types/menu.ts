export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  available: boolean;
  is_popular: boolean;
}

export interface MenuItemInput {
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  available: boolean;
  is_popular: boolean;
}
