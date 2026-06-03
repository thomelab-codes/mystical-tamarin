// Appwrite configuration constants
export const appwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || 'YOUR_PROJECT_ID',
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'YOUR_DATABASE_ID',

  // Collection IDs
  collections: {
    profiles: import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || 'profiles',
    todos: import.meta.env.VITE_APPWRITE_TODOS_COLLECTION_ID || 'todos',
    notes: import.meta.env.VITE_APPWRITE_NOTES_COLLECTION_ID || 'notes',
    messages: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID || 'messages',
  },

  // Storage Bucket IDs
  buckets: {
    images: import.meta.env.VITE_APPWRITE_IMAGES_BUCKET_ID || 'images',
  },
};
