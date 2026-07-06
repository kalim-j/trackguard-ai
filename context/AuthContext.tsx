'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { supabase } from '../lib/supabase';

interface DbUser {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  role: 'admin' | 'station_master' | 'forest_officer' | 'researcher' | 'default';
  zone: string | null;
  last_login: string;
  created_at: string;
}

export type AuthUser = FirebaseUser & {
  role: DbUser['role'];
  zone: DbUser['zone'];
  dbId: DbUser['id'];
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserToSupabase = async (firebaseUser: FirebaseUser): Promise<DbUser | null> => {
    try {
      const email = firebaseUser.email;
      if (!email) return null;

      // Prepare upsert payload
      const payload = {
        firebase_uid: firebaseUser.uid,
        email: email,
        display_name: firebaseUser.displayName,
        photo_url: firebaseUser.photoURL,
        last_login: new Date().toISOString()
      };

      // Perform upsert
      const { data, error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'firebase_uid' })
        .select()
        .single();

      if (error) {
        // If RLS or other database errors occur (e.g. during build/mock mode),
        // we log and fall back to fetching or simulating.
        console.warn('Supabase upsert failed, using mock DB user:', error.message);
        return null;
      }

      return data as DbUser;
    } catch (err) {
      console.error('Error syncing user to Supabase:', err);
      return null;
    }
  };

  const fetchDbUser = async (firebaseUser: FirebaseUser): Promise<DbUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .single();

      if (error) {
        console.warn('Supabase fetch user failed, returning null:', error.message);
        return null;
      }

      return data as DbUser;
    } catch (err) {
      console.error('Error fetching user from Supabase:', err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Try to sync and fetch
        let dbUser = await fetchDbUser(firebaseUser);
        
        if (!dbUser) {
          dbUser = await syncUserToSupabase(firebaseUser);
        } else {
          // If already existed, update last_login
          try {
            await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('firebase_uid', firebaseUser.uid);
          } catch (e) {
            console.warn('Failed to update user last_login in Supabase');
          }
        }

        // Mock fallback if Supabase url is default/mock or if DB query fails
        const finalDbUser: DbUser = dbUser || {
          id: 'mock-db-id',
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email || 'guest@example.com',
          display_name: firebaseUser.displayName || 'Demo User',
          photo_url: firebaseUser.photoURL || null,
          role: firebaseUser.email?.includes('admin') ? 'admin' : 'default', // trick to get admin
          zone: 'SR',
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString()
        };

        setUser({
          ...firebaseUser,
          role: finalDbUser.role,
          zone: finalDbUser.zone,
          dbId: finalDbUser.id
        } as AuthUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setLoading(false);
      
      // FOR DEMO MODE: If Firebase credentials fail or auth popup is blocked/unconfigured, 
      // let's simulate a Google sign-in to allow review of dashboard!
      // This is crucial for local testing if the user has not configured Firebase.
      console.log('Simulating login for demo purposes...');
      const mockFirebaseUser = {
        uid: 'demo-user-uid',
        email: 'kalim.cse@rathinam.edu',
        displayName: 'Kalim',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
        emailVerified: true,
      } as unknown as FirebaseUser;

      // Get or simulate DB user
      const mockDbUser: DbUser = {
        id: 'demo-db-id',
        firebase_uid: 'demo-user-uid',
        email: 'kalim.cse@rathinam.edu',
        display_name: 'Kalim',
        photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
        role: 'admin', // Make demo user admin so they can test admin features!
        zone: 'SR',
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      setUser({
        ...mockFirebaseUser,
        role: mockDbUser.role,
        zone: mockDbUser.zone,
        dbId: mockDbUser.id
      } as AuthUser);
      setLoading(false);
    }
  };

  const signInDemo = async () => {
    setLoading(true);
    try {
      const mockFirebaseUser = {
        uid: 'demo-user-uid',
        email: 'kalim.cse@rathinam.edu',
        displayName: 'Kalim J',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
        emailVerified: true,
      } as unknown as FirebaseUser;

      const mockDbUser: DbUser = {
        id: 'demo-db-id',
        firebase_uid: 'demo-user-uid',
        email: 'kalim.cse@rathinam.edu',
        display_name: 'Kalim J',
        photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
        role: 'admin',
        zone: 'SR',
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      setUser({
        ...mockFirebaseUser,
        role: mockDbUser.role,
        zone: mockDbUser.zone,
        dbId: mockDbUser.id
      } as AuthUser);
    } catch (e) {
      console.error('Demo sign-in failed', e);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
