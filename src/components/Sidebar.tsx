import React, { useState, useEffect } from 'react';
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
  LogOut,
  Bell,
  Check,
  Trash2,
  Inbox,
  MessageSquare
} from 'lucide-react';
import { UserRole, Clinic, Registration, Appointment, TherapeuticEvent } from '../types';
import csmLogo from '../assets/images/csm_logo_official_1782404025347.jpg';

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
  registrations?: Registration[];
  appointments?: Appointment[];
  events?: TherapeuticEvent[];
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
  onLogout,
  registrations = [],
  appointments = [],
  events = []
}: SidebarProps) {
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('csm_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('csm_read_notifications', JSON.stringify(readIds));
    } catch (e) {
      console.error(e);
    }
  }, [readIds]);

  // Close notifications panel on click outside
  useEffect(() => {
    if (!showNotifications) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#btn-notifications-bell') && !target.closest('#notifications-dropdown-panel')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showNotifications]);

  // Construct active notification items based on Firestore live state (scoped to the current clinic or global for developers)
  const isDev = currentRole === 'Desenvolvedor';
  const clinicId = currentClinic.id;

  const pendingRegs = registrations.filter(r => (isDev || r.clinicId === clinicId) && r.status === 'Pendente');
  const upcomingApps = appointments.filter(a => (isDev || a.clinicId === clinicId) && (a.status === 'Agendado' || a.status === 'Reagendado'));

  const notificationsList: {
    id: string;
    title: string;
    description: string;
    type: 'registration' | 'appointment';
    dateStr: string;
    targetTab: string;
  }[] = [];

  // Add registrations
  pendingRegs.forEach(r => {
    const event = events.find(e => e.id === r.eventId);
    const eventName = event ? event.name : 'Evento';
    
    notificationsList.push({
      id: `reg-${r.id}`,
      title: 'Nova Inscrição',
      description: `${r.childName} (Resp: ${r.parentName}) inscrita no evento "${eventName}".`,
      type: 'registration',
      dateStr: r.date,
      targetTab: 'eventos'
    });
  });

  // Add appointments
  upcomingApps.forEach(a => {
    notificationsList.push({
      id: `app-${a.id}`,
      title: 'Lembrete de Consulta',
      description: `Paciente ${a.patientName} (${a.type}) às ${a.time}.`,
      type: 'appointment',
      dateStr: `${a.date} às ${a.time}`,
      targetTab: 'agenda'
    });
  });

  // Filter out the notifications that the user has manually marked as read
  const activeNotifications = notificationsList.filter(n => !readIds.includes(n.id));

  // Handle marking a single notification as read
  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Avoid triggering navigation/tab change
    }
    setReadIds(prev => [...prev, id]);
  };

  // Handle marking all as read
  const handleMarkAllAsRead = () => {
    const allIds = notificationsList.map(n => n.id);
    setReadIds(prev => {
      const merged = new Set([...prev, ...allIds]);
      return Array.from(merged);
    });
  };

  // Handle clicking a notification
  const handleNotificationClick = (targetTab: string) => {
    setActiveTab(targetTab);
    setShowNotifications(false);
  };
  
  // Define available menu links based on the user group role guidelines (Módulo 12)
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: BarChart3, roles: ['Admin', 'Fisio', 'Recepcao'] },
    { id: 'patients', label: 'Prontuários & Pacientes', icon: Users, roles: ['Admin', 'Fisio'] },
    { id: 'busca_estudos', label: 'Estudos & Tratamentos', icon: Sparkles, roles: ['Admin', 'Fisio'] },
    { id: 'agenda', label: 'Agenda Clínica', icon: CalendarIcon, roles: ['Admin', 'Fisio', 'Recepcao'] },
    { id: 'eventos', label: 'Gestão de Eventos', icon: CalendarDays, roles: ['Admin', 'Fisio', 'Recepcao'] },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, roles: ['Admin', 'Recepcao'] },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, roles: ['Admin', 'Fisio'] },
    { id: 'comunicacao', label: 'Modos de Comunicação', icon: MessageSquare, roles: ['Admin', 'Desenvolvedor'] },
    { id: 'clinicas', label: 'SaaS Multi-Clínica', icon: Building2, roles: ['Desenvolvedor'] },
  ];

  return (
    <aside id="app-sidebar" className={`flex-shrink-0 flex flex-col border-r transition-all duration-300 ease-in-out ${
      sidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0 pointer-events-none'
    } ${
      darkMode ? 'bg-[#242D28] border-[#2E3832] text-[#ECEBE5]' : 'bg-[#9BB0A5] border-[#8A9F94] text-white'
    }`}>
      {/* Brand Header */}
      <div className="p-6 border-b border-inherit flex items-center justify-between relative">
        <div className="flex items-center gap-3 overflow-hidden">
          <img 
            src={csmLogo} 
            alt="CSM Clinical Logo" 
            referrerPolicy="no-referrer"
            className="w-10 h-10 bg-white rounded-xl flex-shrink-0 object-contain shadow-sm border border-slate-100 p-0.5"
          />
          <div className="truncate">
            <h1 className="font-serif italic font-semibold text-xl tracking-tight leading-none">
              CSM Clinical
            </h1>
          </div>
        </div>

        {/* Header Actions: Notification Bell + Collapse */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notification Bell Icon */}
          <div className="relative">
            <button
              id="btn-notifications-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer relative flex items-center justify-center ${
                showNotifications
                  ? 'bg-white text-[#9BB0A5] border-[#9BB0A5]'
                  : darkMode 
                    ? 'bg-[#1B221E] border-[#2E3832] text-slate-400 hover:text-white hover:bg-[#2E3832]' 
                    : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
              }`}
              title="Notificações do Sistema"
            >
              <Bell className="w-3.5 h-3.5" />
              {activeNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse border border-white"></span>
              )}
            </button>

            {/* Notifications Dropdown Panel - positioned carefully to prevent overflowing the screen viewport/iframe boundaries */}
            {showNotifications && (
              <div 
                id="notifications-dropdown-panel"
                className={`fixed top-20 left-4 right-4 max-w-[calc(100vw-2rem)] sm:max-w-sm sm:absolute sm:top-auto sm:left-0 sm:right-auto sm:w-80 sm:mt-3.5 rounded-2xl shadow-2xl border z-50 transition-all duration-200 overflow-hidden ${
                  darkMode 
                    ? 'bg-[#1B221E] border-[#2E3832] text-[#ECEBE5]' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {/* Header */}
                <div className={`p-3 border-b flex items-center justify-between ${
                  darkMode ? 'border-[#2E3832] bg-[#242D28]' : 'border-slate-100 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Notificações</span>
                    {activeNotifications.length > 0 && (
                      <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                        {activeNotifications.length}
                      </span>
                    )}
                  </div>
                  {activeNotifications.length > 0 && (
                    <button
                      id="btn-notifications-clear-all"
                      onClick={handleMarkAllAsRead}
                      className={`text-[10px] font-bold flex items-center gap-1 hover:underline ${
                        darkMode ? 'text-slate-400 hover:text-white' : 'text-[#8A9F94] hover:text-[#2D312E]'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                      Limpar tudo
                    </button>
                  )}
                </div>

                {/* List Body */}
                <div className="max-h-64 overflow-y-auto divide-y divide-inherit">
                  {activeNotifications.length === 0 ? (
                    <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
                      <Inbox className={`w-8 h-8 opacity-40 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                      <p className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Tudo limpo!
                      </p>
                      <p className={`text-[10px] opacity-75 leading-tight ${darkMode ? 'text-slate-550' : 'text-slate-500'}`}>
                        Nenhuma notificação ou pendência ativa no momento.
                      </p>
                    </div>
                  ) : (
                    activeNotifications.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => handleNotificationClick(item.targetTab)}
                        className={`p-3 text-left transition-colors cursor-pointer group flex items-start justify-between gap-2 ${
                          darkMode ? 'hover:bg-[#242D28]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              item.type === 'registration' ? 'bg-[#F27D26]' : 'bg-emerald-400'
                            }`}></span>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-90 whitespace-normal break-words">
                              {item.title}
                            </span>
                          </div>
                          <p className={`text-[11px] leading-snug font-medium mb-1.5 break-words ${
                            darkMode ? 'text-slate-300' : 'text-slate-650'
                          }`}>
                            {item.description}
                          </p>
                          <span className={`text-[9px] font-bold block ${
                            darkMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            📅 {item.dateStr}
                          </span>
                        </div>

                        <button
                          id={`btn-dismiss-${item.id}`}
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className={`p-1 rounded-lg border transition-all hover:scale-105 active:scale-95 flex-shrink-0 ${
                            darkMode 
                              ? 'bg-[#1B221E] border-[#2E3832] text-slate-400 hover:text-white hover:bg-[#2E3832]' 
                              : 'bg-white border-slate-200 text-slate-400 hover:text-[#9BB0A5] hover:bg-slate-50'
                          }`}
                          title="Marcar como lida"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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
            disabled={currentRole !== 'Desenvolvedor'}
            onChange={(e) => {
              const selected = clinics.find(c => c.id === e.target.value);
              if (selected) setCurrentClinic(selected);
            }}
            className={`w-full text-xs font-semibold rounded-xl px-3 py-2.5 outline-none appearance-none cursor-pointer border transition-all ${
              darkMode 
                ? 'bg-[#1B221E] border-[#2E3832] text-white focus:border-[#9BB0A5]' 
                : 'bg-[#8A9F94] border-[#7F9389] hover:bg-[#83978C] text-white focus:bg-[#8A9F94]'
            } ${currentRole !== 'Desenvolvedor' ? 'cursor-not-allowed opacity-80' : ''}`}
          >
            {clinics.filter(c => currentRole === 'Desenvolvedor' || c.id === currentClinic.id).map(clinic => (
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
                  Desenvolvedor: ['dashboard', 'patients', 'busca_estudos', 'agenda', 'eventos', 'financeiro', 'relatorios', 'comunicacao', 'clinicas'],
                  Admin: ['dashboard', 'patients', 'busca_estudos', 'agenda', 'eventos', 'financeiro', 'relatorios', 'comunicacao'],
                  Fisio: ['dashboard', 'patients', 'busca_estudos', 'agenda', 'eventos', 'relatorios'],
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
