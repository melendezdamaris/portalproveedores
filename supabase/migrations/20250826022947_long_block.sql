/*
  # Fix suppliers table RLS policy for registration

  1. Security Updates
    - Add INSERT policy for suppliers table to allow authenticated users to create their own supplier record
    - Ensure proper relationship with portal_users table
    
  2. Changes
    - Create policy "Authenticated users can create supplier records"
    - Allow INSERT operations for authenticated users
*/

-- Create INSERT policy for suppliers table
CREATE POLICY "Authenticated users can create supplier records"
  ON suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.id = suppliers.portal_user_id
    )
  );