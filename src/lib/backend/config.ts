// Backend configuration
// Change ACTIVE_BACKEND to switch between backends: 'supabase' | 'firebase' | 'appwrite'
export const ACTIVE_BACKEND = 'supabase' as 'supabase' | 'firebase' | 'appwrite';

// Supabase configuration
export const SUPABASE_CONFIG = {
  url: 'https://zbwgwezckpyelqaaozbk.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpid2d3ZXpja3B5ZWxxYWFvemJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NzE3NTUsImV4cCI6MjA2MTU0Nzc1NX0.FFotjfcatop_gITA5InfkBG70rfwcg_7OKBNuVVg9dA',
};

// Firebase configuration
// Replace with your Firebase project config
export const FIREBASE_CONFIG = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Appwrite configuration
// Replace with your Appwrite project config
export const APPWRITE_CONFIG = {
  endpoint: 'https://cloud.appwrite.io/v1', // Or your self-hosted endpoint
  projectId: 'YOUR_PROJECT_ID',
  databaseId: 'YOUR_DATABASE_ID',
  bucketsId: 'YOUR_BUCKET_ID',
};
