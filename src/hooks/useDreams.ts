import { useState, useEffect, useCallback } from 'react';
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

export function useDreams(userId: string | undefined) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [globalImagery, setGlobalImagery] = useState<GlobalImagery[]>([]);
  const [globalLocations, setGlobalLocations] = useState<GlobalLocation[]>([]);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // User's dream list
  useEffect(() => {
    if (!userId) return;
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

  // Global imagery
  useEffect(() => {
    const q = query(collection(db, 'global_imagery'), orderBy('count', 'desc'), limit(30));
    const unsub = onSnapshot(
      q,
      (snap) => setGlobalImagery(snap.docs.map((d) => d.data() as GlobalImagery)),
      (err) => handleFirestoreError(err, OperationType.LIST, 'global_imagery')
    );
    return () => unsub();
  }, []);

  // Global locations
  useEffect(() => {
    const q = query(collection(db, 'global_locations'), orderBy('count', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => setGlobalLocations(snap.docs.map((d) => d.data() as GlobalLocation)),
      (err) => handleFirestoreError(err, OperationType.LIST, 'global_locations')
    );
    return () => unsub();
  }, []);

  // Total registered users
  useEffect(() => {
    const q = collection(db, 'users');
    const unsub = onSnapshot(
      q,
      (snap) => setTotalUserCount(snap.size),
      (err) => handleFirestoreError(err, OperationType.LIST, 'users')
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  return { dreams, globalImagery, globalLocations, totalUserCount, loading };
}

export function useDreamActions(userId: string | undefined, profile: UserProfile | null) {
  const deleteDream = useCallback(
    async (dreamId: string, location: string, tags: string[]) => {
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
    },
    [userId]
  );

  const addDream = useCallback(
    async (fields: Omit<Dream, 'id' | 'user_id' | 'created_at'>) => {
      if (!userId || !profile) return;
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = profile.last_usage_date !== today;
      const currentUsage = isNewDay ? 0 : profile.daily_usage_count;
      const hasUserKey = !!profile.external_apis?.minimax;
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
    },
    [userId, profile]
  );

  return { deleteDream, addDream };
}
