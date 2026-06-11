-- Rename email column to login in users table if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name='users' AND column_name='email'
  ) THEN
    ALTER TABLE users RENAME COLUMN email TO login;
  END IF;
END $$;

-- Drop views that depend on users table to refresh their columns
DROP VIEW IF EXISTS v_clients_staff;
DROP VIEW IF EXISTS v_clients_individual;
DROP VIEW IF EXISTS v_clients_legal_users;

-- Recreate views with correct column mapping
CREATE OR REPLACE VIEW v_clients_staff AS
  SELECT * FROM users WHERE client_segment = 'staff';

CREATE OR REPLACE VIEW v_clients_individual AS
  SELECT * FROM users WHERE client_segment = 'individual';

CREATE OR REPLACE VIEW v_clients_legal_users AS
  SELECT * FROM users WHERE client_segment = 'legal_entity';
