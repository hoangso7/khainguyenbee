export interface User {
  id: string;
  username: string;
  email: string;
  business_name: string;
  contact_info: string;
  created_at: string;
}

export interface Beehive {
  serial_number: string;
  qr_token: string;
  import_date: string;
  split_date?: string;
  health_status: 'Tốt' | 'Bình thường' | 'Yếu';
  notes?: string;
  is_sold: boolean;
  sold_date?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type HealthStatus = 'Tốt' | 'Bình thường' | 'Yếu';
