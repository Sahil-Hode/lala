import { SiteContent } from './database';

export type ContentDictionary = Record<string, string>;

export interface GroupedContent {
  [section: string]: SiteContent[];
}
