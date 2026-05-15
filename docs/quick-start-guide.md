# Thoth Quick Start Guide

Welcome to Thoth, the global dream archive! This guide will help you get up and running in 5 minutes.

## System Requirements

### For Development
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher (included with Node.js)
- **Git**: Latest version
- **Modern web browser**: Chrome 100+, Firefox 100+, Safari 16+, or Edge 100+

### For Mobile Development (Optional)
- **Android**: Android Studio Hedgehog (2023.1.1) or newer, JDK 17+
- **iOS**: Xcode 15.0 or newer, macOS Sonoma or newer

## Installation Steps

### Step 1: Install Prerequisites

#### Windows
1. Download and install [Node.js](https://nodejs.org/) (LTS version recommended)
2. Download and install [Git for Windows](https://git-scm.com/download/win)
3. Open PowerShell or Command Prompt and verify installations:
   ```bash
   node --version
   npm --version
   git --version
   ```

#### macOS
1. Install Homebrew (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Install Node.js and Git:
   ```bash
   brew install node git
   ```
3. Verify installations:
   ```bash
   node --version
   npm --version
   git --version
   ```

### Step 2: Clone the Repository

```bash
git clone https://github.com/your-username/Thothapp.git
cd Thothapp
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your favorite text editor and fill in the required values:

   ```env
   # Firebase Configuration (Required)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abc123def456

   # Gemini API (Required for Voice Transcription)
   VITE_GEMINI_API_KEY=your_gemini_api_key

   # R2 Storage (Required for Web Audio Uploads)
   R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
   R2_BUCKET=your-bucket-name
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret-key
   R2_PUBLIC_URL=https://your-public-url.com
   ```

## 5-Minute Quick Start Tutorial

### 1. Start the Development Server (1 minute)

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

![Thoth Home Screen](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20modern%20dream%20archive%20web%20app%20interface%20with%20world%20map%20visualization&image_size=landscape_16_9)

### 2. Sign In with Google (1 minute)

1. Click the **Sign in with Google** button
2. Select your Google account
3. Grant the requested permissions

![Google Sign In](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clean%20Google%20sign%20in%20button%20on%20modern%20web%20interface&image_size=square_hd)

### 3. Record Your First Dream (2 minutes)

1. Go to the **Record** tab
2. You'll see a 3-minute "Memory Collapse" countdown - capture your dream before it fades!
3. Click the large microphone button to start recording
4. Speak clearly about your dream
5. Click the button again to stop recording
6. Wait for Thoth to transcribe and analyze your dream using AI

![Dream Recording Interface](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=voice%20recording%20interface%20with%20microphone%20button%20and%20countdown%20timer&image_size=landscape_4_3)

### 4. Explore the Global Dream Map (1 minute)

1. Go to the **Global** tab
2. Explore the interactive D3.js world map showing dream activity by country
3. Check out the trending imagery tags from the collective subconscious
4. View stats like active dreamers and total archived dreams

![Global Dream Map](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=interactive%20world%20map%20visualization%20showing%20dream%20activity%20with%20colorful%20highlights&image_size=landscape_16_9)

## Next Steps

Congratulations! You've successfully set up Thoth and recorded your first dream! Here are some next steps to explore:

- Check out your personal dream archive in the **History** tab
- Customize your settings in the **Settings** tab
- Learn about the AI features in [Using Nuwa AI](./guides/using-nuwa-ai.md)
- Explore the [API documentation](./API.md) for advanced usage
- Build the Android or iOS app following the instructions in the README

## Troubleshooting

### Common Issues

- **Dependencies won't install**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- **Firebase errors**: Double-check your `.env` file has the correct Firebase configuration
- **Port already in use**: The dev server uses port 5173 by default. You can change it in `vite.config.ts`
- **Gemini API not working**: Verify your API key is valid and has the necessary permissions

### Getting Help

If you run into any issues:
1. Check the [README](../README.md) for more detailed documentation
2. Look at the [GitHub Issues](https://github.com/your-username/Thothapp/issues) to see if others have experienced the same problem
3. Open a new issue with a clear description of the problem and steps to reproduce it
