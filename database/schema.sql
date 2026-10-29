-- NEXUS INTEL — Cyber Intelligence Platform Schema
CREATE DATABASE IF NOT EXISTS nexus_intel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexus_intel;

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_key VARCHAR(100) NOT NULL UNIQUE,
    content_value TEXT,
    label VARCHAR(150) NOT NULL,
    section VARCHAR(50) NOT NULL DEFAULT 'general',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_path VARCHAR(500) NOT NULL,
    category VARCHAR(50) DEFAULT 'ops',
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS intel_feeds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    threat_level ENUM('low','medium','high','critical') DEFAULT 'medium',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin: username `admin` / password `nexus2026`
INSERT INTO admins (username, password) VALUES
('admin', '$2y$10$4JOHrCPp94ZspJwo9/5AYu/ISrC.b7vpEd9DxH1MKqGR.AjvGstrG');

INSERT INTO site_content (content_key, content_value, label, section) VALUES
('site_name', 'NEXUS INTEL', 'Site Name', 'brand'),
('site_tagline', 'CLASSIFIED // GLOBAL THREAT INTELLIGENCE', 'Tagline', 'brand'),
('hero_title', 'SURVEILLANCE. ANALYSIS. DOMINANCE.', 'Hero Title', 'hero'),
('hero_subtitle', 'Real-time cyber threat intelligence for nation-state defence, enterprise security, and dark-net monitoring operations.', 'Hero Subtitle', 'hero'),
('hero_cta', 'ACCESS BRIEFING', 'Hero CTA Text', 'hero'),
('about_title', 'THE AGENCY', 'About Title', 'about'),
('about_text', 'NEXUS INTEL operates at the intersection of signals intelligence, cyber warfare, and strategic counter-espionage. Our analysts fuse OSINT, SIGINT, and proprietary dark-web feeds into actionable threat pictures for governments and critical infrastructure operators worldwide.', 'About Text', 'about'),
('mission_title', 'OPERATIONAL DIRECTIVES', 'Mission Title', 'mission'),
('stat_1_value', '14.2K', 'Stat 1 Value', 'stats'),
('stat_1_label', 'THREATS NEUTRALIZED', 'Stat 1 Label', 'stats'),
('stat_2_value', '97%', 'Stat 2 Value', 'stats'),
('stat_2_label', 'DETECTION RATE', 'Stat 2 Label', 'stats'),
('stat_3_value', '48', 'Stat 3 Value', 'stats'),
('stat_3_label', 'ACTIVE THEATERS', 'Stat 3 Label', 'stats'),
('stat_4_value', '24/7', 'Stat 4 Value', 'stats'),
('stat_4_label', 'SOC COVERAGE', 'Stat 4 Label', 'stats'),
('services_title', 'CAPABILITY MATRIX', 'Services Title', 'services'),
('service_1_title', 'THREAT HUNTING', 'Service 1 Title', 'services'),
('service_1_text', 'Proactive adversary tracking across endpoint, network, and cloud attack surfaces with zero-day intelligence pipelines.', 'Service 1 Text', 'services'),
('service_2_title', 'DARK WEB INTEL', 'Service 2 Title', 'services'),
('service_2_text', 'Continuous monitoring of underground forums, leak markets, and credential dumps for early breach indicators.', 'Service 2 Text', 'services'),
('service_3_title', 'INCIDENT RESPONSE', 'Service 3 Title', 'services'),
('service_3_text', 'Rapid containment, forensic reconstruction, and attribution support for high-severity cyber incidents.', 'Service 3 Text', 'services'),
('service_4_title', 'RED TEAM OPS', 'Service 4 Title', 'services'),
('service_4_text', 'Adversary simulation exercises that stress-test perimeter, identity, and physical security postures.', 'Service 4 Text', 'services'),
('gallery_title', 'FIELD SURVEILLANCE', 'Gallery Title', 'gallery'),
('feeds_title', 'LIVE INTEL STREAM', 'Feeds Title', 'feeds'),
('contact_title', 'SECURE CHANNEL', 'Contact Title', 'contact'),
('contact_text', 'Encrypted intake only. Clearance Level 3 required for operational briefings.', 'Contact Text', 'contact'),
('contact_email', 'secure@nexus-intel.ops', 'Contact Email', 'contact'),
('footer_text', 'NEXUS INTEL // CLASSIFIED OPERATIONS // UNAUTHORIZED ACCESS PROHIBITED', 'Footer Text', 'footer'),
('chat_title', 'SECURE COMMS', 'Chat Section Title', 'chat'),
('chat_subtitle', 'Intercepted operator channels — live WhatsApp-style briefing thread.', 'Chat Section Subtitle', 'chat');

