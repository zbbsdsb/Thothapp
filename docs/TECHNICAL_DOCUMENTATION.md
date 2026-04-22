# Thoth Technical Documentation

This document provides detailed technical documentation for the Thoth AI Dream Archive project, including architecture, implementation details, and usage guidelines.

## Project Overview

Thoth is a multi-platform AI-powered dream archive application that allows users to capture, analyze, and store their dreams. The project uses a monorepo architecture to support multiple platforms while maintaining a single source of truth for core business logic.

## Architecture

### Monorepo Structure

Thoth uses a monorepo structure managed by Nx, which provides powerful tools for code sharing, task execution, and dependency management across multiple applications and libraries.

```
thoth/
├── apps/                   # Applications
│   ├── web/                # Web application
│   ├── mobile/             # React Native application
│   ├── windows/            # Windows desktop application (Electron)
│   ├── wearos/             # WearOS application
│   └── apple-watch/        # Apple Watch application
├── packages/               # Shared packages
│   ├── common/             # Core business logic
│   ├── ui/                 # Shared UI components
│   ├── types/              # Shared TypeScript types
│   └── config/             # Shared configuration
├── tools/                  # Build and development tools
├── docs/                   # Project documentation
└── nx.json                 # Nx configuration
```

### Core Services

The Thoth project is built around several core services:

#### AI Service

The AI Service is responsible for analyzing dream transcripts and generating insights, tags, and oracle sentences using the Google Gemini API.

**Key functions:**
- `analyzeDream(transcript: string)`: Analyzes a dream transcript and returns structured analysis results
- `transcribeAudio(audioBlob: Blob)`: Transcribes audio content to text using the Gemini API

#### Data Service

The Data Service is responsible for managing data storage and retrieval using Firebase Firestore.

**Key functions:**
- `saveDream(dream: DreamCreate)`: Saves a new dream to the database
- `getUserDreams(userId: string)`: Retrieves all dreams for a specific user
- `updateGlobalImagery(tags: string[])`: Updates the global imagery statistics with new tags
- `updateGlobalLocation(country: string)`: Updates the global location statistics with a new location
- `getUserProfile(userId: string)`: Retrieves a user's profile
- `createUserProfile(userId: string, email: string)`: Creates a new user profile
- `updateUserProfile(userId: string, updates: Partial<UserProfile>)`: Updates a user's profile
- `syncUserStats(userId: string, isUsingPublicQuota: boolean)`: Syncs user statistics after a dream is saved

#### Auth Service

The Auth Service is responsible for managing user authentication using Firebase Auth.

**Key functions:**
- `signInWithGoogle()`: Signs in a user with Google authentication
- `signOut()`: Signs out the current user
- `getCurrentUser()`: Gets the current authenticated user
- `onAuthStateChange(callback: (user: User | null) => void)`: Registers a callback for auth state changes

#### Storage Service

The Storage Service is responsible for managing file storage using Cloudflare R2 and Firebase Storage.

**Key functions:**
- `uploadAudio(audioBlob: Blob, fileName: string)`: Uploads an audio file to storage
- `uploadToR2(audioBlob: Blob, fileName: string, mimeType: string)`: Uploads an audio file to Cloudflare R2
- `uploadToFirebaseStorage(audioBlob: Blob, fileName: string)`: Uploads an audio file to Firebase Storage

## Data Models

### UserProfile

```typescript
interface UserProfile {
  email: string;
  created_at: Timestamp;
  daily_usage_count: number;
  daily_quota_limit: number;
  last_usage_date: string | null;
  total_dreams: number;
  active_provider: 'gemini' | 'openai' | 'deepseek' | 'minimax';
  external_apis: {
    [key: string]: string;
  };
  streak: number;
  last_streak_date: string | null;
}
```

### Dream

```typescript
interface Dream {
  id: string;
  user_id: string;
  transcript: string;
  audio_url?: string;
  tags: string[];
  insight: string;
  divine_oracle: string;
  location: string;
  created_at: Timestamp;
}

interface DreamCreate {
  user_id: string;
  transcript: string;
  audio_url?: string;
  tags: string[];
  insight: string;
  divine_oracle: string;
  location: string;
}
```

### DreamAnalysis

