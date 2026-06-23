import React from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar as CalendarIcon, 
  CalendarDays, 
  DollarSign, 
  FileText, 
  Settings, 
  Sparkles, 
  UserSquare2, 
  Sun, 
  Moon,
  Building2,
  Lock,
  ChevronLeft,
  LogOut
} from 'lucide-react';
import { UserRole, Clinic } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  clinics: Clinic[];
  currentClinic: Clinic;
  setCurrentClinic: (clinic: Clinic) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentUser?: any;
  onLogout?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  clinics,
  currentClinic,
  setCurrentClinic,
  darkMode,
  setDarkMode,
  sidebarOpen,
  setSidebarOpen,
  currentUser,
  onLogout
}: SidebarProps) {
  
  // Define available menu links based on the user group role guidelines (Módulo 12)
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: BarChart3, roles: ['Admin', 'Fisio', 'Recepcao'] },
    { id: 'patients', label: 'Prontuários & CRM', icon: Users, roles: ['Admin', 'Fisio'] },
    { id: 'agenda', label: 'Agenda Clínica', icon: CalendarIcon, roles: ['Admin', 'Fisio', 'Recepcao'] },
    { id: 'eventos', label: 'Gestão de Eventos', icon: CalendarDays, roles: ['Admin', 'Fisio', 'Recepcao'] },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, roles: ['Admin', 'Recepcao'] },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, roles: ['Admin', 'Fisio'] },
    { id: 'clinicas', label: 'SaaS Multi-Clínica', icon: Building2, roles: ['Desenvolvedor'] },
  ];

  return (
    <aside id="app-sidebar" className={`flex-shrink-0 flex flex-col border-r transition-all duration-300 ease-in-out ${
      sidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0 pointer-events-none'
    } ${
      darkMode ? 'bg-[#242D28] border-[#2E3832] text-[#ECEBE5]' : 'bg-[#9BB0A5] border-[#8A9F94] text-white'
    }`}>
      {/* Brand Header */}
      <div className="p-6 border-b border-inherit flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-white rounded-full flex-shrink-0 flex items-center justify-center shadow-sm">
            <span className="text-[#9BB0A5] font-bold text-lg font-serif">CSM</span>
          </div>
          <div className="truncate">
            <h1 className="font-serif italic font-semibold text-xl tracking-tight leading-none">
              CSM Clinical
            </h1>
            <span className="text-[9px] font-bold tracking-widest uppercase opacity-75 block mt-0.5 font-sans whitespace-nowrap">
              CRM TERAPÊUTICO
            </span>
          </div>
        </div>

        {/* Collapse Sidebar Button */}
        <button
          id="btn-collapse-sidebar"
          onClick={() => setSidebarOpen(false)}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer flex-shrink-0 ${
            darkMode 
              ? 'bg-[#1B221E] border-[#2E3832] text-slate-400 hover:text-white hover:bg-[#2E3832]' 
              : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
          }`}
          title="Ocultar Barra de Opções"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Multi-Clinic Workspace Select (Módulo 14) */}
      <div className="px-4 py-3 border-b border-inherit">
        <label className={`block text-[10px] font-bold tracking-wider uppercase mb-1.5 ${
          darkMode ? 'text-slate-400' : 'text-white/80'
        }`}>
          Clínica Ativa (SaaS)
        </label>
        <div className="relative">
          <select
            id="clinic-selector"
            value={currentClinic.id}
            onChange={(e) => {
              const selected = clinics.find(c => c.id === e.target.value);
              if (selected) setCurrentClinic(selected);
            }}
            className={`w-full text-xs font-semibold rounded-xl px-3 py-2.5 outline-none appearance-none cursor-pointer border transition-all ${
              darkMode 
                ? 'bg-[#1B221E] border-[#2E3832] text-white focus:border-[#9BB0A5]' 
                : 'bg-[#8A9F94] border-[#7F9389] hover:bg-[#83978C] text-white focus:bg-[#8A9F94]'
            }`}
          >
            {clinics.map(clinic => (
              <option key={clinic.id} value={clinic.id} className="text-slate-800">
                🏢 {clinic.name}
              </option>
            ))}
          </select>
          <div className={`absolute inset-y-0 right-3 flex items-center pointer-events-none ${
            darkMode ? 'text-slate-400' : 'text-white'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1.5 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></div>
          <span className={`text-[10px] font-medium ${
            darkMode ? 'text-slate-450' : 'text-white/70'
          }`}>
            Plano {currentClinic.plan} Ativo
          </span>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <p className={`text-[10px] font-bold tracking-wider uppercase px-3 mb-2.5 ${
          darkMode ? 'text-slate-500' : 'text-white/60'
        }`}>
          Módulos do Sistema
        </p>
        {menuItems.map((item) => {
          const isAllowed = currentRole === 'Desenvolvedor' || item.roles.includes(currentRole);
          const isActive = activeTab === item.id;
          
          if (!isAllowed) {
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs cursor-not-allowed select-none rounded-xl ${
                  darkMode ? 'text-slate-600' : 'text-white/40'
                }`}
                style={{ opacity: 0.6 }}
                title="Acesso indisponível para o seu perfil"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 opacity-50" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <Lock className="w-3 h-3" />
              </div>
            );
          }

          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? darkMode
                    ? 'bg-[#9BB0A5] text-[#1B221E] shadow-sm font-bold'
                    : 'bg-white text-[#2D312E] shadow-sm font-bold'
                  : darkMode
                    ? 'text-slate-300 hover:bg-[#2E3832] hover:text-white'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              {isActive && (
                <div className={`absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r-md ${
                  darkMode ? 'bg-[#1B221E]' : 'bg-[#9BB0A5]'
                }`}></div>
              )}
              <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                isActive 
                  ? darkMode ? 'text-[#1B221E]' : 'text-[#9BB0A5]' 
                  : darkMode ? 'text-slate-400' : 'text-white/80'
              }`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Role Switcher Sandbox (Módulo 12 Simulation) */}
      <div className={`p-4 mx-4 mb-4 rounded-2xl border transition-all ${
        darkMode ? 'bg-[#1B221E]/60 border-[#2E3832]' : 'bg-[#8A9F94]/30 border-[#9BB0A5]/30 text-white'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <label className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 ${
            darkMode ? 'text-slate-450' : 'text-white/95'
          }`}>
            <UserSquare2 className={`w-3.5 h-3.5 ${darkMode ? 'text-[#9BB0A5]' : 'text-white'}`} />
            Perfil de Simulação
          </label>
        </div>
        <div className={`grid gap-1 ${
          currentUser?.role === 'Desenvolvedor' ? 'grid-cols-4' : 'grid-cols-3'
        }`}>
          {((currentUser?.role === 'Desenvolvedor' ? ['Admin', 'Fisio', 'Recepcao', 'Desenvolvedor'] : ['Admin', 'Fisio', 'Recepcao']) as UserRole[]).map((role) => (
            <button
              id={`role-btn-${role.toLowerCase()}`}
              key={role}
              onClick={() => {
                setCurrentRole(role);
                // Adjust views if active view is not permitted on role change
                const correspondingMap: Record<string, string[]> = {
                  Desenvolvedor: ['dashboard', 'patients', 'agenda', 'eventos', 'financeiro', 'relatorios', 'clinicas'],
                  Admin: ['dashboard', 'patients', 'agenda', 'eventos', 'financeiro', 'relatorios'],
                  Fisio: ['dashboard', 'patients', 'agenda', 'eventos', 'relatorios'],
                  Recepcao: ['dashboard', 'agenda', 'eventos', 'financeiro']
                };
                if (!correspondingMap[role].includes(activeTab)) {
                  setActiveTab('dashboard');
                }
              }}
              className={`py-1.5 text-[9px] font-bold rounded-lg transition-all ${
                currentRole === role
                  ? darkMode 
                    ? 'bg-[#9BB0A5] text-[#1B221E] shadow-sm'
                    : 'bg-[#F27D26] text-white shadow-sm'
                  : darkMode
                    ? 'bg-[#242D28] text-slate-400 hover:bg-[#2E3832] border border-[#2E3832]/80'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'
              }`}
            >
              {role === 'Admin' ? 'Admin' : role === 'Fisio' ? 'Fisio' : role === 'Recepcao' ? 'Recep' : 'Dev'}
            </button>
          ))}
        </div>
        <p className={`text-[9.5px] text-center mt-1.5 leading-tight ${
          darkMode ? 'text-slate-500' : 'text-white/70'
        }`}>
          Altere o perfil para testar as restrições de permissão do sistema.
        </p>
      </div>

      {/* Bottom Profile and Theme switcher */}
      <div className={`p-4 border-t border-inherit flex flex-col gap-3 ${
        darkMode ? 'bg-[#1B221E]/30' : 'bg-[#8A9F94]/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-full font-serif font-extrabold text-xs flex items-center justify-center shadow-inner flex-shrink-0 ${
              darkMode ? 'bg-[#9BB0A5] text-[#242D28]' : 'bg-white text-[#9BB0A5]'
            }`}>
              {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : (currentRole === 'Admin' ? 'AD' : currentRole === 'Fisio' ? 'FI' : 'RC')}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate max-w-[130px]">
                {currentUser?.name || (currentRole === 'Desenvolvedor' ? 'Jossie Freitas' : currentRole === 'Admin' ? 'Dra. Ana Flávia' : currentRole === 'Fisio' ? 'Dra. Gabriela Nunes' : 'Silvia Souza')}
              </p>
              <p className={`text-[10px] leading-none capitalize font-medium ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {currentUser?.role === 'Desenvolvedor' || currentRole === 'Desenvolvedor' ? 'Desenvolvedor' : currentUser?.role === 'Admin' || currentRole === 'Admin' ? 'Administrador' : currentUser?.role === 'Fisio' || currentRole === 'Fisio' ? 'Fisioterapeuta' : 'Recepção / Secretária'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Theme select button */}
          <button
            id="theme-toggler"
            onClick={() => setDarkMode(!darkMode)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-[10px] font-bold transition-all ${
              darkMode 
                ? 'bg-[#242D28] border-[#2E3832] text-[#9BB0A5] hover:bg-[#2E3832]' 
                : 'bg-white/50 border-slate-250 text-slate-700 hover:bg-slate-100'
            }`}
            title={darkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{darkMode ? 'Claro' : 'Escuro'}</span>
          </button>

          {/* Logout button */}
          {onLogout && (
            <button
              id="btn-sidebar-logout"
              onClick={onLogout}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-[10px] font-bold transition-all ${
                darkMode
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-450 hover:bg-rose-500/20'
                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
              }`}
              title="Sair do sistema (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
