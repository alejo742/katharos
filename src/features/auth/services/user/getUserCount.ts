import { db } from '@/lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

export async function getUserCount() {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getCountFromServer(usersRef);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting user count:', error);
    throw error;
  }
}