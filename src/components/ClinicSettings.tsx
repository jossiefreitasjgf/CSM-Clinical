import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  Phone, 
  HelpCircle,
  FileCheck2,
  Gem,
  User,
  Mail,
  UserCheck,
  Trash2,
  Shield,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { Clinic, SystemUser, UserRole } from '../types';

interface ClinicSettingsProps {
  clinics: Clinic[];
  currentClinic: Clinic;
  onAddClinic: (clinic: Omit<Clinic, 'id'>) => void;
  onUpdateClinicPlan: (id: string, plan: Clinic['plan']) => void;
  onUpdateClinicDetails: (id: string, patch: Partial<Clinic>) => void;
  systemUsers: SystemUser[];
  onAddSystemUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => void;
  onUpdateSystemUser: (id: string, patch: Partial<SystemUser>) => void;
  onDeleteSystemUser: (id: string) => void;
  setCurrentClinic: (clinic: Clinic) => void;
  darkMode: boolean;
}

export default function ClinicSettings({
  clinics,
  currentClinic,
  onAddClinic,
  onUpdateClinicPlan,
  onUpdateClinicDetails,
  systemUsers,
  onAddSystemUser,
  onUpdateSystemUser,
  onDeleteSystemUser,
  setCurrentClinic,
  darkMode
}: ClinicSettingsProps) {

  const [showAddClinicModal, setShowAddClinicModal] = useState(false);

  // Form states: New Clinic
  const [cName, setCName] = useState('');
  const [cDoc, setCDoc] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [cPlan, setCPlan] = useState<Clinic['plan']>('Bronze');
  const [cDoctor, setCDoctor] = useState('');
  const [cFinancial, setCFinancial] = useState('');

  // Active Clinic Settings Management (Address, Doctor, Financial Manager)
  const [detailsAddress, setDetailsAddress] = useState(currentClinic.address || '');
  const [detailsDoctor, setDetailsDoctor] = useState(currentClinic.responsibleDoctor || '');
  const [detailsFinancial, setDetailsFinancial] = useState(currentClinic.financialManager || '');
  const [detailsPhone, setDetailsPhone] = useState(currentClinic.phone || '');
  const [detailsDoc, setDetailsDoc] = useState(currentClinic.document || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Users State Management
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Fisio');
  const [newUserPassword, setNewUserPassword] = useState('1234');
  const [userSuccess, setUserSuccess] = useState(false);

  // WhatsApp State Management
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('csm_whatsapp_linked') || '';
    }
    return '';
  });
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('csm_whatsapp_linked');
    }
    return false;
  });

  // Sync edit inputs when active clinic changes
  useEffect(() => {
    setDetailsAddress(currentClinic.address || '');
    setDetailsDoctor(currentClinic.responsibleDoctor || '');
    setDetailsFinancial(currentClinic.financialManager || '');
    setDetailsPhone(currentClinic.phone || '');
    setDetailsDoc(currentClinic.document || '');
    setSaveSuccess(false);
  }, [currentClinic]);

  const handleSubmitClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cDoc || !cPhone) return;

    onAddClinic({
      name: cName,
      document: cDoc,
      phone: cPhone,
      address: cAddress || 'Endereço Comercial da Clínica',
      plan: cPlan,
      status: 'Ativo',
      responsibleDoctor: cDoctor || 'Não especificado',
      financialManager: cFinancial || 'Não especificado'
    });

    // Reset Form
    setCName('');
    setCDoc('');
    setCPhone('');
    setCAddress('');
    setCPlan('Bronze');
    setCDoctor('');
    setCFinancial('');
    setShowAddClinicModal(false);
  };

  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClinicDetails(currentClinic.id, {
      address: detailsAddress,
      responsibleDoctor: detailsDoctor,
      financialManager: detailsFinancial,
      phone: detailsPhone,
      document: detailsDoc
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    onAddSystemUser({
      clinicId: currentClinic.id,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'Ativo',
      password: newUserPassword
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Fisio');
    setNewUserPassword('1234');
    setUserSuccess(true);
    setTimeout(() => setUserSuccess(false), 3000);
  };

  const handleToggleUserStatus = (user: SystemUser) => {
    const nextStatus = user.status === 'Ativo' ? 'Inativo' : 'Ativo';
    onUpdateSystemUser(user.id, { status: nextStatus });
  };

  const handleUpgradePlan = (plan: Clinic['plan']) => {
    onUpdateClinicPlan(currentClinic.id, plan);
    alert(`Sucesso! Sua clínica ${currentClinic.name} foi atualizada para o plano ${plan}. As novas cobranças de fatura já estão programadas.`);
  };

  // Filter users belonging only to active clinic
  const activeClinicUsers = systemUsers.filter(u => u.clinicId === currentClinic.id);

  return (
    <div id="clinic-settings-module" className="space-y-8 pb-16">
      {/* Editorial Header / Masthead */}
      <header className="pb-6 border-b border-[#E5E3DB] dark:border-[#2E3832] flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8A9F94] dark:text-[#9BB0A5] mb-2 font-sans">
            Configurações Administrativas
          </p>
          <h1 className="text-4xl font-serif italic text-[#2D312E] dark:text-white">
            CSM Clinical & Multi-Clínicas
          </h1>
        </div>
        <button
          id="btn-add-clinic-modal"
          onClick={() => setShowAddClinicModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-white bg-[#9BB0A5] hover:bg-[#8A9F94] rounded-2xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Cadastrar Nova Clínica (Filial)
        </button>
      </header>

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANE (Col 1 to 5): Franchise Clinics switcher */}
        <div className={`lg:col-span-5 p-6 border rounded-[2rem] shadow-sm space-y-6 ${
          darkMode ? 'bg-[#242D28] border-[#2E3832] text-[#ECEBE5]' : 'bg-white border-[#E5E3DB] text-[#2D312E]'
        }`}>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#8A9F94] mb-1">
              Diretório de Unidades ({clinics.length})
            </h3>
            <p className="text-xs text-slate-400">Selecione a unidade ativa para gerenciar o endereço, médicos e colaboradores.</p>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {clinics.map((clinic) => {
              const isSelected = currentClinic.id === clinic.id;
              
              return (
                <div
                  id={`clinic-saas-item-${clinic.id}`}
                  key={clinic.id}
                  onClick={() => setCurrentClinic(clinic)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#9BB0A5]/10 dark:bg-[#9BB0A5]/15 border-[#9BB0A5]'
                      : darkMode
                        ? 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                        : 'bg-[#F9F8F3] border-[#E5E3DB] hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center ${
                      isSelected ? 'bg-[#9BB0A5] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>

                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {clinic.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate leading-none">
                        📄 CNPJ: {clinic.document}
                      </p>
                      
                      {clinic.responsibleDoctor && (
                        <p className="text-[9px] text-[#8A9F94] font-semibold mt-1 truncate">
                          🩺 Dr: {clinic.responsibleDoctor}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase ${
                          clinic.plan === 'Bronze' ? 'bg-amber-100 text-amber-800' : clinic.plan === 'Prata' ? 'bg-slate-200 text-slate-850' : 'bg-[#A2C4D2]/25 text-indigo-900'
                        }`}>
                          Plano {clinic.plan}
                        </span>
                        <span className="text-[9px] text-slate-400">• {clinic.status}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#9BB0A5] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-[#F9F8F3] dark:bg-[#1B221E] border border-[#E5E3DB] dark:border-[#2E3832] rounded-2xl space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assinatura Ativa</p>
            <p className="text-sm font-semibold flex items-center gap-1.5 text-slate-705 dark:text-white">
              <Gem className="w-4 h-4 text-[#F27D26]" /> CSM SaaS {currentClinic.plan}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Status de Faturamento: Regularizado</p>
          </div>
        </div>

        {/* RIGHT PANE (Col 6 to 12): Active Clinic details + Address, Doctor, Fin Manager formulation */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Clinic Info edit form */}
          <div className={`p-6 border rounded-[2rem] shadow-sm space-y-6 ${
            darkMode ? 'bg-[#242D28] border-[#2E3832] text-[#ECEBE5]' : 'bg-white border-[#E5E3DB] text-[#2D312E]'
          }`}>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#8A9F94] mb-1">
                Cadastro da Unidade Ativa
              </h3>
              <p className="text-xs text-slate-400">Defina o endereço físico da clínica, o doutor/fisioterapeuta responsável e as finanças corporativas.</p>
            </div>

            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Clinic Name (disabled representation in unit edit form) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome Oficial</label>
                  <input
                    type="text"
                    disabled
                    value={currentClinic.name}
                    className="w-full text-xs font-semibold rounded-xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 outline-none border border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* CNPJ / Document number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">CNPJ / Inscrição Municipal</label>
                  <input
                    type="text"
                    value={detailsDoc}
                    onChange={(e) => setDetailsDoc(e.target.value)}
                    placeholder="Inscrição ou CNPJ"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F9F8F3] border-[#E5E3DB] text-slate-800'
                    }`}
                  />
                </div>

              </div>

              {/* Responsible Doctor (Doutor Responsável) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-[#9BB0A5] uppercase tracking-wider block flex items-center gap-1">
                  🩺 Doutor(a) Responsável Técnico
                </label>
                <input
                  type="text"
                  required
                  value={detailsDoctor}
                  onChange={(e) => setDetailsDoctor(e.target.value)}
                  placeholder="Nome do Doutor/Fisioterapeuta responsável técnico"
                  className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-[#9BB0A5]' : 'bg-[#F9F8F3] border-[#E5E3DB] focus:bg-white focus:border-[#9BB0A5] text-slate-800'
                  }`}
                />
              </div>

              {/* Financial Manager (Responsável Financeiro) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-[#F27D26] uppercase tracking-wider block flex items-center gap-1">
                  💼 Responsável Financeiro (Contas/Faturamento)
                </label>
                <input
                  type="text"
                  required
                  value={detailsFinancial}
                  onChange={(e) => setDetailsFinancial(e.target.value)}
                  placeholder="Responsável pela tesouraria e cobranças"
                  className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-[#F27D26]' : 'bg-[#F9F8F3] border-[#E5E3DB] focus:bg-white focus:border-[#F27D26] text-slate-800'
                  }`}
                />
              </div>

              {/* Clinic Full Address (Endereço Clínico) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  📍 Endereço Completo da Unidade
                </label>
                <input
                  type="text"
                  required
                  value={detailsAddress}
                  onChange={(e) => setDetailsAddress(e.target.value)}
                  placeholder="Ex: Av. das Américas, 4200 - Bloco C, Barra da Tijuca, RJ"
                  className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F9F8F3] border-[#E5E3DB] focus:bg-white text-slate-800'
                  }`}
                />
              </div>

              {/* Phone number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Telefone de Atendimento / Comercial</label>
                <input
                  type="text"
                  value={detailsPhone}
                  onChange={(e) => setDetailsPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F9F8F3] border-[#E5E3DB] text-slate-800'
                  }`}
                />
              </div>

              {/* Action and feedback */}
              <div className="pt-4 border-t border-[#E5E3DB] dark:border-[#2E3832] flex items-center justify-between">
                <div>
                  {saveSuccess && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      ✓ Configurações salvas com sucesso!
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2D312E] dark:bg-white dark:text-[#1B221E] text-white hover:opacity-90 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Salvar Dados Cadastrais
                </button>
              </div>

            </form>
          </div>

          {/* WHATSAPP CONNECTOR */}
          <div className={`p-6 border rounded-[2rem] shadow-sm space-y-4 ${
            darkMode ? 'bg-[#242D28] border-[#2E3832] text-[#ECEBE5]' : 'bg-white border-[#E5E3DB] text-[#2D312E]'
          }`}>
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                💬 Integração WhatsApp
              </span>
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#8A9F94] mt-2 mb-1">
                Disparos Clínicos para Familiares
              </h3>
              <p className="text-xs text-slate-450">
                Ligue um número de celular oficial para disparar os trabalhos de casa, lembretes de agenda e confirmações de presença dos pacientes.
              </p>
            </div>

            {isWhatsappConnected ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    <div>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">Canal Conectado e Operante</p>
                      <p className="text-[11px] font-mono font-bold text-slate-500">Responsável: {whatsappNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('csm_whatsapp_linked');
                      setIsWhatsappConnected(false);
                      setWhatsappNumber('');
                    }}
                    className="px-3 py-1.5 text-[10px] font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer"
                  >
                    Desconectar
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modelo do Texto de Confirmação</label>
                  <textarea
                    rows={3}
                    defaultValue="Olá [Responsável]! 🎈 Passando para lembrar que a sessão de terapia de [Paciente] está marcada para [Data] às [Hora] na clínica [Clínica]. Contamos com vocês!"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-705 text-slate-200' : 'bg-slate-50 border-[#E5E3DB] text-slate-800'
                    }`}
                  />
                  <span className="text-[9px] text-slate-400 italic block">Use [Responsável], [Paciente], [Data], [Hora] e [Clínica] como tags dinâmicas.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Insira o Celular com DDD (WhatsApp)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-xs font-bold font-mono">
                      🇧🇷 +55
                    </span>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="(11) 98311-2244"
                      className={`w-full text-xs font-bold rounded-xl pl-14 pr-4 py-3 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F9F8F3] border-[#E5E3DB] text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                {whatsappNumber ? (
                  <div className="p-4 border rounded-2xl border-[#E5E3DB] dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in duration-300">
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center relative">
                      <div className="w-36 h-36 relative flex items-center justify-center bg-white rounded-xl overflow-hidden">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/55${whatsappNumber.replace(/\D/g, '') || '00000000000'}`}
                          alt="QR Code de Conexão WhatsApp"
                          className="w-32 h-32 object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 animate-[bounce_2.5s_infinite] shadow-md opacity-80 pointer-events-none"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-350">Aponte a câmera do WhatsApp para ler o código acima</p>
                      <p className="text-[10px] text-slate-400">Vincula o DDD + Número e sincroniza o celular ao CRM.</p>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem('csm_whatsapp_linked', whatsappNumber);
                        setIsWhatsappConnected(true);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full"
                    >
                      ✓ Confirmar Leitura de Código (Parear)
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center text-[10px] text-slate-400 font-semibold italic">
                    Digite o número de telefone acima para exibir o QR Code de Vinculação.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* SECTION: USER MANAGEMENT TAB / PANEL (Cadastro de novos usuários com Nível de Acesso) */}
      <section className={`p-6 md:p-8 border rounded-[2rem] shadow-sm space-y-6 ${
        darkMode ? 'bg-[#242D28] border-[#2E3832] text-[#ECEBE5]' : 'bg-white border-[#E5E3DB] text-[#2D312E]'
      }`}>
        <div className="pb-4 border-b border-[#E5E3DB] dark:border-[#2E3832]">
          <h2 className="text-xs uppercase tracking-widest font-bold text-[#8A9F94] dark:text-[#9BB0A5] mb-1">
            Administração de Equipe
          </h2>
          <h3 className="text-2xl font-serif text-[#2D312E] dark:text-white">
            Cadastro de Novos Usuários e Níveis de Acesso
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Controle quem possui acesso à unidade <strong className="text-slate-700 dark:text-white">{currentClinic.name}</strong> e as respectivas autorizações de visualização.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inline Form to add a new User (Col 1 to 4) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold opacity-50 mb-2">Convidar Colaborador</h4>
            
            <form onSubmit={handleAddUser} className="space-y-4 p-5 rounded-2xl bg-[#F9F8F3] dark:bg-[#1B221E] border border-[#E5E3DB] dark:border-[#2E3832]">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome do Usuário</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Ex: Dra. Juliana Meireles"
                    className={`w-full text-xs font-semibold rounded-xl pl-9 pr-4 py-2.5 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#E5E3DB] text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">E-mail Corporativo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="juliana.meireles@email.com"
                    className={`w-full text-xs font-semibold rounded-xl pl-9 pr-4 py-2.5 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#E5E3DB] text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nível de Acesso (Cargo)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Shield className="w-3.5 h-3.5" />
                  </span>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className={`w-full text-xs font-semibold rounded-xl pl-9 pr-4 py-2.5 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#E5E3DB] text-slate-800'
                    }`}
                  >
                    <option value="Admin">Administrador (Acesso Total)</option>
                    <option value="Fisio">Terapeuta/Fisio (Prontuário e Fichas)</option>
                    <option value="Recepcao">Recepção (Agendas e Cadastro)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Senha de Acesso ao Sistema</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Ex: 1234"
                    className={`w-full text-xs font-semibold rounded-xl pl-9 pr-4 py-2.5 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' : 'bg-white border-[#E5E3DB] text-slate-800 focus:border-teal-400'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2">
                {userSuccess && (
                  <p className="text-[10px] text-emerald-500 font-bold mb-2">✓ Usuário ativado com sucesso!</p>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#9BB0A5] hover:bg-[#8A9F94] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Usuário
                </button>
              </div>

            </form>
          </div>

          {/* List/Table of Active Users in selected clinic (Col 5 to 12) */}
          <div className="lg:col-span-8 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold opacity-50 mb-2">Profissionais e Níveis de Acesso Ativos</h4>
            
            <div className="overflow-x-auto rounded-3xl border border-[#E5E3DB] dark:border-[#2E3832]">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className={`border-b border-[#E5E3DB] dark:border-[#2E3832] ${
                    darkMode ? 'bg-slate-900/50' : 'bg-[#F9F8F3]'
                  }`}>
                    <th scope="col" className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400">Nome/Email</th>
                    <th scope="col" className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400">Senha</th>
                    <th scope="col" className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400">Nível de Acesso</th>
                    <th scope="col" className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400">Status</th>
                    <th scope="col" className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E3DB] dark:divide-[#2E3832]">
                  {activeClinicUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic">No users found for this clinic workspace. Please add one!</td>
                    </tr>
                  ) : (
                    activeClinicUsers.map((user) => {
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-[#2E3832]/30 transition-all">
                          
                          {/* Name & Email detail */}
                          <td className="p-4">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
                              <p className="text-[10px] text-slate-400">{user.email}</p>
                            </div>
                          </td>

                          {/* Password Field inline updating */}
                          <td className="p-4">
                            <input
                              type="text"
                              value={user.password || '1234'}
                              onChange={(e) => onUpdateSystemUser(user.id, { password: e.target.value })}
                              className={`w-24 text-[11px] font-mono font-bold rounded-xl px-2 py-1.5 text-center border transition-all ${
                                darkMode 
                                  ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                                  : 'bg-white border-slate-200 text-slate-800 focus:border-teal-400 focus:bg-white'
                              }`}
                            />
                          </td>

                          {/* Level of Access badge */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              user.role === 'Admin' 
                                ? 'bg-[#F27D26]/10 text-[#F27D26]' 
                                : user.role === 'Fisio' 
                                  ? 'bg-[#9BB0A5]/15 text-[#8A9F94] dark:text-[#9BB0A5]' 
                                  : 'bg-[#A2C4D2]/20 text-indigo-700'
                            }`}>
                              <Shield className="w-3 h-3" />
                              {user.role === 'Admin' ? 'Administrador' : user.role === 'Fisio' ? 'Fisioterapeuta' : 'Recepção'}
                            </span>
                          </td>

                          {/* Active / Inactive switch status */}
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(user)}
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase cursor-pointer hover:underline transition-all ${
                                user.status === 'Ativo' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {user.status}
                            </button>
                          </td>

                          {/* Remove button */}
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => onDeleteSystemUser(user.id)}
                              className="p-1 px-3 text-rose-600 hover:text-rose-800 font-semibold hover:bg-rose-50 rounded-xl transition-all cursor-pointer text-xs"
                              disabled={activeClinicUsers.length <= 1}
                              title={activeClinicUsers.length <= 1 ? "A clínica deve conter no mínimo 1 usuário ativo." : ""}
                            >
                              <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Remover
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </section>

      {/* PLANS DISPLAY */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider block">Assinatura do Plano Corporativo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bronze Card */}
          <div className={`rounded-3xl border p-5 flex flex-col justify-between transition-all ${
            currentClinic.plan === 'Bronze' ? 'border-[#F27D26] ring-4 ring-[#F27D26]/10 bg-[#F27D26]/5' : darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-[#E5E3DB]'
          }`}>
            <div className="space-y-3 text-xs font-semibold">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">Bronze</span>
              <h4 className="text-xl font-bold">R$ 199 <span className="text-[10px] text-slate-400">/ mês</span></h4>
              <p className="text-[11px] text-slate-400">Ideal para consultórios ou clínicas atendendo até 20 crianças.</p>
              
              <ul className="space-y-2 pt-2 border-t border-[#E5E3DB] text-[11px]">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#9BB0A5]" /> Até 20 pacientes ativos</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#9BB0A5]" /> Prontuário básico</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#9BB0A5]" /> Agenda de consultas</li>
              </ul>
            </div>
            <button
              disabled={currentClinic.plan === 'Bronze'}
              onClick={() => handleUpgradePlan('Bronze')}
              className={`w-full py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase mt-5 cursor-pointer ${
                currentClinic.plan === 'Bronze' ? 'bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20' : 'bg-[#9BB0A5] text-white hover:bg-[#8A9F94]'
              }`}
            >
              {currentClinic.plan === 'Bronze' ? 'Plano Bronze Ativo' : 'Mudar para Bronze'}
            </button>
          </div>

          {/* Silver Card */}
          <div className={`rounded-3xl border p-5 flex flex-col justify-between transition-all relative ${
            currentClinic.plan === 'Prata' ? 'border-[#9BB0A5] ring-4 ring-[#9BB0A5]/10 bg-[#9BB0A5]/5' : darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-[#E5E3DB]'
          }`}>
            <div className="absolute top-0 right-5 -translate-y-1/2 bg-[#9BB0A5] text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Mais Vendido
            </div>
            <div className="space-y-3 text-xs font-semibold">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#9BB0A5]/25 text-[#8A9F94] rounded-md">Prata</span>
              <h4 className="text-xl font-bold">R$ 349 <span className="text-[10px] text-slate-400">/ mês</span></h4>
              <p className="text-[11px] text-slate-400">Perfeito para clínicas integradas em expansão com multi-eventos.</p>
              
              <ul className="space-y-2 pt-2 border-t border-[#E5E3DB] text-[11px]">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#9BB0A5]" /> Até 100 pacientes ativos</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#9BB0A5]" /> Prontuário + Ficha Evolutiva 1-5</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#9BB0A5]" /> Criação ilimitada de eventos</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#9BB0A5]" /> Lembrete automático WhatsApp</li>
              </ul>
            </div>
            <button
              disabled={currentClinic.plan === 'Prata'}
              onClick={() => handleUpgradePlan('Prata')}
              className={`w-full py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase mt-5 cursor-pointer ${
                currentClinic.plan === 'Prata' ? 'bg-[#9BB0A5]/15 text-[#8A9F94] border border-[#9BB0A5]/20' : 'bg-[#9BB0A5] text-white hover:bg-[#8A9F94]'
              }`}
            >
              {currentClinic.plan === 'Prata' ? 'Plano Prata Ativo' : 'Mudar para Prata'}
            </button>
          </div>

          {/* Gold Card */}
          <div className={`rounded-3xl border p-5 flex flex-col justify-between transition-all ${
            currentClinic.plan === 'Ouro' ? 'border-[#A2C4D2] ring-4 ring-[#A2C4D2]/10 bg-[#A2C4D2]/5' : darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-[#E5E3DB]'
          }`}>
            <div className="space-y-3 text-xs font-semibold">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#A2C4D2]/20 text-indigo-950 rounded-md">Ouro</span>
              <h4 className="text-xl font-bold">R$ 599 <span className="text-[10px] text-slate-400">/ mês</span></h4>
              <p className="text-[11px] text-slate-400">Totalmente ilimitado para franquias multi-clínicas de reabilitação.</p>
              
              <ul className="space-y-2 pt-2 border-t border-[#E5E3DB] text-[11px]">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#9BB0A5]" /> Pacientes ilimitados</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#9BB0A5]" /> Multi-clínicas ilimitadas</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#9BB0A5]" /> Exportação avançada Prontuários</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#9BB0A5]" /> Suporte VIP Priorizável</li>
              </ul>
            </div>
            <button
              disabled={currentClinic.plan === 'Ouro'}
              onClick={() => handleUpgradePlan('Ouro')}
              className={`w-full py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase mt-5 cursor-pointer ${
                currentClinic.plan === 'Ouro' ? 'bg-[#A2C4D2]/25 text-[#A2C4D2] border border-[#A2C4D2]/40' : 'bg-[#9BB0A5] text-white hover:bg-[#8A9F94]'
              }`}
            >
              {currentClinic.plan === 'Ouro' ? 'Plano Ouro Ativo' : 'Mudar para Ouro'}
            </button>
          </div>
        </div>
      </section>

      {/* MODAL: REGISTER NEW CLINIC (SaaS MULTIEMPRESA) */}
      {showAddClinicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-3xl border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E5E3DB]'
          }`}>
            <div className="p-6 border-b border-[#E5E3DB] dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                🏢 Cadastrar Nova Clínica no Sistema CSM
              </h3>
              <button
                onClick={() => setShowAddClinicModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitClinic} className="p-6 space-y-4">
              <div className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome Fantasia da Clínica *</label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    placeholder="Ex: CSM Clinical Campinas"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-555' : 'bg-slate-50 border-[#E5E3DB] focus:bg-white text-slate-855'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CNPJ da Empresa *</label>
                  <input
                    type="text"
                    required
                    value={cDoc}
                    onChange={(e) => setCDoc(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-[#E5E3DB] text-slate-855'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Telefone de Contato</label>
                    <input
                      type="text"
                      required
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      placeholder="(19) 98111-2234"
                      className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-[#E5E3DB] text-slate-855'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Plano Inicial</label>
                    <select
                      value={cPlan}
                      onChange={(e) => setCPlan(e.target.value as any)}
                      className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-[#E5E3DB]'
                      }`}
                    >
                      <option value="Bronze">Plano Bronze</option>
                      <option value="Prata">Plano Prata</option>
                      <option value="Ouro">Plano Ouro</option>
                    </select>
                  </div>
                </div>

                {/* New responsible doc */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Doutor Responsável Técnico</label>
                  <input
                    type="text"
                    value={cDoctor}
                    onChange={(e) => setCDoctor(e.target.value)}
                    placeholder="Nome do especialista responsável"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-[#E5E3DB] text-slate-855'
                    }`}
                  />
                </div>

                {/* New financial manager */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsável Financeiro</label>
                  <input
                    type="text"
                    value={cFinancial}
                    onChange={(e) => setCFinancial(e.target.value)}
                    placeholder="Nome do responsável financeiro"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-[#E5E3DB] text-slate-855'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Endereço Comercial</label>
                  <input
                    type="text"
                    value={cAddress}
                    onChange={(e) => setCAddress(e.target.value)}
                    placeholder="Ex: Av. Francisco Glicério, 450 - Campinas"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-[#E5E3DB] focus:bg-white text-slate-855'
                    }`}
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddClinicModal(false)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl border cursor-pointer ${
                    darkMode ? 'bg-slate-800 border-slate-705 text-slate-350' : 'bg-white border-slate-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#9BB0A5] hover:bg-[#8A9F94] text-white transition-all cursor-pointer"
                >
                  Cadastrar Unidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
