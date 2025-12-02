import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/schema';
import { User } from '../../types.ts';

export const getUserProfile = async (userId: string): Promise<User | null> => {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as User;
    } else {
        return null;
    }
};

export const searchUsersByName = async (searchQuery: string): Promise<User[]> => {
    // Note: Firestore doesn't support native full-text search. 
    // This is a simple prefix search implementation.
    // For production, consider Algolia or similar.

    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(
        usersRef,
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
        users.push(doc.data() as User);
    });
    return users;
};

export const getAllUsers = async (): Promise<User[]> => {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const querySnapshot = await getDocs(usersRef);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
        users.push(doc.data() as User);
    });
    return users;
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, data);
};
