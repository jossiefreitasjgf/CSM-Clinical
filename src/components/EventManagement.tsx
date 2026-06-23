import React, { useState } from 'react';
import { 
  CalendarDays, 
  MapPin, 
  DollarSign, 
  Users, 
  Link as LinkIcon, 
  Copy, 
  Plus, 
  AlertCircle, 
  Check, 
  UserCheck, 
  UserX,
  FileCheck,
  ChevronDown,
  Trash2,
  UploadCloud,
  Sparkles
} from 'lucide-react';
import { TherapeuticEvent, Registration, Patient, Attendance, Clinic } from '../types';

interface EventManagementProps {
  currentClinic: Clinic;
  events: TherapeuticEvent[];
  registrations: Registration[];
  patients: Patient[];
  attendances: Attendance[];
  onAddEvent: (event: Omit<TherapeuticEvent, 'id' | 'clinicId'>) => void;
  onUpdateEventStatus: (id: string, status: TherapeuticEvent['status']) => void;
  onToggleAttendance: (eventId: string, patientId: string, present: boolean) => void;
  onUpdateAttendanceNotes: (eventId: string, patientId: string, notes: string) => void;
  onDeleteEvent: (id: string) => void;
  onOpenPublicFormByEvent: (eventId: string) => void;
  darkMode: boolean;
}

