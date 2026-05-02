import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { UserProfile } from '../types';

const DEFAULT_PROFILE: Omit<UserProfile, 'created_at' | 'email'> & {
  created_at: Timestamp;
} = {
  email: '',
  created_at: Timestamp.now(),
  daily_usage_count: 0,
  daily_quota_limit: 3,
  last_usage_date: null,
  total_dreams: 0,
  active_provider: 'gemini',
  external_apis: {},
  streak: 0,
  last_streak_date: null,
};

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (!snap.exists()) {
          const newProfile: UserProfile = {
            ...DEFAULT_PROFILE,
            email: u.email || '',
          };
          await setDoc(doc(db, 'users', u.uid), newProfile);
          setProfile(newProfile);
        } else {
          setProfile(snap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider());

  const signOut = () => firebaseSignOut(auth);

  return { user, profile, loading, signInWithGoogle, signOut };
}
