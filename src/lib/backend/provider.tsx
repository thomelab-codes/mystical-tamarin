import React, { createContext, useContext, useMemo } from 'react';
import { IBackendService } from './types';
import { SupabaseBackendService } from './supabase-adapter';
import { FirebaseBackendService } from './firebase-adapter';
import { AppwriteBackendService } from './appwrite-adapter';
import {
  ACTIVE_BACKEND,
  SUPABASE_CONFIG,
  FIREBASE_CONFIG,
  APPWRITE_CONFIG,
} from './config';

const BackendContext = createContext<IBackendService | null>(null);

export function createBackend(): IBackendService {
  switch (ACTIVE_BACKEND) {
    case 'supabase':
      return new SupabaseBackendService(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    case 'firebase':
      return new FirebaseBackendService(FIREBASE_CONFIG);
    case 'appwrite':
      return new AppwriteBackendService(APPWRITE_CONFIG);
    default:
      throw new Error(`Unknown backend: ${ACTIVE_BACKEND}`);
  }
}

interface BackendProviderProps {
  children: React.ReactNode;
}

export function BackendProvider({ children }: BackendProviderProps) {
  const backend = useMemo(() => createBackend(), []);

  return (
    <BackendContext.Provider value={backend}>
      {children}
    </BackendContext.Provider>
  );
}

export function useBackend(): IBackendService {
  const backend = useContext(BackendContext);
  if (!backend) {
    throw new Error('useBackend must be used within BackendProvider');
  }
  return backend;
}
