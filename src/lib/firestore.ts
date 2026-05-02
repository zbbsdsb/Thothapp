import {
  doc,
  setDoc,
  runTransaction,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError } from './errors';
import { OperationType } from '../types';
import type { UserProfile } from '../types';

// ── User Stats ────────────────────────────────────────────────

export async function syncUserStats(
  userId: string,
  profile: UserProfile,
  isUsingPublicQuota: boolean
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      if (!snap.exists()) return;

      const data = snap.data() as UserProfile;
      let newStreak = data.streak || 0;
      if (data.last_streak_date === yesterday) {
        newStreak += 1;
      } else if (data.last_streak_date !== today) {
        newStreak = 1;
      }

      const isNewDay = data.last_usage_date !== today;
      const update: Record<string, unknown> = {
        total_dreams: (data.total_dreams || 0) + 1,
        streak: newStreak,
        last_streak_date: today,
      };

      if (isUsingPublicQuota) {
        if (isNewDay) {
          update.daily_usage_count = 1;
          update.last_usage_date = today;
        } else {
          update.daily_usage_count = (data.daily_usage_count || 0) + 1;
        }
      }

      transaction.update(userRef, update);
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

// ── Global Imagery ────────────────────────────────────────────

export async function updateGlobalImagery(
  tags: string[],
  delta: number = 1
): Promise<void> {
  for (const tag of tags) {
    const tagRef = doc(db, 'global_imagery', tag.toLowerCase());
    try {
      await setDoc(
        tagRef,
        {
          tag: tag.toLowerCase(),
          count: increment(delta),
          last_updated: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `global_imagery/${tag.toLowerCase()}`);
    }
  }
}

// ── Global Location ───────────────────────────────────────────

export async function updateGlobalLocation(
  country: string,
  delta: number = 1
): Promise<void> {
  if (!country) country = 'Unknown';
  console.log(`Updating global location for ${country} with delta ${delta}`);
  const locRef = doc(db, 'global_locations', country);
  try {
    await setDoc(
      locRef,
      {
        country,
        count: increment(delta),
        last_updated: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `global_locations/${country}`);
  }
}
