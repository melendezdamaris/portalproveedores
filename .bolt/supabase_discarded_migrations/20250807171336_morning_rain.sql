/*
  # Crear tabla de encuestas de feedback

  1. Nueva Tabla
    - `feedback_surveys`
      - Encuesta feedback: comunicación, puntualidad pagos, facilidad uso portal, satisfacción general
      - Comentarios adicionales, sugerencias de mejora
      - Relación con proveedores
  
  2. Seguridad
    - Habilitar RLS en tabla `feedback_surveys`
    - Política para que proveedores vean solo sus encuestas
    - Política para que operaciones vea todas las encuestas
*/

CREATE TABLE IF NOT EXISTS feedback_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  
  -- Calificaciones (1-5 estrellas)
  comunicacion integer NOT NULL CHECK (comunicacion >= 1 AND comunicacion <= 5),
  puntualidad_pagos integer NOT NULL CHECK (puntualidad_pagos >= 1 AND puntualidad_pagos <= 5),
  facilidad_uso_portal integer NOT NULL CHECK (facilidad_uso_portal >= 1 AND facilidad_uso_portal <= 5),
  satisfaccion_general integer NOT NULL CHECK (satisfaccion_general >= 1 AND satisfaccion_general <= 5),
  
  -- Comentarios
  comentarios_adicionales text,
  sugerencias_mejora text,
  
  -- Promedio calculado automáticamente
  calificacion_promedio decimal(3,2) GENERATED ALWAYS AS (
    (comunicacion + puntualidad_pagos + facilidad_uso_portal + satisfaccion_general)::decimal / 4
  ) STORED,
  
  -- Auditoría
  submitted_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE feedback_surveys ENABLE ROW LEVEL SECURITY;

-- Política para proveedores: solo ven sus propias encuestas
CREATE POLICY "Proveedores pueden ver sus propias encuestas"
  ON feedback_surveys
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = feedback_surveys.supplier_id 
      AND suppliers.id = auth.uid()::text
    )
  );

-- Política para operaciones: pueden ver todas las encuestas
CREATE POLICY "Operaciones pueden ver todas las encuestas"
  ON feedback_surveys
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'operaciones'
    )
  );

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_supplier_id ON feedback_surveys(supplier_id);
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_submitted_at ON feedback_surveys(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_rating ON feedback_surveys(calificacion_promedio DESC);