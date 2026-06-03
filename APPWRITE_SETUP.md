# Appwrite Setup Guide

This application has been migrated from Supabase to Appwrite. Follow these steps to set up your Appwrite project.

## Prerequisites

- An Appwrite account (sign up at https://appwrite.io)
- Appwrite Cloud instance or self-hosted Appwrite server

## Step 1: Create an Appwrite Project

1. Log in to your Appwrite Console
2. Click "Create Project"
3. Name your project (e.g., "Mystical Tamarin")
4. Copy your **Project ID** - you'll need this later

## Step 2: Configure Web Platform

1. In your project, go to **Settings** > **Platforms**
2. Click **Add Platform** > **Web**
3. Add your application hostname (e.g., `localhost` for development, or your production domain)

## Step 3: Create Database and Collections

### Create Database
1. Go to **Databases** in the left sidebar
2. Click **Create Database**
3. Name it (e.g., "main")
4. Copy the **Database ID**

### Create Collections

#### 1. Profiles Collection
- **Collection ID**: `profiles`
- **Attributes**:
  - `user_id` (String, size: 255, required)
  - `first_name` (String, size: 255, optional)
  - `last_name` (String, size: 255, optional)
- **Indexes**:
  - Index on `user_id` (unique)
- **Permissions**:
  - Role: Any, CRUD permissions
  - Or set up custom permissions based on user_id

#### 2. Todos Collection
- **Collection ID**: `todos`
- **Attributes**:
  - `user_id` (String, size: 255, required)
  - `task` (String, size: 500, required)
  - `is_completed` (Boolean, required, default: false)
  - `due_date` (String, size: 255, optional) // ISO date string
- **Indexes**:
  - Index on `user_id`
  - Index on `$createdAt`
- **Permissions**:
  - Role: Any, CRUD permissions
  - Or set up custom permissions based on user_id

#### 3. Notes Collection
- **Collection ID**: `notes`
- **Attributes**:
  - `user_id` (String, size: 255, required)
  - `title` (String, size: 255, required)
  - `content` (String, size: 10000, optional)
- **Indexes**:
  - Index on `user_id`
  - Index on `$createdAt`
- **Permissions**:
  - Role: Any, CRUD permissions
  - Or set up custom permissions based on user_id

#### 4. Messages Collection
- **Collection ID**: `messages`
- **Attributes**:
  - `user_id` (String, size: 255, required)
  - `content` (String, size: 1000, required)
- **Indexes**:
  - Index on `$createdAt`
- **Permissions**:
  - Role: Any, Read and Create permissions
  - This allows all users to read all messages (public chat)
- **Enable Realtime**: Make sure realtime is enabled for this collection

## Step 4: Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **Create Bucket**
3. **Bucket ID**: `images`
4. Set **File Size Limit** (e.g., 10MB)
5. **Allowed File Extensions**: jpg, jpeg, png, gif, webp
6. **Permissions**:
   - Role: Any, Create and Read permissions
   - Or set up custom permissions for better security

## Step 5: Configure Authentication

1. Go to **Auth** in the left sidebar
2. Go to **Settings**
3. Enable **Email/Password** authentication method
4. Configure any additional auth methods you want (OAuth providers, magic links, etc.)

## Step 6: Create Environment Variables

Create a `.env` file in your project root:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here

# Collection IDs
VITE_APPWRITE_PROFILES_COLLECTION_ID=profiles
VITE_APPWRITE_TODOS_COLLECTION_ID=todos
VITE_APPWRITE_NOTES_COLLECTION_ID=notes
VITE_APPWRITE_MESSAGES_COLLECTION_ID=messages

# Storage Bucket ID
VITE_APPWRITE_IMAGES_BUCKET_ID=images
```

Replace the placeholder values with your actual IDs from the Appwrite Console.

## Step 7: Install Dependencies and Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## Key Features Implemented

- ✅ **Authentication**: Email/Password login and signup
- ✅ **User Profiles**: Create and update user profiles
- ✅ **Todos**: Create, read, update, and delete todos with due dates
- ✅ **Notes**: Create, read, update, and delete notes
- ✅ **Gallery**: Upload, view, and delete images
- ✅ **Messaging**: Real-time public chat with Appwrite Realtime

## Security Recommendations

### Collection-Level Permissions

For better security, consider setting up document-level permissions. Instead of "Role: Any", use:

**For user-specific documents (todos, notes, profiles)**:
- Create: `users` (any authenticated user)
- Read: `user:[USER_ID]` (owner only)
- Update: `user:[USER_ID]` (owner only)
- Delete: `user:[USER_ID]` (owner only)

You can implement this by updating the permissions when creating/updating documents:

```typescript
await databases.createDocument(
  databaseId,
  collectionId,
  ID.unique(),
  data,
  [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ]
);
```

**For public data (messages)**:
- Create: `users` (any authenticated user)
- Read: `any` (everyone)
- Update: `user:[USER_ID]` (owner only)
- Delete: `user:[USER_ID]` (owner only)

## Troubleshooting

### CORS Errors
Make sure you've added your application's domain to the Web Platform in Appwrite Console.

### Permission Errors
Check that your collections have the correct permissions set in the Appwrite Console.

### Realtime Not Working
Ensure that:
1. Realtime is enabled for the Messages collection
2. Your Appwrite instance supports WebSockets
3. Check the browser console for connection errors

### Images Not Loading
Verify that:
1. The storage bucket exists and has the correct ID
2. File upload size limits are configured
3. The bucket has read permissions

## Migration from Supabase

This application was successfully migrated from Supabase to Appwrite with the following changes:

- Replaced Supabase Auth with Appwrite Account API
- Migrated PostgreSQL database operations to Appwrite Database
- Converted Supabase Storage to Appwrite Storage
- Implemented Appwrite Realtime instead of Supabase Realtime

All functionality has been preserved!
