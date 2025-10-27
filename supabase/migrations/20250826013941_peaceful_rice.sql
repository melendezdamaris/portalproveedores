/*
  # Crear tabla de proveedores

  1. Nueva tabla
    - `suppliers`
      - `id` (uuid, primary key)
      - `portal_user_id` (uuid, foreign key a portal_users)
      - `ruc` (text, unique)
      - `business_name` (text)
      - `trade_name` (text, nullable)
      - `person_type` (enum: natural, juridica)
      - `country` (text)
      - `address` (text)
      - `phone` (text)
      - `email` (text)
      - `contact_person` (text)
      - `contact_phone` (text)
      - `contact_email` (text)
      - `contracted_service` (text, nullable)
      - `document_type` (enum: factura, rhe)
      - `ruc_file_url` (text, nullable)
      - `status` (enum: pending, approved, rejected, disabled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS
    - Políticas apropiadas por rol
*/

-- Crear enums
CREATE TYPE person_type AS ENUM ('natural', 'juridica');
CREATE TYPE document_type AS ENUM ('factura', 'rhe');
CREATE TYPE supplier_status AS ENUM ('pending', 'approved', 'rejected', 'disabled');

-- Crear tabla suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_user_id uuid REFERENCES portal_users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  ruc text UNIQUE NOT NULL,
  business_name text NOT NULL,
  trade_name text,
  person_type person_type NOT NULL DEFAULT 'juridica',
  country text NOT NULL DEFAULT 'Perú',
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  contact_person text,
  contact_phone text,
  contact_email text NOT NULL,
  contracted_service text,
  document_type document_type NOT NULL,
  ruc_file_url text,
  status supplier_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Suppliers can read own data"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.id = suppliers.portal_user_id 
      AND portal_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can update own data"
  ON suppliers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.id = suppliers.portal_user_id 
      AND portal_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can read all suppliers"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.role = 'aprobador'
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_suppliers_portal_user_id ON suppliers(portal_user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_ruc ON suppliers(ruc);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);