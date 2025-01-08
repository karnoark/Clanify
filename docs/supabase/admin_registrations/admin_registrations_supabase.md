# admin_registration table

## Overview

This document outlines the database schema for the Clanify mess management application. The schema is designed to handle user authentication, mess management, and the admin verification process securely and efficiently.

## Core Types

### User Roles

```sql
CREATE TYPE user_role AS ENUM ('member', 'admin');
```

Our application distinguishes between two types of users:

- `member`: Regular users who subscribe to mess services
- `admin`: Mess owners who manage their mess services

### Admin Verification Status

```sql
CREATE TYPE admin_verification_status AS ENUM (
    'pending_onboarding',     -- Initial signup, hasn't started onboarding
    'onboarding_in_progress', -- Currently completing onboarding steps
    'verification_pending',   -- Completed onboarding, awaiting review
    'approved',              -- Verified and approved by superadmin
    'rejected'               -- Application rejected by superadmin
);
```

This status tracking ensures a clear progression through the admin verification process.

## Core Tables

### Admin Registrations

```sql
CREATE TABLE admin_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    status admin_verification_status DEFAULT 'pending_onboarding',

    -- Onboarding Information
    mess_details JSONB,      -- Basic mess information
    location_details JSONB,  -- Address and coordinates
    contact_details JSONB,   -- Contact information
    timing_details JSONB,    -- Operating hours
    media_files JSONB,       -- Documents and photos

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    submitted_at TIMESTAMP WITH TIME ZONE,
);

-- Add helpful comment
COMMENT ON TABLE admin_registrations IS
'Stores registration requests and verification status for potential mess owners';

-- Create indexes for common queries
CREATE INDEX idx_admin_reg_status ON admin_registrations(status);
CREATE INDEX idx_admin_reg_email ON admin_registrations(email);
```

This table serves as a holding area for admin registrations until they're fully verified. The JSONB columns allow flexible storage of different types of information collected during onboarding.

### Security Policies

We implement Row Level Security (RLS) to ensure data access is properly controlled:

```sql
-- Enable RLS
ALTER TABLE admin_registrations ENABLE ROW LEVEL SECURITY;

-- Allow new registrations
CREATE POLICY \"Enable registration for visitors\" ON admin_registrations
    FOR INSERT TO public
    WITH CHECK (true);

-- Allow users to view their own registration
CREATE POLICY \"Users can view own registration\" ON admin_registrations
    FOR SELECT TO public
    USING (email = auth.jwt() -> 'email');

-- Allow updates during onboarding
CREATE POLICY \"Users can update own pending registration\" ON admin_registrations
    FOR UPDATE TO public
    USING (
        email = auth.jwt() -> 'email'
        AND status IN ('pending_onboarding', 'onboarding_in_progress')
    )
    WITH CHECK (
        email = auth.jwt() -> 'email'
        AND status IN ('pending_onboarding', 'onboarding_in_progress')
    );

-- Only superadmin can approve/reject
CREATE POLICY \"Only superadmin can change status to approved/rejected\" ON admin_registrations
    FOR UPDATE TO authenticated
    USING (
        auth.jwt() -> 'email' = 'your-superadmin-email@example.com'
        AND NEW.status IN ('approved', 'rejected')
    );
```

## JSONB Structure Examples

### mess_details

```json
{
    \"name\": \"Annapurna Mess\",
    \"description\": \"Home-style vegetarian meals\",
    \"capacity\": 100,
    \"cuisine_type\": \"North Indian\",
    \"specialities\": [\"Gujarati Thali\", \"South Indian Breakfast\"]
}
```

### location_details

```json
{
    \"address\": \"123 Main Street\",
    \"city\": \"Mumbai\",
    \"state\": \"Maharashtra\",
    \"pincode\": \"400001\",
    \"coordinates\": {
        \"latitude\": 19.0760,
        \"longitude\": 72.8777
    },
    \"landmarks\": [\"Near Central Park\", \"Opposite Bus Station\"]
}
```

### timing_details

```json
{
    \"breakfast\": {
        \"start\": \"07:00\",
        \"end\": \"10:00\"
    },
    \"lunch\": {
        \"start\": \"12:00\",
        \"end\": \"15:00\"
    },
    \"dinner\": {
        \"start\": \"19:00\",
        \"end\": \"22:00\"
    },
    \"holidays\": [\"Sunday\"]
}
```

## Best Practices

1. **Indexing**: We create indexes on frequently queried fields (status, email) to improve query performance.

