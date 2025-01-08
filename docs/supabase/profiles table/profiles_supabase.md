# Supabase Database Schema Documentation

## Overview

This document outlines the database schema for the Clanify mess management application. The schema is designed to extend Supabase's built-in authentication with additional user profile information and role management.

## Profiles Table

Here's the core table definition that extends Supabase's auth.users table:

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

Let's understand each component of this table:

1. **Primary Key and Foreign Key**

   - `id UUID`: This is both the primary key and a foreign key reference to auth.users
   - The ON DELETE CASCADE ensures profile cleanup when a user is deleted

2. **Profile Information**

   - `first_name` and `last_name`: Optional user name fields
   - `phone_no`: Optional contact information
   - `updated_at`: Tracks when the profile was last modified

3. **Role Management**
   - `role`: User type, either 'member' or 'admin'
   - Default value is 'member' for new profiles
   - CHECK constraint ensures only valid roles are used

## How It Works

The profiles table integrates with Supabase's auth system in several ways:

1. **User Creation Flow**
   When a new user signs up:

   - Supabase creates a record in auth.users
   - Our table gets a corresponding profile entry via trigger
   - The user starts with the default 'member' role

2. **Profile Updates**

   - Users can update their profile information
   - Role changes require special authorization
   - The updated_at field tracks modifications

3. **Account Deletion**
   - When a user is deleted from auth.users
   - The CASCADE ensures profile cleanup
   - No orphaned profiles remain

## Row Level Security (RLS) Policies

To secure the profiles table:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

alter policy "Public profiles are viewable by everyone."
on "public"."profiles"
to public
using (
  true
);

alter policy "Users can insert their own profile."
on "public"."profiles"
to public
with check (
  ((SELECT auth.uid() AS uid) = id)
);

alter policy "Users can update own profile."
on "public"."profiles"
to public
using (
  ((SELECT auth.uid() AS uid) = id)
);


```

## Common Queries

### Get User Profile with Auth Info

```sql
SELECT
    p.*,
    a.email
FROM profiles p
JOIN auth.users a ON p.id = a.id
WHERE p.id = auth.uid();
```

### Update User Profile

```sql
UPDATE profiles
SET
    first_name = 'New Name',
    phone_no = 'New Phone',
    updated_at = now()
WHERE id = auth.uid();
```

### Find All Mess Owners

```sql
SELECT
    p.*,
    a.email
FROM profiles p
JOIN auth.users a ON p.id = a.id
WHERE p.role = 'admin';
```

## Best Practices

1. **Data Consistency**: Always use transactions when updating both auth and profile data.
2. **Null Values**: The design allows partial profiles with null fields.
3. **Role Changes**: Validate role changes through application logic.
4. **Updates**: Always set updated_at when modifying profiles.

## Future Considerations

1. **Profile Enrichment**

   - Add avatar or profile picture
   - Include user preferences
   - Add address information

2. **Role Extensions**

   - Consider additional roles
   - Add role-specific metadata
   - Implement role hierarchies

3. **Performance**

   - Index commonly queried fields
   - Consider caching strategies
   - Monitor query performance

4. **Data Management**
   - Implement soft deletes
   - Add profile archiving
   - Consider data retention policies
