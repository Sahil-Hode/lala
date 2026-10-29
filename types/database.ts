export interface Admin {
  id: number;
  username: string;
  password?: string;
  created_at: string | Date;
}

export interface SiteContent {
  id: number;
  content_key: string;
  content_value: string;
  label: string;
  section: string;
  updated_at?: string | Date;
}

export interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  image_path: string;
  category: 'ops' | 'field' | 'intel' | 'lab' | string;
  sort_order: number;
  is_active: number | boolean;
  created_at?: string | Date;
}

export interface IntelFeed {
  id: number;
  title: string;
  body: string;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  is_active: number | boolean;
  created_at: string | Date;
}

export interface ChatContact {
  id: number;
  name: string;
  phone: string;
  status_text: string;
  avatar_path: string | null;
  avatar_color: string;
  last_seen: string;
  is_active: number | boolean;
  sort_order: number;
  created_at?: string | Date;
}

export interface ChatMessage {
  id: number;
  contact_id: number;
  sender: 'them' | 'me';
  message: string;
  sent_at: string | Date;
  is_read?: number | boolean;
  sort_order: number;
}
