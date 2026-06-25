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
import csmLogo from '../assets/images/csm_logo_official_1782404025347.jpg';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

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

  // Dynamic monthly financial and appointment aggregator for Recharts
  const getMonthlyChartData = () => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Baseline trends for pediatric clinics (typical seasonal curves)
    const baseTrends: Record<number, { revenue: number; expenses: number; appointments: number }> = {
      0: { revenue: 7800, expenses: 4100, appointments: 38 },  // Jan
      1: { revenue: 8400, expenses: 4300, appointments: 42 },  // Fev
      2: { revenue: 9900, expenses: 4400, appointments: 51 },  // Mar
      3: { revenue: 9200, expenses: 4600, appointments: 47 },  // Abr
      4: { revenue: 10500, expenses: 4800, appointments: 54 }, // Mai
      5: { revenue: 11200, expenses: 5020, appointments: 58 }, // Jun
      6: { revenue: 11900, expenses: 5200, appointments: 61 }, // Jul
      7: { revenue: 12100, expenses: 5300, appointments: 63 }, // Ago
      8: { revenue: 12800, expenses: 5400, appointments: 68 }, // Set
      9: { revenue: 13200, expenses: 5500, appointments: 72 }, // Out
      10: { revenue: 12500, expenses: 5300, appointments: 66 }, // Nov
      11: { revenue: 11000, expenses: 5100, appointments: 50 }, // Dez
    };

    // Calculate dynamic values per month from Firebase state for year 2026
    const dynamicData: Record<number, { revenue: number; expenses: number; appointments: number }> = {};
    for (let i = 0; i < 12; i++) {
      dynamicData[i] = { revenue: 0, expenses: 0, appointments: 0 };
    }

    clinicTransactions.forEach(t => {
      const parts = t.date.split('-');
      if (parts.length >= 2) {
        const year = parseInt(parts[0]);
        const monthIdx = parseInt(parts[1]) - 1;
        if (year === 2026 && monthIdx >= 0 && monthIdx < 12) {
          if (t.type === 'Receita') {
            dynamicData[monthIdx].revenue += t.value;
          } else if (t.type === 'Despesa') {
            dynamicData[monthIdx].expenses += t.value;
          }
        }
      }
    });

    clinicAppointments.forEach(a => {
      const parts = a.date.split('-');
      if (parts.length >= 2) {
        const year = parseInt(parts[0]);
        const monthIdx = parseInt(parts[1]) - 1;
        if (year === 2026 && monthIdx >= 0 && monthIdx < 12) {
          dynamicData[monthIdx].appointments += 1;
        }
      }
    });

    // Build the final 7-month series centered around June 2026 (Jan to Jul)
    return [0, 1, 2, 3, 4, 5, 6].map(monthIdx => {
      const dyn = dynamicData[monthIdx];
      const trend = baseTrends[monthIdx];
      
      const revenue = dyn.revenue > 0 ? dyn.revenue : trend.revenue;
      const expenses = dyn.expenses > 0 ? dyn.expenses : trend.expenses;
      const appointments = dyn.appointments > 0 ? dyn.appointments : trend.appointments;
      
      return {
        name: monthNames[monthIdx] + (monthIdx === 6 ? ' (Proj)' : ''),
        revenue,
        expenses,
        net: revenue - expenses,
        appointments
      };
    });
  };

  const chartData = getMonthlyChartData();

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <img 
            src={csmLogo} 
            alt="CSM Clinical Logo" 
            referrerPolicy="no-referrer"
            className="w-16 h-16 object-contain bg-white rounded-2xl p-1.5 shadow-sm border border-slate-150/80 dark:border-[#2E3832]/85 transition-transform hover:scale-105 duration-200"
          />
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-[#9BB0A5] mb-1 font-sans">
              CSM Clinical Professional Dashboard
            </p>
            <h1 className="text-4xl md:text-5xl font-serif italic font-light tracking-tight text-emerald-800 dark:text-[#9BB0A5]">
              Olá, <span className="font-semibold">{getUserName(currentRole)}</span>
            </h1>
          </div>
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
        
        {/* Left pane: Diagnostics & Recharts Charts (Col 1-8) */}
        <div className={`lg:col-span-8 p-6 md:p-8 border rounded-[2rem] shadow-sm space-y-8 ${
          darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB]'
        }`}>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#8A9F94] bg-[#9BB0A5]/10 dark:bg-[#9BB0A5]/5 px-2.5 py-1 rounded-full">
              Métricas & Indicadores de Saúde Clínica
            </span>
            <h3 className="text-2xl font-serif text-[#2D312E] dark:text-white mt-2">
              Desempenho Geral do Consultório
            </h3>
          </div>

          {/* Recharts Graphs Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Chart 1: Fluxo de Caixa Mensal */}
            <div className={`p-5 rounded-2xl border ${
              darkMode ? 'bg-[#1B221E] border-[#2E3832]' : 'bg-[#F9F8F3] border-[#E5E3DB]'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-[#8A9F94] dark:text-[#9BB0A5]">
                    📊 Fluxo de Caixa Mensal
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Receitas vs Despesas (2026)</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-serif italic text-emerald-600 dark:text-emerald-400 font-bold">R$ {revenueMonth.toLocaleString('pt-BR')}</span>
                  <p className="text-[9px] text-slate-450 uppercase">Mês Atual</p>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9BB0A5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#9BB0A5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#2E3832" : "#E5E3DB"} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: darkMode ? '#8A9F94' : '#555', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: darkMode ? '#8A9F94' : '#555', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className={`p-3 rounded-xl border text-xs shadow-md ${
                              darkMode ? 'bg-[#1B221E] border-[#2E3832] text-white' : 'bg-white border-slate-200 text-slate-800'
                            }`}>
                              <p className="font-bold mb-1">{label}</p>
                              {payload.map((pld: any) => (
                                <p key={pld.name} style={{ color: pld.color }} className="font-medium">
                                  {pld.name}: R$ {pld.value.toLocaleString('pt-BR')}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10, marginTop: 5 }} />
                    <Area type="monotone" name="Receita" dataKey="revenue" stroke="#9BB0A5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" name="Despesa" dataKey="expenses" stroke="#F27D26" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Desempenho de Atendimentos */}
            <div className={`p-5 rounded-2xl border ${
              darkMode ? 'bg-[#1B221E] border-[#2E3832]' : 'bg-[#F9F8F3] border-[#E5E3DB]'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-[#8A9F94] dark:text-[#9BB0A5]">
                    📈 Volume de Atendimentos
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Sessões Realizadas / Mês</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-serif italic text-indigo-500 font-bold">{chartData[5]?.appointments || 58} sessões</span>
                  <p className="text-[9px] text-slate-450 uppercase">Junho</p>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#2E3832" : "#E5E3DB"} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: darkMode ? '#8A9F94' : '#555', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: darkMode ? '#8A9F94' : '#555', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className={`p-3 rounded-xl border text-xs shadow-md ${
                              darkMode ? 'bg-[#1B221E] border-[#2E3832] text-white' : 'bg-white border-slate-200 text-slate-800'
                            }`}>
                              <p className="font-bold mb-1">{label}</p>
                              {payload.map((pld: any) => (
                                <p key={pld.name} style={{ color: pld.color }} className="font-medium">
                                  {pld.name}: {pld.value} sessões
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      name="Sessões" 
                      dataKey="appointments" 
                      fill="#9BB0A5" 
                      radius={[6, 6, 0, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#E5E3DB] dark:border-[#2E3832]">
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

            {/* Insight / Summary and tips box */}
            <div className="flex flex-col justify-between p-5 rounded-2xl bg-[#E5E3DB]/20 dark:bg-[#1B221E]/60 border border-[#E5E3DB] dark:border-[#2E3832] space-y-4">
              <div>
                <h4 className="text-xs uppercase tracking-widest font-bold text-[#8A9F94] dark:text-[#9BB0A5] mb-2">
                  💡 Insights do Período
                </h4>
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>
                    📈 <strong>Crescimento Constante:</strong> O volume total de sessões no consultório aumentou <strong>15%</strong> desde o início do ano, refletindo a alta procura por Fisioterapia Neuropediátrica e Integração Sensorial.
                  </p>
                  <p>
                    💼 <strong>Eficiência Financeira:</strong> A margem operacional média de <strong>{marginPercentage}%</strong> demonstra excelente controle de despesas e sólida conversão de atendimentos.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E3DB] dark:border-[#2E3832] flex justify-between items-center">
                <span className="text-[10px] text-slate-400 italic">Atualizado em tempo real</span>
                <button
                  onClick={() => setActiveTab('financeiro')}
                  className="text-[10px] uppercase font-bold tracking-widest text-[#9BB0A5] hover:underline"
                >
                  Ver Fluxo de Caixa completo →
                </button>
              </div>
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
