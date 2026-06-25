import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc, 
  writeBatch,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { 
  Clinic, 
  SystemUser, 
  TherapeuticEvent, 
  Patient, 
  Registration, 
  EvolutionaryAssessment, 
  MedicalRecord, 
  Appointment, 
  FinancialTransaction, 
  Attendance 
} from '../types';
import { 
  initialClinics, 
  initialSystemUsers, 
  initialEvents, 
  initialPatients, 
  initialRegistrations, 
  initialAssessments, 
  initialMedicalRecords, 
  initialAppointments, 
  initialTransactions, 
  initialAttendances 
} from '../data/seedData';

// Core database collections
export const COLLECTIONS = {
  CLINICS: 'clinics',
  USERS: 'users',
  EVENTS: 'events',
  PATIENTS: 'patients',
  REGISTRATIONS: 'registrations',
  ASSESSMENTS: 'assessments',
  MEDICAL_RECORDS: 'medicalRecords',
  APPOINTMENTS: 'appointments',
  TRANSACTIONS: 'transactions',
  ATTENDANCES: 'attendances'
};

/**
 * Seed the Firestore database with initial demo data if empty
 */
export async function seedDatabaseIfNeeded() {
  try {
    // Check if the database has been seeded by retrieving the first clinic document.
    // If it exists, we are already seeded.
    const clinic1Doc = await getDocument(COLLECTIONS.CLINICS, 'clinic-1');
    if (clinic1Doc) {
      console.log('Database already seeded. Verifying developer account...');
      const devEmail = 'jossiefreitas.jgf@gmail.com';
      const devUser = await getDocument(COLLECTIONS.USERS, devEmail);
      if (!devUser) {
        console.log('Developer account missing from users collection. Restoring...');
        const devPayload = initialSystemUsers.find(u => u.email === devEmail) || {
          id: 'user-dev',
          clinicId: 'clinic-1',
          name: 'Jossie Freitas',
          email: 'jossiefreitas.jgf@gmail.com',
          role: 'Desenvolvedor' as const,
          status: 'Ativo' as const,
          createdAt: '2026-06-23',
          password: '1234'
        };
        await saveDocument(COLLECTIONS.USERS, devEmail, {
          ...devPayload,
          id: devEmail
        });
        console.log('Developer account restored successfully!');
      } else {
        // Also ensure that if the developer account exists, its role is 'Desenvolvedor' and status is 'Ativo'
        const typedDevUser = devUser as any;
        if (typedDevUser.role !== 'Desenvolvedor' || typedDevUser.status !== 'Ativo') {
          console.log('Updating developer account permissions...');
          await saveDocument(COLLECTIONS.USERS, devEmail, {
            ...typedDevUser,
            role: 'Desenvolvedor',
            status: 'Ativo'
          });
        }
      }
      return;
    }

    console.log('Database is empty. Seeding initial data sequentially...');

    // 1. Seed all collections except the clinics first to ensure isUnseeded() continues evaluating to true
    // Seed Users
    for (const user of initialSystemUsers) {
      const emailId = user.email.toLowerCase().trim();
      await saveDocument(COLLECTIONS.USERS, emailId, {
        ...user,
        id: emailId
      });
    }

    // Seed Events
    for (const event of initialEvents) {
      await saveDocument(COLLECTIONS.EVENTS, event.id, event);
    }

    // Seed Patients
    for (const patient of initialPatients) {
      await saveDocument(COLLECTIONS.PATIENTS, patient.id, patient);
    }

    // Seed Registrations
    for (const reg of initialRegistrations) {
      await saveDocument(COLLECTIONS.REGISTRATIONS, reg.id, reg);
    }

    // Seed Assessments
    for (const ass of initialAssessments) {
      await saveDocument(COLLECTIONS.ASSESSMENTS, ass.id, ass);
    }

    // Seed Medical Records
    for (const record of initialMedicalRecords) {
      await saveDocument(COLLECTIONS.MEDICAL_RECORDS, record.id, record);
    }

    // Seed Appointments
    for (const app of initialAppointments) {
      await saveDocument(COLLECTIONS.APPOINTMENTS, app.id, app);
    }

    // Seed Transactions
    for (const tx of initialTransactions) {
      await saveDocument(COLLECTIONS.TRANSACTIONS, tx.id, tx);
    }

    // Seed Attendances
    for (const att of initialAttendances) {
      await saveDocument(COLLECTIONS.ATTENDANCES, att.id, att);
    }

    // 2. Seed clinics, starting with clinic-2
    for (const clinic of initialClinics) {
      if (clinic.id !== 'clinic-1') {
        await saveDocument(COLLECTIONS.CLINICS, clinic.id, {
          ...clinic,
          whatsapp: clinic.whatsapp || ''
        });
      }
    }

    // 3. Write clinic-1 as the absolute final step to lock the unseeded state
    const clinic1 = initialClinics.find(c => c.id === 'clinic-1');
    if (clinic1) {
      await saveDocument(COLLECTIONS.CLINICS, 'clinic-1', {
        ...clinic1,
        whatsapp: clinic1.whatsapp || ''
      });
    }

    console.log('Database successfully seeded sequentially!');
  } catch (error) {
    console.error('Error seeding database:', error);
    handleFirestoreError(error, OperationType.WRITE, 'batch-seeding');
  }
}

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Subscribes to a Firestore collection, optionally filtering by clinicId
 */
export function subscribeCollection<T>(
  collectionName: string,
  clinicId: string | null,
  callback: (data: T[]) => void,
  userRole?: string
) {
  // If user is Developer, they can see all clinics/users. Otherwise, filter by clinicId
  let q;
  if (!clinicId || userRole === 'Desenvolvedor' || collectionName === COLLECTIONS.CLINICS) {
    q = query(collection(db, collectionName));
  } else {
    q = query(collection(db, collectionName), where('clinicId', '==', clinicId));
  }

  return onSnapshot(q, (snapshot) => {
    const items: T[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
    });
    callback(items);
  }, (err) => {
    console.error(`Error subscribing to ${collectionName}:`, err);
    handleFirestoreError(err, OperationType.GET, collectionName);
  });
}

/**
 * Create or overwrite a document
 */
export async function saveDocument(collectionName: string, id: string, data: any) {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${id}`);
  }
}

/**
 * Delete a document
 */
export async function removeDocument(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

/**
 * Get a single document
 */
export async function getDocument(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${collectionName}/${id}`);
    return null;
  }
}
