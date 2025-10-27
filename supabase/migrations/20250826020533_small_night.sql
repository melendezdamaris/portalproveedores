/*
  # Create feedback surveys table

  1. New Tables
    - `feedback_surveys`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, foreign key to suppliers)
      - `communication_rating` (integer, 1-5 scale)
      - `payment_timing_rating` (integer, 1-5 scale)
      - `platform_usability_rating` (integer, 1-5 scale)
      - `overall_satisfaction_rating` (integer, 1-5 scale)
      - `comments` (text, optional feedback)
      - `suggestions` (text, optional suggestions)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `feedback_surveys` table
    - Add policy for suppliers to manage their own feedback
    - Add policy for approvers to read all feedback

  3. Indexes
    - Index on supplier_id for efficient queries
    - Index on created_at for chronological ordering
    - Index on overall_satisfaction_rating for analytics
*/

-- Create feedback surveys table
CREATE TABLE IF NOT EXISTS feedback_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL,
  communication_rating integer NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  payment_timing_rating integer NOT NULL CHECK (payment_timing_rating >= 1 AND payment_timing_rating <= 5),
  platform_usability_rating integer NOT NULL CHECK (platform_usability_rating >= 1 AND platform_usability_rating <= 5),
  overall_satisfaction_rating integer NOT NULL CHECK (overall_satisfaction_rating >= 1 AND overall_satisfaction_rating <= 5),
  comments text,
  suggestions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE feedback_surveys 
ADD CONSTRAINT feedback_surveys_supplier_id_fkey 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_supplier_id ON feedback_surveys(supplier_id);
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_created_at ON feedback_surveys(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_satisfaction ON feedback_surveys(overall_satisfaction_rating);

-- Enable Row Level Security
ALTER TABLE feedback_surveys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Suppliers can manage own feedback"
  ON feedback_surveys
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s
      JOIN portal_users pu ON s.portal_user_id = pu.id
      WHERE s.id = feedback_surveys.supplier_id
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can read all feedback"
  ON feedback_surveys
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE portal_users.user_id = auth.uid()
      AND portal_users.role = 'aprobador'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_feedback_surveys_updated_at
  BEFORE UPDATE ON feedback_surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();