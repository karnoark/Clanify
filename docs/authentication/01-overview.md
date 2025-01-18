# Authentication Overview

This document provides a comprehensive overview of the authentication system in the Clanify app.

## Architecture

The authentication system is built on three main pillars:

1. **Supabase Authentication**: Handles the core authentication operations including sign in, sign up, and session management.
2. **Zustand State Management**: Manages authentication state using a centralized store.
3. **Expo Router**: Handles protected routing and navigation based on authentication state.

## Key Components

### Auth Store (src/store/auth.ts)
The auth store serves as the central point for authentication state and operations. It:
- Manages user session and profile data
- Handles authentication operations (sign in, sign up, sign out)
- Persists authentication state using MMKV storage
- Manages admin registration status

### AuthStateManager (app/_layout.tsx)
A React component that:
- Monitors authentication state changes
- Enforces route protection rules
- Handles role-based navigation
- Manages admin verification flow

### Authentication Screens
Located in the `app/(auth)` directory:
- Sign In
- Sign Up
- Password Recovery
- Email Verification

## Authentication Flow

1. **Initial Load**
   - App starts
   - AuthStateManager initializes
   - Checks for existing session in storage
   - Routes user based on authentication state

2. **Sign In Process**
   - User enters credentials
   - Auth store validates with Supabase
   - Session and user data stored
   - AuthStateManager detects change
   - Routes to appropriate screen based on role

3. **Session Management**
   - Sessions persist across app restarts
   - Auto-refresh of expired tokens
   - Secure storage using MMKV
   - Real-time session state sync

4. **Protected Routes**
   - AuthStateManager prevents unauthorized access
   - Role-based access control
   - Special handling for admin verification
   - Automatic redirects to appropriate routes

## User Roles

The app supports three user roles:
1. `member`: Regular mess members
2. `admin`: Verified mess administrators
3. `admin_verification_pending`: Admins awaiting verification

Each role has specific access patterns and routing rules managed by the AuthStateManager.

## Security Features

1. **Secure Storage**
   - Session tokens stored in MMKV
   - Encrypted storage for sensitive data
   - Automatic session cleanup on logout

2. **Route Protection**
   - Centralized authorization checks
   - Role-based access control
   - Protected route groups

3. **Error Handling**
   - Comprehensive error messages
   - Automatic session recovery
   - Failed authentication handling

## Configuration

Authentication settings are managed through environment variables:
- Supabase URL and API keys
- Storage encryption keys
- Redirect URLs for OAuth