INSERT INTO intel_feeds (title, body, threat_level, is_active) VALUES
('RANSOMWARE CLUSTER DETECTED', 'New LockBit affiliate infrastructure observed probing healthcare verticals across APAC. IOC package queued for distribution.', 'critical', 1),
('CREDENTIAL DUMP — FINTECH', '2.1M records from a regional payment processor surfaced on a closed forum. Correlation with prior breaches in progress.', 'high', 1),
('STATE ACTOR TTP UPDATE', 'APT29 tooling refresh: new stealth loader variants using legitimate cloud CDNs for C2. Detection rules published.', 'high', 1),
('SUPPLY CHAIN ADVISORY', 'Compromised npm package used in CI pipelines of three defence contractors. Immediate package pin recommended.', 'medium', 1);

INSERT INTO gallery (title, description, image_path, category, sort_order, is_active) VALUES
('SOC COMMAND NODE', 'Primary security operations center — overnight shift.', 'assets/uploads/placeholder-soc.svg', 'ops', 1, 1),
('SIGNAL INTERCEPT ARRAY', 'Long-range RF collection during field exercise.', 'assets/uploads/placeholder-signal.svg', 'field', 2, 1),
('THREAT MAP OVERLAY', 'Global active campaign heat visualization.', 'assets/uploads/placeholder-map.svg', 'intel', 3, 1),
('FORENSICS LAB', 'Malware reverse-engineering bay.', 'assets/uploads/placeholder-lab.svg', 'ops', 4, 1);

CREATE TABLE IF NOT EXISTS chat_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(40) DEFAULT '',
    status_text VARCHAR(200) DEFAULT 'online',
    avatar_path VARCHAR(500) DEFAULT NULL,
    avatar_color VARCHAR(20) DEFAULT '#00a884',
    last_seen VARCHAR(80) DEFAULT 'online',
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contact_id INT NOT NULL,
    sender ENUM('them','me') NOT NULL DEFAULT 'them',
    message TEXT NOT NULL,
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (contact_id) REFERENCES chat_contacts(id) ON DELETE CASCADE
);

INSERT INTO chat_contacts (name, phone, status_text, avatar_color, last_seen, is_active, sort_order) VALUES
('Agent Viper', '+1 202 555 0147', 'Field operative', '#25d366', 'online', 1, 1),
('Handler Nova', '+44 7700 900123', 'Command relay', '#128c7e', 'last seen today at 21:14', 1, 2),
('Ghost Cell', '+971 50 555 0199', 'Encrypted node', '#34b7f1', 'online', 1, 3);

INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order) VALUES
(1, 'them', 'Package confirmed. Eyes on the perimeter.', DATE_SUB(NOW(), INTERVAL 25 MINUTE), 1),
(1, 'me', 'Copy. Extract window opens at 02:00 Z.', DATE_SUB(NOW(), INTERVAL 24 MINUTE), 2),
(1, 'them', 'Got thermal on two hostiles near the north gate.', DATE_SUB(NOW(), INTERVAL 22 MINUTE), 3),
(1, 'me', 'Hold position. Do not engage unless compromised.', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 4),
(1, 'them', 'Understood. Channel stays dark until you ping.', DATE_SUB(NOW(), INTERVAL 18 MINUTE), 5),
(2, 'them', 'Uplink ready. Standing by for next directive.', DATE_SUB(NOW(), INTERVAL 12 MINUTE), 1),
(2, 'me', 'Relay the SOC feed to Ghost Cell. Priority critical.', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 2),
(2, 'them', 'Done. They acknowledged with green status.', DATE_SUB(NOW(), INTERVAL 8 MINUTE), 3),
(3, 'them', 'Node is clean. No packet loss on the dead-drop.', DATE_SUB(NOW(), INTERVAL 6 MINUTE), 1),
(3, 'me', 'Send the dump hash when you have it.', DATE_SUB(NOW(), INTERVAL 4 MINUTE), 2),
(3, 'them', 'sha256:9f2c…a81e — already mirrored to vault.', DATE_SUB(NOW(), INTERVAL 2 MINUTE), 3);
