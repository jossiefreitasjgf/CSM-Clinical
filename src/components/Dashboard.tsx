import React from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { Patient, TherapeuticEvent, Appointment, FinancialTransaction, Registration, Clinic, UserRole } from '../types';

interface DashboardProps {
  currentClinic: Clinic;
  patients: Patient[];
  events: TherapeuticEvent[];
  appointments: Appointment[];
  transactions: FinancialTransaction[];
  registrations: Registration[];
  setActiveTab: (tab: string) => void;
  setSelectedPatientId: (id: string | null) => void;
  darkMode: boolean;
  currentRole: UserRole;
}

export default function Dashboard({
  currentClinic,
  patients,
  events,
  appointments,
  transactions,
  registrations,
  setActiveTab,
  setSelectedPatientId,
  darkMode,
  currentRole
}: DashboardProps) {

  // Filter state dynamically by active clinic
  const clinicPatients = patients.filter(p => p.clinicId === currentClinic.id);
  const clinicEvents = events.filter(e => e.clinicId === currentClinic.id);
  const clinicAppointments = appointments.filter(a => a.clinicId === currentClinic.id);
  const clinicTransactions = transactions.filter(t => t.clinicId === currentClinic.id);
  const clinicRegs = registrations.filter(r => r.clinicId === currentClinic.id);

  // Key metrics calculation
  const totalPatients = clinicPatients.length;
  const totalEvents = clinicEvents.length;
  const futureEventsCount = clinicEvents.filter(e => e.status === 'Aberto').length;
  
  // June 2026 Financial Calculations (current local time in metadata is June 2026)
  const currentMonthTransactions = clinicTransactions.filter(t => t.date.startsWith('2026-06'));
  
  const revenueMonth = currentMonthTransactions
    .filter(t => t.type === 'Receita')
    .reduce((sum, t) => sum + t.value, 0);

  const expensesMonth = currentMonthTransactions
    .filter(t => t.type === 'Despesa')
    .reduce((sum, t) => sum + t.value, 0);

  const netProfit = revenueMonth - expensesMonth;
  const marginPercentage = revenueMonth > 0 ? Math.round((netProfit / revenueMonth) * 100) : 0;

  // Active registrations
  const totalRegisteredInscriptions = clinicRegs.filter(r => r.status === 'Aprovado').length;
  const pendingInscriptions = clinicRegs.filter(r => r.status === 'Pendente').length;

  // Upcoming appointments
  const upcomingAppointments = clinicAppointments
    .filter(a => a.status === 'Agendado' || a.status === 'Confirmado')
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 5);

  // Diagnosis distribution
  const diagnosisMap: Record<string, number> = {};
  clinicPatients.forEach(p => {
    // Simplify diagnosis labels for charting
    let diag = p.diagnosis;
    if (diag.toLowerCase().includes('paralisia cerebral')) diag = 'Paralisia Cerebral';
    else if (diag.toLowerCase().includes('autista') || diag.toLowerCase().includes('tea')) diag = 'Espectro Autista (TEA)';
    else if (diag.toLowerCase().includes('down') || diag.toLowerCase().includes('t21')) diag = 'Síndrome de Down';
    else if (diag.toLowerCase().includes('mielo')) diag = 'Mielomeningocele';
    else diag = 'Outro';
    
    diagnosisMap[diag] = (diagnosisMap[diag] || 0) + 1;
  });

  const diagnosisList = Object.entries(diagnosisMap).map(([name, count]) => ({
    name,
    count,
    percentage: totalPatients > 0 ? Math.round((count / totalPatients) * 100) : 0
  })).sort((a, b) => b.count - a.count);
  const getUserName = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'Dra. Ana Flávia';
      case 'Fisio':
        return 'Dra. Gabriela Nunes';
      case 'Recepcao':
        return 'Silvia Souza';
      default:
        return 'Dra. Ana Flávia';
    }
  };

  const getTodayFormatted = () => {
    const today = new Date();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    return { day, month, year };
  };

  const todayDate = getTodayFormatted();

  return (
    <div id="dashboard-module" className="space-y-8 pb-12">
      {/* Editorial Header / Masthead */}
      <header className="pb-6 border-b border-[#E5E3DB] dark:border-[#2E3832] flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-[#9BB0A5] mb-2 font-sans">
            CSM Clinical Professional Dashboard
          </p>
          <h1 className="text-4xl md:text-5xl font-serif italic font-light tracking-tight text-emerald-800 dark:text-[#9BB0A5]">
            Olá, <span className="font-semibold">{getUserName(currentRole)}</span>
          </h1>
        </div>
        <div className="text-left md:text-right">
          <p className="text-2xl md:text-3xl font-light text-slate-800 dark:text-slate-100">
            {todayDate.day} {todayDate.month} <span className="text-emerald-700 dark:text-[#9BB0A5] font-medium">{todayDate.year}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Clínica Ativa: {currentClinic.name}
          </p>
        </div>
      </header>

      {/* Featured Dynamic Editorial Section */}
      {clinicEvents.length > 0 && (
        <section>
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-xs uppercase tracking-widest font-bold opacity-40">Evento em Destaque</h2>
            <span className="px-3 py-1 bg-[#A2C4D2] text-white text-[10px] rounded-full uppercase font-bold tracking-wider">
              Inscrições Abertas
            </span>
          </div>
          {(() => {
            const featuredEvent = clinicEvents.find(e => e.status === 'Aberto') || clinicEvents[0];
            return (
              <div className={`relative group border p-6 md:p-8 rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 ${
                darkMode ? 'bg-[#242D28] border-[#2E3832] text-[#ECEBE5]' : 'bg-white border-[#E5E3DB] text-[#2D312E]'
              }`}>
                <div className="w-full md:w-40 h-40 bg-[#E5E3DB] dark:bg-[#1B221E] rounded-3xl overflow-hidden flex items-center justify-center text-[#9BB0A5]">
                  <Calendar className="w-16 h-16 stroke-1 text-[#9BB0A5]" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-[#F27D26] uppercase tracking-wider block mb-1">
                    Tema: {featuredEvent.theme}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif text-[#2D312E] dark:text-white mb-2 leading-tight">
                    {featuredEvent.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                    {featuredEvent.description || 'Oficinas e exploração multissensorial com foco em motricidade corporal e integração de estímulos vestibular e proprioceptivo de forma lúdica.'}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-widest font-semibold text-[#8A9F94] dark:text-[#9BB0A5]">
                    <span>📅 {new Date(featuredEvent.date + 'T12:00:00').toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})}</span>
                    <span>⏰ {featuredEvent.time}h</span>
                    <span>👥 {clinicRegs.filter(r => r.eventId === featuredEvent.id && r.status === 'Aprovado').length} / {featuredEvent.maxParticipants} vagas preenchidas</span>
                    <span className="text-[#2D312E] dark:text-white font-serif text-sm italic">R$ {featuredEvent.price}</span>
                  </div>
                </div>
                <div className="absolute -top-3 right-4 bg-[#F27D26] text-white px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full transform rotate-3">
                  Inscrições Ativas
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        <div 
          onClick={() => setActiveTab('patients')}
          className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer ${
            darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB] shadow-sm'
          }`}
        >
          <p className="text-5xl font-light font-serif tracking-tight text-[#2D312E] dark:text-[#ECEBE5]">{totalPatients}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#8A9F94] font-bold mt-2">Pacientes Ativos</p>
          <p className="text-[10px] text-slate-400 mt-2">✔ Prontuários atualizados</p>
        </div>

        <div 
          onClick={() => setActiveTab('eventos')}
          className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer ${
            darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB] shadow-sm'
          }`}
        >
          <p className="text-5xl font-light font-serif tracking-tight text-[#2D312E] dark:text-[#ECEBE5]">{totalEvents}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#8A9F94] font-bold mt-2">Eventos Terapêuticos</p>
          <p className="text-[10px] text-slate-400 mt-2">✨ {futureEventsCount} com inscrições abertas</p>
        </div>

        <div 
          onClick={() => setActiveTab('financeiro')}
          className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer ${
            darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB] shadow-sm'
          }`}
        >
          <p className="text-4xl font-light font-serif tracking-tight text-[#F27D26]">R$ {revenueMonth.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#8A9F94] font-bold mt-3">Receita (Junho)</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {pendingInscriptions} pagamentos pendentes
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('financeiro')}
          className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer ${
            darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB] shadow-sm'
          }`}
        >
          <p className={`text-4xl font-light font-serif tracking-tight ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
            R$ {netProfit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[#8A9F94] font-bold mt-3">Saldo Líquido</p>
          <p className="text-[10px] text-slate-450 dark:text-slate-450 mt-2">{marginPercentage}% Margem Operacional</p>
        </div>
      </section>

      {/* Split Content View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left pane: Diagnostics & Motor evolution micro table (Col 1-8) */}
        <div className={`lg:col-span-8 p-6 md:p-8 border rounded-[2rem] shadow-sm space-y-8 ${
          darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB]'
        }`}>
          <div>
            <h2 className="text-xs uppercase tracking-widest font-bold opacity-40 mb-2">Evolução de Atividades & Demanda</h2>
            <h3 className="text-2xl font-serif text-[#2D312E] dark:text-white">Perfil Demográfico do Consultor</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Diagnostics distribution */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest font-bold text-[#8A9F94] dark:text-[#9BB0A5]">
                🏷️ Distribuição de Diagnósticos
              </h4>
              <div className="space-y-3 pt-2">
                {diagnosisList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum paciente ativo cadastrado.</p>
                ) : (
                  diagnosisList.map((item, index) => {
                    const colorCodes = ['bg-[#A2C4D2]', 'bg-[#9BB0A5]', 'bg-[#F27D26]', 'bg-[#8A9F94]', 'bg-slate-300'];
                    const activeColorClass = colorCodes[index % colorCodes.length];
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${activeColorClass}`}></span>
                            {item.name}
                          </span>
                          <span className="text-slate-500">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#E5E3DB] dark:bg-[#1B221E] h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${item.percentage}%` }}
                            className={`h-full rounded-full ${activeColorClass}`}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick cash inflow review */}
            <div className="flex flex-col justify-between p-5 rounded-2xl bg-[#F9F8F3] dark:bg-[#1B221E] border border-[#E5E3DB] dark:border-[#2E3832]">
              <div>
                <h4 className="text-xs uppercase tracking-widest font-bold text-[#8A9F94] dark:text-[#9BB0A5]">
                  📊 Fluxo de Entradas
                </h4>
                <p className="text-3xl font-light font-serif mt-2 text-[#2D312E] dark:text-white">
                  R$ {revenueMonth.toLocaleString('pt-BR')}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Volume arrecadado com inscrições e atendimentos no consultório.
                </p>
              </div>

              {/* Dynamic Micro-Chart of inflows Category */}
              <div className="mt-4 h-24 flex items-end justify-between px-2 pt-2 border-t border-[#E5E3DB] dark:border-[#2E3832]">
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className="w-5 bg-[#A2C4D2]/40 hover:bg-[#A2C4D2] rounded-t h-12 transition-all cursor-pointer relative group">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 p-1 bg-slate-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      R$ {clinicTransactions.filter(t => t.category === 'Inscrição de Evento').reduce((s,t) => s + t.value, 0)}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#8A9F94] uppercase tracking-tighter">Eventos</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className="w-5 bg-[#9BB0A5]/45 hover:bg-[#9BB0A5] rounded-t h-16 transition-all cursor-pointer relative group">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 p-1 bg-slate-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      R$ {clinicTransactions.filter(t => t.category.includes('Atendimento') || t.category.includes('Consulta')).reduce((s,t) => s + t.value, 0)}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#8A9F94] uppercase tracking-tighter">Sessões</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className="w-5 bg-[#E5E3DB]/80 hover:bg-[#9BB0A5] rounded-t h-6 transition-all cursor-pointer relative group">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 p-1 bg-slate-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      R$ 0
                    </span>
                  </div>
                  <span className="text-[9px] text-[#8A9F94] uppercase tracking-tighter">Outros</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className="w-5 bg-rose-500/20 hover:bg-rose-500 rounded-t h-20 transition-all cursor-pointer relative group">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 p-1 bg-slate-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      R$ {expensesMonth}
                    </span>
                  </div>
                  <span className="text-[9px] text-rose-500 font-bold uppercase tracking-tighter">Saídas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Motor Evolution Micro Chart */}
          <div className="pt-4 border-t border-[#E5E3DB] dark:border-[#2E3832]">
            <h4 className="text-xs uppercase tracking-widest font-bold opacity-45 mb-4">Evolução Motora Global (Geral)</h4>
            <div className="flex items-end gap-2 h-20">
              <div className="flex-1 bg-[#A2C4D2] h-[40%] rounded-t-lg opacity-40"></div>
              <div className="flex-1 bg-[#A2C4D2] h-[55%] rounded-t-lg opacity-50"></div>
              <div className="flex-1 bg-[#A2C4D2] h-[48%] rounded-t-lg opacity-60"></div>
              <div className="flex-1 bg-[#A2C4D2] h-[70%] rounded-t-lg opacity-70"></div>
              <div className="flex-1 bg-[#9BB0A5] h-[85%] rounded-t-lg"></div>
              <div className="flex-1 bg-[#9BB0A5] h-[92%] rounded-t-lg shadow-sm"></div>
              <div className="flex-1 bg-[#E5E3DB] dark:bg-[#1B221E] h-[30%] rounded-t-lg"></div>
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-[#8A9F94] uppercase tracking-widest font-semibold">
              <span>Maio</span>
              <span>Junho</span>
              <span>Julho</span>
              <span>Agosto</span>
              <span>Setembro</span>
              <span>Outubro</span>
              <span>Projeção</span>
            </div>
          </div>
        </div>

        {/* Right pane: Upcoming Sessions & Actions (Col 9-12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upcoming sessions */}
          <div className={`p-6 border rounded-[2rem] shadow-sm space-y-6 ${
            darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB]'
          }`}>
            <div className="flex justify-between items-baseline">
              <h2 className="text-xs uppercase tracking-widest font-bold opacity-40">Próximos Atendimentos</h2>
              <button 
                id="goToCalendarBtn"
                onClick={() => setActiveTab('agenda')}
                className="text-[10px] uppercase font-bold tracking-widest text-[#9BB0A5] hover:underline"
              >
                Agenda →
              </button>
            </div>

            <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
              {upcomingAppointments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">Nenhum atendimento agendado.</p>
              ) : (
                upcomingAppointments.map((app) => {
                  const patient = patients.find(p => p.id === app.patientId);
                  return (
                    <div 
                      key={app.id} 
                      onClick={() => {
                        setSelectedPatientId(app.patientId);
                        setActiveTab('patients');
                      }}
                      className="flex items-center gap-3 group cursor-pointer hover:opacity-85"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#E5E3DB] dark:bg-[#1B221E] overflow-hidden border border-white dark:border-[#2E3832] flex-shrink-0">
                        {patient?.photo ? (
                          <img src={patient.photo} alt={app.patientName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-serif font-bold text-slate-500">
                            {app.patientName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate text-[#2D312E] dark:text-white">{app.patientName}</p>
                        <p className="text-[10px] text-[#8A9F94] dark:text-[#9BB0A5] uppercase tracking-wider truncate">
                          {app.time} • {app.type}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 border border-[#E5E3DB] dark:border-[#2E3832] rounded-md uppercase font-bold text-slate-500 flex-shrink-0">
                        {app.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Rapid actions cards */}
          <div className={`p-6 border rounded-[2rem] shadow-sm space-y-4 ${
            darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB]'
          }`}>
            <h2 className="text-xs uppercase tracking-widest font-bold opacity-40">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActiveTab('eventos')}
                className="p-4 border border-[#9BB0A5] text-[#2D312E] dark:text-[#ECEBE5] hover:bg-[#9BB0A5] hover:text-white rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-center"
              >
                <span className="text-xl font-serif">📅</span>
                <span className="text-[9px] uppercase font-bold tracking-widest">Novo Evento</span>
              </button>
              <button 
                onClick={() => setActiveTab('relatorios')}
                className="p-4 border border-[#E5E3DB] dark:border-[#2E3832] bg-white dark:bg-[#1B221E] hover:bg-slate-100 dark:hover:bg-[#2E3832] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-[#2D312E] dark:text-[#ECEBE5] text-center"
              >
                <span className="text-xl font-serif">📈</span>
                <span className="text-[9px] uppercase font-bold tracking-widest">Relatório</span>
              </button>
            </div>
          </div>

          {/* Bottom Financial Goal Proximity */}
          <div className="p-6 bg-[#2B312E] text-[#ECEBE5] rounded-3xl space-y-3 shadow-md">
            <p className="text-[10px] uppercase tracking-widest opacity-60">Resumo Financeiro Mensal</p>
            <p className="text-2xl font-serif italic mb-2 leading-tight">Lucro projetado: R$ 8.420</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="w-2/3 bg-[#9BB0A5] h-full rounded-full"></div>
            </div>
            <p className="text-[9px] opacity-40">65% da meta mensal de R$ 13.000 atingida.</p>
          </div>

        </div>

      </div>

      {/* Advisory Banner */}
      <div className={`p-5 rounded-2xl border text-xs leading-relaxed flex items-center gap-3 ${
        darkMode ? 'bg-slate-900/30 border-slate-800 text-slate-400' : 'bg-[#9BB0A5]/10 border-[#9BB0A5]/25 text-slate-700'
      }`}>
        <AlertCircle className="w-5 h-5 text-[#9BB0A5] flex-shrink-0" />
        <p>
          <strong>Dica do Consultório:</strong> O formulário online de Captação e Inscrição está sincronizado em tempo real. Crie novos eventos na aba <strong>Gestão de Eventos</strong> e simule registros de novos pacientes instantaneamente!
        </p>
      </div>
    </div>
  );
}
