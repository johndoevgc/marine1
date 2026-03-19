-- =============================================
-- VGC Maritime Cyber System - Seed Data
-- Run after schema.sql to populate initial data
-- =============================================

-- Vessel data
INSERT INTO Vessels (id, name, type, flag, status, speed, heading, mmsi, lat, lon) VALUES
(1,  'MV Pacific Star',   'Container', N'🇺🇸', 'active', '14.2 kn', 'NE', '338234981', 35.6762,  139.6503),
(2,  'MV Atlantic Wave',  'Tanker',    N'🇬🇧', 'active', '11.8 kn', 'W',  '232456789', 51.5074,  -0.1278),
(3,  'MV Storm Rider',    'Bulk',      N'🇳🇴', 'alert',  '9.4 kn',  'SE', '257891234', 59.9139,  10.7522),
(4,  'MV Arctic Dawn',    'LNG',       N'🇩🇰', 'active', '16.0 kn', 'N',  '219345678', 55.6761,  12.5683),
(5,  'MV Northern Wind',  'Ferry',     N'🇫🇮', 'active', '22.1 kn', 'W',  '230123456', 60.1699,  24.9384),
(6,  'MV Indian Ocean',   'Container', N'🇮🇳', 'active', '13.5 kn', 'E',  '419567890', 18.9750,  72.8258),
(7,  'MV Gulf Voyager',   'Tanker',    N'🇦🇪', 'alert',  '8.2 kn',  'SW', '470234567', 25.2048,  55.2708),
(8,  'MV Blue Horizon',   'Cargo',     N'🇵🇭', 'active', '12.7 kn', 'SE', '548901234', 14.5995,  120.9842),
(9,  'MV Southern Cross', 'Bulk',      N'🇦🇺', 'active', '10.3 kn', 'NE', '503678901', -33.8688, 151.2093),
(10, 'MV Cape of Good',   'Container', N'🇿🇦', 'alert',  '15.6 kn', 'N',  '601234567', -33.9249, 18.4241);

-- Compliance items
INSERT INTO ComplianceItems (id, category, label, done) VALUES
('cs1', 'Cybersecurity Standards', 'IMO MSC-FAL.1/Circ.3 Compliance',              1),
('cs2', 'Cybersecurity Standards', 'NIST Cybersecurity Framework Implementation',    1),
('cs3', 'Cybersecurity Standards', 'ISO 27001 Certification Current',                1),
('cs4', 'Cybersecurity Standards', 'BIMCO Cybersecurity Guidelines Adherence',       1),
('cs5', 'Cybersecurity Standards', 'IEC 62443 Industrial Control Systems Security',  0),
('cs6', 'Cybersecurity Standards', 'Quarterly Penetration Testing Completed',        0),
('vs1', 'Vessel Security',         'Bridge Control System Access Controls',           1),
('vs2', 'Vessel Security',         'AIS/GPS Anti-Spoofing Measures Active',          1),
('vs3', 'Vessel Security',         'Satellite Communication Encryption Enabled',      1),
('vs4', 'Vessel Security',         'ECDIS System Firewall Configured',               0),
('vs5', 'Vessel Security',         'Crew Cybersecurity Awareness Training (Annual)',  1),
('vs6', 'Vessel Security',         'Network Segmentation (IT/OT separation)',         1),
('or1', 'Operational Requirements','Incident Response Plan Documented & Tested',      1),
('or2', 'Operational Requirements','Cyber Risk Assessment Completed (Annual)',         0),
('or3', 'Operational Requirements','Third-Party Vendor Security Assessment',           1),
('or4', 'Operational Requirements','Data Backup & Recovery Procedures Verified',       0),
('or5', 'Operational Requirements','Regulatory Reporting Procedures in Place',         1),
('or6', 'Operational Requirements','Business Continuity Plan Updated',                 1);

-- Threat distribution
INSERT INTO ThreatDistribution (category, percentage) VALUES
('Phishing',          35),
('Malware',           25),
('Network Intrusion', 20),
('GPS Spoofing',      12),
('Insider Threat',     8);

-- Security score
INSERT INTO SecurityScore (score, threat_level) VALUES
(87, 'MODERATE');
