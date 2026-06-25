import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Baby, 
  User, 
  FileText, 
  Upload, 
  CheckCircle, 
  Download, 
  Printer, 
  ArrowLeft, 
  AlertCircle,
  FileCheck2,
  Calendar,
  Layers,
  MapPin,
  HeartPulse,
  Receipt
} from 'lucide-react';
import { TherapeuticEvent, Registration, Patient, FinancialTransaction } from '../types';
import { exportRegistrationReceiptPDF } from '../utils/exportUtils';

interface PublicRegistrationProps {
  events: TherapeuticEvent[];
  selectedEventId: string;
  onBackToCRM: () => void;
  onAddRegistration: (newPatient: Omit<Patient, 'id' | 'clinicId' | 'photo' | 'createdAt'>, registration: Omit<Registration, 'id' | 'clinicId' | 'registrationNumber' | 'date'>) => void;
  patients: Patient[];
}

export default function PublicRegistration({
  events,
  selectedEventId,
  onBackToCRM,
  onAddRegistration,
  patients
}: PublicRegistrationProps) {

  // Active step flow: 'Form' | 'Confirmation'
  const [step, setStep] = useState<'Form' | 'Confirmation'>('Form');
  
  // Find current Event details
  const currentEvent = events.find(e => e.id === selectedEventId);

  // Form Field States
  // 1. Dados da Criança
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<'M' | 'F' | 'Outro'>('M');

  // 2. Dados dos Responsáveis
  const [parentName, setParentName] = useState(''); // Mother
  const [fatherName, setFatherName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // 3. Informações Clínicas
  const [diagnosis, setDiagnosis] = useState('');
  const [limitations, setLimitations] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [notes, setNotes] = useState('');

  // 4. Pagamento Receipt
  const [receiptFile, setReceiptFile] = useState<{ name: string; size: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errMessage, setErrMessage] = useState('');

  // Confirmation Details (set after successful registration submit)
  const [finalRegistrationNumber, setFinalRegistrationNumber] = useState('');

  // Automatically calculate children's age (Módulo 2 requirement)
  useEffect(() => {
    if (!birthDate) {
      setAge(null);
      return;
    }
    const today = new Date();
    const birth = new Date(birthDate + 'T12:00:00');
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge >= 0 ? calculatedAge : 0);
  }, [birthDate]);

  // Handle autocomplete matching option to speed up test simulations
  const handleAutocompleteSimulation = (patientId: string) => {
    const p = patients.find(p => p.id === patientId);
    if (!p) return;
    setChildName(p.name);
    setBirthDate(p.birthDate);
    setGender(p.gender);
    setParentName(p.motherName);
    setFatherName(p.fatherName);
    setGuardianName(p.guardianName);
    setCpf(p.cpf);
    setPhone(p.phone);
    setWhatsapp(p.whatsapp);
    setEmail(p.email);
    setDiagnosis(p.diagnosis);
    setLimitations(p.limitations);
    setAllergies(p.allergies);
    setMedications(p.medications);
    setNotes(p.notes);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setErrMessage('');
      setIsUploading(true);
      setTimeout(() => {
        setReceiptFile({
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`
        });
        setIsUploading(false);
      }, 150);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;

    if (!childName || !birthDate || !guardianName || !phone || !email) {
      setErrMessage('Preencha todos os campos obrigatórios (*)');
      return;
    }

    if (!receiptFile) {
      setErrMessage('Por favor, faça o upload do comprovante de pagamento para prosseguir.');
      return;
    }

    const registrationNo = `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setFinalRegistrationNumber(registrationNo);

    // Dynamic callback to save child patient and register event subscription
    onAddRegistration(
      {
        name: childName,
        birthDate,
        gender,
        fatherName: fatherName || 'Não Informado',
        motherName: parentName || 'Não Informado',
        guardianName,
        cpf: cpf || 'Isento',
        phone,
        whatsapp: whatsapp || phone,
        email,
        diagnosis: diagnosis || 'Sem Diagnóstico Fechado',
        limitations: limitations || 'Nenhuma',
        allergies: allergies || 'Nenhuma',
        medications: medications || 'Nenhum',
        notes: notes || 'Cadastrado no formulário de inscrição pública.'
      },
      {
        eventId: currentEvent.id,
        childId: '', // To be filled by parent list aggregator
        childName,
        parentName: guardianName,
        status: 'Aprovado', // Approved automatically since payment receipt is attached (Finance registered instantly as paid)
        paymentReceiptName: receiptFile.name,
        paymentReceiptSize: receiptFile.size,
        ageCalculated: age || 0
      }
    );

    setStep('Confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentEvent) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 max-w-xl mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold">Evento não localizado</h3>
        <p className="text-sm text-slate-500">Este link de inscrição está incorreto ou foi cancelado pela clínica.</p>
        <button onClick={onBackToCRM} className="p-2 py-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl pr-4 pl-4 hover:bg-slate-200">
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Decentered Top Indicator */}
      <div className="bg-indigo-900 text-white py-3 px-4 text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span>Ambiente de Inscrição Oficial - Clínica Integrada CSM Clinical</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* Back control panel */}
        <button
          onClick={onBackToCRM}
          className="mb-6 flex items-center gap-1 text-xs font-bold text-slate-550 hover:text-slate-800 transition-colors bg-white hover:bg-slate-100 p-2.5 rounded-xl border border-slate-150"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel Administrativo
        </button>

        {step === 'Form' ? (
          <div className="space-y-6">
            
            {/* Event Profile Card banner */}
            <div className="bg-gradient-to-r from-teal-500 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 bg-white/5 rounded-full translate-x-12 -translate-y-12"></div>
              
              <div className="z-10 relative space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                  Inscrição Online Rápida
                </span>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{currentEvent.name}</h1>
                <p className="text-xs text-teal-100/90 font-semibold max-w-xl">🎯 {currentEvent.theme}</p>
                <p className="text-xs text-white/80 leading-relaxed max-w-2xl">{currentEvent.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs font-bold z-10 relative">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-300" />
                  <span>{new Date(currentEvent.date + 'T12:00:00').toLocaleDateString('pt-BR')} às {currentEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-300" />
                  <span className="truncate">{currentEvent.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-300" />
                  <span>Inscrição: R$ {currentEvent.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Sandbox Autocomplete Tool on top */}
            <div className="bg-amber-50 border border-amber-200/70 p-4 rounded-3xl">
              <div className="flex items-center gap-2 mb-2 text-amber-850">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Atalho de Simulação Terapêutica (Developer Tool)</h4>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed mb-3">
                Para fins de teste e demonstração do sistema, preencha os formulários automaticamente selecionando um dos pacientes pré-cadastrados na base clínica:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {patients.slice(0, 4).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleAutocompleteSimulation(p.id)}
                    className="p-1 px-3 text-[10px] font-extrabold bg-white border border-amber-300 hover:border-amber-600 rounded-lg hover:bg-amber-100/30 transition-colors"
                  >
                    ⚡ Simular {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Registration Form Frame */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
              
              {/* SECTION 1: Dados da Criança */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Baby className="w-5 h-5 text-teal-500" /> 1. Informações da Criança
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-12 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Nome Completo da Criança *
                    </label>
                    <input
                      type="text"
                      required
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Ex: Enzo Gabriel Santos"
                      className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                    />
                  </div>

                  <div className="sm:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Idade Calculada
                    </label>
                    <div className="w-full text-sm font-extrabold rounded-xl px-4 py-2.5 border border-slate-150 bg-slate-100 text-slate-700 flex items-center justify-between">
                      <span>{age !== null ? `${age} anos` : 'Defina a data'}</span>
                      <Sparkles className="w-4 h-4 text-teal-500 text-indigo-500" />
                    </div>
                  </div>

                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Sexo *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Dados dos Responsáveis */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="w-5 h-5 text-indigo-500" /> 2. Contatos & Responsáveis
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Nome da Mãe *
                    </label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Nome da mãe da criança"
                      className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Nome do Pai
                    </label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Nome do pai (opcional)"
                      className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Responsável Legal que irá acompanhar *
                    </label>
                    <input
                      type="text"
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Ex: Camila Ferreira Santos"
                      className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      CPF do Responsável *
                    </label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Telefone Celular *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      WhatsApp para receber lembretes *
                    </label>
                    <input
                      type="text"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Código + número (Ex: 11999999999)"
                      className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      E-mail do Responsável *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato.pais@email.com"
                      className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Informações Clínicas */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-100">
                  <HeartPulse className="w-5 h-5 text-rose-500" /> 3. Perfil Clínico do Paciente
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Diagnóstico Clínico / CID *
                    </label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Ex: Paralisia Cerebral Espástica, Autismo Level 2 support, Trissomia 21 ou Atraso Motor"
                      className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Limitações e Auxílios de Marcha
                      </label>
                      <input
                        type="text"
                        value={limitations}
                        onChange={(e) => setLimitations(e.target.value)}
                        placeholder="Ex: Faz uso de andador anterior, órtese AFO..."
                        className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Alergias Alimentares ou Medicamentosas
                      </label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="Caso tenha alergias (ex: Dipirona, Corantes)..."
                        className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Medicamentos de Uso Contínuo
                      </label>
                      <input
                        type="text"
                        value={medications}
                        onChange={(e) => setMedications(e.target.value)}
                        placeholder="Especificar dosagem e frequência (Baclofeno)..."
                        className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Observações Clínicas Gerais
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Qualquer outro detalhe de comportamento, fobias..."
                        className="w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-teal-500 focus:bg-white transition-all bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Pagamento PIX e Upload do Comprovante (Módulo 2) */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Receipt className="w-5 h-5 text-emerald-500" /> 4. Pagamento e Validação da Chave PIX
                </h3>

                <div className={`p-5 rounded-2xl border text-xs ${
                  'bg-emerald-50 border-emerald-150 text-emerald-800'
                }`}>
                  <p className="font-extrabold text-xs mb-1">🔑 Chave PIX para Depósito de Inscrição:</p>
                  <p className="font-mono bg-white inline-block px-3 py-1.5 rounded-lg border border-emerald-250 font-black tracking-wide select-all text-sm">
                    pix@fisiokidscrm.com.br
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed">
                    Valor total da Inscrição para este Evento: <strong>R$ {currentEvent.price.toLocaleString('pt-BR')}</strong>. Faça a transferência e anexe o comprovante abaixo para a recepção aprovar sua presença.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Anexar Comprovante do Transação (PDF, JPG ou PNG) *
                  </label>
                  
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl hover:border-teal-500 transition-colors p-6 text-center cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleSimulatedFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    
                    {isUploading ? (
                      <div className="space-y-2 py-2">
                        <div className="inline-block w-8 h-8 rounded-full border-4 border-teal-500/10 border-t-teal-500 animate-spin"></div>
                        <p className="text-xs text-slate-500 font-bold">Processando arquivo do comprovante...</p>
                      </div>
                    ) : receiptFile ? (
                      <div className="space-y-2 py-1 text-emerald-600">
                        <FileCheck2 className="w-10 h-10 mx-auto text-emerald-500" />
                        <h4 className="text-xs font-extrabold truncate max-w-[280px] mx-auto">{receiptFile.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                          {receiptFile.size} - Carregado com Sucesso!
                        </span>
                        <p className="text-[10px] text-slate-400">Clique ou arraste outro para substituir</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-slate-400 py-2">
                        <Upload className="w-9 h-9 mx-auto text-slate-300" />
                        <p className="text-xs font-bold text-slate-650">Arraste ou clique para selecionar arquivo</p>
                        <p className="text-[10px] text-slate-430 leading-snug">Imagens (JPG, PNG) ou Documentos (PDF) ate 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              {errMessage && (
                <div className="p-3.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" /> {errMessage}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onBackToCRM}
                  className="px-5 py-3 rounded-2xl border border-slate-250 text-slate-500 bg-white hover:bg-slate-50 text-xs font-bold transition-all"
                >
                  Cancelar Inscrição
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-lg shadow-teal-500/15 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Finalizar Inscrição Online
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* MÓDULO 3: Automatic confirmation & printable badge */
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-xl max-w-xl mx-auto space-y-6 text-center">
              
              {/* Success Badge */}
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">Inscrição Enviada com Sucesso!</h2>
                <div className="inline-block bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                    Inscrição: <strong>{finalRegistrationNumber}</strong>
                  </span>
                </div>
              </div>

              {/* Real Email sent notice */}
              <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-100 flex items-center justify-center gap-2 leading-relaxed">
                <FileCheck2 className="w-4 h-4 flex-shrink-0 text-emerald-600 animate-pulse" />
                <span>Confirmação enviada para <strong>{email}</strong> com os detalhes e QR Code.</span>
              </div>

              {/* Printable Ticket Voucher (Módulo 3 guidelines) */}
              <div id="registration-voucher" className="border border-slate-205 rounded-3xl overflow-hidden shadow-sm text-left">
                <div className="bg-gradient-to-r from-teal-500 to-teal-650 p-4 text-white flex justify-between items-center">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-teal-100">Comprovante de Pré-Inscrição</h4>
                    <p className="text-sm font-extrabold truncate max-w-[200px]">{currentEvent.name}</p>
                  </div>
                  <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-lg">
                    {finalRegistrationNumber}
                  </span>
                </div>

                <div className="p-5 space-y-4 text-xs font-bold bg-slate-50/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Criança / Paciente</p>
                      <p className="text-slate-800 mt-0.5 font-extrabold">👦 {childName}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{age} anos ({gender === 'M' ? 'Masculino' : 'Feminino'})</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Responsável Cadastrado</p>
                      <p className="text-slate-800 mt-0.5 font-extrabold">👤 {guardianName}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Te.: {phone}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Data & Horário</p>
                      <p className="text-slate-700 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {new Date(currentEvent.date + 'T12:00:00').toLocaleDateString('pt-BR')} às {currentEvent.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Local Clínico</p>
                      <p className="text-slate-700 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {currentEvent.location}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Status Financeiro</p>
                      <span className="inline-block mt-1 bg-emerald-500/10 text-emerald-600 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase">
                        Pago e Confirmado
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Valor Investido</p>
                      <span className="text-sm font-black text-slate-800">
                        R$ {currentEvent.price.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons to print or down */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 py-3.5 text-xs font-bold rounded-2xl transition-all"
                >
                  <Printer className="w-4 h-4 text-slate-500" /> Imprimir Comprovante
                </button>
                <button
                  onClick={() => {
                    const regObj: Registration = {
                      id: 'temp',
                      clinicId: 'temp',
                      eventId: currentEvent.id,
                      childId: 'temp',
                      childName: childName,
                      parentName: guardianName,
                      registrationNumber: finalRegistrationNumber,
                      date: new Date().toISOString().substring(0, 10),
                      status: 'Aprovado',
                      paymentReceiptName: 'comprovante_pix.pdf',
                      paymentReceiptSize: '120 KB',
                      ageCalculated: Number(age)
                    };
                    exportRegistrationReceiptPDF(regObj, currentEvent, 'CSM CLINICAL');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 text-xs font-bold rounded-2xl transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" /> Baixar Comprovante PDF
                </button>
              </div>

              <div className="pt-4 border-t border-slate-150">
                <button
                  onClick={onBackToCRM}
                  className="w-full bg-teal-500 text-white hover:bg-teal-600 py-3 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-teal-500/10"
                >
                  Voltar para Área de Administração
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
