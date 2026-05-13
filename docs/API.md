---
title: "API Documentation"
description: "Technical API documentation for Thoth services"
category: "specs"
---
# Thoth API Documentation

This document provides detailed documentation for the core APIs and services used in the Thoth AI Dream Archive project.

## Core Services

### AI Service

The AI Service is responsible for analyzing dream transcripts and generating insights, tags, and oracle sentences.

#### `analyzeDream(transcript: string): Promise<DreamAnalysis>`

Analyzes a dream transcript and returns structured analysis results.

**Parameters:**
- `transcript`: The dream transcript to analyze

**Returns:**
```typescript
interface DreamAnalysis {
  tags: string[];           // Extracted imagery tags
  insight: string;          // Psychological insight
  divine_oracle: string;    // Oracle sentence
}
```

#### `transcribeAudio(audioBlob: Blob): Promise<string>`

Transcribes audio content to text using the Gemini API.

**Parameters:**
- `audioBlob`: The audio blob to transcribe

**Returns:**
- The transcribed text

### Data Service

The Data Service is responsible for managing data storage and retrieval using Firebase Firestore.

#### `saveDream(dream: DreamCreate): Promise<Dream>`

Saves a new dream to the database.

**Parameters:**
- `dream`: The dream data to save

**Returns:**
- The saved dream with generated ID

#### `getUserDreams(userId: string): Promise<Dream[]>`

Retrieves all dreams for a specific user.

**Parameters:**
- `userId`: The user's ID

**Returns:**
- An array of dream objects

#### `updateGlobalImagery(tags: string[]): Promise<void>`

Updates the global imagery statistics with new tags.

**Parameters:**
- `tags`: An array of tags to update

#### `updateGlobalLocation(country: string): Promise<void>`

Updates the global location statistics with a new location.

**Parameters:**
- `country`: The country to update

### Auth Service

The Auth Service is responsible for managing user authentication using Firebase Auth.

#### `signInWithGoogle(): Promise<User>`

Signs in a user with Google authentication.

**Returns:**
- The authenticated user

#### `signOut(): Promise<void>`

Signs out the current user.

#### `getCurrentUser(): User | null`

Gets the current authenticated user.

**Returns:**
- The current user or null if not authenticated

### Storage Service

The Storage Service is responsible for managing file storage using Cloudflare R2 and Firebase Storage.

#### `uploadAudio(audioBlob: Blob, fileName: string): Promise<string>`

Uploads an audio file to storage.

**Parameters:**
- `audioBlob`: The audio blob to upload
- `fileName`: The name of the file

**Returns:**
- The URL of the uploaded file

#### `getAudioUrl(fileName: string): Promise<string>`

Gets the URL of an audio file.

**Parameters:**
- `fileName`: The name of the file

**Returns:**
- The URL of the file

## Data Models

### User Profile

```typescript
interface UserProfile {
  email: string;              // User's email address
  created_at: Timestamp;      // Account creation time
  daily_usage_count: number;  // Daily usage count
  daily_quota_limit: number;  // Daily quota limit
  last_usage_date: string | null; // Last usage date
  total_dreams: number;       // Total number of dreams
  active_provider: 'gemini' | 'openai' | 'deepseek' | 'minimax'; // Active AI provider
  external_apis: {            // External API keys
    [key: string]: string;
  };
  streak: number;             // Current streak
  last_streak_date: string | null; // Last streak date
}
```

### Dream

```typescript
interface Dream {
  id: string;                 // Dream ID
  user_id: string;            // User ID
  transcript: string;         // Dream transcript
  audio_url?: string;         // Audio recording URL
  tags: string[];             // Extracted tags
  insight: string;            // Psychological insight
  divine_oracle: string;      // Oracle sentence
  location: string;           // Location
  created_at: Timestamp;      // Creation time
}
```

### Global Imagery

```typescript
interface GlobalImagery {
  tag: string;                // Imagery tag
  count: number;              // Frequency count
  last_updated: Timestamp;    // Last updated time
}
```

### Global Location

```typescript
interface GlobalLocation {
  country: string;            // Country name
  count: number;              // Frequency count
  last_updated: Timestamp;    // Last updated time
}
```

## Error Handling

All services use a consistent error handling pattern. Errors are caught and wrapped with additional context information:

```typescript
interface FirestoreErrorInfo {
  error: string;              // Error message
  operationType: OperationType; // Operation type
  path: string | null;        // Database path
  authInfo: any;              // Authentication information
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

## Authentication Flow

1. User signs in with Google using `signInWithGoogle()`
2. User profile is created or updated in Firestore
3. User gains access to their dream archive
4. User can sign out using `signOut()`

## Data Flow

1. **Capture**: User records audio or enters text
2. **Process**: Audio is transcribed and analyzed by AI
3. **Store**: Dream data is saved to Firestore
4. **Aggregate**: Global statistics are updated
5. **Retrieve**: User can access their dreams and global data

---

*Thoth API Documentation v1.0.0*
