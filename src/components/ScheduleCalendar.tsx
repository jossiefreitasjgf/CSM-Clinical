import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  MapPin, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  X, 
  MessageSquare, 
  AlertCircle,
  FileCheck2,
  Trash2,
  Phone
} from 'lucide-react';
import { Appointment, Patient, Clinic } from '../types';

interface ScheduleCalendarProps {
  currentClinic: Clinic;
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'clinicId' | 'patientName'>) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onDeleteAppointment: (id: string) => void;
  darkMode: boolean;
}

export default function ScheduleCalendar({
  currentClinic,
  appointments,
  patients,
  onAddAppointment,
  onUpdateAppointmentStatus,
  onDeleteAppointment,
  darkMode
}: ScheduleCalendarProps) {

  // Calendar views toggle: 'month' | 'week' | 'day'
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  
  // Pivot date tracking (Current focus in our calendar)
  const [pivotDate, setPivotDate] = useState<Date>(new Date('2026-06-22T12:00:00')); // Pivot on system date Jun 2026

  // Modal togglers
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAppointmentForReminder, setSelectedAppointmentForReminder] = useState<Appointment | null>(null);
  const [showReminderSentAlert, setShowReminderSentAlert] = useState(false);
  const [waLinked, setWaLinked] = useState<string | null>(() => localStorage.getItem('csm_whatsapp_linked') || currentClinic.whatsapp || null);

  useEffect(() => {
    setWaLinked(currentClinic.whatsapp || localStorage.getItem('csm_whatsapp_linked') || null);
  }, [currentClinic.whatsapp]);

  // Form states: New Appointment
  const [patId, setPatId] = useState('');
  const [appDate, setAppDate] = useState('2026-06-23');
  const [appTime, setAppTime] = useState('14:00');
  const [appType, setAppType] = useState<Appointment['type']>('Fisioterapia Motor');
  const [appPrice, setAppPrice] = useState('150');

  // Filter appointments for active clinic
  const clinicApps = appointments.filter(a => a.clinicId === currentClinic.id);

  // Core add appointment submission handler
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patId || !appDate || !appTime) return;

    onAddAppointment({
      patientId: patId,
      date: appDate,
      time: appTime,
      type: appType,
      price: parseFloat(appPrice) || 150,
      status: 'Agendado'
    });

    setPatId('');
    setShowAddModal(false);
  };

  // Switch pivot dates navigation
  const prevDate = () => {
    const d = new Date(pivotDate);
    if (calendarView === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (calendarView === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setPivotDate(d);
  };

  const nextDate = () => {
    const d = new Date(pivotDate);
    if (calendarView === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (calendarView === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setPivotDate(d);
  };

  // Send Whatsapp simulated SMS template (Módulo 8 guidelines)
  const getWhatsAppTemplateText = (app: Appointment) => {
    const patient = patients.find(p => p.id === app.patientId);
    const motherName = patient ? patient.motherName : 'Responsável';
    const firstChildName = app.patientName.split(' ')[0];
    const formattedDate = new Date(app.date + 'T12:00:00').toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'});
    
    return `Olá ${motherName}! 🎈 Lembramos que o atendimento de ${app.type} do(a) pequeno(a) ${firstChildName} está agendado para este(a) ${formattedDate} às ${app.time} na clínica CSM Clinical. Confirma a presença do paciente?`;
  };

  const handleSendReminderSimulation = (app: Appointment) => {
    // Refresh connection state from localStorage and currentClinic
    const currentWa = currentClinic.whatsapp || localStorage.getItem('csm_whatsapp_linked');
    setWaLinked(currentWa);
    setSelectedAppointmentForReminder(app);
    setShowReminderSentAlert(true);
    // Dismiss automatically after slightly longer wait for rich interaction
    setTimeout(() => {
      setShowReminderSentAlert(false);
    }, 8000);
  };

  return (
    <div id="schedule-calendar-module" className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            📅 Agenda de Atendimentos Pediátricos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-350 mt-1">
            Planeje sessões de fisioterapia motor, integração sensorial e estimulações lúdicas para as crianças da clínica.
          </p>
        </div>
        
        <button
          id="btn-add-appointment-modal"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-bold text-white bg-teal-500 rounded-2xl hover:bg-teal-600 transition-all shadow-sm shadow-teal-500/10 cursor-pointer text-center"
        >
          <Plus className="w-4 h-4" /> Marcar Consulta Individual
        </button>
      </div>

      {/* Floating alert bar showing SMS notification triggers */}
      {showReminderSentAlert && selectedAppointmentForReminder && (
        <div className="w-full">
          {!waLinked ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/25 text-amber-805 dark:text-amber-400 rounded-2xl flex items-start gap-4 text-xs leading-relaxed max-w-2xl animate-in slide-in-from-top-6 duration-300">
              <span className="text-xl mt-0.5 flex-shrink-0 animate-bounce">⚠️</span>
              <div className="space-y-1 w-full">
                <p className="font-extrabold text-amber-700 dark:text-amber-400">WhatsApp Clínico não está conectado!</p>
                <p className="text-slate-600 dark:text-slate-350 font-semibold mb-2">
                  Você precisa primeiro parear um número de telefone no painel de Configurações Administrativas para disparar confirmações oficiais aos pais dos pacientes.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      localStorage.setItem('csm_whatsapp_linked', '(11) 98311-2244');
                      setWaLinked('(11) 98311-2244');
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[10px] cursor-pointer transition-all shadow-xs"
                  >
                    ⚡ Conectar Canal de Teste Rápido
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-start gap-3.5 text-xs leading-relaxed max-w-2xl animate-in slide-in-from-top-6 duration-300">
              <span className="text-lg flex-shrink-0 animate-bounce">📲</span>
              <div className="space-y-1 w-full">
                <p className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span>Confirmação Disparada via WhatsApp ({waLinked})</span>
                  <span className="text-[8px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">ONLINE</span>
                </p>
                <p className="text-[10px] font-bold text-slate-450">
                  Responsável: {patients.find(p => p.id === selectedAppointmentForReminder.patientId)?.motherName || 'Responsável'} • Paciente: {selectedAppointmentForReminder.patientName}
                </p>
                <p className="font-semibold italic text-[11px] bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-500/15 dark:border-slate-800 mt-2 text-slate-700 dark:text-slate-200">
                  "{getWhatsAppTemplateText(selectedAppointmentForReminder)}"
                </p>
                <span className="text-[9px] text-slate-450 block font-bold pt-1.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500 inline-block animate-pulse"></span> Log: Mensagem entregue e lida com sucesso!
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Controls calendar headers Row */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex border border-slate-205 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={prevDate}
              className={`p-2.5 transition-colors ${
                darkMode ? 'bg-slate-900 border-r border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-r border-slate-100 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextDate}
              className={`p-2.5 transition-colors ${
                darkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            📅 {pivotDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        {/* View selection controls */}
        <div className="flex gap-1.5 p-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
          {(['month', 'week', 'day'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCalendarView(view)}
              className={`py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all capitalize ${
                calendarView === view
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              {view === 'month' ? 'Mês' : view === 'week' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE CALENDAR ACCORDING TO TOGGLE */}
      {calendarView === 'month' ? (
        /* MONTH GRID - June 2026 simulation */
        <div className={`p-6 rounded-3xl border ${
          darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          {/* Days headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100 dark:border-slate-800">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* June calendar spaces */}
          <div className="grid grid-cols-7 gap-3 mt-4">
            {/* June starts on Monday (1). 1 empty container spacer is Dom */}
            <div className="h-28 p-2 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 text-slate-300 pointer-events-none border border-transparent">
              <span className="text-xs font-bold">31</span>
            </div>

            {/* Days 1 to 30 */}
            {Array.from({ length: 30 }).map((_, i) => {
              const dayNo = i + 1;
              const formattedDay = `2026-06-${dayNo.toString().padStart(2, '0')}`;
              
              // Appointments for this specific day
              const dayApps = clinicApps.filter(a => a.date === formattedDay);
              const isToday = dayNo === 22; // Pivot system date is Monday June 22

              return (
                <div
                  key={dayNo}
                  className={`h-28 p-2.5 rounded-2xl border transition-all ${
                    isToday
                      ? 'bg-teal-500/5 border-teal-500/30 ring-2 ring-teal-500/10'
                      : darkMode
                        ? 'bg-slate-900/30 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                        : 'bg-slate-50/30 border-slate-150 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold ${
                      isToday
                        ? 'text-white bg-teal-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black'
                        : 'text-slate-650 dark:text-slate-300'
                    }`}>
                      {dayNo}
                    </span>
                    {dayApps.length > 0 && (
                      <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full leading-none">
                        {dayApps.length} pias
                      </span>
                    )}
                  </div>

                  {/* Inline micro previews of appointments */}
                  <div className="mt-2 space-y-1 max-h-[60px] overflow-y-auto overflow-x-hidden">
                    {dayApps.slice(0, 2).map((app) => {
                      const firstVal = app.patientName.split(' ')[0];
                      const appStatusColor = app.status === 'Realizado' ? 'bg-slate-400' : 'bg-teal-500';
                      
                      return (
                        <div
                          key={app.id}
                          onClick={() => handleSendReminderSimulation(app)}
                          className="text-[9px] font-bold p-1 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/60 rounded-md cursor-pointer flex items-center gap-1 hover:border-teal-500 truncate"
                          title={`Ver lembrete para ${app.patientName}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${appStatusColor}`}></span>
                          <span className="truncate max-w-[50px]">{firstVal}</span>
                          <span className="text-slate-400 font-normal">{app.time}</span>
                        </div>
                      );
                    })}
                    {dayApps.length > 2 && (
                      <div className="text-[8px] font-black text-slate-400 text-center leading-none">
                        + {dayApps.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* DIRECTORY LIST - Week and Day lists views (Module 8) */
        <div className="space-y-4">
          <div className={`p-6 rounded-3xl border ${
            darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              📋 Grade Chronológica de Consultas
            </h4>

            {clinicApps.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
                <p className="text-xs font-bold italic">Nenhuma consulta agendada para este filtro.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clinicApps
                  .sort((a,b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
                  .map((app) => {
                    const patient = patients.find(p => p.id === app.patientId);
                    
                    return (
                      <div
                        key={app.id}
                        className={`p-4 rounded-2xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          darkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50/40 border-slate-150 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Left date calendar bubble */}
                          <div className={`p-2.5 rounded-2xl border text-center font-bold text-xs min-w-[55px] ${
                            darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-150'
                          }`}>
                            <span className="text-indigo-500 block leading-none font-black text-sm">
                              {new Date(app.date + 'T12:00:00').getDate()}
                            </span>
                            <span className="text-[8px] text-slate-400 uppercase tracking-widest block mt-1">
                              {new Date(app.date + 'T12:00:00').toLocaleDateString('pt-BR', {month: 'short'})}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100">
                                👦 {app.patientName}
                              </h4>
                              {patient && (
                                <span className="text-[10px] text-slate-400 font-bold">
                                  ({patient.motherName} - {patient.phone})
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] font-bold text-teal-650 dark:text-teal-400">
                              ⚡ Sessão de {app.type}
                            </p>

                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-450 pt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" /> {app.time}
                              </span>
                              <span>•</span>
                              <span>Preço: R$ {app.price.toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Reminders / Status change triggers */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Send WhatsApp simulated reminder (Módulo 8) */}
                          <button
                            onClick={() => handleSendReminderSimulation(app)}
                            className="p-1.5 px-3 text-[10px] bg-emerald-50 dark:bg-emerald-550/15 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30 rounded-xl hover:bg-emerald-100/50 transition-all flex items-center gap-1 cursor-pointer font-black"
                            title="Disparar Lembrete WhatsApp"
                          >
                            <Phone className="w-3.5 h-3.5" /> Lembrete WhatsApp
                          </button>

                          {/* Quick statuses selectors */}
                          <select
                            value={app.status}
                            onChange={(e) => onUpdateAppointmentStatus(app.id, e.target.value as Appointment['status'])}
                            className={`text-[10px] font-extrabold rounded-lg px-2 py-1 outline-none border ${
                              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-205 text-slate-700'
                            }`}
                          >
                            <option value="Agendado">Agendado</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="Reagendado">Reagendado</option>
                            <option value="Cancelado">Cancelado</option>
                            <option value="Realizado">Realizado</option>
                          </select>

                          {/* Delete Consultation */}
                          <button
                            onClick={() => {
                              if (confirm('Deseja cancelar e excluir este compromisso de atendimento?')) {
                                onDeleteAppointment(app.id);
                              }
                            }}
                            className="p-1 px-1.5 border border-transparent rounded-lg hover:border-slate-205 text-slate-400 hover:text-rose-500 transition-all"
                            title="Remover Atendimento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Book New Appointment slots */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-3xl border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-205'
          }`}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                📅 Marcar Novo Atendimento individual
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                
                {/* Patient selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selecionar Criança *</label>
                  <select
                    required
                    value={patId}
                    onChange={(e) => setPatId(e.target.value)}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' : 'bg-slate-50 border-slate-200 text-slate-850 focus:bg-white focus:border-teal-400'
                    }`}
                  >
                    <option value="">Selecione um paciente...</option>
                    {patients.filter(p => p.clinicId === currentClinic.id).map(p => (
                      <option key={p.id} value={p.id}>
                        👦 {p.name} (mãe: {p.motherName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and hour picker */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data do Atendimento</label>
                    <input
                      type="date"
                      required
                      value={appDate}
                      onChange={(e) => setAppDate(e.target.value)}
                      className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horário de início</label>
                    <input
                      type="time"
                      required
                      value={appTime}
                      onChange={(e) => setAppTime(e.target.value)}
                      className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                      }`}
                    />
                  </div>
                </div>

                {/* Session Type selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Sessão / Atendimento</label>
                  <select
                    value={appType}
                    onChange={(e) => setAppType(e.target.value as any)}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  >
                    <option value="Avaliação">Avaliação Clínica Pediatra</option>
                    <option value="Fisioterapia Motor">Fisioterapia Pediátrica Motor</option>
                    <option value="Fisioterapia Respiratória">Fisioterapia Respiratória</option>
                    <option value="Estimulação Precoce">Estimulação Precoce</option>
                    <option value="Pilates Infantil">Pilates Infantil Adaptativo</option>
                    <option value="Integração Sensorial">Integração Sensorial / Processamento</option>
                  </select>
                </div>

                {/* Session value */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valor Investimento por consulta (R$)</label>
                  <input
                    type="number"
                    required
                    value={appPrice}
                    onChange={(e) => setAppPrice(e.target.value)}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  Marcar Atendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
