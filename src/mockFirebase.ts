// Mock Firebase Implementation using localStorage for client-first reliability and iframe compatibility.
// It matches the APIs of firebase/app, firebase/auth, and firebase/firestore perfectly.

// ------------------------------------
// Global Event Emitter for collections
// ------------------------------------
type Listener = () => void;
const changeListeners: Record<string, Set<Listener>> = {};

export function emitChange(collectionName: string) {
  if (changeListeners[collectionName]) {
    changeListeners[collectionName].forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Error in change listener:', err);
      }
    });
  }
}

export function addChangeListener(collectionName: string, callback: Listener) {
  if (!changeListeners[collectionName]) {
    changeListeners[collectionName] = new Set();
  }
  changeListeners[collectionName].add(callback);
  return () => {
    changeListeners[collectionName].delete(callback);
  };
}

// Helper to get raw data from local storage
function getCollectionData(collectionName: string): any[] {
  try {
    const raw = localStorage.getItem(`csm_db_${collectionName}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Error reading collection ${collectionName} from localStorage:`, e);
    return [];
  }
}

function saveCollectionData(collectionName: string, data: any[]) {
  try {
    localStorage.setItem(`csm_db_${collectionName}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing collection ${collectionName} to localStorage:`, e);
  }
}

// ------------------------------------
// firebase/app
// ------------------------------------
export function initializeApp() {
  return { name: 'mock-app' };
}

// ------------------------------------
// firebase/auth
// ------------------------------------
class MockAuth {
  private authListeners: Set<(user: any) => void> = new Set();

