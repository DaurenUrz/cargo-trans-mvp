-- Update default value for scanned_places to include received list
ALTER TABLE shipments ALTER COLUMN scanned_places SET DEFAULT '{"received": [], "loaded": [], "arrived": [], "issued": []}';

-- Update existing records to ensure they have the received field if they are not null
UPDATE shipments 
SET scanned_places = scanned_places || '{"received": []}'::jsonb 
WHERE scanned_places IS NOT NULL AND NOT (scanned_places ? 'received');
