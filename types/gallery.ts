export type GalleryCategory = 'ops' | 'field' | 'intel' | 'lab';

export interface GalleryInput {
  title: string;
  description?: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  image_path?: string;
}
