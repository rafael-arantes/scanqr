-- Add role field to user_profiles table for admin permissions
ALTER TABLE user_profiles
ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for faster role lookups
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Create feedbacks table
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('bug', 'suggestion', 'praise', 'other')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for feedbacks table
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_category ON feedbacks(category);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at DESC);

-- Enable RLS on feedbacks table
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedbacks
CREATE POLICY "Users can create their own feedbacks"
ON feedbacks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own feedbacks
CREATE POLICY "Users can read their own feedbacks"
ON feedbacks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admins can read all feedbacks
CREATE POLICY "Admins can read all feedbacks"
ON feedbacks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Policy: Admins can update all feedbacks
CREATE POLICY "Admins can update all feedbacks"
ON feedbacks
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedbacks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_feedbacks_updated_at_trigger
BEFORE UPDATE ON feedbacks
FOR EACH ROW
EXECUTE FUNCTION update_feedbacks_updated_at();
