import { auth } from '../firebase';
import { OperationType, FirestoreErrorInfo } from '../index';

/**
 * Handles Firestore errors by adding context information and logging.
 * @param error The error to handle
 * @param operationType The type of operation being performed
 * @param path The Firestore path being accessed
 */
export const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null): void => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error:', JSON.stringify(errInfo));
};
