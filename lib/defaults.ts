import { SiteContent, GalleryItem, IntelFeed, ChatContact, ChatMessage } from '@/types/database';

export const DEFAULT_CONTENT_ROWS: SiteContent[] = [
  { id: 1, content_key: 'site_name', content_value: 'NEXUS INTEL', label: 'Site Name', section: 'brand' },
  { id: 2, content_key: 'site_tagline', content_value: 'CLASSIFIED // GLOBAL THREAT INTELLIGENCE', label: 'Tagline', section: 'brand' },
  { id: 3, content_key: 'hero_title', content_value: 'SURVEILLANCE. ANALYSIS. DOMINANCE.', label: 'Hero Title', section: 'hero' },
  { id: 4, content_key: 'hero_subtitle', content_value: 'Real-time cyber threat intelligence for nation-state defence, enterprise security, and dark-net monitoring operations.', label: 'Hero Subtitle', section: 'hero' },
  { id: 5, content_key: 'hero_cta', content_value: 'ACCESS BRIEFING', label: 'Hero CTA Text', section: 'hero' },
  { id: 6, content_key: 'about_title', content_value: 'THE AGENCY', label: 'About Title', section: 'about' },
  { id: 7, content_key: 'about_text', content_value: 'NEXUS INTEL operates at the intersection of signals intelligence, cyber warfare, and strategic counter-espionage. Our analysts fuse OSINT, SIGINT, and proprietary dark-web feeds into actionable threat pictures for governments and critical infrastructure operators worldwide.', label: 'About Text', section: 'about' },
  { id: 8, content_key: 'mission_title', content_value: 'OPERATIONAL DIRECTIVES', label: 'Mission Title', section: 'mission' },
  { id: 9, content_key: 'stat_1_value', content_value: '14.2K', label: 'Stat 1 Value', section: 'stats' },
  { id: 10, content_key: 'stat_1_label', content_value: 'THREATS NEUTRALIZED', label: 'Stat 1 Label', section: 'stats' },
  { id: 11, content_key: 'stat_2_value', content_value: '97%', label: 'Stat 2 Value', section: 'stats' },
  { id: 12, content_key: 'stat_2_label', content_value: 'DETECTION RATE', label: 'Stat 2 Label', section: 'stats' },
  { id: 13, content_key: 'stat_3_value', content_value: '48', label: 'Stat 3 Value', section: 'stats' },
  { id: 14, content_key: 'stat_3_label', content_value: 'ACTIVE THEATERS', label: 'Stat 3 Label', section: 'stats' },
  { id: 15, content_key: 'stat_4_value', content_value: '24/7', label: 'Stat 4 Value', section: 'stats' },
  { id: 16, content_key: 'stat_4_label', content_value: 'SOC COVERAGE', label: 'Stat 4 Label', section: 'stats' },
  { id: 17, content_key: 'services_title', content_value: 'CAPABILITY MATRIX', label: 'Services Title', section: 'services' },
  { id: 18, content_key: 'service_1_title', content_value: 'THREAT HUNTING', label: 'Service 1 Title', section: 'services' },
  { id: 19, content_key: 'service_1_text', content_value: 'Proactive adversary tracking across endpoint, network, and cloud attack surfaces with zero-day intelligence pipelines.', label: 'Service 1 Text', section: 'services' },
  { id: 20, content_key: 'service_2_title', content_value: 'DARK WEB INTEL', label: 'Service 2 Title', section: 'services' },
  { id: 21, content_key: 'service_2_text', content_value: 'Continuous monitoring of underground forums, leak markets, and credential dumps for early breach indicators.', label: 'Service 2 Text', section: 'services' },
  { id: 22, content_key: 'service_3_title', content_value: 'INCIDENT RESPONSE', label: 'Service 3 Title', section: 'services' },
  { id: 23, content_key: 'service_3_text', content_value: 'Rapid containment, forensic reconstruction, and attribution support for high-severity cyber incidents.', label: 'Service 3 Text', section: 'services' },
  { id: 24, content_key: 'service_4_title', content_value: 'RED TEAM OPS', label: 'Service 4 Title', section: 'services' },
  { id: 25, content_key: 'service_4_text', content_value: 'Adversary simulation exercises that stress-test perimeter, identity, and physical security postures.', label: 'Service 4 Text', section: 'services' },
  { id: 26, content_key: 'gallery_title', content_value: 'FIELD SURVEILLANCE', label: 'Gallery Title', section: 'gallery' },
  { id: 27, content_key: 'feeds_title', content_value: 'LIVE INTEL STREAM', label: 'Feeds Title', section: 'feeds' },
  { id: 28, content_key: 'contact_title', content_value: 'SECURE CHANNEL', label: 'Contact Title', section: 'contact' },
  { id: 29, content_key: 'contact_text', content_value: 'Encrypted intake only. Clearance Level 3 required for operational briefings.', label: 'Contact Text', section: 'contact' },
  { id: 30, content_key: 'contact_email', content_value: 'secure@nexus-intel.ops', label: 'Contact Email', section: 'contact' },
  { id: 31, content_key: 'footer_text', content_value: 'NEXUS INTEL // CLASSIFIED OPERATIONS // UNAUTHORIZED ACCESS PROHIBITED', label: 'Footer Text', section: 'footer' },
  { id: 32, content_key: 'chat_title', content_value: 'WHATSAPP EXTRACTION', label: 'Chat Section Title', section: 'chat' },
  { id: 33, content_key: 'chat_subtitle', content_value: 'Target handset dump — all chats pulled from the extracted number.', label: 'Chat Section Subtitle', section: 'chat' },
  { id: 34, content_key: 'chat_source_phone', content_value: '+91 9906451074', label: 'Extracted Phone Number', section: 'chat' },
  { id: 35, content_key: 'chat_tool_banner', content_value: 'DARKSCAN v4.2.1 - SESSION ENCRYPTED', label: 'Tool Banner Line', section: 'chat' },
  { id: 36, content_key: 'chat_status', content_value: 'EXTRACTION COMPLETE', label: 'Top Status Label', section: 'chat' },
];

