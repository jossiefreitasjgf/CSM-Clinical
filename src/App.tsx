import React, { useState, useEffect } from 'react';
import { 
  Clinic, 
  TherapeuticEvent, 
  Patient, 
  Registration, 
  EvolutionaryAssessment, 
  MedicalRecord, 
  Appointment, 
  FinancialTransaction, 
  Attendance, 
  UserRole,
  SystemUser
} from './types';
import { db, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  COLLECTIONS,
  seedDatabaseIfNeeded,
  subscribeCollection,
  saveDocument,
  removeDocument,
  getDocument
} from './services/dbService';

// Component imports
import { Menu, Lock, KeyRound, Eye, EyeOff, CheckCircle2, XCircle, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientCRM from './components/PatientCRM';
import ScheduleCalendar from './components/ScheduleCalendar';
import EventManagement from './components/EventManagement';
import FinancialHub from './components/FinancialHub';
import ReportsCenter from './components/ReportsCenter';
import ClinicSettings from './components/ClinicSettings';
import CommunicationSettings from './components/CommunicationSettings';
import PublicRegistration from './components/PublicRegistration';
import { Login } from './components/Login';

export default function App() {
  // Master database state definitions synchronized with Firebase
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [events, setEvents] = useState<TherapeuticEvent[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [assessments, setAssessments] = useState<EvolutionaryAssessment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);

  // System User Auth and Session state
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Connection and first-launch states
  const [authLoading, setAuthLoading] = useState(true);
  const [publicEventId, setPublicEventId] = useState<string | null>(null);

  // Password change states for first access requirement
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
    setIsChangingPassword(true);

    if (currentPasswordInput !== '1234') {
      setPasswordChangeError('A senha atual digitada está incorreta.');
      setIsChangingPassword(false);
      return;
    }

    const isMinLength = newPasswordInput.length >= 8;
    const hasLetterAndNumber = /[a-zA-Z]/.test(newPasswordInput) && /[0-9]/.test(newPasswordInput);
    const hasUppercase = /[A-Z]/.test(newPasswordInput);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_/\-+=~`[\]\\]/.test(newPasswordInput);
    const passwordsMatch = newPasswordInput === confirmPasswordInput;

    if (!isMinLength) {
      setPasswordChangeError('A senha deve conter no mínimo 8 caracteres.');
      setIsChangingPassword(false);
      return;
    }
    if (!hasLetterAndNumber) {
      setPasswordChangeError('A senha deve conter letras e números.');
      setIsChangingPassword(false);
      return;
    }
    if (!hasUppercase) {
      setPasswordChangeError('A senha deve conter no mínimo uma letra maiúscula.');
      setIsChangingPassword(false);
      return;
    }
    if (!hasSpecialChar) {
      setPasswordChangeError('A senha deve conter no mínimo um caractere especial (ex: @, #, $, %, etc.).');
      setIsChangingPassword(false);
      return;
    }
    if (!passwordsMatch) {
      setPasswordChangeError('A confirmação de senha não confere.');
      setIsChangingPassword(false);
      return;
    }
    if (newPasswordInput === '1234') {
      setPasswordChangeError('A nova senha não pode ser a senha padrão 1234.');
      setIsChangingPassword(false);
      return;
    }

    try {
      if (!currentUser) return;
      const cleanEmail = currentUser.email.toLowerCase().trim();
      
      const updatedUser = {
        ...currentUser,
        password: newPasswordInput
      };
      
      await saveDocument(COLLECTIONS.USERS, cleanEmail, updatedUser);
      
      setCurrentUser(updatedUser);
      setPasswordChangeSuccess('Senha alterada com sucesso! Redirecionando...');
      
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err: any) {
      console.error(err);
      setPasswordChangeError(`Erro ao atualizar a senha: ${err.message}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Coordinate check on page render to see if we clicked "Simulate registration" or accessed public ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventIdParam = params.get('publicEventId');
    if (eventIdParam) {
      setPublicEventId(eventIdParam);
    }
  }, []);

  // 1. AUTHENTICATION AND DATABASE SEEDING INITIALIZATION
  useEffect(() => {
    const initializeAppSession = async () => {
      // First, seed the cloud database if this is the first deployment run
      await seedDatabaseIfNeeded();

      // Set up the listener for Firebase Authentication state changes
      const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
        setAuthLoading(true);
        if (firebaseUser && firebaseUser.email) {
          try {
            const cleanEmail = firebaseUser.email.toLowerCase().trim();
            // Retrieve authorized system user matching the email
            const systemUser = await getDocument(COLLECTIONS.USERS, cleanEmail) as SystemUser | null;
            
            if (systemUser) {
              if (systemUser.status === 'Ativo') {
                setCurrentUser(systemUser);
                setCurrentRole(systemUser.role);
                
                // Fetch the default associated clinic for this user
                const clinicDoc = await getDocument(COLLECTIONS.CLINICS, systemUser.clinicId);
                if (clinicDoc) {
                  setCurrentClinic(clinicDoc as Clinic);
                }
              } else {
                console.warn('Access denied: System user status is Inactive.');
                await signOut(auth);
                setCurrentUser(null);
              }
            } else {
              console.warn('Authorized system user record not found in Firestore.');
              await signOut(auth);
              setCurrentUser(null);
            }
          } catch (err) {
            console.error('Error during session validation:', err);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
          setCurrentClinic(null);
        }
        setAuthLoading(false);
      });

      return unsubscribeAuth;
    };

      let unsubAuthPromise = initializeAppSession();
 
       return () => {
         unsubAuthPromise.then(unsub => unsub && unsub());
       };
     }, []);
 
     // 1.5. GLOBAL CLINICS LIST SYNCHRONIZATION FOR REGISTRATION/LOGIN
     useEffect(() => {
       const unsubClinicsGlobal = subscribeCollection<Clinic>(COLLECTIONS.CLINICS, null, setClinics);
       return () => {
         unsubClinicsGlobal();
       };
     }, []);
 
     // 2. REAL-TIME MULTI-TENANT DATABASE SYNCHRONIZATION (TENANT ISOLATION)
     useEffect(() => {
       if (!currentUser || !currentClinic) return;
 
       const clinicId = currentClinic.id;
       const role = currentUser.role;
 
       // Subscriptions separated logically by subscriber/tenant (clinicId)
       // Developers have universal reading capabilities to audit the SaaS
       const unsubUsers = subscribeCollection<SystemUser>(COLLECTIONS.USERS, clinicId, setSystemUsers, role);
       const unsubEvents = subscribeCollection<TherapeuticEvent>(COLLECTIONS.EVENTS, clinicId, setEvents, role);
       const unsubPatients = subscribeCollection<Patient>(COLLECTIONS.PATIENTS, clinicId, setPatients, role);
       const unsubRegistrations = subscribeCollection<Registration>(COLLECTIONS.REGISTRATIONS, clinicId, setRegistrations, role);
       const unsubAssessments = subscribeCollection<EvolutionaryAssessment>(COLLECTIONS.ASSESSMENTS, clinicId, setAssessments, role);
       const unsubMedicalRecords = subscribeCollection<MedicalRecord>(COLLECTIONS.MEDICAL_RECORDS, clinicId, setMedicalRecords, role);
       const unsubAppointments = subscribeCollection<Appointment>(COLLECTIONS.APPOINTMENTS, clinicId, setAppointments, role);
       const unsubTransactions = subscribeCollection<FinancialTransaction>(COLLECTIONS.TRANSACTIONS, clinicId, setTransactions, role);
       const unsubAttendances = subscribeCollection<Attendance>(COLLECTIONS.ATTENDANCES, clinicId, setAttendances, role);
 
       return () => {
         unsubUsers();
         unsubEvents();
         unsubPatients();
         unsubRegistrations();
         unsubAssessments();
         unsubMedicalRecords();
         unsubAppointments();
         unsubTransactions();
         unsubAttendances();
       };
     }, [currentUser, currentClinic?.id]);

  // Sync role to currentUser role changes
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
    }
  }, [currentUser]);

  // Sync currentClinic state to its updated values from Firestore
  useEffect(() => {
    if (currentClinic && clinics.length > 0) {
      const updated = clinics.find(c => c.id === currentClinic.id);
      if (updated) {
        setCurrentClinic(updated);
      }
    }
  }, [clinics, currentClinic?.id]);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setCurrentClinic(null);
    setActiveTab('dashboard');
  };

  const handleOpenPublicFormByEvent = (eventId: string) => {
    setPublicEventId(eventId);
  };

  // 1. EVENT MANAGEMENT CALLBACKS
  const handleAddEvent = async (eventData: Omit<TherapeuticEvent, 'id' | 'clinicId'>) => {
    if (!currentClinic) return;
    const id = `event-${Date.now()}`;
    const newEvent: TherapeuticEvent = {
      ...eventData,
      id,
      clinicId: currentClinic.id
    };
    await saveDocument(COLLECTIONS.EVENTS, id, newEvent);
  };

  const handleUpdateEventStatus = async (id: string, status: TherapeuticEvent['status']) => {
    await saveDocument(COLLECTIONS.EVENTS, id, { status });
    if (status === 'Cancelado') {
      const eventRegs = registrations.filter(r => r.eventId === id);
      for (const reg of eventRegs) {
        await saveDocument(COLLECTIONS.REGISTRATIONS, reg.id, { status: 'Cancelado' });
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    await removeDocument(COLLECTIONS.EVENTS, id);
  };

  const handleToggleAttendance = async (eventId: string, patientId: string, present: boolean) => {
    const existing = attendances.find(a => a.eventId === eventId && a.patientId === patientId);
    const id = existing ? existing.id : `att-${Date.now()}`;
    await saveDocument(COLLECTIONS.ATTENDANCES, id, {
      id,
      eventId,
      patientId,
      present,
      notes: existing ? existing.notes : ''
    });
  };

  const handleUpdateAttendanceNotes = async (eventId: string, patientId: string, notes: string) => {
    const existing = attendances.find(a => a.eventId === eventId && a.patientId === patientId);
    const id = existing ? existing.id : `att-${Date.now()}`;
    await saveDocument(COLLECTIONS.ATTENDANCES, id, {
      id,
      eventId,
      patientId,
      present: existing ? existing.present : true,
      notes
    });
  };

  // 2. PATIENT CRM CALLBACKS
  const handleAddPatient = async (patientData: Omit<Patient, 'id' | 'clinicId' | 'photo' | 'createdAt'>) => {
    if (!currentClinic) return;
    const id = `patient-${Date.now()}`;
    const newPatient: Patient = {
      ...patientData,
      id,
      clinicId: currentClinic.id,
      photo: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=200',
      createdAt: new Date().toISOString()
    };
    await saveDocument(COLLECTIONS.PATIENTS, id, newPatient);
    setSelectedPatientId(id);
  };

  const handleUpdatePatient = async (id: string, patch: Partial<Patient>) => {
    await saveDocument(COLLECTIONS.PATIENTS, id, patch);
  };

  const handleAddAssessment = async (patientId: string, assData: Omit<EvolutionaryAssessment, 'id' | 'patientId' | 'date' | 'author'>) => {
    const id = `eval-${Date.now()}`;
    const newAss: EvolutionaryAssessment = {
      ...assData,
      id,
      patientId,
      date: new Date().toISOString().split('T')[0],
      author: currentUser?.name || 'Profissional'
    };
    await saveDocument(COLLECTIONS.ASSESSMENTS, id, newAss);
  };

  const handleAddMedicalRecord = async (patientId: string, recData: Omit<MedicalRecord, 'id' | 'patientId' | 'date' | 'author'>) => {
    const id = `rec-${Date.now()}`;
    const newRecord: MedicalRecord = {
      ...recData,
      id,
      patientId,
      date: new Date().toISOString().split('T')[0],
      author: currentUser?.name || 'Profissional'
    };
    await saveDocument(COLLECTIONS.MEDICAL_RECORDS, id, newRecord);
  };

  // 3. APPOINTMENT SCHEDULING CALLBACKS
  const handleAddAppointment = async (appData: Omit<Appointment, 'id' | 'clinicId' | 'patientName'>) => {
    if (!currentClinic) return;
    const child = patients.find(p => p.id === appData.patientId);
    const id = `app-${Date.now()}`;
    const newApp: Appointment = {
      ...appData,
      id,
      clinicId: currentClinic.id,
      patientName: child ? child.name : 'Paciente Desconhecido'
    };
    await saveDocument(COLLECTIONS.APPOINTMENTS, id, newApp);

    if (newApp.status === 'Realizado') {
      const txId = `tx-${Date.now()}`;
      const newTx: FinancialTransaction = {
        id: txId,
        clinicId: currentClinic.id,
        type: 'Receita',
        category: 'Atendimento Particular',
        value: newApp.price,
        date: newApp.date,
        description: `Sessão ${newApp.type} - ${newApp.patientName}`,
        referenceId: id
      };
      await saveDocument(COLLECTIONS.TRANSACTIONS, txId, newTx);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const a = appointments.find(app => app.id === id);
    if (!a) return;
    const oldStatus = a.status;

    await saveDocument(COLLECTIONS.APPOINTMENTS, id, { status });

    if (status === 'Realizado' && oldStatus !== 'Realizado') {
      const txExists = transactions.some(t => t.referenceId === id);
      if (!txExists) {
        const txId = `tx-${Date.now()}`;
        const newTx: FinancialTransaction = {
          id: txId,
          clinicId: a.clinicId,
          type: 'Receita',
          category: 'Atendimento Particular',
          value: a.price,
          date: a.date,
          description: `Sessão ${a.type} - ${a.patientName}`,
          referenceId: id
        };
        await saveDocument(COLLECTIONS.TRANSACTIONS, txId, newTx);
      }
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    await removeDocument(COLLECTIONS.APPOINTMENTS, id);
  };

  // 4. FINANCIAL LEDGER CALLBACKS
  const handleAddTransaction = async (txData: Omit<FinancialTransaction, 'id' | 'clinicId'>) => {
    if (!currentClinic) return;
    const id = `tx-${Date.now()}`;
    const newTx: FinancialTransaction = {
      ...txData,
      id,
      clinicId: currentClinic.id
    };
    await saveDocument(COLLECTIONS.TRANSACTIONS, id, newTx);
  };

  const handleDeleteTransaction = async (id: string) => {
    await removeDocument(COLLECTIONS.TRANSACTIONS, id);
  };

  // 5. REGISTRATION AND BILLING CENTER - APROVAÇÃO FINANCEIRA
  const handleApproveRegistration = async (id: string) => {
    const reg = registrations.find(r => r.id === id);
    if (!reg) return;

    await saveDocument(COLLECTIONS.REGISTRATIONS, id, { status: 'Aprovado' });

    const matchedEvent = events.find(e => e.id === reg.eventId);
    if (matchedEvent) {
      const txId = `tx-${Date.now()}`;
      const newTx: FinancialTransaction = {
        id: txId,
        clinicId: reg.clinicId,
        type: 'Receita',
        category: 'Inscrição de Evento',
        value: matchedEvent.price,
        date: new Date().toISOString().split('T')[0],
        description: `Inscrição ${matchedEvent.name} - ${reg.childName} (${reg.registrationNumber})`,
        referenceId: reg.id
      };
      await saveDocument(COLLECTIONS.TRANSACTIONS, txId, newTx);
    }
  };

  // 6. PUBLIC REGISTRATION HANDLER
  const handleAddRegistrationFromPublicForm = async (
    patientInput: Omit<Patient, 'id' | 'clinicId' | 'photo' | 'createdAt'>,
    registrationInput: Omit<Registration, 'id' | 'clinicId' | 'registrationNumber' | 'date'>
  ) => {
    const matchedEvent = events.find(e => e.id === registrationInput.eventId);
    const targetClinicId = matchedEvent ? matchedEvent.clinicId : (currentClinic?.id || 'clinic-1');

    let foundPatient = patients.find(p => 
      p.clinicId === targetClinicId && 
      p.name.trim().toLowerCase() === patientInput.name.trim().toLowerCase()
    );

    let childId = '';
    if (foundPatient) {
      childId = foundPatient.id;
    } else {
      childId = `patient-${Date.now()}`;
      const newPatient: Patient = {
        ...patientInput,
        id: childId,
        clinicId: targetClinicId,
        photo: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=200',
        createdAt: new Date().toISOString()
      };
      await saveDocument(COLLECTIONS.PATIENTS, childId, newPatient);
    }

    const regId = `reg-${Date.now() + 1}`;
    const newReg: Registration = {
      ...registrationInput,
      id: regId,
      clinicId: targetClinicId,
      childId,
      registrationNumber: `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0]
    };
    await saveDocument(COLLECTIONS.REGISTRATIONS, regId, newReg);

    if (newReg.status === 'Aprovado' && matchedEvent) {
      const txId = `tx-${Date.now() + 3}`;
      const newTx: FinancialTransaction = {
        id: txId,
        clinicId: targetClinicId,
        type: 'Receita',
        category: 'Inscrição de Evento',
        value: matchedEvent.price,
        date: new Date().toISOString().split('T')[0],
        description: `Inscrição ${matchedEvent.name} - ${newReg.childName} (${newReg.registrationNumber})`,
        referenceId: regId
      };
      await saveDocument(COLLECTIONS.TRANSACTIONS, txId, newTx);
    }

    const appId = `app-${Date.now() + 2}`;
    const newAppointment: Appointment = {
      id: appId,
      clinicId: targetClinicId,
      patientId: childId,
      patientName: patientInput.name,
      date: matchedEvent ? matchedEvent.date : new Date().toISOString().split('T')[0],
      time: matchedEvent ? matchedEvent.time : '14:00',
      type: 'Integração Sensorial',
      price: matchedEvent ? matchedEvent.price : 150.0,
      status: 'Agendado'
    };
    await saveDocument(COLLECTIONS.APPOINTMENTS, appId, newAppointment);
  };

  // 7. MULTI-CLINIC MANAGEMENT (SaaS Operator Panel)
  const handleAddClinic = async (clinicData: Omit<Clinic, 'id'>) => {
    const id = `clinic-${Date.now()}`;
    const newClinic: Clinic = {
      ...clinicData,
      id,
      status: 'Ativo'
    };
    await saveDocument(COLLECTIONS.CLINICS, id, newClinic);
    setCurrentClinic(newClinic);
  };

  const handleUpdateClinicPlan = async (id: string, plan: Clinic['plan']) => {
    await saveDocument(COLLECTIONS.CLINICS, id, { plan });
  };

  const handleUpdateClinicDetails = async (id: string, patch: Partial<Clinic>) => {
    await saveDocument(COLLECTIONS.CLINICS, id, patch);
  };

  const handleAddSystemUser = async (userData: Omit<SystemUser, 'id' | 'createdAt'>) => {
    const emailId = userData.email.toLowerCase().trim();
    const newUser: SystemUser = {
      ...userData,
      id: emailId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    await saveDocument(COLLECTIONS.USERS, emailId, newUser);

    // Multi-tenant email registration confirmation trick:
    // Create their auth record in background using a separate Firebase app instance,
    // so it doesn't log out the currently active Administrator session.
    // This allows immediately shooting password recovery and registration emails!
    try {
      const { initializeApp } = await import('firebase/app');
      const { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } = await import('firebase/auth');
      const firebaseConfig = await import('../firebase-applet-config.json');

      const tempApp = initializeApp(firebaseConfig.default, `temp-${Date.now()}`);
      const tempAuth = getAuth(tempApp);

      const userCred = await createUserWithEmailAndPassword(tempAuth, userData.email, userData.password || '1234');
      await sendEmailVerification(userCred.user);
      await sendPasswordResetEmail(tempAuth, userData.email);
      await tempAuth.signOut();
      console.log(`Successfully dispatched confirmation/recovery email to ${userData.email}`);
    } catch (e) {
      console.warn("Auth user pre-registration skipped (might already exist or network offline):", e);
    }
  };

  const handleUpdateSystemUser = async (id: string, patch: Partial<SystemUser>) => {
    await saveDocument(COLLECTIONS.USERS, id, patch);
  };

  const handleDeleteSystemUser = async (id: string) => {
    await removeDocument(COLLECTIONS.USERS, id);
  };

  // Render loading spinner when resolving Firebase session
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F5] text-slate-800 dark:bg-[#121614] dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9BB0A5] mb-4"></div>
        <p className="font-serif italic text-lg font-semibold">Carregando CSM Clinical...</p>
        <p className="text-xs text-slate-400 mt-1">Conectando ao banco de dados Firebase seguro</p>
      </div>
    );
  }

  // Routing render
  if (publicEventId) {
    return (
      <PublicRegistration 
        events={events}
        selectedEventId={publicEventId}
        onBackToCRM={() => {
          setPublicEventId(null);
          window.history.pushState({}, document.title, window.location.pathname);
        }}
        onAddRegistration={handleAddRegistrationFromPublicForm}
        patients={patients}
      />
    );
  }

  if (!currentUser || !currentClinic) {
    return (
      <Login 
        systemUsers={systemUsers}
        onLoginSuccess={() => {}} // Driven by auth state listener
        onRegisterUser={() => {}} // Driven by auth state listener
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        clinics={clinics}
      />
    );
  }

  if (currentUser && currentUser.password === '1234') {
    const isMinLength = newPasswordInput.length >= 8;
    const hasLetterAndNumber = /[a-zA-Z]/.test(newPasswordInput) && /[0-9]/.test(newPasswordInput);
    const hasUppercase = /[A-Z]/.test(newPasswordInput);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_/\-+=~`[\]\\]/.test(newPasswordInput);
    const passwordsMatch = confirmPasswordInput !== '' && newPasswordInput === confirmPasswordInput;

    const reqs = [
      { label: 'No mínimo 8 caracteres', met: isMinLength },
      { label: 'Conter letras e números', met: hasLetterAndNumber },
      { label: 'No mínimo uma letra maiúscula', met: hasUppercase },
      { label: 'No mínimo um caractere especial (ex: @, #, $, %)', met: hasSpecialChar },
      { label: 'Confirmação de senha idêntica', met: passwordsMatch },
    ];

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${darkMode ? 'dark bg-[#1B221E] text-[#ECEBE5]' : 'bg-[#F9F8F3] text-[#2D312E]'}`}>
        <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border transition-all duration-300 ${darkMode ? 'bg-[#232B26] border-[#303B34]' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col items-center mb-6 text-center">
            <div className={`p-4 rounded-full mb-4 ${darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              <Lock className="w-10 h-10 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Alteração de Senha Obrigatória</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-xs">
              Sua conta está utilizando a senha padrão de primeiro acesso (<strong className="font-mono">1234</strong>). Por segurança, cadastre uma nova senha forte para continuar.
            </p>
          </div>

          <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
            {passwordChangeError && (
              <div className="p-3.5 text-xs font-semibold bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordChangeError}</span>
              </div>
            )}

            {passwordChangeSuccess && (
              <div className="p-3.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 animate-pulse" />
                <span>{passwordChangeSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="Digite '1234'"
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                    darkMode 
                      ? 'bg-[#1B221E] border-[#303B34] focus:ring-[#9BB0A5]/40 text-white' 
                      : 'bg-slate-50 border-slate-200 focus:ring-[#9BB0A5]/20 text-slate-800'
                  }`}
                  required
                />
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Cadastre sua nova senha"
                  className={`w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                    darkMode 
                      ? 'bg-[#1B221E] border-[#303B34] focus:ring-[#9BB0A5]/40 text-white' 
                      : 'bg-slate-50 border-slate-200 focus:ring-[#9BB0A5]/20 text-slate-800'
                  }`}
                  required
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 hover:scale-115 transition-all"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className={`w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                    darkMode 
                      ? 'bg-[#1B221E] border-[#303B34] focus:ring-[#9BB0A5]/40 text-white' 
                      : 'bg-slate-50 border-slate-200 focus:ring-[#9BB0A5]/20 text-slate-800'
                  }`}
                  required
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 hover:scale-115 transition-all"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live Requirements List */}
            <div className={`p-4 rounded-xl space-y-2 border text-xs transition-all duration-300 ${darkMode ? 'bg-[#1B221E]/50 border-[#303B34]' : 'bg-slate-50 border-slate-100'}`}>
              <span className="block font-bold mb-2 opacity-90 text-[10px] uppercase tracking-wider">Requisitos da senha:</span>
              {reqs.map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  {req.met ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 animate-[pulse_1s_infinite]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0 transition-colors" />
                  )}
                  <span className={`transition-colors duration-200 ${req.met ? 'text-emerald-500 font-semibold' : 'text-slate-400'}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  darkMode 
                    ? 'border-[#303B34] hover:bg-slate-800/50 text-[#ECEBE5]' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
              <button
                type="submit"
                disabled={isChangingPassword || !isMinLength || !hasLetterAndNumber || !hasUppercase || !hasSpecialChar || !passwordsMatch}
                className={`flex-[2] py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md focus:outline-none focus:ring-2 ${
                  isChangingPassword || !isMinLength || !hasLetterAndNumber || !hasUppercase || !hasSpecialChar || !passwordsMatch
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                    : 'bg-[#9BB0A5] hover:bg-[#8A9F94] focus:ring-[#9BB0A5]/40 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {isChangingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-[#1B221E] text-[#ECEBE5]' : 'bg-[#F9F8F3] text-[#2D312E]'}`}>
      
      {/* Sidebar navigation components */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        clinics={clinics}
        currentClinic={currentClinic}
        setCurrentClinic={setCurrentClinic}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
        registrations={registrations}
        appointments={appointments}
        events={events}
      />

      {/* Floating Menu Toggle Button when options bar is hidden */}
      {!sidebarOpen && (
        <button
          id="btn-sidebar-toggle-show"
          onClick={() => setSidebarOpen(true)}
          className={`fixed bottom-6 left-6 z-40 p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 duration-200 border ${
            darkMode 
              ? 'bg-[#242D28] text-[#9BB0A5] border-[#2E3832] hover:bg-[#2E3832]' 
              : 'bg-[#9BB0A5] text-white border-[#8A9F94] hover:bg-[#8A9F94]'
          }`}
          title="Exibir Menu de Opções"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Main Content View with route switch transitions */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen max-w-(screen-xl) mx-auto w-full">
        {activeTab === 'dashboard' && (
          <Dashboard 
            currentClinic={currentClinic}
            patients={patients}
            events={events}
            appointments={appointments}
            transactions={transactions}
            registrations={registrations}
            setActiveTab={setActiveTab}
            setSelectedPatientId={setSelectedPatientId}
            darkMode={darkMode}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'patients' && (
          <PatientCRM 
            currentClinic={currentClinic}
            patients={patients}
            assessments={assessments}
            medicalRecords={medicalRecords}
            events={events}
            registrations={registrations}
            darkMode={darkMode}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onAddAssessment={handleAddAssessment}
            onAddMedicalRecord={handleAddMedicalRecord}
            selectedPatientId={selectedPatientId}
            setSelectedPatientId={setSelectedPatientId}
            attendances={attendances}
          />
        )}

        {activeTab === 'agenda' && (
          <ScheduleCalendar 
            currentClinic={currentClinic}
            appointments={appointments}
            patients={patients}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onDeleteAppointment={handleDeleteAppointment}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'eventos' && (
          <EventManagement 
            currentClinic={currentClinic}
            events={events}
            registrations={registrations}
            patients={patients}
            attendances={attendances}
            onAddEvent={handleAddEvent}
            onUpdateEventStatus={handleUpdateEventStatus}
            onToggleAttendance={handleToggleAttendance}
            onUpdateAttendanceNotes={handleUpdateAttendanceNotes}
            onDeleteEvent={handleDeleteEvent}
            onOpenPublicFormByEvent={handleOpenPublicFormByEvent}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'financeiro' && (
          <FinancialHub 
            currentClinic={currentClinic}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'relatorios' && (
          <ReportsCenter 
            currentClinic={currentClinic}
            patients={patients}
            events={events}
            registrations={registrations}
            appointments={appointments}
            transactions={transactions}
            attendances={attendances}
            onApproveRegistration={handleApproveRegistration}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'clinicas' && (
          <ClinicSettings 
            clinics={clinics}
            currentClinic={currentClinic}
            onAddClinic={handleAddClinic}
            onUpdateClinicPlan={handleUpdateClinicPlan}
            onUpdateClinicDetails={handleUpdateClinicDetails}
            systemUsers={systemUsers}
            onAddSystemUser={handleAddSystemUser}
            onUpdateSystemUser={handleUpdateSystemUser}
            onDeleteSystemUser={handleDeleteSystemUser}
            setCurrentClinic={setCurrentClinic}
            darkMode={darkMode}
            currentUser={currentUser}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'comunicacao' && (
          <CommunicationSettings
            currentClinic={currentClinic}
            onUpdateClinicDetails={handleUpdateClinicDetails}
            darkMode={darkMode}
          />
        )}
      </main>
    </div>
  );
}
