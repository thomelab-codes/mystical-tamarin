# Multi-Backend Productivity Tools

A comprehensive productivity suite built with React and TypeScript, featuring support for **three different backend services**: Supabase, Firebase, and Appwrite. Switch between backends with a single configuration change!

## Features

### Existing Features
- **Dashboard**: User profile management and central hub
- **Notes**: Create, edit, and manage personal notes
- **Todo List**: Task management with due dates and completion tracking
- **Calculator**: Scientific calculator with number base conversion
- **Image Gallery**: Upload, view, and manage images
- **Messaging**: Real-time public chat

### New Productivity Features
- **Pomodoro Timer**: Focus timer with customizable work/break intervals
- **Password Generator**: Generate secure passwords with customizable options
- **Unit Converter**: Convert between different units (length, weight, temperature, volume, area, speed, time)
- **Flashcards**: Create custom flashcard decks for studying any subject
- **Language Learning**: Learn Spanish, Lithuanian, and Polish with built-in vocabulary and phrases
  - Interactive flashcards mode
  - Type-answer practice
  - Text-to-speech pronunciation
  - 100+ vocabulary words per language
  - Common phrases with pronunciation guides

### Planned Features (Database Support Ready)
- **Habit Tracker**: Track daily, weekly, and monthly habits
- **Calendar/Events**: Manage events and appointments
- **Expense Tracker**: Track income and expenses with categories
- **Kanban Board**: Visual task management with drag-and-drop
- **Markdown Editor**: Rich text editing with live preview

## Multi-Backend Support

This application includes a complete abstraction layer that allows you to use any of the following backends:

### Supported Backends
1. **Supabase** (Default) - PostgreSQL-based backend with real-time subscriptions
2. **Firebase** - Google's cloud platform with Firestore and real-time updates
3. **Appwrite** - Open-source backend with self-hosting options

## Multilingual Support (i18n)

The entire application interface is available in **20 languages**:

- 🇬🇧 **English** - Default language
- 🇪🇸 **Spanish** (Español)
- 🇹🇭 **Thai** (ไทย)
- 🇱🇹 **Lithuanian** (Lietuvių)
- 🇵🇱 **Polish** (Polski)
- 🇱🇦 **Lao** (ລາວ)
- 🇨🇳 **Chinese** (中文)
- 🇭🇰 **Cantonese** (粵語)
- 🇮🇳 **Hindi** (हिन्दी)
- 🇻🇳 **Vietnamese** (Tiếng Việt)
- 🇮🇩 **Indonesian** (Bahasa Indonesia)
- 🇯🇵 **Japanese** (日本語)
- 🇩🇪 **German** (Deutsch)
- 🇳🇱 **Dutch** (Nederlands)
- 🇫🇷 **French** (Français)
- 🇵🇹 **Portuguese** (Português)
- 🇮🇳 **Tamil** (தமிழ்)
- 🇷🇺 **Russian** (Русский)
- 🇷🇸 **Serbian** (Српски)
- 🇬🇷 **Greek** (Ελληνικά)

### Features:
- **Automatic Language Detection** - Detects browser language on first visit
- **Language Switcher** - Easy dropdown in the dashboard sidebar
- **Persistent Selection** - Your language choice is saved locally
- **Complete Translation** - All UI text, navigation, and messages are translated
- **Easy to Extend** - Add new languages by creating JSON translation files

### How to Switch Languages:
1. Open the dashboard
2. Find the language switcher (🌐) in the sidebar
3. Select your preferred language from the dropdown
4. The entire app updates instantly!

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Account on your chosen backend service (Supabase, Firebase, or Appwrite)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mystical-tamarin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Choose and configure your backend** (see Backend Setup below)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Backend Setup

### Option 1: Supabase (Default)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migration**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `database_migration.sql`
   - Execute the SQL

3. **Configure the app**
   - Open `src/lib/backend/config.ts`
   - The Supabase configuration is already set up (current project)
   - Ensure `ACTIVE_BACKEND` is set to `'supabase'`

4. **You're ready to go!** The app is pre-configured with Supabase.

### Option 2: Firebase

