export interface Shift {
  id: number;
  drive_id: number;
  start_time: Date;
  end_time: Date;
  status: string;
  driver: Driver;
  motorcycle: Motorcycle;
}

export interface Driver {
  id: number;
  name: string;
  license_number: string;
  phone: string;
  email: string;
  status: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface Menu {
  id: number;
  restaurant_id: number;
  product_id: number;
  price: number;
  availiability: boolean;
  product: Product;
  restaurant: Restaurant;
}

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Order {
  id: number;
  customer_id: number;
  menu_id: number;
  motorcycle_id: number;
  quatity: number;
  total_price: number;
  status: string;
  customer: Customer;
  menu: Menu;
}

export interface Motorcycle {
  id: number;
  license_plate: string;
  brand: string;
  year: number;
  status: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  photoUrl?: string;
}

export interface Address {
  id: number;
  order_id: number;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Issue {
  id: number;
  motorcycle_id: number;
  description: string;
  issue_type: string;
  date_reported: Date;
  status: string;
  motorcycle?: Motorcycle;
}

export interface Photo {
  id: number;
  issue_id: number;
  photo_url: string;
  uploaded_at: Date;
  description?: string;
}

export interface CreateRestaurantDto {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface CreateMenuDto {
  restaurant_id: number;
  product_id: number;
  price: number;
  availiability: boolean;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
}

export interface CreateOrderDto {
  customer_id: number;
  menu_id: number;
  motorcycle_id?: number;
  quatity: number;
  total_price: number;
  status: string;
}

export interface CreateAddressDto {
  order_id: number;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateMotorcycleDto {
  license_plate: string;
  brand: string;
  year: number;
  status: string;
}

export interface CreateDriverDto {
  name: string;
  license_number: string;
  phone: string;
  email: string;
  status: string;
}

export interface CreateShiftDto {
  drive_id: number;
  start_time: Date;
  end_time: Date;
  status: string;
}

export interface CreateIssueDto {
  motorcycle_id: number;
  description: string;
  issue_type: string;
  date_reported: Date;
  status: string;
}

export interface CreatePhotoDto {
  issue_id: number;
  photo_url: string;
  description?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
  borderColor?: string[];
  borderWidth?: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface OrderNotification {
  id: string;
  order_id: number;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'order';
  title?: string;
  message: string;
  duration?: number;
}


export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Modelo de ubicación de motocicleta
export interface MotorcycleLocation {
  motorcycle_id: string;
  driver_name: string;
  license_plate: string;
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number; // grados (0-360)
  last_update: Date;
  status: 'idle' | 'picking_up' | 'delivering' | 'offline';
  current_order_id?: string;
}

// Modelo de orden activa en el mapa
export interface ActiveOrder {
  order_id: string;
  motorcycle_id: string;
  customer_name: string;
  restaurant: string;
  restaurant_location: { lat: number; lng: number };
  delivery_location: { lat: number; lng: number };
  status: 'pending' | 'picked_up' | 'on_route' | 'delivered';
  estimated_time: number; // minutos
  total: number;
}

// Modelo de ruta
export interface Route {
  order_id: string;
  motorcycle_id: string;
  waypoints: { lat: number; lng: number }[];
  distance: number; // km
  duration: number; // minutos
}

// Evento de actualización de ubicación
export interface LocationUpdateEvent {
  motorcycle_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: Date;
}