2. **Data Integrity**: Using ENUMs ensures only valid status values can be stored.

3. **Security**: RLS policies ensure users can only access and modify their own data.

4. **Flexibility**: JSONB columns allow us to store structured data that might evolve over time without requiring schema changes.

## Common Queries

Here are some common queries used in the application:

```sql
-- Check registration status
SELECT status, current_onboarding_step
FROM admin_registrations
WHERE email = 'example@email.com';

-- Get pending verifications
SELECT id, email, first_name, last_name, submitted_at
FROM admin_registrations
WHERE status = 'verification_pending'
ORDER BY submitted_at ASC;

-- Update registration status
UPDATE admin_registrations
SET status = 'approved',
    verification_notes = 'All documents verified'
WHERE id = 'registration-uuid';
```

## Schema Changes

When making schema changes:

1. Document the change in this file
2. Test the change in development environment
3. Create a migration file
4. Test the migration in staging
5. Apply in production

## Future Considerations

1. Consider adding a `verification_checklist` JSONB column to track specific verification requirements.
2. Consider adding `region` or `zone` columns for geographic organization.
3. Plan for multi-language support in text fields.

# Admin Registration Queries

### Creating New Admin Registration

```typescript
const { data, error } = await supabase
  .from('admin_registrations')
  .insert([
    {
      email: credentials.email,
      password_hash: await hashPassword(credentials.password),
      first_name: credentials.firstName,
      last_name: credentials.lastName,
      status: 'pending_onboarding',
    },
  ])
  .select()
  .single();
```

This query:

1. Creates a new admin registration record
2. Returns the created record for confirmation
3. Uses `.single()` because we expect exactly one result

### Checking Registration Status

```typescript
const { data, error } = await supabase
  .from('admin_registrations')
  .select('status, current_onboarding_step')
  .eq('email', userEmail)
  .single();
```

Use this query to check where an admin is in the registration process.

### Updating Onboarding Progress

```typescript
const { data, error } = await supabase
  .from('admin_registrations')
  .update({
    mess_details: messData,
    current_onboarding_step: 'location',
  })
  .eq('id', registrationId)
  .select();
```

This query updates the mess details and advances the onboarding step.

### Completing Onboarding

```typescript
const { error } = await supabase
  .from('admin_registrations')
  .update({
    status: 'verification_pending',
    submitted_at: new Date().toISOString(),
    current_onboarding_step: 'completed',
  })
  .eq('id', registrationId);
```

Use this when an admin completes all onboarding steps.

### Superadmin: View Pending Verifications

```typescript
const { data, error } = await supabase
  .from('admin_registrations')
  .select(
    `
        id,
        email,
        first_name,
        last_name,
        mess_details,
        location_details,
        submitted_at
    `,
  )
  .eq('status', 'verification_pending')
  .order('submitted_at', { ascending: true });
```

This query fetches all registrations awaiting verification.

### Superadmin: Approve Registration

```typescript
// Transaction to approve admin and create their account
const { error } = await supabase.rpc('approve_admin_registration', {
  registration_id: 'uuid-here',
  notes: 'All documents verified',
});
```

This calls a stored procedure that:

1. Updates registration status to 'approved'
2. Creates the actual admin user account
3. Maintains an audit trail

## Error Handling

Always handle potential errors in your queries:

```typescript
try {
    const { data, error } = await supabase.from('admin_registrations')...
    if (error) throw error;

    // Handle successful query
    return data;
} catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to process registration');
}
```

## Performance Considerations

1. Use `.select()` to fetch only needed columns
2. Use `.single()` when expecting one result
3. Include appropriate indices in your schema
4. Consider pagination for large result sets

## Security Best Practices

1. Never trust client-side data
2. Always validate input before queries
3. Use RLS policies for access control
4. Use parameterized queries to prevent SQL injection

## Maintenance Queries

These queries are useful for maintenance and debugging:

### Check Failed Registrations

```sql
SELECT email, status, verification_notes
FROM admin_registrations
WHERE status = 'rejected'
ORDER BY updated_at DESC
LIMIT 10;
```

### Clean Up Stale Registrations

```sql
DELETE FROM admin_registrations
WHERE status = 'pending_onboarding'
AND created_at < NOW() - INTERVAL '30 days';
```

### Audit Registration Progress

```sql
SELECT
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours
FROM admin_registrations
GROUP BY status;
```

## Testing Queries

When testing new queries:

1. Start with a small dataset
2. Check execution plans
3. Verify RLS policies work as expected
4. Test edge cases (empty results, null values)
   `
   }