```typescript
interface DreamAnalysis {
  tags: string[];
  insight: string;
  divine_oracle: string;
}
```

### GlobalImagery

```typescript
interface GlobalImagery {
  tag: string;
  count: number;
  last_updated: Timestamp;
}
```

### GlobalLocation

```typescript
interface GlobalLocation {
  country: string;
  count: number;
  last_updated: Timestamp;
}
```

## Implementation Details

### AI Analysis Process

1. User records a dream via voice or text
2. If voice, the audio is transcribed to text using the Gemini API
3. The transcript is analyzed by the Gemini API to extract tags, insights, and an oracle sentence
4. The analysis results are stored with the dream data

### Data Flow

1. **Capture**: User records audio or enters text
2. **Process**: Audio is transcribed and analyzed by AI
3. **Store**: Dream data is saved to Firestore
4. **Aggregate**: Global statistics are updated
5. **Retrieve**: User can access their dreams and global data

### Storage Strategy

Thoth uses a dual-storage strategy:

1. **Primary Storage**: Cloudflare R2 for high-performance, cost-effective storage of audio recordings
2. **Fallback Storage**: Firebase Storage as a secondary fallback for redundancy

### Authentication Flow

1. User signs in with Google using `signInWithGoogle()`
2. User profile is created or updated in Firestore
3. User gains access to their dream archive
4. User can sign out using `signOut()`

## Development Guidelines

### Getting Started

1. **Clone the repository**: `git clone https://github.com/thothapp/thoth.git`
2. **Install dependencies**: `npm install`
3. **Set up environment variables**: Create a `.env` file based on `.env.example`
4. **Start development server**: `nx serve web`

### Environment Variables

The following environment variables are required:

- `FIREBASE_API_KEY`: Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `FIREBASE_APP_ID`: Firebase app ID
- `GEMINI_API_KEY`: Google Gemini API key
- `CLOUDFLARE_R2_ENDPOINT`: Cloudflare R2 endpoint
- `CLOUDFLARE_R2_ACCESS_KEY_ID`: Cloudflare R2 access key ID
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`: Cloudflare R2 secret access key
- `CLOUDFLARE_R2_BUCKET_NAME`: Cloudflare R2 bucket name
- `CLOUDFLARE_R2_PUBLIC_URL`: Cloudflare R2 public URL

### Code Style

Thoth follows the Google Style Guide for TypeScript and JavaScript.

### Testing

All services in the common package include comprehensive unit tests. To run the tests:

```bash
nx test common
```

### Building

To build the entire project:

```bash
nx build
```

To build a specific application:

```bash
nx build web
```

## Deployment

### Web Application

The web application can be deployed to any static hosting service, such as Vercel, Netlify, or Firebase Hosting.

### Mobile Application

The mobile application can be built and deployed to the App Store (iOS) and Google Play Store (Android) using the React Native CLI.

### Windows Application

The Windows application can be built and deployed to the Microsoft Store using Electron.

### Wearable Applications

The WearOS and Apple Watch applications can be built and deployed to their respective app stores.

## Monitoring and Maintenance

### Error Handling

Thoth includes comprehensive error handling for all services. Errors are logged with context information to aid in debugging.

### Performance Monitoring

Thoth uses Firebase Performance Monitoring to track app performance and identify bottlenecks.

### Security

Thoth implements the following security measures:

- Firebase Authentication for user management
- Firebase Security Rules for database access control
- Environment variables for sensitive configuration
- HTTPS for all network requests

## Future Enhancements

### Planned Features

- **Advanced Dream Analysis**: More sophisticated AI models for dream interpretation
- **Dream Sharing**: Social features for sharing dreams with friends
- **Dream Visualization**: Generate visual representations of dreams
- **Dream Journal**: Enhanced journaling features with tags and categories
- **Sleep Tracking**: Integration with sleep tracking devices

### Technical Roadmap

1. **Phase 1**: Complete web and mobile applications
2. **Phase 2**: Add desktop and wearable applications
3. **Phase 3**: Implement advanced AI features
4. **Phase 4**: Launch social features

## Support

For technical support, please contact the Thoth development team at support@thothapp.com.

---

*Thoth Technical Documentation v1.0.0*