1. **Create a Firebase project** at [firebase.google.com](https://firebase.google.com)

2. **Enable services**
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Firebase Storage

3. **Get your config**
   - Go to Project Settings → General
   - Scroll to "Your apps" and add a Web app
   - Copy the Firebase configuration object

4. **Configure the app**
   ```typescript
   // src/lib/backend/config.ts
   export const ACTIVE_BACKEND = 'firebase';

   export const FIREBASE_CONFIG = {
     apiKey: 'YOUR_API_KEY',
     authDomain: 'YOUR_PROJECT.firebaseapp.com',
     projectId: 'YOUR_PROJECT_ID',
     storageBucket: 'YOUR_PROJECT.appspot.com',
     messagingSenderId: 'YOUR_SENDER_ID',
     appId: 'YOUR_APP_ID',
   };
   ```

5. **Set up Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null &&
           request.auth.uid == resource.data.user_id;
       }
     }
   }
   ```

6. **Set up Storage Security Rules**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Option 3: Appwrite

1. **Set up Appwrite**
   - Use [Appwrite Cloud](https://cloud.appwrite.io) or
   - [Self-host Appwrite](https://appwrite.io/docs/installation)

2. **Create a project**
   - Create a new project in Appwrite console
   - Note your Project ID

3. **Create a database**
   - Create a new database
   - Note your Database ID
   - Create collections for each table in `database_migration.sql`
   - Set up attributes matching the SQL schema

4. **Create a storage bucket**
   - Create a storage bucket
   - Note your Bucket ID

5. **Configure the app**
   ```typescript
   // src/lib/backend/config.ts
   export const ACTIVE_BACKEND = 'appwrite';

   export const APPWRITE_CONFIG = {
     endpoint: 'https://cloud.appwrite.io/v1', // or your self-hosted URL
     projectId: 'YOUR_PROJECT_ID',
     databaseId: 'YOUR_DATABASE_ID',
     bucketsId: 'YOUR_BUCKET_ID',
   };
   ```

6. **Set up permissions**
   - For each collection, set permissions:
     - Create: Users
     - Read: User ($userId)
     - Update: User ($userId)
     - Delete: User ($userId)

## Switching Between Backends

To switch backends, simply change the `ACTIVE_BACKEND` constant in `src/lib/backend/config.ts`:

```typescript
// Switch to Supabase
export const ACTIVE_BACKEND = 'supabase';

// Switch to Firebase
export const ACTIVE_BACKEND = 'firebase';

// Switch to Appwrite
export const ACTIVE_BACKEND = 'appwrite';
```

The application will automatically use the appropriate adapter!

## Project Structure

```
src/
├── lib/
│   └── backend/           # Backend abstraction layer
│       ├── types.ts       # TypeScript interfaces
│       ├── supabase-adapter.ts
│       ├── firebase-adapter.ts
│       ├── appwrite-adapter.ts
│       ├── provider.tsx   # React context provider
│       ├── config.ts      # Backend configuration
│       └── index.ts       # Exports
├── pages/                 # Page components
│   ├── Dashboard.tsx
│   ├── Notes.tsx
│   ├── TodoList.tsx
│   ├── Pomodoro.tsx
│   ├── PasswordGenerator.tsx
│   ├── UnitConverter.tsx
│   └── ...
├── components/
│   └── ui/               # shadcn/ui components
├── App.tsx               # Main app with routing
└── main.tsx              # Entry point
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **State**: React Query (TanStack Query)
- **Backend**: Supabase / Firebase / Appwrite (configurable)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema

The application uses the following tables (see `database_migration.sql`):

- `profiles` - User profile information
- `notes` - User notes
- `todos` - Todo items
- `messages` - Public messages
- `habits` - Habit tracking
- `habit_logs` - Habit completion logs
- `events` - Calendar events
- `expenses` - Income and expense tracking
- `kanban_boards` - Kanban boards
- `kanban_columns` - Board columns
- `kanban_cards` - Task cards
- `markdown_docs` - Markdown documents
- `flashcard_decks` - Flashcard deck organization
- `flashcards` - Individual flashcard items
- `language_progress` - Language learning progress tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Open an issue on GitHub
- Check the documentation for your chosen backend:
  - [Supabase Docs](https://supabase.com/docs)
  - [Firebase Docs](https://firebase.google.com/docs)
  - [Appwrite Docs](https://appwrite.io/docs)

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
