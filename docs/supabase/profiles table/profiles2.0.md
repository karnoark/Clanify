# Supabase Profiles Table and Policies Documentation

This document explains the setup of the `profiles` table in Supabase, along with associated triggers, Row Level Security (RLS) policies, and other configurations to securely manage user data.

---

## 1. **Creating an ENUM Type for User Roles**

We define a custom ENUM type to enforce valid user roles:

```sql
CREATE TYPE user_role AS ENUM ('admin', 'member', 'admin_verification_pending');
```

This ENUM ensures that the `role` column in the `profiles` table only accepts predefined values.

---

## 2. **Creating the Profiles Table**

The `profiles` table stores additional user metadata such as `first_name`, `last_name`, `role`, and `phone_number`. It is linked to the `auth.users` table.

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    role user_role DEFAULT 'member',
    phone_number TEXT,
    created_at TIMESTAMP DEFAULT now()
);
```

- **Columns**:
  - `id`: References the `auth.users` table to associate the profile with a user.
  - `role`: Uses the `user_role` ENUM with a default value of `'member'`.
  - `phone_number`: Can be updated later by the user.

---

## 3. **Trigger to Sync User Metadata**

We create a trigger that automatically inserts data into the `profiles` table when a user signs up.

### Function

```sql
CREATE OR REPLACE FUNCTION sync_user_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, first_name, last_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'role');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Trigger

```sql
CREATE TRIGGER on_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_user_to_profile();
```

- **How It Works**:
  - When a user signs up, metadata (`first_name`, `last_name`, `role`) provided in `raw_user_meta_data` is extracted and inserted into the `profiles` table.

---

## 4. **Enabling Row Level Security (RLS)**

To secure the `profiles` table, we enable RLS:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

RLS ensures users can only access or modify their own data.

---

## 5. **Adding RLS Policies**

We define specific policies to control access to the `profiles` table:

### **Policy to Allow Users to Read Their Profile**

```sql
CREATE POLICY "Allow users to read their profile"
ON profiles
FOR SELECT
USING (id = auth.uid());
```

- **Explanation**: Users can view their profile only if the `id` in `profiles` matches their `auth.uid()`.

### **Policy to Allow Users to Update Their Profile**

```sql
CREATE POLICY "Allow users to update their profile"
ON profiles
FOR UPDATE
USING (id = auth.uid());
```

- **Explanation**: Users can update their profile only if the `id` matches their `auth.uid()`.

### **Optional Policy: Admin Access**

Admins can have full access to the `profiles` table:

```sql
CREATE POLICY "Allow admins full access"
ON profiles
USING (EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
));
```

- **Explanation**: Admin users (based on their `role` in `raw_user_meta_data`) can access any row in the `profiles` table.

### ** Policy: allows insert operation for new users **

```sql
-- Add a policy to allow the trigger function to create new profiles
CREATE POLICY "Allow trigger to create profiles" ON public.profiles
FOR INSERT
TO public
WITH CHECK (true);  -- This allows the initial profile creation
```

---

## 6. **Testing the Setup**

### **Signup Data**

When a user signs up, metadata such as `first_name`, `last_name`, and `role` is passed in the `raw_user_meta_data`:

```javascript
const {
  data: { session, user },
  error,
} = await supabase.auth.signUp({
  email: credentials.email,
  password: credentials.password,
  options: {
    data: {
      first_name: credentials.firstName,
      last_name: credentials.lastName,
      role: credentials.role, // e.g., 'admin', 'member', etc.
    },
  },
});
```

### **Validation**

- Verify that the `profiles` table is populated with the correct data after user signup.
- Test the RLS policies:
  - **Read**: Users should only see their own profile.
  - **Update**: Users should only be able to update their own profile.
  - **Admin Access**: Admins should have full access (if the optional policy is added).

---

## Summary

This setup ensures a secure, scalable, and maintainable way to manage user profiles in Supabase. Key features include:

1. Strict role constraints using ENUM.
2. Automatic syncing of metadata to the `profiles` table.
3. Fine-grained access control with RLS policies.

Let me know if you have further questions or need additional configurations!
