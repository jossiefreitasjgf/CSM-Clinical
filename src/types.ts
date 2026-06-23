export type UserRole = 'Admin' | 'Fisio' | 'Recepcao' | 'Desenvolvedor';

export interface Clinic {
  id: string;
  name: string;
  document: string;
  address: string;
  phone: string;
  plan: 'Bronze' | 'Prata' | 'Ouro';
  status: 'Ativo' | 'Inativo';
  responsibleDoctor?: string;
  financialManager?: string;
}

export interface SystemUser {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
  password?: string;
}

export interface TherapeuticEvent {
  id: string;
  clinicId: string;
  name: string;
  theme: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  maxParticipants: number;
  status: 'Aberto' | 'Encerrado' | 'Cancelado';
  image?: string;
}

export interface Patient {
  id: string;
  clinicId: string;
  photo: string;
  name: string;
  birthDate: string;
  gender: 'M' | 'F' | 'Outro';
  fatherName: string;
  motherName: string;
  guardianName: string;
  cpf: string;
  phone: string;
  whatsapp: string;
  email: string;
  diagnosis: string;
  limitations: string;
  allergies: string;
  medications: string;
  notes: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  clinicId: string;
  eventId: string;
  childId: string;
  childName: string;
  parentName: string;
  registrationNumber: string;
  date: string;
  status: 'Pendente' | 'Aprovado' | 'Cancelado';
  paymentReceiptName: string;
  paymentReceiptSize: string;
  ageCalculated: number;
}

export interface Attendance {
  id: string;
  eventId: string;
  patientId: string;
  present: boolean;
  notes: string;
}

export interface EvolutionaryAssessment {
  id: string;
  patientId: string;
  date: string;
  author: string;
  // Desenvolvimento Motor (1-5)
  coord: number;
  equilibrio: number;
  mobilidade: number;
  forca: number;
  motricidadeFina: number;
  // Desenvolvimento Social (1-5)
  interacao: number;
  comunicacao: number;
  participacaoGrupo: number;
  notes: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  title: string;
  type: 'Anamnese' | 'Evolução' | 'Avaliação' | 'Relatório' | 'Documento';
  description: string;
  author: string;
  attachments?: { name: string; size: string; date: string }[];
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'Avaliação' | 'Fisioterapia Motor' | 'Fisioterapia Respiratória' | 'Estimulação Precoce' | 'Pilates Infantil' | 'Integração Sensorial';
  price: number;
  status: 'Agendado' | 'Confirmado' | 'Reagendado' | 'Cancelado' | 'Realizado';
}

export interface FinancialTransaction {
  id: string;
  clinicId: string;
  type: 'Receita' | 'Despesa';
  category: string;
  value: number;
  date: string;
  description: string;
  referenceId?: string; // event registration ID or appointment ID
}
