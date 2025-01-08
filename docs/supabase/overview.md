# The Core Identity System

Think of profiles like a city's resident database. Every person in your app ecosystem, whether they're eating at messes or running them, has an entry here. This table answers the basic question **"Who is this person?"** It's directly connected to Supabase's authentication system, which handles passwords and security.

The `profiles` table is your main user database. It's like a permanent record of everyone who uses your app — both regular users (**members**) who want to eat at messes and verified mess owners (**admins**) who run them. Every active user in your app must have a record in this table.

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMPTZ,
    first_name TEXT,
    last_name TEXT,
    phone_no TEXT,
    role VARCHAR(10) NOT NULL DEFAULT 'member'
        CHECK (role IN ('admin', 'member'))
);
```

---

# The Business Registration Office

The `admin_registrations` table is like a city's business licensing office. When someone wants to open a mess, they first submit their application here. This table keeps track of all the paperwork, verifications, and the approval process. It's like the paper trail that shows how a mess came to be.

Think of `admin_registrations` like a waiting room or an application processing center. When someone wants to become a mess owner (**admin**), they need to prove they can actually run a mess — they need proper facilities, documentation, and so on. We can't just let anyone become an admin immediately.

Here's how the tables work together in your application's lifecycle:

The `admin_registrations` table is specifically for processing new mess owners. Think of it as an application form with multiple pages (your onboarding steps). Even after someone completes their registration and becomes an admin, their registration record stays in this table. This serves several purposes:

1. Historical record of the verification process
2. Proof of submitted documents and information
3. Ability to audit who approved what and when
4. Reference for any future disputes or verifications

```sql
-- Create the admin registration status enum
CREATE TYPE admin_verification_status AS ENUM (
    'pending_onboarding',    -- Initial signup, hasn't started onboarding
    'onboarding_in_progress', -- Currently going through onboarding steps
    'verification_pending',   -- Completed onboarding, awaiting your review
    'approved',              -- You've approved them
    'rejected'               -- You've rejected them
);

CREATE TYPE onboarding_step AS ENUM (
  'mess_details',
  'location_details',
  'contact_details',
  'timing_details',
  'media_files'
);

-- Create table for admin registrations
CREATE TABLE admin_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    status admin_verification_status DEFAULT 'pending_onboarding',
    current_onboarding_step onboarding_step DEFAULT 'mess_details', -- Tracks which step they're on

    -- Data from your onboarding steps
    mess_details JSONB,      -- From MessDetailsStep
    location_details JSONB,  -- From LocationStep
    contact_details JSONB,   -- From ContactStep
    timing_details JSONB,    -- From TimingStep
    media_files JSONB,       -- From MediaStep

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    submitted_at TIMESTAMP WITH TIME ZONE, -- When they complete all steps
    verification_notes TEXT  -- Your notes during verification
);

-- First, we create a function that will automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the updated_at column to the current UTC timestamp
    NEW.updated_at = timezone('utc'::text, now());
    -- Return the modified row
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Then, we create a trigger that calls this function
CREATE TRIGGER update_admin_registrations_updated_at
    BEFORE UPDATE ON admin_registrations  -- This trigger fires before any update
    FOR EACH ROW                         -- It runs for each row being updated
    EXECUTE FUNCTION update_updated_at_column();

-- enable RLS for admin_registrations table
ALTER TABLE admin_registrations ENABLE ROW LEVEL SECURITY;

-- Allow new registrations
CREATE POLICY "Enable registration for all users" ON admin_registrations
    FOR INSERT TO public
    WITH CHECK (true);

-- Fix the type mismatch in the SELECT policy
CREATE POLICY "Users can view own registration" ON admin_registrations
    FOR SELECT TO authenticated
    USING (
        -- Extract the text value from the JWT email claim using ->>
        -- ->> operator gets the value as TEXT from JSONB
        -- -> would get it as JSONB, which is why we had the error
        email = (auth.jwt() ->> 'email')
    );

```

---

# The Business Directory

The `messes` table is like the city's active business directory. Once a mess owner is approved, their operational information lives here. This is what your app actually uses day-to-day to show users what messes are available, where they are, and what they offer.

```sql
CREATE TABLE messes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    description TEXT,
    capacity INTEGER,
    address TEXT,
    city TEXT,
    coordinates POINT,
    timings JSONB,
    photos TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

# The Flow of Data

The Operational Systems:
Just as a city needs systems for different services, your app needs tables to handle various operations:

```sql
-- Membership Management (like gym memberships)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES profiles(id),
    mess_id UUID REFERENCES messes(id),  -- Changed from profiles to messes
    plan_type TEXT,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ
);

-- Daily Operations (like attendance at a school)
CREATE TABLE attendance (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES profiles(id),
    mess_id UUID REFERENCES messes(id),  -- Changed from profiles to messes
    meal_type TEXT,
    attended_at TIMESTAMPTZ
);

-- Menu System (like a restaurant's menu board)
CREATE TABLE menus (
    id UUID PRIMARY KEY,
    mess_id UUID REFERENCES messes(id),  -- Changed from profiles to messes
    day_of_week TEXT,
    meal_type TEXT,
    items JSONB,
    price DECIMAL
);

-- Feedback System (like a review system)
CREATE TABLE ratings (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES profiles(id),
    mess_id UUID REFERENCES messes(id),  -- Changed from profiles to messes
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ
);

-- Special Requests System
CREATE TABLE dietary_preferences (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES profiles(id),
    preference_type TEXT[],
    notes TEXT
);

-- Leave Management (like vacation tracking)
CREATE TABLE absence_records (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES profiles(id),
    mess_id UUID REFERENCES messes(id),  -- Changed from profiles to messes
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    status TEXT
);

```

### When Someone Signs Up as a Member:

1. Entry created in `auth.users` (Supabase handles this).
2. Entry created in `profiles` with `role='member'`.
3. They can immediately start using the app.

### When Someone Wants to Become a Mess Owner:

1. Entry created in `admin_registrations`.
2. They complete onboarding steps (stored in `admin_registrations`).
3. You review and approve their application.
4. Upon approval:
   - Entry created in `auth.users`.
   - Entry created in `profiles` with `role='admin'`.
   - A new mess is created in the `messes` table (their business listing) with migration of useful information from `admin_registrations` to `messes`.
   - Their `admin_registrations` record stays as historical proof.
5. They can now start managing their mess.

### When Regular Users Interact with Messes:

1. They find messes through queries to the `messes` table.
2. Their subscriptions, attendance, and feedback link to the `messes` table.
3. Mess owners can manage their listings in the `messes` table.

# Functions Created

```sql
-- Create an enum for the response type
CREATE TYPE email_status AS ENUM (
    'available',
    'exists_in_profiles',
    'exists_in_admin_registrations'
);

-- Create function to check email uniqueness
CREATE OR REPLACE FUNCTION check_email_availability(check_email TEXT)
RETURNS email_status AS $$
DECLARE
    status email_status;
BEGIN
    -- First check profiles table
    IF EXISTS (
        SELECT 1 FROM auth.users
        WHERE email = check_email
    ) THEN
        RETURN 'exists_in_profiles';
    END IF;

    -- Then check admin_registrations table
    IF EXISTS (
        SELECT 1 FROM admin_registrations
        WHERE email = check_email
    ) THEN
        RETURN 'exists_in_admin_registrations';
    END IF;

    -- If we get here, email is available
    RETURN 'available';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policy to allow anyone to execute this function
GRANT EXECUTE ON FUNCTION check_email_availability TO anon, authenticated;
```
