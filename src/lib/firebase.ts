import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction, UserProfile } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with specific databaseId as declared in config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Auth instance
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Operation Types for error logging
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection at boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Permission denied is expected for test path because of default deny, meaning server is reachable
    return true;
  }
}

// Auth Helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Sign-in error:', err);
    throw err;
  }
}

export async function logOut(): Promise<void> {
  await fbSignOut(auth);
}

// Database Helpers

export function subscribeTransactions(
  userId: string,
  onData: (transactions: Transaction[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const collectionPath = 'transactions';
  try {
    const q = query(collection(db, collectionPath), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            type: data.type,
            amount: Number(data.amount),
            category: data.category,
            description: data.description || '',
            date: data.date,
            month: data.month,
            paymentMethod: data.paymentMethod || 'transfer',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        // Sort descending by date, then createdAt
        list.sort((a, b) => b.date.localeCompare(a.date));
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
        onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
    throw error;
  }
}

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const collectionPath = 'transactions';
  const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const docRef = doc(db, collectionPath, id);
  try {
    await setDoc(docRef, {
      ...data,
      amount: Number(data.amount),
      description: data.description?.trim().slice(0, 200) || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${id}`);
  }
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const path = `transactions/${id}`;
  const docRef = doc(db, 'transactions', id);
  try {
    const updatePayload: Record<string, any> = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    if (data.amount !== undefined) {
      updatePayload.amount = Number(data.amount);
    }
    if (data.description !== undefined) {
      updatePayload.description = data.description.trim().slice(0, 200);
    }
    await setDoc(docRef, updatePayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const path = `transactions/${id}`;
  try {
    await deleteDoc(doc(db, 'transactions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeUserProfile(
  userId: string,
  onData: (profile: UserProfile | null) => void
): Unsubscribe {
  const docRef = doc(db, 'users', userId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as UserProfile);
      } else {
        onData(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    }
  );
}

export async function saveUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const path = `users/${userId}`;
  const docRef = doc(db, 'users', userId);
  try {
    await setDoc(
      docRef,
      {
        userId,
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function initUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  const docRef = doc(db, 'users', user.uid);
  try {
    await setDoc(
      docRef,
      {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'ผู้ใช้งาน',
        monthlyBudget: 15000,
        currency: 'THB',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
