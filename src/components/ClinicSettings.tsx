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
  AlertCircle,
  Lock
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
  currentUser?: SystemUser | null;
  currentRole?: UserRole;
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
  darkMode,
  currentUser,
  currentRole = 'Admin'
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

  // Developer/Manager: User account inline editing states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userEditName, setUserEditName] = useState('');
  const [userEditEmail, setUserEditEmail] = useState('');
  const [userEditRole, setUserEditRole] = useState<UserRole>('Fisio');
  const [userEditPassword, setUserEditPassword] = useState('');
  const [userEditClinicId, setUserEditClinicId] = useState('');
  const [selectedUserClinicFilter, setSelectedUserClinicFilter] = useState<string>('all');

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

  // Filter users belonging only to active clinic, with all clinics support for Developers
  const isDev = currentRole === 'Desenvolvedor';
  const activeClinicUsers = isDev
    ? (selectedUserClinicFilter === 'all' ? systemUsers : systemUsers.filter(u => u.clinicId === selectedUserClinicFilter))
    : systemUsers.filter(u => u.clinicId === currentClinic.id);

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-xs uppercase tracking-widest font-bold opacity-50">Profissionais e Níveis de Acesso</h4>
              
              {isDev && (
                <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Filtrar Unidade:</span>
                  <select
                    value={selectedUserClinicFilter}
                    onChange={(e) => setSelectedUserClinicFilter(e.target.value)}
                    className={`text-[11px] font-bold rounded-lg px-2 py-1 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-850'
                    }`}
                  >
                    <option value="all">Todas as Clínicas (Geral)</option>
                    {clinics.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto rounded-3xl border border-[#E5E3DB] dark:border-[#2E3832]">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead>
                  <tr className={`border-b border-[#E5E3DB] dark:border-[#2E3832] ${
                    darkMode ? 'bg-slate-900/50' : 'bg-[#F9F8F3]'
                  }`}>
                    <th scope="col" className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400">Nome/Email</th>
                    <th scope="col" className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400">Unidade</th>
                    <th scope="col" className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400">Nível de Acesso</th>
                    <th scope="col" className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400">Senha</th>
                    <th scope="col" className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400">Status</th>
                    <th scope="col" className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E3DB] dark:divide-[#2E3832]">
                  {activeClinicUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">Nenhum profissional encontrado nesta seleção. Cadastre um novo ao lado!</td>
                    </tr>
                  ) : (
                    activeClinicUsers.map((user) => {
                      const isEditingThisUser = editingUserId === user.id;
                      const userClinic = clinics.find(c => c.id === user.clinicId);

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-[#2E3832]/30 transition-all">
                          
                          {/* Name & Email detail */}
                          <td className="p-4">
                            {isEditingThisUser ? (
                              <div className="space-y-1 max-w-[180px]">
                                <input
                                  type="text"
                                  value={userEditName}
                                  onChange={(e) => setUserEditName(e.target.value)}
                                  className={`w-full text-xs font-bold rounded-lg px-2.5 py-1 border outline-none ${
                                    darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-slate-200 text-slate-800 focus:border-emerald-400'
                                  }`}
                                />
                                <input
                                  type="email"
                                  value={userEditEmail}
                                  onChange={(e) => setUserEditEmail(e.target.value)}
                                  className={`w-full text-[10px] font-semibold rounded-lg px-2.5 py-1 border outline-none ${
                                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 focus:border-emerald-500' : 'bg-white border-slate-200 text-slate-500 focus:border-emerald-400'
                                  }`}
                                />
                              </div>
                            ) : (
                              <div>
                                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                  {user.name}
                                  {user.role === 'Desenvolvedor' && (
                                    <span className="text-[8px] bg-sky-500/10 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded-md font-black">DEV</span>
                                  )}
                                </p>
                                <p className="text-[10px] text-slate-400">{user.email}</p>
                              </div>
                            )}
                          </td>

                          {/* Clinic/Unit Assignment */}
                          <td className="p-4">
                            {isEditingThisUser && isDev ? (
                              <select
                                value={userEditClinicId}
                                onChange={(e) => setUserEditClinicId(e.target.value)}
                                className={`text-[11px] font-bold rounded-lg px-2 py-1 outline-none border transition-all ${
                                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                                }`}
                              >
                                {clinics.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                {userClinic ? userClinic.name : 'Nenhuma'}
                              </span>
                            )}
                          </td>

                          {/* Level of Access badge */}
                          <td className="p-4">
                            {isEditingThisUser ? (
                              <select
                                value={userEditRole}
                                onChange={(e) => setUserEditRole(e.target.value as UserRole)}
                                className={`text-[11px] font-bold rounded-lg px-2 py-1 outline-none border transition-all ${
                                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                                }`}
                              >
                                <option value="Admin">Administrador (Total)</option>
                                <option value="Fisio">Fisioterapeuta</option>
                                <option value="Recepcao">Recepção</option>
                                <option value="Desenvolvedor">Desenvolvedor</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                user.role === 'Admin' 
                                  ? 'bg-[#F27D26]/10 text-[#F27D26]' 
                                  : user.role === 'Fisio' 
                                    ? 'bg-[#9BB0A5]/15 text-[#8A9F94] dark:text-[#9BB0A5]' 
                                    : user.role === 'Desenvolvedor'
                                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                      : 'bg-[#A2C4D2]/20 text-indigo-700'
                              }`}>
                                <Shield className="w-3 h-3" />
                                {user.role === 'Admin' ? 'Administrador' : user.role === 'Fisio' ? 'Fisioterapeuta' : user.role === 'Desenvolvedor' ? 'Desenvolvedor' : 'Recepção'}
                              </span>
                            )}
                          </td>

                          {/* Password Field inline updating */}
                          <td className="p-4">
                            {isEditingThisUser ? (
                              <input
                                type="text"
                                value={userEditPassword}
                                onChange={(e) => setUserEditPassword(e.target.value)}
                                className={`w-20 text-[11px] font-mono font-bold rounded-xl px-2 py-1 border outline-none text-center ${
                                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                                }`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={user.password || '1234'}
                                onChange={(e) => onUpdateSystemUser(user.id, { password: e.target.value })}
                                className={`w-20 text-[11px] font-mono font-bold rounded-xl px-2 py-1 text-center border transition-all ${
                                  darkMode 
                                    ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                                    : 'bg-white border-slate-200 text-slate-800 focus:border-teal-400 focus:bg-white'
                                }`}
                              />
                            )}
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

                          {/* Action buttons */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isEditingThisUser ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateSystemUser(user.id, {
                                        name: userEditName,
                                        email: userEditEmail,
                                        role: userEditRole,
                                        password: userEditPassword,
                                        clinicId: userEditClinicId
                                      });
                                      setEditingUserId(null);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-extrabold hover:bg-emerald-600 transition-all cursor-pointer"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingUserId(null)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-350 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-extrabold hover:opacity-80 transition-all cursor-pointer"
                                  >
                                    Canc.
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingUserId(user.id);
                                      setUserEditName(user.name);
                                      setUserEditEmail(user.email);
                                      setUserEditRole(user.role);
                                      setUserEditPassword(user.password || '1234');
                                      setUserEditClinicId(user.clinicId);
                                    }}
                                    className="p-1 px-2 text-[#8A9F94] hover:text-[#2D312E] dark:hover:text-white font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer text-[10px]"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Deseja realmente remover o colaborador "${user.name}"?`)) {
                                        onDeleteSystemUser(user.id);
                                      }
                                    }}
                                    className="p-1 px-2 text-rose-500 hover:text-rose-700 font-extrabold hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer text-[10px]"
                                    disabled={!isDev && activeClinicUsers.length <= 1}
                                    title={!isDev && activeClinicUsers.length <= 1 ? "A clínica deve conter no mínimo 1 usuário ativo." : ""}
                                  >
                                    <Trash2 className="w-3 h-3 inline mr-0.5" /> Excluir
                                  </button>
                                </>
                              )}
                            </div>
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
