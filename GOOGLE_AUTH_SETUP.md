# Google Authentication Setup Guide

This guide will help you set up Google login functionality with Supabase for your Vietnam Heritage Jigsaw Quest project.

## Prerequisites

1. A Supabase account and project
2. Google Cloud Console account

## Step 1: Set up Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once your project is created, go to Settings > API
3. Copy your Project URL and anon/public key
4. Update the `.env` file in your project root with these values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 2: Configure Google OAuth in Supabase

1. In your Supabase dashboard, go to Authentication > Providers
2. Find Google and click on it
3. Enable the Google provider
4. You'll need to configure Google OAuth credentials (next step)

## Step 3: Set up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to APIs & Services > Library
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add your authorized redirect URIs:
     - For local development: `http://localhost:5173`
     - For Supabase: `https://your-project-id.supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret

## Step 4: Configure Google Provider in Supabase

1. Back in your Supabase dashboard, go to Authentication > Providers > Google
2. Paste your Google OAuth Client ID and Client Secret
3. Save the configuration

## Step 5: Configure Site URL and Redirect URLs

1. In Supabase, go to Authentication > URL Configuration
2. Set your Site URL (e.g., `http://localhost:5173` for development)
3. Add Redirect URLs:
   - `http://localhost:5173` (for development)
   - Your production URL when you deploy

## Step 6: Test the Implementation

1. Start your development server:
   ```cmd
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:5173`
3. Click on "Sign In" and then "Continue with Google"
4. You should be redirected to Google's OAuth consent screen

## Features Implemented

✅ **Google OAuth Integration**: Users can sign in with their Google account
✅ **User Session Management**: Automatic session handling with Supabase
✅ **User Profile Display**: Shows user name and avatar from Google
✅ **Logout Functionality**: Users can sign out
✅ **Loading States**: Proper loading indicators during authentication
✅ **Error Handling**: Displays error messages for failed authentication

## Authentication Flow

1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent screen
3. User grants permissions
4. Redirected back to your app
5. Supabase handles the authentication
6. User session is established
7. User data is available in the app

## Troubleshooting

**Issue**: "Invalid redirect URI" error

- **Solution**: Make sure your redirect URIs in Google Cloud Console match exactly with your app URLs

**Issue**: "Google+ API not enabled" error

- **Solution**: Enable the Google+ API in Google Cloud Console

**Issue**: Environment variables not loading

- **Solution**: Make sure your `.env` file is in the project root and restart your development server

**Issue**: CORS errors

- **Solution**: Check your Site URL and Redirect URLs in Supabase authentication settings

## Security Notes

- Never commit your `.env` file with real credentials to version control
- Use different Google OAuth clients for development and production
- Regularly rotate your API keys and secrets
- Review and limit the OAuth scopes requested

## Next Steps

Once authentication is working, you can:

- Add user profile management
- Implement role-based access control
- Add social features like leaderboards
- Sync user progress across devices
- Add email notifications for achievements

For more information, refer to the [Supabase Auth documentation](https://supabase.com/docs/guides/auth) and [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2).