  get currentUser() {
    const raw = localStorage.getItem('csm_auth_user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        return { 
          email: user.email, 
          uid: user.id || user.email,
          emailVerified: true,
          isAnonymous: false,
          tenantId: null,
          providerData: []
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.authListeners.add(callback);
    // Execute immediately with the current logged-in user
    setTimeout(() => {
      callback(this.currentUser);
    }, 20);

    return () => {
      this.authListeners.delete(callback);
    };
  }

  triggerListeners() {
    const user = this.currentUser;
    this.authListeners.forEach(cb => {
      try {
        cb(user);
      } catch (err) {
        console.error('Error in auth state change listener:', err);
      }
    });
  }

  setCurrentUser(user: any | null) {
    if (user) {
      localStorage.setItem('csm_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('csm_auth_user');
    }
    this.triggerListeners();
  }

  async signOut() {
    this.setCurrentUser(null);
  }

  async signInWithEmailAndPassword(email: string, password?: string) {
    return signInWithEmailAndPassword(this, email, password);
  }

  async createUserWithEmailAndPassword(email: string, password?: string) {
    return createUserWithEmailAndPassword(this, email, password);
  }

  async sendPasswordResetEmail(email: string) {
    return sendPasswordResetEmail(this, email);
  }

  async sendEmailVerification() {
    return sendEmailVerification(this);
  }
}

export const auth = new MockAuth();

export function getAuth(app?: any) {
  if (app && app.name && typeof app.name === 'string' && app.name.startsWith('temp-')) {
    return new MockAuth();
  }
  return auth;
}

export async function signInWithEmailAndPassword(authInstance: any, email: string, password?: string) {
  const cleanEmail = email.toLowerCase().trim();
  const users = getCollectionData('users');
  const found = users.find(u => u.email.toLowerCase().trim() === cleanEmail);

  if (!found) {
    throw new Error('Usuário não cadastrado ou e-mail inválido.');
  }

  if (password && found.password && found.password !== password) {
    throw new Error('Senha incorreta.');
  }

  auth.setCurrentUser(found);
  return { 
    user: { 
      email: found.email, 
      uid: found.email,
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerData: []
    } 
  };
}

export async function createUserWithEmailAndPassword(authInstance: any, email: string, password?: string) {
  const cleanEmail = email.toLowerCase().trim();
  const users = getCollectionData('users');
  const found = users.find(u => u.email.toLowerCase().trim() === cleanEmail);

  if (found) {
    throw new Error('Usuário já cadastrado com este e-mail.');
  }

  const newUser = {
    id: cleanEmail,
    email: cleanEmail,
    name: email.split('@')[0],
    role: 'Fisio', // Default role
    status: 'Ativo',
    createdAt: new Date().toISOString().split('T')[0],
    password: password || '1234',
    clinicId: 'clinic-1' // Default clinic
  };

  users.push(newUser);
  saveCollectionData('users', users);
  emitChange('users');

  auth.setCurrentUser(newUser);
  return { 
    user: { 
      email: cleanEmail, 
      uid: cleanEmail,
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerData: []
    } 
  };
}

export async function signOut(authInstance: any) {
  auth.setCurrentUser(null);
}

export async function sendPasswordResetEmail(authInstance: any, email: string) {
  console.log(`[Mock Auth] Solicitado envio de redefinição de senha para: ${email}`);
  return true;
}

export async function sendEmailVerification(userInstance: any) {
  console.log(`[Mock Auth] Solicitado envio de verificação para o usuário atual.`);
  return true;
}

// ------------------------------------
// firebase/firestore
// ------------------------------------
export const db = { name: 'mock-firestore' };

export function getFirestore() {
  return db;
}

export function doc(dbInstance: any, collectionName: string, id: string) {
  return { collectionName, id, type: 'doc' };
}

export function collection(dbInstance: any, collectionName: string) {
  return { collectionName, type: 'collection' };
}

export function query(collectionRef: any, ...constraints: any[]) {
  return { 
    collectionName: collectionRef.collectionName, 
    type: 'query', 
    constraints 
  };
}

export function where(field: string, operator: string, value: any) {
  return { type: 'where', field, operator, value };
}

export async function setDoc(docRef: any, data: any, options?: { merge?: boolean }) {
  const { collectionName, id } = docRef;
  const items = getCollectionData(collectionName);
  const index = items.findIndex(item => item.id === id);

  if (index >= 0) {
    if (options?.merge) {
      items[index] = { ...items[index], ...data };
    } else {
      items[index] = { ...data, id };
    }
  } else {
    items.push({ ...data, id });
  }

  saveCollectionData(collectionName, items);
  emitChange(collectionName);
}

export async function updateDoc(docRef: any, data: any) {
  return setDoc(docRef, data, { merge: true });
}

export async function getDoc(docRef: any) {
  const { collectionName, id } = docRef;
  const items = getCollectionData(collectionName);
  const found = items.find(item => item.id === id);
  return {
    id,
    exists: () => found !== undefined,
    data: () => {
      if (!found) return undefined;
      const { id: _, ...rest } = found;
      return rest;
    }
  };
}

export async function getDocs(queryObj: any) {
  const { collectionName, constraints } = queryObj;
  let items = getCollectionData(collectionName);

  if (constraints && Array.isArray(constraints)) {
    for (const filter of constraints) {
      if (filter && filter.type === 'where') {
        const { field, operator, value } = filter;
        items = items.filter(item => {
          const itemValue = item[field];
          if (operator === '==') {
            return itemValue === value;
          }
          return true;
        });
      }
    }
  }

  const docSnaps = items.map(item => ({
    id: item.id,
    data: () => {
      const { id: _, ...rest } = item;
      return rest;
    }
  }));

  return {
    forEach: (callback: (doc: any) => void) => {
      docSnaps.forEach(callback);
    },
    docs: docSnaps
  };
}

export async function deleteDoc(docRef: any) {
  const { collectionName, id } = docRef;
  const items = getCollectionData(collectionName);
  const filtered = items.filter(item => item.id !== id);
  saveCollectionData(collectionName, filtered);
  emitChange(collectionName);
}

export function onSnapshot(
  queryObj: any,
  onNext: (snapshot: any) => void,
  onError?: (error: any) => void
) {
  const { collectionName, constraints } = queryObj;

  const runQueryAndNotify = () => {
    let items = getCollectionData(collectionName);

    if (constraints && Array.isArray(constraints)) {
      for (const filter of constraints) {
        if (filter && filter.type === 'where') {
          const { field, operator, value } = filter;
          items = items.filter(item => {
            const itemValue = item[field];
            if (operator === '==') {
              return itemValue === value;
            }
            return true;
          });
        }
      }
    }

    const docSnaps = items.map(item => ({
      id: item.id,
      data: () => {
        const { id: _, ...rest } = item;
        return rest;
      }
    }));

    const snapshot = {
      forEach: (callback: (doc: any) => void) => {
        docSnaps.forEach(callback);
      },
      docs: docSnaps
    };

    onNext(snapshot);
  };

  // Run initial pull
  runQueryAndNotify();

  // Subscribe to changes on this collection
  const unsubscribe = addChangeListener(collectionName, runQueryAndNotify);
  return unsubscribe;
}

export function writeBatch(dbInstance: any) {
  let writes: { docRef: any; data: any; type: 'set' | 'delete' }[] = [];
  return {
    set: (docRef: any, data: any) => {
      writes.push({ docRef, data, type: 'set' });
    },
    delete: (docRef: any) => {
      writes.push({ docRef, data: null, type: 'delete' });
    },
    commit: async () => {
      for (const w of writes) {
        if (w.type === 'set') {
          await setDoc(w.docRef, w.data);
        } else if (w.type === 'delete') {
          await deleteDoc(w.docRef);
        }
      }
    }
  };
}
