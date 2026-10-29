export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';

export interface FeedInput {
  title: string;
  body: string;
  threat_level: ThreatLevel;
  is_active: boolean;
}
