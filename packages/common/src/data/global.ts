import {
  doc,
  setDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { OperationType } from '../index';
import { handleFirestoreError } from '../utils/error';

/**
 * Updates the global imagery statistics with new tags.
 * @param tags An array of tags to update
 * @param delta The amount to increment by (default: 1)
 * @returns A Promise that resolves when the update is complete
 */
export const updateGlobalImagery = async (tags: string[], delta: number = 1): Promise<void> => {
  for (const tag of tags) {
    try {
      const tagRef = doc(db, 'global_imagery', tag.toLowerCase());
      await setDoc(tagRef, {
        tag: tag.toLowerCase(),
        count: increment(delta),
        last_updated: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `global_imagery/${tag.toLowerCase()}`);
      // Continue with other tags even if one fails
    }
  }
};

/**
 * Updates the global location statistics with a new location.
 * @param country The country to update
 * @param delta The amount to increment by (default: 1)
 * @returns A Promise that resolves when the update is complete
 */
export const updateGlobalLocation = async (country: string, delta: number = 1): Promise<void> => {
  try {
    if (!country) country = "Unknown";
    const locRef = doc(db, 'global_locations', country);
    await setDoc(locRef, {
      country,
      count: increment(delta),
      last_updated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `global_locations/${country}`);
    throw error;
  }
};