export default function EventManagement({
  currentClinic,
  events,
  registrations,
  patients,
  attendances,
  onAddEvent,
  onUpdateEventStatus,
  onToggleAttendance,
  onUpdateAttendanceNotes,
  onDeleteEvent,
  onOpenPublicFormByEvent,
  darkMode
}: EventManagementProps) {

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEventIdForRollCall, setSelectedEventIdForRollCall] = useState<string | null>(null);
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  // Form states for new event
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-06-25');
  const [time, setTime] = useState('14:00');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('150');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [status, setStatus] = useState<'Aberto' | 'Encerrado' | 'Cancelado'>('Aberto');
  const [image, setImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Curated pediatric therapeutic event preset image templates
  const PRESET_IMAGES = [
    {
      name: 'Estimulação Motora',
      url: 'https://images.unsplash.com/photo-1545558014-8687977e99a5?auto=format&fit=crop&q=80&w=400',
      label: '🎈 Psicomotora'
    },
    {
      name: 'Integração Sensorial',
      url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=400',
      label: '🎨 Sensorial'
    },
    {
      name: 'Celebração Infantil',
      url: 'https://images.unsplash.com/photo-1533256692281-7c9ac70327f2?auto=format&fit=crop&q=80&w=400',
      label: '🍿 Recreativo'
    },
    {
      name: 'Fisioterapia Clássica',
      url: 'https://images.unsplash.com/photo-1481824429379-07aa5e5b0739?auto=format&fit=crop&q=80&w=400',
      label: '✨ Geral'
    }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter events by clinic
  const clinicEvents = events.filter(e => e.clinicId === currentClinic.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !theme || !date || !time) return;

    onAddEvent({
      name,
      theme,
      description,
      date,
      time,
      location: location || 'CSM Clinical Matriz',
      price: parseFloat(price) || 0,
      maxParticipants: parseInt(maxParticipants) || 10,
      status,
      image: image || undefined
    });

    // Reset Form
    setName('');
    setTheme('');
    setDescription('');
    setLocation('');
    setPrice('150');
    setMaxParticipants('10');
    setStatus('Aberto');
    setImage('');
    setShowAddModal(false);
  };

  const copyLink = (eventId: string) => {
    // Generate simulated URL according to Module 1 guidelines
    const publicUrl = `${window.location.origin}?publicEventId=${eventId}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopiedEventId(eventId);
      setTimeout(() => setCopiedEventId(null), 2500);
    });
  };

  return (
    <div id="event-management-module" className="space-y-6">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            🎈 Gestão de Eventos Terapêuticos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Crie workshops lúdicos de estimulação motora, configure inscrições públicas e gerencie listas de presença.
          </p>
        </div>
        <button
          id="btn-add-event-modal"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-white bg-teal-500 rounded-2xl hover:bg-teal-600 transition-all shadow-sm shadow-teal-500/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Evento Terapêutico
        </button>
      </div>

      {/* Events Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clinicEvents.map((event) => {
          // Calculate registered count for this event
          const eventRegs = registrations.filter(r => r.eventId === event.id && r.status === 'Aprovado');
          const registeredCount = eventRegs.length;
          const isFull = registeredCount >= event.maxParticipants;
          
          return (
            <div
              key={event.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-md ${
                darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100 hover:shadow-slate-100/40'
              }`}
            >
              {/* Event Image Banner */}
              {event.image && (
                <div className="w-full h-36 rounded-2xl overflow-hidden mb-4 relative border border-slate-100 dark:border-slate-800 flex-shrink-0">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover hover:scale-[105%] transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Event Meta */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {/* Status Indicator Badge */}
                  <span className={`text-[9px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full ${
                    event.status === 'Aberto' 
                      ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20' 
                      : event.status === 'Encerrado' 
                        ? 'bg-slate-500/10 text-slate-500 dark:bg-slate-500/25' 
                        : 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20'
                  }`}>
                    {event.status}
                  </span>
                  
                  {/* Participant Ratio Gauge */}
                  <span className={`text-xs font-semibold ${
                    isFull ? 'text-rose-500' : 'text-slate-400'
                  }`}>
                    👥 {registeredCount} / {event.maxParticipants} vagas
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white line-clamp-1">
                    {event.name}
                  </h3>
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5 line-clamp-1">
                    🎯 Tema: {event.theme}
                  </p>
                  <p className="text-xs text-slate-450 dark:text-slate-450 mt-2 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Event Schedule Info Box */}
                <div className={`p-3 rounded-2xl space-y-1.5 text-xs font-semibold ${
                  darkMode ? 'bg-slate-900/50' : 'bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                    <CalendarDays className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>
                      {new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR')} às {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                    <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                    <DollarSign className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>
                      {event.price === 0 ? 'Gratuito' : `R$ ${event.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Rows */}
              <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                
                {/* Simulated Public URL copier */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => copyLink(event.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold rounded-xl border transition-all ${
                      copiedEventId === event.id
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : darkMode
                          ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                          : 'bg-white border-slate-250 text-slate-600 hover:bg-slate-50'
                    }`}
                    title="Copiar link público para divulgação WhatsApp"
                  >
                    {copiedEventId === event.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Link Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" /> Copiar Link Público
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onOpenPublicFormByEvent(event.id)}
                    className="flexItemsCenter px-3 py-2.5 bg-teal-50 dark:bg-teal-500/15 border border-teal-100 dark:border-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-bold rounded-xl hover:bg-teal-100/50 flex items-center justify-center gap-1"
                    title="Abrir o formulário de matrícula para preenchimento de simulação"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Simular Inscrição
                  </button>
                </div>

                {/* Event Status Toggles and List Check-In control */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">Status:</span>
                    <select
                      value={event.status}
                      onChange={(e) => onUpdateEventStatus(event.id, e.target.value as TherapeuticEvent['status'])}
                      className={`text-[10px] font-extrabold rounded-lg px-2 py-1 outline-none border ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <option value="Aberto">Aberto</option>
                      <option value="Encerrado">Encerrado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedEventIdForRollCall(
                          selectedEventIdForRollCall === event.id ? null : event.id
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                        selectedEventIdForRollCall === event.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-indigo-50 dark:bg-indigo-505/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50'
                      }`}
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Frequência
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza de que deseja excluir este evento terapêutico?')) {
                          onDeleteEvent(event.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 cursor-pointer"
                      title="Excluir Evento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* MÓDULO 5: Attendance / Roll Call Collapsible Panel (Live) */}
              {selectedEventIdForRollCall === event.id && (
                <div className={`mt-5 p-4 rounded-2xl border transition-all text-xs ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-150'
                }`}>
                  <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px] mb-3 flex items-center gap-1.5">
                    📋 Lista de Chamada e Presença
                  </h4>

                  {eventRegs.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 space-y-1">
                      <AlertCircle className="w-5 h-5 mx-auto text-slate-300" />
                      <p className="text-[10px] font-semibold italic">Nenhum participante inscrito e aprovado neste evento.</p>
                      <p className="text-[9px] text-slate-430 leading-snug">
                        Use o botão "Simular Inscrição" para preencher dados no formulário público de teste!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {eventRegs.map((reg) => {
                        const childPatient = patients.find(p => p.id === reg.childId);
                        
                        // Check if presence is already registered
                        const attendanceEntry = attendances.find(
                          a => a.eventId === event.id && a.patientId === (childPatient?.id || '')
                        );
                        const isPresent = attendanceEntry ? attendanceEntry.present : false;
                        
                        return (
                          <div 
                            key={reg.id} 
                            className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-700/60 flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-extrabold text-slate-800 dark:text-slate-100 max-w-[120px] truncate">
                                👦 {reg.childName}
                              </span>
                              
                              {/* Presence toggle buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => onToggleAttendance(event.id, childPatient?.id || '', true)}
                                  className={`p-1 px-2.5 text-[9px] font-black rounded-md flex items-center gap-1 border transition-all ${
                                    isPresent
                                      ? 'bg-emerald-500 border-emerald-505 text-white'
                                      : darkMode
                                        ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                                  }`}
                                >
                                  <UserCheck className="w-3 h-3" /> PRESENTE
                                </button>
                                
                                <button
                                  onClick={() => onToggleAttendance(event.id, childPatient?.id || '', false)}
                                  className={`p-1 px-2.5 text-[9px] font-black rounded-md flex items-center gap-1 border transition-all ${
                                    (!isPresent && attendanceEntry)
                                      ? 'bg-slate-400 border-slate-400 text-white'
                                      : darkMode
                                        ? 'bg-slate-800 border-slate-700 text-slate-450 hover:text-white'
                                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                                  }`}
                                >
                                  <UserX className="w-3 h-3" /> FALTOU
                                </button>
                              </div>
                            </div>

                            {/* Feed observation text field */}
                            <input
                              type="text"
                              value={attendanceEntry?.notes || ''}
                              onChange={(e) => onUpdateAttendanceNotes(event.id, childPatient?.id || '', e.target.value)}
                              placeholder="Observações do comportamento/desempenho..."
                              className={`w-full text-[10px] px-2.5 py-1.5 rounded-lg Outline-none border ${
                                darkMode 
                                  ? 'bg-slate-900 border-slate-700 text-white focus:border-teal-500' 
                                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-400'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Adding event custom Dialog modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-xl rounded-3xl border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-205'
          }`}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-transparent to-transparent">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                🎈 Criar Novo Evento Terapêutico
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500 border border-transparent rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nome do Evento
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Circuito Motor dos Animais da Selva"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-850 focus:border-teal-400 focus:bg-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tema do Evento
                  </label>
                  <input
                    type="text"
                    required
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Ex: Coordenação Motora Grossa e Fortalecimento"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-850 focus:border-teal-400 focus:bg-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Descrição
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explicitar o escopo do evento, público alvo recomendado, dinâmicas e objetivos terapeuticos envolvidos..."
                    rows={2}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all resize-none ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-850 focus:border-teal-400 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Theme Image Uploader */}
                <div className="space-y-2 col-span-1 sm:col-span-2 pb-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Imagem Temática do Evento
                    </label>
                    {image && (
                      <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase px-1.5 py-0.5 bg-teal-50 dark:bg-teal-500/10 rounded-md">
                        ✓ Imagem Carregada
                      </span>
                    )}
                  </div>
                  
                  {/* Preset Quick Selection Buttons */}
                  <div className="flex flex-wrap gap-1.5 mb-1 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 self-center uppercase mr-1">Sugestões:</span>
                    {PRESET_IMAGES.map((imgPreset) => (
                      <button
                        key={imgPreset.name}
                        type="button"
                        onClick={() => setImage(imgPreset.url)}
                        className={`px-2.5 py-1 rounded-xl text-[9px] font-black border transition-all flex items-center gap-1 cursor-pointer ${
                          image === imgPreset.url
                            ? 'bg-teal-500 border-teal-500 text-white shadow-sm shadow-teal-505/10'
                            : darkMode
                              ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        {imgPreset.label}
                      </button>
                    ))}
                  </div>

                  {/* Drag-and-Drop / File selection stage */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-4 transition-all text-center relative flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      isDragging
                        ? 'border-teal-500 bg-teal-500/5'
                        : darkMode
                          ? 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                          : 'border-slate-205 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    {image ? (
                      <div className="w-full relative group">
                        <img
                          src={image}
                          alt="Previsualização do Tema"
                          className="w-full h-32 object-cover rounded-xl border border-slate-100 dark:border-slate-850"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1.5 text-[9px] font-black shadow-md hover:scale-105 transition-all cursor-pointer"
                        >
                          Excluir
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer w-full py-2 flex flex-col items-center justify-center gap-1.5">
                        <UploadCloud className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-slate-600 dark:text-slate-300">
                            Arraste uma imagem ou clique para selecionar
                          </p>
                          <p className="text-[9px] text-slate-450">
                            Suporta PNG, JPG, JPEG ou GIF (Convertido em Base64 local)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Manual URL field if they want a custom web link */}
                  <div className="pt-1">
                    <input
                      type="text"
                      value={image.startsWith('data:') ? '' : image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Ou cole o link (URL) de uma imagem externa..."
                      className={`w-full text-[10px] font-semibold rounded-xl px-3 py-2.5 outline-none border transition-all ${
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-850 focus:border-teal-400 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-850 focus:border-teal-400 focus:bg-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-850 focus:border-teal-400 focus:bg-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Local do Evento
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Área externa ou Sala 2"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-850 focus:border-teal-400 focus:bg-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Valor de Inscrição (R$)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 150"
                    min="0"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-850 focus:border-teal-400 focus:bg-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Limite Participantes
                  </label>
                  <input
                    type="number"
                    required
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    placeholder="Ex: 10"
                    min="1"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-850 focus:border-teal-400 focus:bg-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Status Inicial
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Aberto' | 'Encerrado' | 'Cancelado')}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-850 focus:border-teal-400 focus:bg-white'
                    }`}
                  >
                    <option value="Aberto">Aberto</option>
                    <option value="Encerrado">Encerrado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-105'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-600 text-white transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  Criar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
