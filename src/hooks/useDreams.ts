import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  limit,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError } from '../lib/errors';
import { OperationType } from '../types';
import { syncUserStats, updateGlobalImagery, updateGlobalLocation } from '../lib/firestore';
import type { Dream, GlobalImagery, GlobalLocation, UserProfile } from '../types';

// HARDCODED: Demo mode is on (because Screenshot_MODE import is broken)
const IS_DEMO_MODE = true;

const MOCK_DREAMS: Dream[] = [
  {
    id: 'demo-dream-1',
    user_id: 'demo-user-123',
    transcript: 'I was flying over a beautiful ocean at sunset, the colors were incredible.',
    audio_url: '',
    tags: ['flying', 'ocean', 'sunset'],
    insight: 'This dream suggests a desire for freedom and perspective.',
    divine_oracle: 'The oracle speaks of transformation and new beginnings.',
    location: 'Unknown',
    created_at: { toDate: () => new Date() } as any,
  },
  {
    id: 'demo-dream-2',
    user_id: 'demo-user-123',
    transcript: 'I found a hidden library with books that contained my memories.',
    audio_url: '',
    tags: ['library', 'books', 'memories'],
    insight: 'A dream about self-discovery and accessing inner wisdom.',
    divine_oracle: 'The oracle whispers of knowledge waiting to be unlocked.',
    location: 'Unknown',
    created_at: { toDate: () => new Date(Date.now() - 86400000) } as any,
  },
];

export function useDreams(userId: string | undefined) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [globalImagery, setGlobalImagery] = useState<GlobalImagery[]>([]);
  const [globalLocations, setGlobalLocations] = useState<GlobalLocation[]>([]);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // In demo mode, use mock data and skip Firestore
  useEffect(() => {
    if (IS_DEMO_MODE) {
      setDreams(MOCK_DREAMS);
      setGlobalImagery([
        { tag: 'flying', count: 42 },
        { tag: 'water', count: 38 },
        { tag: 'chase', count: 27 },
      ]);
      setGlobalLocations([
        { location: 'New York', count: 156 },
        { location: 'London', count: 98 },
        { location: 'Tokyo', count: 87 },
      ]);
      setTotalUserCount(1234);
      setLoading(false);
      return;
    }
  }, []);

  // Function to remove dream from state (used in demo mode)
  const removeDreamFromState = (dreamId: string) => {
    setDreams(prev => prev.filter(d => d.id !== dreamId));
  };

  // User's dream list (skip in demo mode)
  useEffect(() => {
    if (IS_DEMO_MODE || !userId) return;
    const q = query(
      collection(db, 'dreams'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => setDreams(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Dream))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'dreams')
    );
    return () => unsub();
  }, [userId]);

  // Global imagery (skip in demo mode)
  useEffect(() => {
    if (IS_DEMO_MODE) return;
    const q = query(collection(db, 'global_imagery'), orderBy('count', 'desc'), limit(30));
    const unsub = onSnapshot(
      q,
      (snap) => setGlobalImagery(snap.docs.map((d) => d.data() as GlobalImagery)),
      (err) => handleFirestoreError(err, OperationType.LIST, 'global_imagery')
    );
    return () => unsub();
  }, []);

  // Global locations (skip in demo mode)
  useEffect(() => {
    if (IS_DEMO_MODE) return;
    const q = query(collection(db, 'global_locations'), orderBy('count', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => setGlobalLocations(snap.docs.map((d) => d.data() as GlobalLocation)),
      (err) => handleFirestoreError(err, OperationType.LIST, 'global_locations')
    );
    return () => unsub();
  }, []);

  // Total registered users (skip in demo mode)
  useEffect(() => {
    if (IS_DEMO_MODE) return;
    const q = collection(db, 'users');
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTotalUserCount(snap.size);
        // Only set loading to false after all data is loaded
        if (userId) {
          setLoading(false);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'users')
    );
    return () => unsub();
  }, [userId]);

  return { dreams, globalImagery, globalLocations, totalUserCount, loading, removeDreamFromState };
}

export function useDreamActions(userId: string | undefined, profile: UserProfile | null) {
  const deleteDream = async (dreamId: string, location: string, tags: string[]) => {
      if (!userId) return;
      try {
        await deleteDoc(doc(db, 'dreams', dreamId));
        await updateDoc(doc(db, 'users', userId), { total_dreams: increment(-1) });
        await updateGlobalLocation(location || 'Unknown', -1);
        if (tags.length > 0) await updateGlobalImagery(tags, -1);
      } catch (err) {
        if (err instanceof Error && !err.message.includes('Firestore Error')) {
          console.error(err);
        }
        throw err;
      }
    };

  const addDream = async (fields: Omit<Dream, 'id' | 'user_id' | 'created_at'>) => {
      if (!userId || !profile) return;
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = profile.last_usage_date !== today;
      const currentUsage = isNewDay ? 0 : profile.daily_usage_count;
      const hasUserKey = !!profile.external_apis?.gemini;
      const isUsingPublicQuota = !hasUserKey;

      if (isUsingPublicQuota && currentUsage >= profile.daily_quota_limit) {
        throw new Error('Daily quota reached.');
      }

      const dreamRef = await addDoc(collection(db, 'dreams'), {
        user_id: userId,
        ...fields,
        created_at: serverTimestamp(),
      });

      await Promise.all([
        syncUserStats(userId, profile, isUsingPublicQuota),
        updateGlobalImagery(fields.tags),
        updateGlobalLocation(fields.location),
      ]);

      return dreamRef.id;
    };

  return { deleteDream, addDream };
}
