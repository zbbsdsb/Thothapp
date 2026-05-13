---
title: "Architecture"
description: "Technical architecture overview of Thoth"
category: "specs"
---
# Thoth Architecture

Thoth is a full-stack application designed for high-performance dream archiving and AI analysis.

## 🏗️ System Overview

The system is built on a modern, serverless-first architecture:

### Frontend (React + Vite)
- **Framework**: React 19 with Vite for fast development and optimized builds.
- **Styling**: Tailwind CSS 4.0 for a custom, mystical UI.
- **Animations**: Framer Motion for smooth transitions and the "Memory Collapse" effects.
- **Data Visualization**: D3.js and TopoJSON for the interactive Global Imagery Map.

### Backend (Express + Node.js)
- **Server**: A lightweight Express server handles presigned URL generation for Cloudflare R2 uploads and is deployed on Vercel (not a standalone server).
- **Note**: On mobile (Capacitor/Android), R2 uploads fall back to Firebase Storage because the Express server is not directly accessible from the native layer.
- **Environment**: Managed via `dotenv` / Vercel environment variables for secure configuration.

### Database & Auth (Firebase)
- **Firestore**: NoSQL database for storing user profiles, dream records, and global statistics.
- **Authentication**: Google OAuth via Firebase Auth for secure, one-tap login.
- **Security Rules**: Strict, granular rules ensure that users can only access their own data.

### Storage (Cloudflare R2)
- **Primary Storage**: Cloudflare R2 is used for high-performance, cost-effective storage of audio recordings.
- **Fallback**: Firebase Storage is configured as a secondary fallback for redundancy.

### AI Engine (Gemini)
- **Transcription**: Gemini Flash converts voice recordings into high-accuracy text.
- **Analysis**: Generates psychological insights, imagery tags, and the "Divine Oracle" sentences.

## 🔄 Data Flow

1. **Capture**: User records audio in the browser.
2. **Presign**: Frontend requests a presigned PUT URL from the Express backend.
3. **Upload**: Audio is uploaded directly from the browser to Cloudflare R2.
4. **Process**: Transcript and metadata are sent to Gemini for analysis.
5. **Archive**: Final dream record is saved to Firestore.
6. **Aggregate**: Global statistics are updated atomically via Firestore transactions.

---
*Thoth Architecture v2.0.0 — Updated 2026-05-12*
