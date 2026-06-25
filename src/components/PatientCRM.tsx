import React, { useState } from 'react';
import { 
  Search, 
  Baby, 
  Phone, 
  Calendar, 
  Activity, 
  FileCheck2, 
  Plus, 
  Clock, 
  FileText, 
  Upload, 
  Download, 
  Printer, 
  AlertCircle,
  Paperclip,
  CheckCircle,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  Sliders,
  UserCheck,
  Building,
  Dumbbell,
  Send,
  MessageSquare,
  Trash2,
  Bookmark
} from 'lucide-react';
import { Patient, EvolutionaryAssessment, MedicalRecord, TherapeuticEvent, Registration, Attendance, Clinic } from '../types';

export interface HomePrescription {
  id: string;
  patientId: string;
  type: 'Receita' | 'Treino Psicomotor';
  title: string;
  instructions: string;
  recommendedFrequency: string;
  createdAt: string;
  sentViaWhatsApp: boolean;
  sentDate?: string;
}

const HOME_TEMPLATES = [
  {
    title: 'Circuito Sensorial de Almofadas',
    type: 'Treino Psicomotor' as const,
    instructions: 'Espalhe de 4 a 5 almofadas de diferentes texturas e alturas pelo corredor da casa. Incentive a criança a caminhar por cima delas descalça, de ida e volta, para estimular o equilíbrio corporal dinâmico, propriocepção e a sensibilidade tátil.',
    frequency: '1x ao dia (preferencialmente no final de tarde)'
  },
  {
    title: 'Ponte Pélvica Lúdica (Fortalecimento)',
    type: 'Treino Psicomotor' as const,
    instructions: 'Deitar a criança de barriga para cima em um tapete macio. Posicionar os calcanhares dela na beirada do sofá ou colchonete e ajudá-la a elevar o quadril contraindo levemente os glúteos. Manter por 5 segundos e repetir 10 vezes para fortalecimento lombar e de cadeias posteriores.',
    frequency: '3x por semana (segunda, quarta e sexta)'
  },
  {
    title: 'Movimento de Pinça com Prendedores',
    type: 'Treino Psicomotor' as const,
    instructions: 'Coloque um pote plástico no chão e entregue prendedores de roupas coloridos. Peça para a criança prender todos em volta da borda usando somente os dedos indicador e polegar, exercitando a força e pinça da coordenação motora fina.',
    frequency: 'Diário (Treino de 10 minutos)'
  },
  {
    title: 'Agachamento com Balde de Brinquedos',
    type: 'Treino Psicomotor' as const,
    instructions: 'Espalhe pecinhas de encaixe ou bonecos pelo chão. Com a criança em pé, segure um balde perto do colo e estimule o pequeno a agachar (com os calcanhares no chão, sem desabar as costas) para elevar uma pecinha por vez e colocar no balde.',
    frequency: '2x por semana (Sábado e Domingo)'
  },
  {
    title: 'Receita: Calmante de Relaxamento Noturno',
    type: 'Receita' as const,
    instructions: 'Com luz de cabeceira suave, realize uma fricção tátil leve nas solas dos pés e panturrilhas da criança utilizando hidratante corporal neutro por 5 minutos antes do sono principal, acalmando a reatividade tátil.',
    frequency: 'Todas as noites após o banho e antes de dormir'
  }
];

interface PatientCRMProps {
  currentClinic: Clinic;
  patients: Patient[];
  assessments: EvolutionaryAssessment[];
  medicalRecords: MedicalRecord[];
  events: TherapeuticEvent[];
  registrations: Registration[];
  attendances: Attendance[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'clinicId' | 'photo' | 'createdAt'>) => void;
  onUpdatePatient: (id: string, patient: Partial<Patient>) => void;
  onAddAssessment: (patientId: string, assessment: Omit<EvolutionaryAssessment, 'id' | 'patientId' | 'date' | 'author'>) => void;
  onAddMedicalRecord: (patientId: string, record: Omit<MedicalRecord, 'id' | 'patientId' | 'date' | 'author'>) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  darkMode: boolean;
}

