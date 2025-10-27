/*
  # Crear tabla de encuestas de feedback

  1. Nueva Tabla
    - `feedback_surveys`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, foreign key)
      - Calificaciones: comunicación, puntualidad_pagos, facilidad_uso_portal, satisfacción_general
      - `comentarios_adicionales` (text)
      - `sugerencias_mejora` (text)
      - `submitted_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en tabla `feedback_surveys`
    - Políticas: proveedores pueden crear sus encuestas, operaciones/aprobadores pueden ver todas
*/

-- Crear tabla de encuestas de feedback
CREATE TABLE IF NOT EXISTS feedback_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  
  -- Calificaciones (1-5)
  comunicacion integer NOT NULL CHECK (comunicacion >= 1 AND comunicacion <= 5),
  puntualidad_pagos integer NOT NULL CHECK (puntualidad_pagos >= 1 AND puntualidad_pagos <= 5),
  facilidad_uso_portal integer NOT NULL CHECK (facilidad_uso_portal >= 1 AND facilidad_uso_portal <= 5),
  satisfaccion_general integer NOT NULL CHECK (satisfaccion_general >= 1 AND satisfaccion_general <= 5),
  
  -- Comentarios
  comentarios_adicionales text,
  sugerencias_mejora text,
  
  submitted_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE feedback_surveys ENABLE ROW LEVEL SECURITY;

-- Política para proveedores (crear sus propias encuestas)
CREATE POLICY "Proveedores pueden crear sus propias encuestas"
  ON feedback_surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = current_user_id()
    )
  );

-- Política para proveedores (ver sus propias encuestas)
CREATE POLICY "Proveedores pueden ver sus propias encuestas"
  ON feedback_surveys
  FOR SELECT
  TO authenticated
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = current_user_id()
    )
  );

-- Política para operaciones (ver todas las encuestas)
CREATE POLICY "Operaciones pueden ver todas las encuestas"
  ON feedback_surveys
  FOR SELECT
  TO authenticated
  USING (current_user_role() = 'operaciones');

-- Política para aprobadores (ver todas las encuestas)
CREATE POLICY "Aprobadores pueden ver todas las encuestas"
  ON feedback_surveys
  FOR SELECT
  TO authenticated
  USING (current_user_role() = 'aprobador');

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_supplier_id ON feedback_surveys(supplier_id);
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_submitted_at ON feedback_surveys(submitted_at DESC);

-- Vista para estadísticas de feedback
CREATE OR REPLACE VIEW feedback_statistics AS
SELECT 
  AVG(comunicacion) as avg_comunicacion,
  AVG(puntualidad_pagos) as avg_puntualidad_pagos,
  AVG(facilidad_uso_portal) as avg_facilidad_uso_portal,
  AVG(satisfaccion_general) as avg_satisfaccion_general,
  COUNT(*) as total_encuestas
FROM feedback_surveys;