export const DEFAULT_CONTENT_DICT: Record<string, string> = DEFAULT_CONTENT_ROWS.reduce((acc, row) => {
  acc[row.content_key] = row.content_value;
  return acc;
}, {} as Record<string, string>);

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: 'SOC COMMAND NODE',
    description: 'Primary security operations center — overnight shift.',
    image_path: '/assets/uploads/placeholder-soc.svg',
    category: 'ops',
    sort_order: 1,
    is_active: 1,
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 2,
    title: 'SIGNAL INTERCEPT ARRAY',
    description: 'Long-range RF collection during field exercise.',
    image_path: '/assets/uploads/placeholder-signal.svg',
    category: 'field',
    sort_order: 2,
    is_active: 1,
    created_at: new Date('2026-01-02T00:00:00Z').toISOString(),
  },
  {
    id: 3,
    title: 'THREAT MAP OVERLAY',
    description: 'Global active campaign heat visualization.',
    image_path: '/assets/uploads/placeholder-map.svg',
    category: 'intel',
    sort_order: 3,
    is_active: 1,
    created_at: new Date('2026-01-03T00:00:00Z').toISOString(),
  },
  {
    id: 4,
    title: 'FORENSICS LAB',
    description: 'Malware reverse-engineering bay.',
    image_path: '/assets/uploads/placeholder-lab.svg',
    category: 'ops',
    sort_order: 4,
    is_active: 1,
    created_at: new Date('2026-01-04T00:00:00Z').toISOString(),
  },
];

export const DEFAULT_INTEL_FEEDS: IntelFeed[] = [
  {
    id: 1,
    title: 'RANSOMWARE CLUSTER DETECTED',
    body: 'New LockBit affiliate infrastructure observed probing healthcare verticals across APAC. IOC package queued for distribution.',
    threat_level: 'critical',
    is_active: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 2,
    title: 'CREDENTIAL DUMP — FINTECH',
    body: '2.1M records from a regional payment processor surfaced on a closed forum. Correlation with prior breaches in progress.',
    threat_level: 'high',
    is_active: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 3,
    title: 'STATE ACTOR TTP UPDATE',
    body: 'APT29 tooling refresh: new stealth loader variants using legitimate cloud CDNs for C2. Detection rules published.',
    threat_level: 'high',
    is_active: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 4,
    title: 'SUPPLY CHAIN ADVISORY',
    body: 'Compromised npm package used in CI pipelines of three defence contractors. Immediate package pin recommended.',
    threat_level: 'medium',
    is_active: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
  },
];

