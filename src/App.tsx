import React, { useState, useEffect } from 'react';
import { 
  initialClinics, 
  initialEvents, 
  initialPatients, 
  initialRegistrations, 
  initialAssessments, 
  initialMedicalRecords, 
  initialAppointments, 
  initialTransactions, 
  initialAttendances,
  initialSystemUsers
} from './data/seedData';
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

// Component imports
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientCRM from './components/PatientCRM';
import ScheduleCalendar from './components/ScheduleCalendar';
import EventManagement from './components/EventManagement';
import FinancialHub from './components/FinancialHub';
import ReportsCenter from './components/ReportsCenter';
import ClinicSettings from './components/ClinicSettings';
import PublicRegistration from './components/PublicRegistration';
import { Login } from './components/Login';

export default function App() {
  // Master database state definitions with localStorage persistence
  const [clinics, setClinics] = useState<Clinic[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_clinics');
      if (saved) return JSON.parse(saved);
    }
    return initialClinics;
  });

  const [events, setEvents] = useState<TherapeuticEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_events');
      if (saved) return JSON.parse(saved);
    }
    return initialEvents;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_patients');
      if (saved) return JSON.parse(saved);
    }
    return initialPatients;
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_registrations');
      if (saved) return JSON.parse(saved);
    }
    return initialRegistrations;
  });

  const [assessments, setAssessments] = useState<EvolutionaryAssessment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_assessments');
      if (saved) return JSON.parse(saved);
    }
    return initialAssessments;
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_medical_records');
      if (saved) return JSON.parse(saved);
    }
    return initialMedicalRecords;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_appointments');
      if (saved) return JSON.parse(saved);
    }
    return initialAppointments;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_transactions');
      if (saved) return JSON.parse(saved);
    }
    return initialTransactions;
  });

  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_attendances');
      if (saved) return JSON.parse(saved);
    }
    return initialAttendances;
  });
  
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_system_users');
      if (saved) return JSON.parse(saved);
    }
    return initialSystemUsers;
  });

  // System User Login session state
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_session_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  // Layout and Role configuration state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  
  const [currentClinic, setCurrentClinic] = useState<Clinic>(() => {
    if (typeof window !== 'undefined') {
      const savedClinic = localStorage.getItem('csm_current_clinic');
      if (savedClinic) {
        try {
          return JSON.parse(savedClinic);
        } catch (e) {
          // ignore
        }
      }
      const savedClinics = localStorage.getItem('csm_clinics');
      if (savedClinics) {
        try {
          const parsed = JSON.parse(savedClinics);
          if (parsed && parsed.length > 0) return parsed[0];
        } catch (e) {
          // ignore
        }
      }
    }
    return initialClinics[0];
  });

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Sync databases to localStorage when updated
  useEffect(() => {
    localStorage.setItem('csm_clinics', JSON.stringify(clinics));
  }, [clinics]);

  useEffect(() => {
    localStorage.setItem('csm_current_clinic', JSON.stringify(currentClinic));
  }, [currentClinic]);

  useEffect(() => {
    localStorage.setItem('csm_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('csm_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('csm_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('csm_assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('csm_medical_records', JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  useEffect(() => {
    localStorage.setItem('csm_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('csm_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('csm_attendances', JSON.stringify(attendances));
  }, [attendances]);

  // LINK: auto-sync systemUsers to local storage when changed
  useEffect(() => {
    localStorage.setItem('csm_system_users', JSON.stringify(systemUsers));
  }, [systemUsers]);

  // Sync role to currentUser role automatically
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('csm_session_user');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Link for simulating the public registration platform
  const [publicEventId, setPublicEventId] = useState<string | null>(null);

  // Coordinate check on page render to see if we clicked "Simulate registration" or accessed public ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventIdParam = params.get('publicEventId');
    if (eventIdParam) {
      setPublicEventId(eventIdParam);
    }
  }, []);

  // Sync state when current clinic might be modified inside settings
  useEffect(() => {
    const updated = clinics.find(c => c.id === currentClinic.id);
    if (updated) {
      setCurrentClinic(updated);
    }
  }, [clinics, currentClinic.id]);

  // 1. EVENT MANAGEMENT CALLBACKS
  const handleAddEvent = (eventData: Omit<TherapeuticEvent, 'id' | 'clinicId'>) => {
    const newEvent: TherapeuticEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      clinicId: currentClinic.id
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleUpdateEventStatus = (id: string, status: TherapeuticEvent['status']) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    
    // Automatically cancel all pendings if canceled
    if (status === 'Cancelado') {
      setRegistrations(prev => prev.map(r => r.eventId === id ? { ...r, status: 'Cancelado' } : r));
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleToggleAttendance = (eventId: string, patientId: string, present: boolean) => {
    setAttendances(prev => {
      const exists = prev.some(a => a.eventId === eventId && a.patientId === patientId);
      if (exists) {
        return prev.map(a => (a.eventId === eventId && a.patientId === patientId) ? { ...a, present } : a);
      } else {
        return [...prev, { id: `att-${Date.now()}`, eventId, patientId, present, notes: '' }];
      }
    });
  };

  const handleUpdateAttendanceNotes = (eventId: string, patientId: string, notes: string) => {
    setAttendances(prev => {
      const exists = prev.some(a => a.eventId === eventId && a.patientId === patientId);
      if (exists) {
        return prev.map(a => (a.eventId === eventId && a.patientId === patientId) ? { ...a, notes } : a);
      } else {
        return [...prev, { id: `att-${Date.now()}`, eventId, patientId, present: true, notes }];
      }
    });
  };

  const handleOpenPublicFormByEvent = (eventId: string) => {
    setPublicEventId(eventId);
  };

  // 2. PATIENT CRM CALLBACKS
  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'clinicId' | 'photo' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: `patient-${Date.now()}`,
      clinicId: currentClinic.id,
      photo: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=200', // cute default child avatar
      createdAt: new Date().toISOString()
    };
    setPatients(prev => [...prev, newPatient]);
    setSelectedPatientId(newPatient.id);
  };

  const handleUpdatePatient = (id: string, patch: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  const handleAddAssessment = (patientId: string, assData: Omit<EvolutionaryAssessment, 'id' | 'patientId' | 'date' | 'author'>) => {
    const newAss: EvolutionaryAssessment = {
      ...assData,
      id: `eval-${Date.now()}`,
      patientId,
      date: new Date().toISOString().split('T')[0],
      author: currentRole === 'Admin' ? 'Dra. Ana Flávia' : currentRole === 'Fisio' ? 'Dra. Gabriela Nunes' : 'Silvia Souza'
    };
    setAssessments(prev => [...prev, newAss]);
  };

  const handleAddMedicalRecord = (patientId: string, recData: Omit<MedicalRecord, 'id' | 'patientId' | 'date' | 'author'>) => {
    const newRecord: MedicalRecord = {
      ...recData,
      id: `rec-${Date.now()}`,
      patientId,
      date: new Date().toISOString().split('T')[0],
      author: currentRole === 'Admin' ? 'Dra. Ana Flávia' : currentRole === 'Fisio' ? 'Dra. Gabriela Nunes' : 'Silvia Souza'
    };
    setMedicalRecords(prev => [...prev, newRecord]);
  };

  // 3. APPOINTMENT SCHEDULING CALLBACKS (ScheduleCalendar)
  const handleAddAppointment = (appData: Omit<Appointment, 'id' | 'clinicId' | 'patientName'>) => {
    const child = patients.find(p => p.id === appData.patientId);
    const newApp: Appointment = {
      ...appData,
      id: `app-${Date.now()}`,
      clinicId: currentClinic.id,
      patientName: child ? child.name : 'Paciente Desconhecido'
    };
    setAppointments(prev => [...prev, newApp]);

    // Automatically file a ledger receipt if appointment is already labeled completed
    if (newApp.status === 'Realizado') {
      const newTx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        clinicId: currentClinic.id,
        type: 'Receita',
        category: 'Atendimento Particular',
        value: newApp.price,
        date: newApp.date,
        description: `Sessão ${newApp.type} - ${newApp.patientName}`,
        referenceId: newApp.id
      };
      setTransactions(prev => [...prev, newTx]);
    }
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        const oldStatus = a.status;
        const updated = { ...a, status };

        // Automatically file a revenue transaction if changed to 'Realizado'
        if (status === 'Realizado' && oldStatus !== 'Realizado') {
          const txExists = transactions.some(t => t.referenceId === id);
          if (!txExists) {
            setTransactions(prevTx => [
              ...prevTx,
              {
                id: `tx-${Date.now()}`,
                clinicId: a.clinicId,
                type: 'Receita',
                category: 'Atendimento Particular',
                value: a.price,
                date: a.date,
                description: `Sessão ${a.type} - ${a.patientName}`,
                referenceId: id
              }
            ]);
          }
        }
        return updated;
      }
      return a;
    }));
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  // 4. FINANCIAL LEDGER CALLBACKS
  const handleAddTransaction = (txData: Omit<FinancialTransaction, 'id' | 'clinicId'>) => {
    const newTx: FinancialTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      clinicId: currentClinic.id
    };
    setTransactions(prev => [...prev, newTx]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // 5. REGISTRATION AND BILLING CENTER - APROVAÇÃO FINANCEIRA DE PIX COBRADO
  const handleApproveRegistration = (id: string) => {
    setRegistrations(prevRegs => prevRegs.map(reg => {
      if (reg.id === id) {
        const updatedReg = { ...reg, status: 'Aprovado' as const };
        
        // Dynamic cash book entry injection
        const matchedEvent = events.find(e => e.id === reg.eventId);
        if (matchedEvent) {
          const newTx: FinancialTransaction = {
            id: `tx-${Date.now()}`,
            clinicId: reg.clinicId,
            type: 'Receita',
            category: 'Inscrição de Evento',
            value: matchedEvent.price,
            date: new Date().toISOString().split('T')[0],
            description: `Inscrição ${matchedEvent.name} - ${reg.childName} (${reg.registrationNumber})`,
            referenceId: reg.id
          };
          setTransactions(prevTx => [...prevTx, newTx]);
        }
        return updatedReg;
      }
      return reg;
    }));
  };

  // 6. PUBLIC REGISTRATION HANDLER FROM DIVULGATION LINK LINKS
  const handleAddRegistrationFromPublicForm = (
    patientInput: Omit<Patient, 'id' | 'clinicId' | 'photo' | 'createdAt'>,
    registrationInput: Omit<Registration, 'id' | 'clinicId' | 'registrationNumber' | 'date'>
  ) => {
    // Audit clinic for selected event
    const matchedEvent = events.find(e => e.id === registrationInput.eventId);
    const targetClinicId = matchedEvent ? matchedEvent.clinicId : currentClinic.id;

    // Duplication checker for child of this mother on same clinic
    let foundPatient = patients.find(p => 
      p.clinicId === targetClinicId && 
      p.name.trim().toLowerCase() === patientInput.name.trim().toLowerCase()
    );

    let childId = '';
    if (foundPatient) {
      childId = foundPatient.id;
    } else {
      // Create Patient File
      const newPatient: Patient = {
        ...patientInput,
        id: `patient-${Date.now()}`,
        clinicId: targetClinicId,
        photo: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=200',
        createdAt: new Date().toISOString()
      };
      setPatients(prev => [...prev, newPatient]);
      childId = newPatient.id;
    }

    const newReg: Registration = {
      ...registrationInput,
      id: `reg-${Date.now() + 1}`,
      clinicId: targetClinicId,
      childId,
      registrationNumber: `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0]
    };

    setRegistrations(prev => [...prev, newReg]);

    // Automatically inject cash book/ledger receipts since registration is already approved on submission (payment attached)
    if (newReg.status === 'Aprovado' && matchedEvent) {
      const newTx: FinancialTransaction = {
        id: `tx-${Date.now() + 3}`,
        clinicId: targetClinicId,
        type: 'Receita',
        category: 'Inscrição de Evento',
        value: matchedEvent.price,
        date: new Date().toISOString().split('T')[0],
        description: `Inscrição ${matchedEvent.name} - ${newReg.childName} (${newReg.registrationNumber})`,
        referenceId: newReg.id
      };
      setTransactions(prevTx => [...prevTx, newTx]);
    }

    // Automatically register future therapy plan booking in Agenda workspace
    // as an Agendado assessment, to link CRM records together
    const newAppointment: Appointment = {
      id: `app-${Date.now() + 2}`,
      clinicId: targetClinicId,
      patientId: childId,
      patientName: patientInput.name,
      date: matchedEvent ? matchedEvent.date : new Date().toISOString().split('T')[0],
      time: matchedEvent ? matchedEvent.time : '14:00',
      type: 'Integração Sensorial',
      price: matchedEvent ? matchedEvent.price : 150.0,
      status: 'Agendado'
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  // 7. MULTI-CLINIC MANAGEMENT
  const handleAddClinic = (clinicData: Omit<Clinic, 'id'>) => {
    const newClinic: Clinic = {
      ...clinicData,
      id: `clinic-${Date.now()}`,
      status: 'Ativo'
    };
    setClinics(prev => [...prev, newClinic]);
    setCurrentClinic(newClinic);
  };

  const handleUpdateClinicPlan = (id: string, plan: Clinic['plan']) => {
    setClinics(prev => prev.map(c => c.id === id ? { ...c, plan } : c));
  };

  const handleUpdateClinicDetails = (id: string, patch: Partial<Clinic>) => {
    setClinics(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const handleAddSystemUser = (userData: Omit<SystemUser, 'id' | 'createdAt'>) => {
    const newUser: SystemUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSystemUsers(prev => [...prev, newUser]);
  };

  const handleUpdateSystemUser = (id: string, patch: Partial<SystemUser>) => {
    setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  };

  const handleDeleteSystemUser = (id: string) => {
    setSystemUsers(prev => prev.filter(u => u.id !== id));
  };

  // Routing render
  if (publicEventId) {
    return (
      <PublicRegistration 
        events={events}
        selectedEventId={publicEventId}
        onBackToCRM={() => {
          setPublicEventId(null);
          // Remove query params
          window.history.pushState({}, document.title, window.location.pathname);
        }}
        onAddRegistration={handleAddRegistrationFromPublicForm}
        patients={patients}
      />
    );
  }

  if (!currentUser) {
    return (
      <Login 
        systemUsers={systemUsers}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentRole(user.role);
        }}
        onRegisterUser={(userPayload) => {
          const newUser: SystemUser = {
            ...userPayload,
            id: `user-${Date.now()}`,
            createdAt: new Date().toISOString().split('T')[0],
            status: 'Ativo'
          };
          setSystemUsers(prev => [...prev, newUser]);
          localStorage.setItem('csm_session_user', JSON.stringify(newUser));
          setCurrentUser(newUser);
          setCurrentRole(newUser.role);
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        clinics={clinics}
      />
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
            attendances={attendances}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onAddAssessment={handleAddAssessment}
            onAddMedicalRecord={handleAddMedicalRecord}
            selectedPatientId={selectedPatientId}
            setSelectedPatientId={setSelectedPatientId}
            darkMode={darkMode}
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
          />
        )}
      </main>
    </div>
  );
}
