# Thoth Common Package

The common package is the core business logic of the Thoth AI Dream Archive project. It contains the shared services and utilities that are used across all platform-specific applications.

## Overview

This package provides the following core services:

- **AI Service**: Handles dream analysis and audio transcription
- **Data Service**: Manages data storage and retrieval
- **Auth Service**: Handles user authentication
- **Storage Service**: Manages file storage
- **Utilities**: Common utility functions

## Directory Structure

```
packages/common/
├── src/
│   ├── ai/                 # AI analysis services
│   │   ├── analyze.ts      # Dream analysis logic
│   │   ├── transcribe.ts   # Audio transcription logic
│   │   └── index.ts        # Export file
│   ├── data/               # Data models and services
│   │   ├── dream.ts        # Dream-related functions
│   │   ├── user.ts         # User-related functions
│   │   ├── global.ts       # Global statistics functions
│   │   └── index.ts        # Export file
│   ├── auth/               # Authentication services
│   │   ├── google.ts       # Google authentication
│   │   └── index.ts        # Export file
│   ├── storage/            # Storage services
│   │   ├── r2.ts           # Cloudflare R2 integration
│   │   ├── firebase.ts     # Firebase Storage integration
│   │   └── index.ts        # Export file
│   ├── utils/              # Utility functions
│   │   ├── error.ts        # Error handling utilities
│   │   ├── time.ts         # Time-related utilities
│   │   └── index.ts        # Export file
│   └── index.ts            # Main export file
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Core Services

### AI Service

The AI Service is responsible for analyzing dream transcripts and generating insights, tags, and oracle sentences using the Google Gemini API.

#### Functions

- `analyzeDream(transcript: string): Promise<DreamAnalysis>`: Analyzes a dream transcript and returns structured analysis results.
- `transcribeAudio(audioBlob: Blob): Promise<string>`: Transcribes audio content to text using the Gemini API.

### Data Service

The Data Service is responsible for managing data storage and retrieval using Firebase Firestore.

#### Functions

- `saveDream(dream: DreamCreate): Promise<Dream>`: Saves a new dream to the database.
- `getUserDreams(userId: string): Promise<Dream[]>`: Retrieves all dreams for a specific user.
- `updateGlobalImagery(tags: string[]): Promise<void>`: Updates the global imagery statistics with new tags.
- `updateGlobalLocation(country: string): Promise<void>`: Updates the global location statistics with a new location.
- `getUserProfile(userId: string): Promise<UserProfile | null>`: Retrieves a user's profile.
- `updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void>`: Updates a user's profile.

### Auth Service

The Auth Service is responsible for managing user authentication using Firebase Auth.

#### Functions

- `signInWithGoogle(): Promise<User>`: Signs in a user with Google authentication.
- `signOut(): Promise<void>`: Signs out the current user.
- `getCurrentUser(): User | null`: Gets the current authenticated user.
- `onAuthStateChanged(callback: (user: User | null) => void): () => void`: Registers a callback for auth state changes.

### Storage Service

The Storage Service is responsible for managing file storage using Cloudflare R2 and Firebase Storage.

#### Functions

- `uploadAudio(audioBlob: Blob, fileName: string): Promise<string>`: Uploads an audio file to storage.
- `getAudioUrl(fileName: string): Promise<string>`: Gets the URL of an audio file.

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

## Error Handling

The common package uses a consistent error handling pattern. All errors are caught and wrapped with additional context information:

```typescript
interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
```

## Usage Examples

### Analyzing a Dream

```typescript
import { analyzeDream } from '@thoth/common/ai';

const transcript = "I was flying over a forest and saw a golden door.";
const analysis = await analyzeDream(transcript);

console.log('Tags:', analysis.tags);
console.log('Insight:', analysis.insight);
console.log('Oracle:', analysis.divine_oracle);
```

### Saving a Dream

```typescript
import { saveDream } from '@thoth/common/data';

const dream = {
  user_id: 'user123',
  transcript: "I was flying over a forest and saw a golden door.",
  tags: ['flying', 'forest', 'golden door'],
  insight: "Your subconscious is seeking new opportunities.",
  divine_oracle: "The path to wisdom lies beyond the golden threshold.",
  location: "United States"
};

const savedDream = await saveDream(dream);
console.log('Saved dream ID:', savedDream.id);
```

### Uploading Audio

```typescript
import { uploadAudio } from '@thoth/common/storage';

const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
const fileName = `dreams/${userId}/${dreamId}.webm`;
const audioUrl = await uploadAudio(audioBlob, fileName);
console.log('Audio URL:', audioUrl);
```

### Authentication

```typescript
import { signInWithGoogle, signOut, getCurrentUser } from '@thoth/common/auth';

// Sign in with Google
const user = await signInWithGoogle();
console.log('Signed in user:', user.displayName);

// Get current user
const currentUser = getCurrentUser();
console.log('Current user:', currentUser?.email);

// Sign out
await signOut();
console.log('User signed out');
```

## Dependencies

- `@google/genai`: For AI analysis and transcription
- `firebase`: For authentication, data storage, and file storage
- `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`: For Cloudflare R2 integration
- `dotenv`: For environment variable management

## Development

To develop the common package:

1. Navigate to the package directory: `cd packages/common`
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Build the package: `npm run build`

## Testing

The common package includes comprehensive unit tests for all services. To run the tests:

```bash
npm test
```

## Versioning

The common package follows semantic versioning. Versions are incremented based on the following guidelines:

- **Patch**: Bug fixes and minor improvements
- **Minor**: New features and functionality
- **Major**: Breaking changes

---

*Thoth Common Package v1.0.0*