export const DEFAULT_CHAT_CONTACTS: ChatContact[] = [
  {
    id: 1,
    name: 'Agent Viper',
    phone: '+1 202 555 0147',
    status_text: 'Field operative',
    avatar_path: null,
    avatar_color: '#25d366',
    last_seen: 'online',
    is_active: 1,
    sort_order: 1,
  },
  {
    id: 2,
    name: 'Handler Nova',
    phone: '+44 7700 900123',
    status_text: 'Command relay',
    avatar_path: null,
    avatar_color: '#128c7e',
    last_seen: 'last seen today at 21:14',
    is_active: 1,
    sort_order: 2,
  },
  {
    id: 3,
    name: 'Ghost Cell',
    phone: '+971 50 555 0199',
    status_text: 'Encrypted node',
    avatar_path: null,
    avatar_color: '#34b7f1',
    last_seen: 'online',
    is_active: 1,
    sort_order: 3,
  },
];

export const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  { id: 1, contact_id: 1, sender: 'them', message: 'Package confirmed. Eyes on the perimeter.', sent_at: new Date(Date.now() - 25 * 60000).toISOString(), is_read: 1, sort_order: 1 },
  { id: 2, contact_id: 1, sender: 'me', message: 'Copy. Extract window opens at 02:00 Z.', sent_at: new Date(Date.now() - 24 * 60000).toISOString(), is_read: 1, sort_order: 2 },
  { id: 3, contact_id: 1, sender: 'them', message: 'Got thermal on two hostiles near the north gate.', sent_at: new Date(Date.now() - 22 * 60000).toISOString(), is_read: 1, sort_order: 3 },
  { id: 4, contact_id: 1, sender: 'me', message: 'Hold position. Do not engage unless compromised.', sent_at: new Date(Date.now() - 20 * 60000).toISOString(), is_read: 1, sort_order: 4 },
  { id: 5, contact_id: 1, sender: 'them', message: 'Understood. Channel stays dark until you ping.', sent_at: new Date(Date.now() - 18 * 60000).toISOString(), is_read: 1, sort_order: 5 },

  { id: 6, contact_id: 2, sender: 'them', message: 'Uplink ready. Standing by for next directive.', sent_at: new Date(Date.now() - 12 * 60000).toISOString(), is_read: 1, sort_order: 1 },
  { id: 7, contact_id: 2, sender: 'me', message: 'Relay the SOC feed to Ghost Cell. Priority critical.', sent_at: new Date(Date.now() - 10 * 60000).toISOString(), is_read: 1, sort_order: 2 },
  { id: 8, contact_id: 2, sender: 'them', message: 'Done. They acknowledged with green status.', sent_at: new Date(Date.now() - 8 * 60000).toISOString(), is_read: 1, sort_order: 3 },

  { id: 9, contact_id: 3, sender: 'them', message: 'Node is clean. No packet loss on the dead-drop.', sent_at: new Date(Date.now() - 6 * 60000).toISOString(), is_read: 1, sort_order: 1 },
  { id: 10, contact_id: 3, sender: 'me', message: 'Send the dump hash when you have it.', sent_at: new Date(Date.now() - 4 * 60000).toISOString(), is_read: 1, sort_order: 2 },
  { id: 11, contact_id: 3, sender: 'them', message: 'sha256:9f2c…a81e — already mirrored to vault.', sent_at: new Date(Date.now() - 2 * 60000).toISOString(), is_read: 1, sort_order: 3 },
];

export const DEFAULT_ADMIN = {
  id: 1,
  username: 'admin',
  password: '$2y$10$4JOHrCPp94ZspJwo9/5AYu/ISrC.b7vpEd9DxH1MKqGR.AjvGstrG',
};
