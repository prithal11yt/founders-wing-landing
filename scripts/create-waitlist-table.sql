-- Create waitlist_applications table
CREATE TABLE IF NOT EXISTS waitlist_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  social_links VARCHAR(500),
  what_building TEXT NOT NULL,
  months_working VARCHAR(50),
  current_stage VARCHAR(100),
  working_full_time VARCHAR(100),
  join_reason TEXT NOT NULL,
  biggest_challenge TEXT NOT NULL,
  can_contribute TEXT NOT NULL,
  monthly_budget VARCHAR(50),
  paid_community_willing VARCHAR(10),
  heard_from VARCHAR(100),
  other_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_waitlist_email ON waitlist_applications(email);

-- Create index on created_at for sorting
CREATE INDEX idx_waitlist_created_at ON waitlist_applications(created_at DESC);
