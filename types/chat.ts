import { ChatContact, ChatMessage } from './database';

export interface ChatThread extends ChatContact {
  messages: ChatMessage[];
  preview?: string;
  preview_time?: string | null;
}

export interface ContactInput {
  name: string;
  phone?: string;
  status_text?: string;
  last_seen?: string;
  avatar_color?: string;
  sort_order?: number;
  is_active?: boolean;
  avatar_path?: string | null;
}

export interface MessageInput {
  contact_id: number;
  sender: 'them' | 'me';
  message: string;
  sent_at?: string;
  sort_order?: number;
}
