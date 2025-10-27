/*
  # Crear tabla de proveedores

  1. Nueva Tabla
    - `suppliers` (proveedores)
      - `id` (uuid, primary key)
      - `user_id` (uuid, referencia al usuario)
      - `ruc` (text)
      - `business_name` (text, razón social)
      - `person_type` (text, tipo de persona)
      - `country` (text, país)
      - `address` (text, dirección)
      - `document_type` (text, tipo de comprobante a emitir)
      - `ruc_file_url` (text, PDF de ficha RUC)
      - `contact_person` (text, persona de contacto)
      - `contact_email` (text, email de contacto)
      - `phone` (text, teléfono)
      - `neo_contact_email` (text, correo de NEO)
      - `status` (text, estado del proveedor)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Enable RLS on `suppliers` table
    - Add policies for different user roles
*/

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  ruc text NOT NULL,
  business_name text NOT NULL,
  person_type text CHECK (person_type IN ('natural', 'juridica')),
  country text NOT NULL,
  address text NOT NULL,
  document_type text CHECK (document_type IN ('factura', 'rhe')),
  ruc_file_url text,
  contact_person text,
  contact_email text,
  phone text,
  neo_contact_email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disabled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Política para proveedores: pueden ver y editar su propio registro
CREATE POLICY "Suppliers can manage own data"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para operaciones: pueden ver todos los proveedores
CREATE POLICY "Operations can view all suppliers"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'operaciones'
    )
  );

-- Política para aprobadores: pueden ver proveedores pendientes
CREATE POLICY "Approvers can view pending suppliers"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'aprobador'
    )
  );