import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  addDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './client';

/**
 * Get a single document by ID
 */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<{ data: T | null; error: any }> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() } as T, error: null };
    }
    return { data: null, error: null };
  } catch (error) {
    console.error('Error getting document:', error);
    return { data: null, error };
  }
}

/**
 * Get multiple documents with optional query constraints
 */
export async function getDocuments<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<{ data: T[] | null; error: any }> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting documents:', error);
    return { data: null, error };
  }
}

/**
 * Create a new document with auto-generated ID
 */
export async function createDocument<T = DocumentData>(
  collectionName: string,
  data: T
): Promise<{ data: string | null; error: any }> {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { data: docRef.id, error: null };
  } catch (error) {
    console.error('Error creating document:', error);
    return { data: null, error };
  }
}

/**
 * Set a document with a specific ID (creates or overwrites)
 */
export async function setDocument<T = DocumentData>(
  collectionName: string,
  docId: string,
  data: T,
  merge = false
): Promise<{ error: any }> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    }, { merge });
    return { error: null };
  } catch (error) {
    console.error('Error setting document:', error);
    return { error };
  }
}

/**
 * Update an existing document
 */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<{ error: any }> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error) {
    console.error('Error updating document:', error);
    return { error };
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<{ error: any }> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { error: null };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { error };
  }
}

/**
 * Batch write operations
 */
export async function batchWrite(
  operations: Array<{
    type: 'set' | 'update' | 'delete';
    collection: string;
    docId: string;
    data?: any;
  }>
): Promise<{ error: any }> {
  try {
    const batch = writeBatch(db);
    
    operations.forEach(op => {
      const docRef = doc(db, op.collection, op.docId);
      
      switch (op.type) {
        case 'set':
          batch.set(docRef, { ...op.data, updatedAt: Timestamp.now() });
          break;
        case 'update':
          batch.update(docRef, { ...op.data, updatedAt: Timestamp.now() });
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    });
    
    await batch.commit();
    return { error: null };
  } catch (error) {
    console.error('Error in batch write:', error);
    return { error };
  }
}

// Export query helpers for building queries
export { where, orderBy, limit, Timestamp };
