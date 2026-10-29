-- WhatsApp-style contacts & chats (safe to re-run)
USE nexus_intel;

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

INSERT INTO site_content (content_key, content_value, label, section)
SELECT * FROM (
    SELECT 'chat_source_phone' AS content_key, '+91 9906451074' AS content_value, 'Extracted Phone Number' AS label, 'chat' AS section
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM site_content WHERE content_key = 'chat_source_phone');

INSERT INTO site_content (content_key, content_value, label, section)
SELECT * FROM (
    SELECT 'chat_tool_banner', 'DARKSCAN v4.2.1 - SESSION ENCRYPTED', 'Tool Banner Line', 'chat'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM site_content WHERE content_key = 'chat_tool_banner');

INSERT INTO site_content (content_key, content_value, label, section)
SELECT * FROM (
    SELECT 'chat_status', 'EXTRACTION COMPLETE', 'Top Status Label', 'chat'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM site_content WHERE content_key = 'chat_status');

UPDATE site_content SET content_value='WHATSAPP EXTRACTION' WHERE content_key='chat_title';
UPDATE site_content SET content_value='Target handset dump — all chats pulled from the extracted number.' WHERE content_key='chat_subtitle';

-- Seed contacts only if empty
INSERT INTO chat_contacts (name, phone, status_text, avatar_color, last_seen, is_active, sort_order)
SELECT * FROM (
    SELECT 'Agent Viper' AS name, '+1 202 555 0147' AS phone, 'Field operative' AS status_text,
           '#25d366' AS avatar_color, 'online' AS last_seen, 1 AS is_active, 1 AS sort_order
) AS t
WHERE NOT EXISTS (SELECT 1 FROM chat_contacts LIMIT 1);

INSERT INTO chat_contacts (name, phone, status_text, avatar_color, last_seen, is_active, sort_order)
SELECT 'Handler Nova', '+44 7700 900123', 'Command relay', '#128c7e', 'last seen today at 21:14', 1, 2
FROM DUAL
WHERE (SELECT COUNT(*) FROM chat_contacts) = 1;

INSERT INTO chat_contacts (name, phone, status_text, avatar_color, last_seen, is_active, sort_order)
SELECT 'Ghost Cell', '+971 50 555 0199', 'Encrypted node', '#34b7f1', 'online', 1, 3
FROM DUAL
WHERE (SELECT COUNT(*) FROM chat_contacts) = 2;

-- Seed messages for contact 1 if none exist
INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
SELECT c.id, 'them', 'Package confirmed. Eyes on the perimeter.', DATE_SUB(NOW(), INTERVAL 25 MINUTE), 1
FROM chat_contacts c WHERE c.name = 'Agent Viper'
AND NOT EXISTS (SELECT 1 FROM chat_messages LIMIT 1);

INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
SELECT c.id, 'me', 'Copy. Extract window opens at 02:00 Z.', DATE_SUB(NOW(), INTERVAL 24 MINUTE), 2
FROM chat_contacts c WHERE c.name = 'Agent Viper'
AND (SELECT COUNT(*) FROM chat_messages) = 1;

INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
SELECT c.id, 'them', 'Got thermal on two hostiles near the north gate.', DATE_SUB(NOW(), INTERVAL 22 MINUTE), 3
FROM chat_contacts c WHERE c.name = 'Agent Viper'
AND (SELECT COUNT(*) FROM chat_messages) = 2;

INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
SELECT c.id, 'me', 'Hold position. Do not engage unless compromised.', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 4
FROM chat_contacts c WHERE c.name = 'Agent Viper'
AND (SELECT COUNT(*) FROM chat_messages) = 3;

INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
SELECT c.id, 'them', 'Understood. Channel stays dark until you ping.', DATE_SUB(NOW(), INTERVAL 18 MINUTE), 5
FROM chat_contacts c WHERE c.name = 'Agent Viper'
AND (SELECT COUNT(*) FROM chat_messages) = 4;

INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
SELECT c.id, 'them', 'Uplink ready. Standing by for next directive.', DATE_SUB(NOW(), INTERVAL 12 MINUTE), 1
FROM chat_contacts c WHERE c.name = 'Handler Nova'
AND NOT EXISTS (
    SELECT 1 FROM chat_messages m
    INNER JOIN chat_contacts cc ON cc.id = m.contact_id
    WHERE cc.name = 'Handler Nova'
);

INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
SELECT c.id, 'me', 'Relay the SOC feed to Ghost Cell. Priority critical.', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 2
FROM chat_contacts c WHERE c.name = 'Handler Nova'
AND (SELECT COUNT(*) FROM chat_messages m INNER JOIN chat_contacts cc ON cc.id = m.contact_id WHERE cc.name = 'Handler Nova') = 1;

INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
SELECT c.id, 'them', 'Done. They acknowledged with green status.', DATE_SUB(NOW(), INTERVAL 8 MINUTE), 3
FROM chat_contacts c WHERE c.name = 'Handler Nova'
AND (SELECT COUNT(*) FROM chat_messages m INNER JOIN chat_contacts cc ON cc.id = m.contact_id WHERE cc.name = 'Handler Nova') = 2;

INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
SELECT c.id, 'them', 'Node is clean. No packet loss on the dead-drop.', DATE_SUB(NOW(), INTERVAL 6 MINUTE), 1
FROM chat_contacts c WHERE c.name = 'Ghost Cell'
AND NOT EXISTS (
    SELECT 1 FROM chat_messages m
    INNER JOIN chat_contacts cc ON cc.id = m.contact_id
    WHERE cc.name = 'Ghost Cell'
);

INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
SELECT c.id, 'me', 'Send the dump hash when you have it.', DATE_SUB(NOW(), INTERVAL 4 MINUTE), 2
FROM chat_contacts c WHERE c.name = 'Ghost Cell'
AND (SELECT COUNT(*) FROM chat_messages m INNER JOIN chat_contacts cc ON cc.id = m.contact_id WHERE cc.name = 'Ghost Cell') = 1;

INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
SELECT c.id, 'them', 'sha256:9f2c…a81e — already mirrored to vault.', DATE_SUB(NOW(), INTERVAL 2 MINUTE), 3
FROM chat_contacts c WHERE c.name = 'Ghost Cell'
AND (SELECT COUNT(*) FROM chat_messages m INNER JOIN chat_contacts cc ON cc.id = m.contact_id WHERE cc.name = 'Ghost Cell') = 2;
