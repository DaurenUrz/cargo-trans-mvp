ALTER TABLE shipments ADD COLUMN IF NOT EXISTS scanned_places JSONB DEFAULT '{"loaded": [], "arrived": [], "issued": []}';
UPDATE shipments SET scanned_places = '{"loaded": [], "arrived": [], "issued": []}' WHERE scanned_places IS NULL;
