import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile, OperationType } from '../index';
import { handleFirestoreError } from '../utils/error';

/**
 * Retrieves a user's profile.
 * @param userId The user's ID
 * @returns A Promise that resolves to the user's profile or null if not found
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
      return null;
    }
    
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    throw error;
  }
};

/**
 * Creates a new user profile.
 * @param userId The user's ID
 * @param email The user's email
 * @returns A Promise that resolves to the created user profile
 */
export const createUserProfile = async (userId: string, email: string): Promise<UserProfile> => {
  try {
    const userRef = doc(db, 'users', userId);
    const newProfile: UserProfile = {
      email,
      created_at: new Date(),
      daily_usage_count: 0,
      daily_quota_limit: 3,
      last_usage_date: null,
      total_dreams: 0,
      active_provider: 'gemini',
      external_apis: {},
      streak: 0,
      last_streak_date: null
    };
    
    await setDoc(userRef, newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}`);
    throw error;
  }
};

/**
 * Updates a user's profile.
 * @param userId The user's ID
 * @param updates The updates to apply
 * @returns A Promise that resolves when the update is complete
 */
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    throw error;
  }
};

/**
 * Syncs user statistics after a dream is saved.
 * @param userId The user's ID
 * @param isUsingPublicQuota Whether the user is using public quota
 * @returns A Promise that resolves when the sync is complete
 */
export const syncUserStats = async (userId: string, isUsingPublicQuota: boolean): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data() as UserProfile;
      let newStreak = userData.streak || 0;
      if (userData.last_streak_date === yesterday) {
        newStreak += 1;
      } else if (userData.last_streak_date !== today) {
        newStreak = 1;
      }

      const isNewDay = userData.last_usage_date !== today;
      const userUpdate: any = {
        total_dreams: (userData.total_dreams || 0) + 1,
        streak: newStreak,
        last_streak_date: today
      };

      if (isUsingPublicQuota) {
        if (isNewDay) {
          userUpdate.daily_usage_count = 1;
          userUpdate.last_usage_date = today;
        } else {
          userUpdate.daily_usage_count = (userData.daily_usage_count || 0) + 1;
        }
      }

      transaction.update(userRef, userUpdate);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    throw error;
  }
};
