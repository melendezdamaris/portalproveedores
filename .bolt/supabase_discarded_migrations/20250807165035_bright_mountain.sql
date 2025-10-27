/*
  # Crear tabla de encuestas de feedback

  1. Nueva Tabla
    - `feedback_surveys` (encuestas de feedback)
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, referencia a suppliers)
      - `communication_rating` (integer, calificación comunicación)
      - `payment_timing_rating` (integer, calificación puntualidad pagos)
      - `platform_usability_rating` (integer, calificación facilidad de uso)
      - `overall_satisfaction_rating` (integer, calificación satisfacción general)
      - `additional_comments` (text, comentarios adicionales)
      - `improvement_suggestions` (text, sugerencias de mejora)
      - `submitted_at` (timestamp)

  2. Seguridad
    - Enable RLS on `feedback_surveys` table
    - Add policies for suppliers and operations
*/

CREATE TABLE IF NOT EXISTS feedback_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  communication_rating integer NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  payment_timing_rating integer NOT NULL CHECK (payment_timing_rating >= 1 AND payment_timing_rating <= 5),
  platform_usability_rating integer NOT NULL CHECK (platform_usability_rating >= 1 AND platform_usability_rating <= 5),
  overall_satisfaction_rating integer NOT NULL CHECK (overall_satisfaction_rating >= 1 AND overall_satisfaction_rating <= 5),
  additional_comments text,
  improvement_suggestions text,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE feedback_surveys ENABLE ROW LEVEL SECURITY;

-- Política para proveedores: pueden crear sus propias encuestas
CREATE POLICY "Suppliers can create own feedback"
  ON feedback_surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = feedback_surveys.supplier_id 
      AND suppliers.user_id = auth.uid()
    )
  );

-- Política para operaciones y aprobadores: pueden ver todas las encuestas
CREATE POLICY "Operations and approvers can view all feedback"
  ON feedback_surveys
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' IN ('operaciones', 'aprobador')
    )
  );