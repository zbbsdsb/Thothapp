---
title: "OAuth Integration"
description: "Learn how Thoth uses OAuth for secure authentication"
category: "guides"
---
# OAuth Integration

Thoth uses Google OAuth for secure, passwordless authentication! This guide explains how it works.

## What is OAuth?

OAuth is an open standard for access delegation that lets you sign in to Thoth using your Google account without sharing your password with us.

## How Google Sign-In Works

1. When you open Thoth, you'll see a landing page with the Thoth logo
2. Thoth automatically initiates the Google sign-in flow
3. You're redirected to Google's secure sign-in page
4. You sign in with your Google account
5. You grant Thoth basic profile permissions
6. You're redirected back to Thoth, now signed in!

## Permissions Requested

When you sign in with Google, Thoth only requests basic profile information:
- Your email address (used to identify your account)
- Your name and profile picture (optional, for personalization)
- Thoth never sees your Google password!

## Security

- All authentication happens securely on Google's servers
- Your Thoth account is protected by Google's security measures (2FA, etc.)
- You can revoke Thoth's access to your Google account at any time

## Revoking Access

To revoke Thoth's access to your Google account:
1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security** → **Third-party apps with account access**
3. Find Thoth in the list
4. Click **Remove access**
