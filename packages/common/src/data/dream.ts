import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Dream, DreamCreate, OperationType } from '../index';
import { handleFirestoreError } from '../utils/error';

/**
 * Saves a new dream to the database.
 * @param dream The dream data to save
 * @returns A Promise that resolves to the saved dream with generated ID
 */
export const saveDream = async (dream: DreamCreate): Promise<Dream> => {
  try {
    const dreamPath = 'dreams';
    const docRef = await addDoc(collection(db, dreamPath), {
      ...dream,
      created_at: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...dream,
      created_at: Timestamp.now()
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'dreams');
    throw error;
  }
};

/**
 * Retrieves all dreams for a specific user.
 * @param userId The user's ID
 * @returns A Promise that resolves to an array of dream objects
 */
export const getUserDreams = async (userId: string): Promise<Dream[]> => {
  try {
    const q = query(
      collection(db, 'dreams'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Dream));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'dreams');
    throw error;
  }
};