export default function PatientCRM({
  currentClinic,
  patients,
  assessments,
  medicalRecords,
  events,
  registrations,
  attendances,
  onAddPatient,
  onUpdatePatient,
  onAddAssessment,
  onAddMedicalRecord,
  selectedPatientId,
  setSelectedPatientId,
  darkMode
}: PatientCRMProps) {

  // Search Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'Todos' | 'M' | 'F'>('Todos');

  // Sub-modules state inside profile
  const [activeProfileSubTab, setActiveProfileSubTab] = useState<'prontuario' | 'evolucoes' | 'participacao' | 'prescricoes_casa'>('prontuario');

  // Home Prescriptions State Management
  const [homePrescriptions, setHomePrescriptions] = useState<HomePrescription[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csm_home_prescriptions');
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: 'hp-1',
        patientId: 'patient-1',
        type: 'Treino Psicomotor',
        title: 'Circuito Sensorial de Almofadas',
        instructions: 'Espalhe de 4 a 5 almofadas de diferentes texturas e alturas pelo corredor da casa. Incentive a criança a caminhar por cima delas descalça, de ida e volta, para estimular o equilíbrio corporal dinâmico, propriocepção e a sensibilidade tátil.',
        recommendedFrequency: '1x ao dia (preferencialmente no final de tarde)',
        createdAt: '2026-06-20',
        sentViaWhatsApp: true,
        sentDate: '2026-06-21'
      },
      {
        id: 'hp-2',
        patientId: 'patient-1',
        type: 'Receita',
        title: 'Movimento de Pinça de Prendedores',
        instructions: 'Coloque um pote plástico no chão e entregue prendedores de roupas coloridos. Peça para a criança prender todos em volta da borda usando somente os dedos indicador e polegar, exercitando a força e pinça da coordenação motora fina.',
        recommendedFrequency: 'Diário (Treino de 10 minutos)',
        createdAt: '2026-06-22',
        sentViaWhatsApp: false
      },
      {
        id: 'hp-3',
        patientId: 'patient-2',
        type: 'Treino Psicomotor',
        title: 'Ponte Pélvica Lúdica (Fortalecimento)',
        instructions: 'Deitar a criança de barriga para cima em um tapete macio. Posicionar os calcanhares dela na beirada do sofá ou colchonete e ajudá-la a elevar o quadril contraindo levemente os glúteos. Manter por 5 segundos e repetir 10 vezes.',
        recommendedFrequency: '3x por semana (segunda, quarta e sexta)',
        createdAt: '2026-06-21',
        sentViaWhatsApp: true,
        sentDate: '2026-06-21'
      }
    ];
  });

  // State triggers for adding prescriptions
  const [newPrescType, setNewPrescType] = useState<'Receita' | 'Treino Psicomotor'>('Treino Psicomotor');
  const [newPrescTitle, setNewPrescTitle] = useState('');
  const [newPrescInstructions, setNewPrescInstructions] = useState('');
  const [newPrescFrequency, setNewPrescFrequency] = useState('Diário');
  const [showAddPrescForm, setShowAddPrescForm] = useState(false);
  const [whatsSentToast, setWhatsSentToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});

  // Save changes to localstorage
  React.useEffect(() => {
    localStorage.setItem('csm_home_prescriptions', JSON.stringify(homePrescriptions));
  }, [homePrescriptions]);

  // Modal triggers
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddAssessmentModal, setShowAddAssessmentModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  // Form states: New Patient
  const [pName, setPName] = useState('');
  const [pBirthDate, setPBirthDate] = useState('2020-01-01');
  const [pGender, setPGender] = useState<'M' | 'F' | 'Outro'>('M');
  const [pMother, setPMother] = useState('');
  const [pFather, setPFather] = useState('');
  const [pGuardian, setPGuardian] = useState('');
  const [pCpf, setPCpf] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pDiag, setPDiag] = useState('');
  const [pLim, setPLim] = useState('');
  const [pAller, setPAller] = useState('');
  const [pMeds, setPMeds] = useState('');
  const [pNotes, setPNotes] = useState('');

  // Form states: New Assessment
  const [evalCoord, setEvalCoord] = useState(3);
  const [evalEquilibrio, setEvalEquilibrio] = useState(3);
  const [evalMobilidade, setEvalMobilidade] = useState(3);
  const [evalForca, setEvalForca] = useState(3);
  const [evalFin, setEvalFin] = useState(3);
  const [evalInter, setEvalInter] = useState(3);
  const [evalCom, setEvalCom] = useState(3);
  const [evalGrp, setEvalGrp] = useState(3);
  const [evalNotes, setEvalNotes] = useState('');

  // Form states: New Record Entry
  const [recTitle, setRecTitle] = useState('');
  const [recType, setRecType] = useState<MedicalRecord['type']>('Evolução');
  const [recDesc, setRecDesc] = useState('');
  const [recAttachmentName, setRecAttachmentName] = useState('');

  // Filter lists by clinic
  const clinicPatients = patients.filter(p => p.clinicId === currentClinic.id);

  // Filter patients by search term
  const filteredPatients = clinicPatients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.motherName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = genderFilter === 'Todos' || p.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  // Current Patient selection
  const activePatient = clinicPatients.find(p => p.id === selectedPatientId) || clinicPatients[0] || null;

  // Selected patient details variables
  const patientAssessments = activePatient 
    ? assessments.filter(a => a.patientId === activePatient.id).sort((a,b) => b.date.localeCompare(a.date))
    : [];

  const patientMedicalRecords = activePatient
    ? medicalRecords.filter(m => m.patientId === activePatient.id).sort((a,b) => b.date.localeCompare(a.date))
    : [];

  // MÓDULO 5: Registered and actual participations in events
  const patientRegistrations = activePatient
    ? registrations.filter(r => r.childId === activePatient.id && r.status === 'Aprovado')
    : [];

  const patientHomePrescriptions = activePatient
    ? homePrescriptions.filter(hp => hp.patientId === activePatient.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pBirthDate || !pGuardian || !pCpf || !pPhone || !pEmail) return;

    onAddPatient({
      name: pName,
      birthDate: pBirthDate,
      gender: pGender,
      fatherName: pFather || 'Não informado',
      motherName: pMother || 'Não informado',
      guardianName: pGuardian,
      cpf: pCpf,
      phone: pPhone,
      whatsapp: pPhone,
      email: pEmail,
      diagnosis: pDiag || 'Atraso Motor em Investigação',
      limitations: pLim || 'Nenhuma',
      allergies: pAller || 'Nenhuma',
      medications: pMeds || 'Nenhum',
      notes: pNotes || 'Adicionado no cadastro manual.'
    });

    // Reset Form fields
    setPName('');
    setPMother('');
    setPFather('');
    setPGuardian('');
    setPCpf('');
    setPPhone('');
    setPEmail('');
    setPDiag('');
    setPLim('');
    setPAller('');
    setPMeds('');
    setPNotes('');
    setShowAddPatientModal(false);
  };

  const handleAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    onAddAssessment(activePatient.id, {
      coord: evalCoord,
      equilibrio: evalEquilibrio,
      mobilidade: evalMobilidade,
      forca: evalForca,
      motricidadeFina: evalFin,
      interacao: evalInter,
      comunicacao: evalCom,
      participacaoGrupo: evalGrp,
      notes: evalNotes || 'Realizada nova avaliação de critérios multidisciplinares.'
    });

    setEvalNotes('');
    setShowAddAssessmentModal(false);
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient || !recTitle || !recDesc) return;

    const attachmentsList = recAttachmentName 
      ? [{ name: recAttachmentName, size: '250 KB', date: new Date().toISOString().split('T')[0] }] 
      : undefined;

    onAddMedicalRecord(activePatient.id, {
      title: recTitle,
      type: recType,
      description: recDesc,
      attachments: attachmentsList
    });

    setRecTitle('');
    setRecDesc('');
    setRecAttachmentName('');
    setShowAddRecordModal(false);
  };

  const getAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate + 'T12:00:00');
    let ageY = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      ageY--;
    }
    return ageY >= 0 ? ageY : 0;
  };

  return (
    <div id="patient-crm-module" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: Children catalog list directory (4 cols) */}
      <div className={`lg:col-span-4 rounded-3xl border p-5 space-y-4 ${
        darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
              Crianças Cadastradas
            </h3>
            <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">
              {filteredPatients.length} de {clinicPatients.length} pacientes
            </p>
          </div>
          <button
            id="btn-add-patient-action"
            onClick={() => setShowAddPatientModal(true)}
            className="p-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl shadow-sm shadow-teal-500/10 flex items-center justify-center gap-1 cursor-pointer"
            title="Cadastrar Nova Criança"
          >
            <Plus className="w-4 h-4" /> <span className="text-[11px] font-bold pr-1.5">Criar</span>
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, mãe, laudo..."
              className={`w-full text-xs font-semibold rounded-xl pl-9 pr-4 py-2.5 outline-none border transition-all ${
                darkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-teal-550' 
                  : 'bg-slate-50 border-slate-150 text-slate-800 focus:border-teal-400 focus:bg-white'
              }`}
            />
          </div>

          {/* Gender filters */}
          <div className="flex gap-1 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl">
            {(['Todos', 'M', 'F'] as const).map((genderOption) => (
              <button
                key={genderOption}
                onClick={() => setGenderFilter(genderOption)}
                className={`flex-1 py-1 px-2.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  genderFilter === genderOption
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                {genderOption === 'Todos' ? 'Todos' : genderOption === 'M' ? 'Meninos 👦' : 'Meninas 👧'}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Listings */}
        <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Baby className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold italic">Nenhuma criança localizada.</p>
              <p className="text-[10px] text-slate-430 leading-snug">Cadastre no botão acima ou altere filtros.</p>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const isSelected = selectedPatientId === patient.id || (!selectedPatientId && filteredPatients[0].id === patient.id);
              const initials = patient.name.split(' ').map(n => n[0]).join('').substring(0, 2);
              
              return (
                <div
                  id={`patient-item-${patient.id}`}
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatientId(patient.id);
                    setActiveProfileSubTab('prontuario');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-550/10 border-teal-450/40'
                      : darkMode
                        ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800'
                        : 'bg-slate-50/40 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {patient.photo ? (
                      <img 
                        src={patient.photo} 
                        alt={patient.name} 
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-850"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center">
                        {initials}
                      </div>
                    )}
                    
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate group-hover:text-teal-600 transition-colors">
                        {patient.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {getAge(patient.birthDate)} anos • {patient.gender === 'M' ? 'Masc' : 'Fem'}
                      </span>
                      <p className="text-[9px] font-extrabold text-teal-600 dark:text-teal-400 truncate max-w-[170px] mt-1 pr-1.5">
                        🧬 {patient.diagnosis}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'translate-x-1 text-teal-550' : ''}`} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Extensive electronic clinical chart and evolution profile (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {activePatient ? (
          <div className="space-y-6">
            
            {/* Upper bio summary card */}
            <div className={`p-6 rounded-3xl border ${
              darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-150 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  {activePatient.photo ? (
                    <img 
                      src={activePatient.photo} 
                      alt={activePatient.name} 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-3xl object-cover border-2 border-slate-100 dark:border-slate-800 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-inner">
                      {activePatient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl font-extrabold text-slate-850 dark:text-white tracking-tight">
                      {activePatient.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-450">
                      <span className="font-bold bg-teal-50 dark:bg-emerald-550/15 text-teal-600 dark:text-teal-400 px-2.5 py-0.5 rounded-full uppercase">
                        👲 {getAge(activePatient.birthDate)} anos ({new Date(activePatient.birthDate + 'T12:00:00').toLocaleDateString('pt-BR')})
                      </span>
                      <span>•</span>
                      <span className="font-bold">CPF: {activePatient.cpf}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      alert(`Iniciando geração de Prontuário Médico completo de ${activePatient.name} em PDF...`);
                      window.print();
                    }}
                    className="p-1 px-3 text-[10px] font-black bg-indigo-50 dark:bg-indigo-550/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl hover:bg-indigo-100/50 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Exportar Prontuário PDF
                  </button>
                </div>
              </div>

              {/* Bio fast details sheet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-5 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Responsáveis</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-100">👩 Mãe: {activePatient.motherName}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">👨 Pai: {activePatient.fatherName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Contatos Gerais</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-teal-500" /> {activePatient.phone}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold truncate">📧 {activePatient.email}</p>
                </div>

                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Alergias & Remédios</span>
                  <p className="font-extrabold text-rose-500">🚫 Alergias: {activePatient.allergies}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">💊 {activePatient.medications}</p>
                </div>

                <div className="sm:col-span-2 lg:col-span-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/10 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-rose-600 font-black block">Laudo Principal / Diagnóstico e limitações físicas</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-100">🧬 {activePatient.diagnosis}</p>
                  <p className="text-slate-500 dark:text-slate-350 font-semibold mt-1">⚠️ Limitações observadas: {activePatient.limitations}</p>
                </div>
              </div>
            </div>

            {/* Profile Subnavigation Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
              {[
                { id: 'prontuario', label: 'Histórico & Prontuário', count: patientMedicalRecords.length },
                { id: 'evolucoes', label: 'Avaliações Terapêuticas (1 a 5)', count: patientAssessments.length },
                { id: 'participacao', label: 'Frequência de Eventos', count: patientRegistrations.length },
                { id: 'prescricoes_casa', label: 'Exercícios de Casa & Receitas', count: patientHomePrescriptions.length },
              ].map((tab) => (
                <button
                  id={`patient-subtab-${tab.id}`}
                  key={tab.id}
                  onClick={() => setActiveProfileSubTab(tab.id as any)}
                  className={`pb-3.5 text-xs font-bold transition-all px-4 relative ${
                    activeProfileSubTab === tab.id
                      ? 'text-teal-600 dark:text-teal-400 font-extrabold'
                      : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                      {tab.count}
                    </span>
                  )}
                  {activeProfileSubTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Profile Sub Tabs Contents */}
            
            {/* SUB-TAB 1: Medical records history / Prontuário (Módulo 7) */}
            {activeProfileSubTab === 'prontuario' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                
                {/* Header list row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                      Linha do Tempo Clinica (Prontuário)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Laudos de Anamnese, relatórios e arquivos anexados das sessões.</p>
                  </div>
                  <button
                    id="btn-add-record-action"
                    onClick={() => setShowAddRecordModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-500 text-white text-xs font-bold rounded-xl hover:bg-teal-600 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Registrar Evolução
                  </button>
                </div>

                {/* Patient Records Lists */}
                <div className="space-y-4">
                  {patientMedicalRecords.length === 0 ? (
                    <div className={`p-8 text-center rounded-2xl border ${
                      darkMode ? 'border-slate-850 text-slate-500' : 'border-slate-100 text-slate-400'
                    }`}>
                      <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2.5" />
                      <p className="text-xs font-bold italic">Nenhum prontuário registrado para este paciente.</p>
                      <p className="text-[10px] mt-1 max-w-sm mx-auto">Crie laudos de Anamnese ou relatórios periódicos clínicos usando o botão "Registrar Evolução".</p>
                    </div>
                  ) : (
                    patientMedicalRecords.map((record) => {
                      const typeColors = {
                        'Anamnese': 'bg-pink-500/10 text-pink-500 dark:bg-pink-500/15',
                        'Evolução': 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400',
                        'Avaliação': 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/15',
                        'Relatório': 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/15',
                        'Documento': 'bg-slate-500/10 text-slate-550 dark:bg-slate-500/15'
                      };
                      
                      return (
                        <div
                          key={record.id}
                          className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                            darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  typeColors[record.type] || 'bg-slate-100'
                                }`}>
                                  {record.type}
                                </span>
                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                                  {record.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Registrado em {new Date(record.date + 'T12:00:00').toLocaleDateString('pt-BR')} por {record.author}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                            {record.description}
                          </p>

                          {/* Attached files items (Module 7 requirement) */}
                          {record.attachments && record.attachments.length > 0 && (
                            <div className="pt-2">
                              <h5 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                                <Paperclip className="w-3.5 h-3.5 text-indigo-500" /> Arquivos Anexados ({record.attachments.length})
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {record.attachments.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-2 px-3 rounded-xl border flex items-center justify-between text-[11px] font-semibold ${
                                      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-150'
                                    }`}
                                  >
                                    <span className="truncate max-w-[150px] text-slate-650 dark:text-slate-350">📂 {file.name}</span>
                                    <span className="text-[9px] text-slate-400 font-bold">({file.size})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: Evolutionary evaluation charts & numbers (Módulo 6) */}
            {activeProfileSubTab === 'evolucoes' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                      Evolução de Critérios e Escala Multidisciplinar
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Avaliação periódica por critérios de Desenvolvimento Social e Motor (1 a 5).</p>
                  </div>
                  <button
                    id="btn-add-assessment-action"
                    onClick={() => setShowAddAssessmentModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-500 text-white text-xs font-bold rounded-xl hover:bg-teal-600 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Nova Avaliação (1 a 5)
                  </button>
                </div>

                {/* Render Chronological graphs of past evaluations */}
                {patientAssessments.length === 0 ? (
                  <div className={`p-8 text-center rounded-2xl border ${
                    darkMode ? 'border-slate-850 text-slate-500' : 'border-slate-100 text-slate-400'
                  }`}>
                    <Activity className="w-12 h-12 mx-auto text-indigo-400 mb-2.5" />
                    <p className="text-xs font-bold italic">Nenhuma ficha evolutiva preenchida.</p>
                    <p className="text-[10px] mt-1 max-w-sm mx-auto">Utilize o botão principal "Nova Avaliação" para classificar de 1 a 5 as coordenações do paciente.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Visual Chronological line progression of averages */}
                    <div className={`p-5 rounded-3xl border overflow-hidden ${
                      darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100'
                    }`}>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" /> Gráfico Cronológico de Desempenho
                      </h4>

                      <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        
                        {/* A very smart customized React-SVG line chart showing the progression of average motor vs social over dates! */}
                        <div className="flex-1 min-h-[140px] flex items-end justify-between px-4 pt-4 border-b border-l border-slate-200/80 dark:border-slate-800 relative bg-slate-50/40 dark:bg-slate-900/40 p-3 rounded-2xl">
                          {/* Grid Helper Lines */}
                          <div className="absolute left-0 right-0 top-1/4 border-t border-slate-150/40 dark:border-slate-800/40 pointer-events-none"></div>
                          <div className="absolute left-0 right-0 top-2/4 border-t border-slate-150/40 dark:border-slate-800/40 pointer-events-none"></div>
                          <div className="absolute left-0 right-0 top-3/4 border-t border-slate-150/40 dark:border-slate-800/40 pointer-events-none"></div>

                          {patientAssessments.slice().reverse().map((ass, i) => {
                            const motorAvg = (ass.coord + ass.equilibrio + ass.mobilidade + ass.forca + ass.motricidadeFina) / 5;
                            const socialAvg = (ass.interacao + ass.comunicacao + ass.participacaoGrupo) / 3;
                            
                            // Map score 1-5 to percentage height
                            const motorHeight = `${(motorAvg / 5) * 100}%`;
                            const socialHeight = `${(socialAvg / 5) * 100}%`;

                            return (
                              <div key={ass.id} className="flex-1 flex flex-col items-center justify-end px-1 h-full z-10">
                                <div className="w-full flex justify-center gap-1 items-end h-[100px] mb-2">
                                  {/* Motor score cylinder */}
                                  <div 
                                    style={{ height: motorHeight }}
                                    className="w-3 bg-teal-500 rounded-t-sm hover:brightness-110 transition-all cursor-crosshair relative group"
                                  >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                      Motor: {motorAvg.toFixed(1)} / 5
                                    </div>
                                  </div>
                                  
                                  {/* Social score cylinder */}
                                  <div 
                                    style={{ height: socialHeight }}
                                    className="w-3 bg-indigo-500 rounded-t-sm hover:brightness-110 transition-all cursor-crosshair relative group"
                                  >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                      Social: {socialAvg.toFixed(1)} / 5
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[9px] font-extrabold text-slate-400">
                                  {new Date(ass.date + 'T12:00:00').toLocaleDateString('pt-BR', {month: 'short', year: '2-digit'})}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Chart Legend Info block */}
                        <div className="w-full md:w-56 space-y-3">
                          <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Legenda do Gráfico</p>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2 font-bold">
                              <span className="w-3 h-3 bg-teal-500 rounded-lg"></span>
                              <span>Desenvolvimento Motor (Méd.)</span>
                            </div>
                            <p className="text-[10px] text-slate-400 pl-5 leading-normal">Médias de coordenação, equilíbrio, mobilidade ativa, força física e precisão.</p>
                            
                            <div className="flex items-center gap-2 font-bold pt-1">
                              <span className="w-3 h-3 bg-indigo-500 rounded-lg"></span>
                              <span>Desenvolvimento Social (Méd.)</span>
                            </div>
                            <p className="text-[10px] text-slate-400 pl-5 leading-normal">Médias de engajamento do grupo, comunicação expressa e socialização.</p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Detailed Cronological assessments ratings list card */}
                    <div className="space-y-4">
                      {patientAssessments.map((ass) => {
                        return (
                          <div
                            key={ass.id}
                            className={`p-5 rounded-2xl border space-y-4 ${
                              darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-150'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-500" />
                                <h4 className="text-xs font-black text-slate-850 dark:text-white">
                                  Avaliação de Metas Clínicas
                                </h4>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">
                                Realizada em {new Date(ass.date + 'T12:00:00').toLocaleDateString('pt-BR')} por {ass.author}
                              </span>
                            </div>

                            {/* Ratings metrics grid breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                              
                              {/* Motor Section list */}
                              <div className="space-y-2.5">
                                <p className="font-extrabold text-teal-600 dark:text-teal-400 text-[10px] uppercase tracking-wider">💪 Desenvolvimento Motor</p>
                                
                                {[
                                  { val: ass.coord, lbl: 'Coordenação Ampla' },
                                  { val: ass.equilibrio, lbl: 'Equilíbrio Dinâmico' },
                                  { val: ass.mobilidade, lbl: 'Mobilidade / Flexibilidade' },
                                  { val: ass.forca, lbl: 'Força Muscular' },
                                  { val: ass.motricidadeFina, lbl: 'Motricidade Fina / Pinça' }
                                ].map((item) => (
                                  <div key={item.lbl} className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.lbl}</span>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map((_, idx) => (
                                        <span 
                                          key={idx} 
                                          className={`w-3.5 h-3.5 rounded-full ${
                                            idx < item.val ? 'bg-teal-500 text-white' : 'bg-slate-205 dark:bg-slate-800'
                                          }`}
                                        />
                                      ))}
                                      <span className="ml-1.5 font-bold text-slate-800 dark:text-slate-200">{item.val}/5</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Social Section list */}
                              <div className="space-y-2.5">
                                <p className="font-extrabold text-indigo-500 text-[10px] uppercase tracking-wider">🤝 Desenvolvimento Social</p>
                                
                                {[
                                  { val: ass.interacao, lbl: 'Interação Social' },
                                  { val: ass.comunicacao, lbl: 'Comunicação Verbal / Gestos' },
                                  { val: ass.participacaoGrupo, lbl: 'Participação em Grupo' }
                                ].map((item) => (
                                  <div key={item.lbl} className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.lbl}</span>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map((_, idx) => (
                                        <span 
                                          key={idx} 
                                          className={`w-3.5 h-3.5 rounded-full ${
                                            idx < item.val ? 'bg-indigo-500 text-white' : 'bg-slate-205 dark:bg-slate-800'
                                          }`}
                                        />
                                      ))}
                                      <span className="ml-1.5 font-bold text-slate-800 dark:text-slate-200">{item.val}/5</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Free evaluations text logs */}
                            <div className="bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">Notas Evolutivas Escritas:</span>
                              <p className="text-xs text-slate-650 dark:text-slate-350 italic font-medium">"{ass.notes}"</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: Participation lists in Events (Módulo 5) */}
            {activeProfileSubTab === 'participacao' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                    Histórico de Participação em Eventos Terapêuticos
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Lista de eventos para os quais a criança obteve inscrição aprovada na clínica.</p>
                </div>

                <div className="space-y-3">
                  {patientRegistrations.length === 0 ? (
                    <div className={`p-8 text-center rounded-2xl border ${
                      darkMode ? 'border-slate-850 text-slate-500' : 'border-slate-100 text-slate-400'
                    }`}>
                      <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2.5" />
                      <p className="text-xs font-bold italic">Nenhum evento registrado no currículo do paciente.</p>
                      <p className="text-[10px] mt-1 max-w-sm mx-auto">Vá para a aba de Eventos, clique em "Copiar Link Público" e simule a matrícula da criança em um evento!</p>
                    </div>
                  ) : (
                    patientRegistrations.map((reg) => {
                      const matchedEvent = events.find(e => e.id === reg.eventId);
                      if (!matchedEvent) return null;
                      
                      const attendanceEntry = attendances.find(
                        a => a.eventId === matchedEvent.id && a.patientId === activePatient.id
                      );
                      const isPresent = attendanceEntry ? attendanceEntry.present : null;
                      
                      return (
                        <div
                          key={reg.id}
                          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                              🎟️ Inscrição Aprovada ({reg.registrationNumber})
                            </span>
                            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                              {matchedEvent.name}
                            </h4>
                            <p className="text-[10px] font-semibold text-slate-500">
                              🎯 Tema: {matchedEvent.theme} • {new Date(matchedEvent.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </p>
                          </div>

                          {/* Attendance Presence Status Indicators */}
                          <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                            <span className="text-[9px] font-bold text-slate-400 block p-px">Presença no Evento:</span>
                            {isPresent === null ? (
                              <span className="text-[10px] font-black uppercase text-amber-550 bg-amber-500/10 px-2.5 py-1 rounded-full">
                                ⏳ Pendente de Chamada
                              </span>
                            ) : isPresent ? (
                              <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Presente
                              </span>
                            ) : (
                              <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full">
                                ❌ Ausente
                              </span>
                            )}
                            
                            {attendanceEntry?.notes && (
                              <p className="text-[10px] text-slate-450 italic mt-1.5 bg-slate-900/20 p-2 rounded-lg text-left">
                                "{attendanceEntry.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 4: Home care workouts & prescriptions */}
            {activeProfileSubTab === 'prescricoes_casa' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-500/5 p-4 rounded-3xl border border-teal-500/10">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                      🏠 Trabalhos para Casa & Receitas de Apoio
                    </h3>
                    <p className="text-xs text-slate-450">
                      Crie treinos psicomotores lúdicos e receitas para realizar em casa com os pais para melhorar o desenvolvimento de <strong>{activePatient.name}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddPrescForm(!showAddPrescForm)}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Prescrever Treino/Receita
                  </button>
                </div>

                {/* Toast alerts for simulated messages */}
                {whatsSentToast.show && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-2xl text-xs flex items-center gap-2.5 animate-bounce">
                    <span>📲</span>
                    <span className="font-bold">{whatsSentToast.msg}</span>
                  </div>
                )}

                {/* Inline Prescription creation form */}
                {showAddPrescForm && (
                  <div className={`p-5 rounded-3xl border space-y-4 animate-in slide-in-from-top-4 duration-300 ${
                    darkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-black uppercase text-slate-400">Nova Prescrição para Casa</h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <span>💡 Preencher com Template Clínico:</span>
                        <select
                          onChange={(e) => {
                            const idx = parseInt(e.target.value);
                            if (isNaN(idx)) return;
                            const template = HOME_TEMPLATES[idx];
                            setNewPrescTitle(template.title);
                            setNewPrescType(template.type);
                            setNewPrescInstructions(template.instructions);
                            setNewPrescFrequency(template.frequency);
                          }}
                          className={`rounded px-1.5 py-0.5 outline-none border ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <option value="">Selecione...</option>
                          {HOME_TEMPLATES.map((tpl, i) => (
                            <option key={i} value={i}>{tpl.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* PrescType */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Tarefa</label>
                        <select
                          value={newPrescType}
                          onChange={(e) => setNewPrescType(e.target.value as any)}
                          className={`w-full text-xs font-semibold rounded-xl px-3 py-2 outline-none border transition-all ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <option value="Treino Psicomotor">🏃 Treino Psicomotor de Fortalecimento</option>
                          <option value="Receita">💊 Orientação / Receituário de Apoio</option>
                        </select>
                      </div>

                      {/* Recommend Frequency */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Frequência Recomendada</label>
                        <input
                          type="text"
                          value={newPrescFrequency}
                          onChange={(e) => setNewPrescFrequency(e.target.value)}
                          placeholder="Ex: Diário, 3x por semana antes do sono"
                          className={`w-full text-xs font-semibold rounded-xl px-3 py-2 outline-none border transition-all ${
                            darkMode ? 'bg-slate-850 border-slate-705 text-white' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Presc Title */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título da Atividade</label>
                      <input
                        type="text"
                        value={newPrescTitle}
                        onChange={(e) => setNewPrescTitle(e.target.value)}
                        placeholder="Ex: Pular Obstáculos no Corredor"
                        className={`w-full text-xs font-bold rounded-xl px-3 py-2 outline-none border transition-all ${
                          darkMode ? 'bg-slate-855 border-slate-705 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    {/* Presc Instructions */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Instruções Passo a Passo para os Pais</label>
                      <textarea
                        rows={3}
                        value={newPrescInstructions}
                        onChange={(e) => setNewPrescInstructions(e.target.value)}
                        placeholder="Descreva exatamente como o pai ou a mãe devem incentivar a criança e quais materiais utilizar..."
                        className={`w-full text-xs font-semibold rounded-xl px-3 py-2.5 outline-none border transition-all ${
                          darkMode ? 'bg-slate-855 border-slate-705 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShowAddPrescForm(false)}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl border ${
                          darkMode ? 'bg-slate-800 border-slate-705 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (!newPrescTitle || !newPrescInstructions) {
                            alert('Insira título e instruções para salvar.');
                            return;
                          }
                          const newPresc: HomePrescription = {
                            id: `hp-${Date.now()}`,
                            patientId: activePatient.id,
                            type: newPrescType,
                            title: newPrescTitle,
                            instructions: newPrescInstructions,
                            recommendedFrequency: newPrescFrequency,
                            createdAt: new Date().toISOString().split('T')[0],
                            sentViaWhatsApp: false
                          };
                          setHomePrescriptions([newPresc, ...homePrescriptions]);
                          setNewPrescTitle('');
                          setNewPrescInstructions('');
                          setNewPrescFrequency('Diário');
                          setShowAddPrescForm(false);
                        }}
                        className="px-4 py-2 bg-teal-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-teal-600"
                      >
                        Gravar Atividade de Casa
                      </button>
                    </div>
                  </div>
                )}

                {/* Displaying active prescriptions list */}
                <div className="space-y-4">
                  {patientHomePrescriptions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
                      <Bookmark className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
                      <p className="text-xs font-semibold italic text-slate-600 dark:text-slate-455">Nenhum de casa cadastrado para essa criança.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Crie exercícios ou use nossos modelos de fortalecimento lúdicos e receituários clicando em "Prescrever".</p>
                    </div>
                  ) : (
                    patientHomePrescriptions.map((hp) => {
                      const isPre = hp.type === 'Receita';
                      return (
                        <div
                          key={hp.id}
                          className={`p-5 rounded-3xl border relative transition-colors ${
                            darkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-[#F9F8F3]/50 border-slate-150 hover:bg-[#F9F8F3]/80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5 w-full">
                              {/* Type badge */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  isPre 
                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' 
                                    : 'bg-teal-550/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400'
                                }`}>
                                  {isPre ? <FileText className="w-3 h-3" /> : <Dumbbell className="w-3 h-3" />}
                                  {hp.type}
                                </span>
                                {hp.sentViaWhatsApp ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-400/10 text-emerald-600 px-2.5 py-0.5 rounded-full font-bold">
                                    ✓ Disparado no WhatsApp ({hp.sentDate ? new Date(hp.sentDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Hoje'})
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500/15 text-amber-600 px-2.5 py-0.5 rounded-full font-bold">
                                    ⏳ Aguardando Disparo
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm font-extrabold text-slate-850 dark:text-white mt-1">
                                {hp.title}
                              </h4>

                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 mt-2">
                                {hp.instructions}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-450 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span>🗓️ Prescrito em: {new Date(hp.createdAt + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                <span>•</span>
                                <span className="text-indigo-650 dark:text-indigo-400">⏳ Frequência: {hp.recommendedFrequency}</span>
                              </div>
                            </div>

                            {/* Actions block */}
                            <div className="flex items-center gap-2 self-end sm:self-start flex-shrink-0">
                              <button
                                onClick={() => {
                                  const configWa = currentClinic.whatsapp || localStorage.getItem('csm_whatsapp_linked');
                                  if (!configWa) {
                                    alert('⚠️ WhatsApp não configurado! Acesse SaaS Multi-Clínica -> Modos de Comunicação para conectar o celular oficial.');
                                    return;
                                  }
                                  
                                  // Update the prescription state to mark as sent
                                  const updated = homePrescriptions.map(p => {
                                    if (p.id === hp.id) {
                                      return { ...p, sentViaWhatsApp: true, sentDate: new Date().toISOString().split('T')[0] };
                                    }
                                    return p;
                                  });
                                  setHomePrescriptions(updated);
                                  
                                  // Success visual feedback
                                  const guardian = activePatient.guardianName || activePatient.motherName || 'Responsável';
                                  setWhatsSentToast({
                                    show: true,
                                    msg: `Ficha "${hp.title}" transmitida com sucesso para ${guardian} no número ${configWa}!`
                                  });
                                  setTimeout(() => setWhatsSentToast({show: false, msg: ''}), 6000);
                                }}
                                className={`px-2.5 py-1.5 text-[10px] font-black rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                                  hp.sentViaWhatsApp
                                    ? 'bg-emerald-500 text-white border-emerald-500 font-extrabold shadow-sm'
                                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-205'
                                }`}
                                title="Enviar Atividade de Fortalecimento via WhatsApp para os Pais"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> 
                                {hp.sentViaWhatsApp ? 'Reenviar WhatsApp' : 'Disparar WhatsApp'}
                              </button>
                              
                              <button
                                onClick={() => {
                                  if (confirm('Tem certeza de que deseja remover esta prescrição de casa?')) {
                                    const filtered = homePrescriptions.filter(p => p.id !== hp.id);
                                    setHomePrescriptions(filtered);
                                  }
                                }}
                                className="p-1.5 px-2 bg-rose-50 dark:bg-rose-500/10 text-rose-505 hover:bg-rose-100 rounded-lg transition-all"
                                title="Apagar Registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold italic">Cadastre seu primeiro paciente no botão de CRM lateral.</p>
          </div>
        )}
      </div>

      {/* MODAL: Add Patient child profile manually */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-205'
          }`}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-transparent to-transparent">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                👦 Cadastrar Criança de Forma Manual
              </h3>
              <button
                onClick={() => setShowAddPatientModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePatientSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <h4 className="text-[10px] font-black text-teal-600 block uppercase tracking-wider pb-1.5 border-b border-slate-50 dark:border-slate-850">1. Cadastro da Criança</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome Completo *</label>
                  <input
                    type="text" required value={pName} onChange={(e) => setPName(e.target.value)}
                    placeholder="Enzo Gabriel Santos"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sexo *</label>
                  <select
                    value={pGender} onChange={(e) => setPGender(e.target.value as any)}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Festa de Nascimento *</label>
                  <input
                    type="date" required value={pBirthDate} onChange={(e) => setPBirthDate(e.target.value)}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CPF do Responsável *</label>
                  <input
                    type="text" required value={pCpf} onChange={(e) => setPCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Telefone / WhatsApp *</label>
                  <input
                    type="text" required value={pPhone} onChange={(e) => setPPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
              </div>

              <h4 className="text-[10px] font-black text-indigo-500 block uppercase tracking-wider pt-3 pb-1.5 border-b border-slate-50 dark:border-slate-850">2. Pais & Contatos</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome da Mãe</label>
                  <input
                    type="text" value={pMother} onChange={(e) => setPMother(e.target.value)}
                    placeholder="Mãe da criança"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome do Pai</label>
                  <input
                    type="text" value={pFather} onChange={(e) => setPFather(e.target.value)}
                    placeholder="Pai da criança"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsável Legal *</label>
                  <input
                    type="text" required value={pGuardian} onChange={(e) => setPGuardian(e.target.value)}
                    placeholder="Quem trará a criança"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email de Contato *</label>
                  <input
                    type="email" required value={pEmail} onChange={(e) => setPEmail(e.target.value)}
                    placeholder="contato.responsavel@dominio.com"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
              </div>

              <h4 className="text-[10px] font-black text-rose-500 block uppercase tracking-wider pt-3 pb-1.5 border-b border-slate-50 dark:border-slate-850">3. Ficha Clínica & Antecedentes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Laudo Principal / Diagnóstico *</label>
                  <input
                    type="text" value={pDiag} onChange={(e) => setPDiag(e.target.value)}
                    placeholder="Ex: Paralisia Cerebral Espástica Cid G80"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Limitações Gerais</label>
                  <input
                    type="text" value={pLim} onChange={(e) => setPLim(e.target.value)}
                    placeholder="Auxílios de marcha ou restrições clínicas"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alergias Alimentares / Remédios</label>
                  <input
                    type="text" value={pAller} onChange={(e) => setPAller(e.target.value)}
                    placeholder="Nenhuma ou detalhar medicamentos perigosos"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Medicamentos de Uso Contínuo</label>
                  <input
                    type="text" value={pMeds} onChange={(e) => setPMeds(e.target.value)}
                    placeholder="Nome dos remédios que utiliza em casa"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button" onClick={() => setShowAddPatientModal(false)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl border ${
                    darkMode ? 'bg-slate-850 border-slate-750 text-slate-350' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-600 text-white transition-all cursor-pointer"
                >
                  Salvar Paciente no CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Evolutionary Assessment scores 1-5 (Módulo 6) */}
      {showAddAssessmentModal && activePatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-xl rounded-3xl border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-205'
          }`}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                📊 Registrar Evolução Terapêutica de {activePatient.name}
              </h3>
              <button
                onClick={() => setShowAddAssessmentModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssessmentSubmit} className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
              <div className="space-y-4">
                
                {/* Motor parameters slider controls */}
                <h4 className="text-[10px] font-black tracking-wider uppercase text-teal-600 dark:text-teal-400">Desenvolvimento Motor (Avaliar de 1 a 5)</h4>
                <div className="space-y-3.5">
                  {[
                    { val: evalCoord, set: setEvalCoord, lbl: 'Coordenação Ampla', desc: 'Recrutamento de cadeias, simetria nos movimentos.' },
                    { val: evalEquilibrio, set: setEvalEquilibrio, lbl: 'Equilíbrio Dinâmico', desc: 'Transferência de peso, controle postural e prancha.' },
                    { val: evalMobilidade, set: setEvalMobilidade, lbl: 'Mobilidade Ativa', desc: 'Grau de alcance articular e amplitude.' },
                    { val: evalForca, set: setEvalForca, lbl: 'Força Muscular', desc: 'Capacidade de resistência contra gravidade.' },
                    { val: evalFin, set: setEvalFin, lbl: 'Motricidade Fina / Pinça', desc: 'Preensão palmar, coordenação bimanual lúdica.' }
                  ].map((x) => (
                    <div key={x.lbl} className="space-y-1.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{x.lbl} <span className="text-[10px] font-semibold text-slate-400 block">{x.desc}</span></span>
                        <span className="text-teal-650 dark:text-teal-400 font-extrabold text-sm">{x.val} / 5</span>
                      </div>
                      <input 
                        type="range" min="1" max="5" value={x.val} onChange={(e) => x.set(parseInt(e.target.value))}
                        className="w-full accent-teal-500 bg-slate-205 dark:bg-slate-800 h-1 rounded-sm cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                {/* Social parameters slider controls */}
                <h4 className="text-[10px] font-black tracking-wider uppercase text-indigo-500 pt-2 border-t border-slate-100 dark:border-slate-800">Desenvolvimento Social (Avaliar de 1 a 5)</h4>
                <div className="space-y-3.5">
                  {[
                    { val: evalInter, set: setEvalInter, lbl: 'Interação Social', desc: 'Contato visual, empatia compartilhada lúdica.' },
                    { val: evalCom, set: setEvalCom, lbl: 'Estilo de Comunicação', desc: 'Expressão de sentimentos, vocalização ativa.' },
                    { val: evalGrp, set: setEvalGrp, lbl: 'Participação em Grupo', desc: 'Acata regras do terapeuta pediátrico.' }
                  ].map((x) => (
                    <div key={x.lbl} className="space-y-1.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{x.lbl} <span className="text-[10px] font-semibold text-slate-400 block">{x.desc}</span></span>
                        <span className="text-indigo-550 dark:text-indigo-400 font-extrabold text-sm">{x.val} / 5</span>
                      </div>
                      <input 
                        type="range" min="1" max="5" value={x.val} onChange={(e) => x.set(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-205 dark:bg-slate-800 h-1 rounded-sm cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                {/* Clinical Notes details */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notas Observacionais Livres</label>
                  <textarea
                    value={evalNotes} onChange={(e) => setEvalNotes(e.target.value)}
                    placeholder="Descreva conquistas motoras ou gatilhos comportamentais demonstrados durante os testes..."
                    rows={2}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border resize-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-555' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-teal-400 text-slate-850'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button" onClick={() => setShowAddAssessmentModal(false)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl border ${
                    darkMode ? 'bg-slate-850 border-slate-750 text-slate-350' : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-600 text-white transition-all cursor-pointer"
                >
                  Registrar Ficha 1-5
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Prontuário Evolution (Módulo 7) */}
      {showAddRecordModal && activePatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-xl rounded-3xl border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-205'
          }`}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                ✍️ Escrever Evolução ou Anamnese Clinica
              </h3>
              <button
                onClick={() => setShowAddRecordModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título da Entrada *</label>
                  <input
                    type="text" required value={recTitle} onChange={(e) => setRecTitle(e.target.value)}
                    placeholder="Ex: Resumo de evolução motora quinzenal ou Ficha de Anamnese"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' : 'bg-slate-50 border-slate-200 focus:bg-white text-slate-850'
                    }`}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Entrada *</label>
                  <select
                    value={recType} onChange={(e) => setRecType(e.target.value as any)}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-555' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  >
                    <option value="Anamnese">Anamnese</option>
                    <option value="Evolução">Evolução</option>
                    <option value="Avaliação">Avaliação</option>
                    <option value="Relatório">Relatório</option>
                    <option value="Documento">Documento</option>
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-black text-rose-500">Conteúdo do Registro Clínico *</label>
                  <textarea
                    required value={recDesc} onChange={(e) => setRecDesc(e.target.value)}
                    placeholder="Escreva com detalhes tecnicos toda a evolução, queixas dos familiares, metas do planejamento motor e respostas aos estimulos aplicados na sessão..."
                    rows={5}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border resize-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 focus:bg-white text-slate-850'
                    }`}
                  />
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Anexar Laudo ou Arquivo Digital (Simulado)</label>
                  <input
                    type="text" value={recAttachmentName} onChange={(e) => setRecAttachmentName(e.target.value)}
                    placeholder="laudo_exame_neuromuscular.pdf"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' : 'bg-slate-50 border-slate-200 focus:bg-white text-slate-850'
                    }`}
                  />
                  <span className="text-[9px] text-slate-400">Escreva o nome de arquivo com extensão para criar o link simbólico de laudo clinico (Ex: exame_março.jpg).</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button" onClick={() => setShowAddRecordModal(false)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl border ${
                    darkMode ? 'bg-slate-850 border-slate-700 text-slate-350' : 'bg-white border-slate-205 text-slate-500'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-600 text-white transition-all cursor-pointer"
                >
                  Registrar Entrada Prontuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
