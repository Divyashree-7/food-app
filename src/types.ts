export type AppRole = 'customer' | 'vendor' | 'delivery' | 'admin';
export type AppLanguage = 'en' | 'hi';
export type ActiveInterface = 'customer' | 'delivery' | 'vendor' | 'admin';

export interface Store {
  id: string;
  legacy_id: string;
  name_en: string;
  name_hi: string;
  description_en: string;
  description_hi: string;
  type: 'restaurant' | 'grocery';
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  logo_url: string;
  cover_image_url: string;
  avg_rating: number;
  total_ratings: number;
  delivery_radius_km: number;
  avg_prep_time_minutes: number;
  min_order_value: number;
  is_active: boolean;
  is_accepting_orders: boolean;
  source: 'external' | 'manual';
  last_synced_at: string;
}

export interface ProductVariant {
  id: string;
  name_en: string;
  name_hi: string;
  price_delta: number;
}

export interface Product {
  id: string;
  legacy_id: string;
  store_id: string;
  category_id: string;
  category_name_en: string;
  category_name_hi: string;
  name_en: string;
  name_hi: string;
  description_en: string;
  description_hi: string;
  price: number;
  discounted_price: number;
  image_url: string;
  is_veg: boolean;
  unit: 'kg' | 'g' | 'litre' | 'ml' | 'piece' | 'pack';
  stock_quantity: number;
  variants: ProductVariant[];
  is_available: boolean;
  gst_rate: number;
  last_synced_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface OrderItem {
  product_id: string;
  name_en: string;
  name_hi: string;
  price: number;
  quantity: number;
  subtotal: number;
  selected_variant?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  store_id: string;
  store_name: string;
  delivery_partner_id: string | null;
  order_type: 'food' | 'grocery';
  items: OrderItem[];
  delivery_address: {
    full_address: string;
    landmark: string;
    latitude: number;
    longitude: number;
    city: string;
  };
  items_total: number;
  delivery_fee: number;
  taxes: number;
  discount: number;
  grand_total: number;
  payment_method: 'upi' | 'card' | 'cod';
  payment_status: 'pending' | 'captured';
  order_status:
    | 'placed'
    | 'accepted'
    | 'preparing'
    | 'ready'
    | 'picked_up'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  delivery_otp: string;
  placed_at: string;
  estimated_delivery_time: string;
  prep_time_minutes: number;
  driver_lat?: number;
  driver_lng?: number;
}

export interface UserSession {
  id: string;
  token: string;
  user_id: string;
  device_info: string;
  created_at: string;
  last_active_at: string;
}

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  role: AppRole;
  preferred_language: AppLanguage;
  is_blocked: boolean;
  activeSessionsCount?: number;
}
