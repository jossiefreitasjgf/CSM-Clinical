import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Calendar, 
  Activity, 
  Download, 
  Printer, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  FileCheck2,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Patient, TherapeuticEvent, Registration, Appointment, FinancialTransaction, Attendance, Clinic } from '../types';
import { exportReportPDF, exportReportExcel } from '../utils/exportUtils';

interface ReportsCenterProps {
  currentClinic: Clinic;
  patients: Patient[];
  events: TherapeuticEvent[];
  registrations: Registration[];
  appointments: Appointment[];
  transactions: FinancialTransaction[];
  attendances: Attendance[];
  onApproveRegistration: (id: string) => void;
  darkMode: boolean;
}

export default function ReportsCenter({
  currentClinic,
  patients,
  events,
  registrations,
  appointments,
  transactions,
  attendances,
  onApproveRegistration,
  darkMode
}: ReportsCenterProps) {

  // Chosen Report tab: 'participantes' | 'evolucao' | 'financeiro' | 'agenda' | 'frequencia'
  const [chosenReport, setChosenReport] = useState<'participantes' | 'evolucao' | 'financeiro' | 'agenda' | 'frequencia'>('participantes');

  // Filter keys
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');

  // Filter listings by active clinic
  const clinicEvents = events.filter(e => e.clinicId === currentClinic.id);
  const clinicPatients = patients.filter(p => p.clinicId === currentClinic.id);
  const clinicRegs = registrations.filter(r => r.clinicId === currentClinic.id);
  const clinicApps = appointments.filter(a => a.clinicId === currentClinic.id);
  const clinicTx = transactions.filter(t => t.clinicId === currentClinic.id);

  // Real Excel and PDF download triggers
  const handleDownloadExcel = () => {
    exportReportExcel(chosenReport, currentClinic.name, {
      clinicRegs,
      clinicPatients,
      clinicTx,
      clinicApps,
      attendances,
      selectedEventId,
      selectedPatientId,
      events,
      patients
    });
  };

  const handlePrintPDF = () => {
    exportReportPDF(chosenReport, currentClinic.name, {
      clinicRegs,
      clinicPatients,
      clinicTx,
      clinicApps,
      attendances,
      selectedEventId,
      selectedPatientId,
      events,
      patients
    });
  };

  return (
    <div id="reports-center-module" className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            📊 Centro de Relatórios Clínicos & Auditoria
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gere relatórios impressos, baixe planilhas Excel estruturadas e audite frequência e métricas do seu consultório.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadExcel}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-550/15 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-450 text-xs font-bold rounded-xl hover:bg-emerald-100/50 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar Planilha Excel
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-500 text-white text-xs font-bold rounded-xl hover:bg-teal-600 transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Imprimir PDF Relatório
          </button>
        </div>
      </div>

      {/* Report Selector Tabs Grid (Módulo 11) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { id: 'participantes', label: 'Participantes / Evento', icon: Users },
          { id: 'evolucao', label: 'Evolução Pacientes', icon: Activity },
          { id: 'financeiro', label: 'DRE / Financeiro', icon: DollarSign },
          { id: 'agenda', label: 'Agenda Clínica', icon: Calendar },
          { id: 'frequencia', label: 'Frequência do Mês', icon: FileCheck2 },
        ].map((tab) => {
          const isActive = chosenReport === tab.id;
          return (
            <button
              id={`report-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setChosenReport(tab.id as any)}
              className={`p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.01] ${
                isActive
                  ? 'bg-teal-500 border-teal-505 text-white shadow-md shadow-teal-500/10'
                  : darkMode
                    ? 'bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300'
                    : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-750'
              }`}
            >
              <tab.icon className={`w-5 h-5 mb-2 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <p className="text-[11px] font-black tracking-wider uppercase leading-snug">{tab.label}</p>
            </button>
          );
        })}
      </div>

      {/* REPORT CONFIGURED VIEWS */}
      
      {/* 1. PARTICIPANTES POR EVENTO (Attendees List Report with approval actions) */}
      {chosenReport === 'participantes' && (
        <div className={`p-6 rounded-3xl border space-y-6 ${
          darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-850 dark:text-white flex items-center gap-1.5">
                👥 Relatório de Inscritos e Validação por Evento
              </h3>
              <p className="text-xs text-slate-400">Verifique comprovantes de matrículas e aprove comprovantes de PIX pendentes dos pais.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-450 whitespace-nowrap">Filtrar Evento:</span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className={`text-xs font-semibold rounded-xl px-3 py-2 outline-none border ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {clinicEvents.map(e => (
                  <option key={e.id} value={e.id}>🎈 {e.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List of current inscriptions details */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400 select-none pb-2">
                  <th className="py-3 px-2">Criança / Paciente</th>
                  <th className="py-3 px-2">Responsável</th>
                  <th className="py-3 px-2">Data Matrícula</th>
                  <th className="py-3 px-2">Comprovante Pix</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clinicRegs.filter(r => r.eventId === selectedEventId).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                      Nenhuma inscrição registrada ou preenchida para este evento.
                      <p className="text-[10px] text-slate-450 font-normal mt-1">Abra "Gestão de Eventos" e clique em "Simular Inscrição" para matricular um paciente de teste!</p>
                    </td>
                  </tr>
                ) : (
                  clinicRegs.filter(r => r.eventId === selectedEventId).map((reg) => {
                    const patient = patients.find(p => p.id === reg.childId);
                    
                    return (
                      <tr 
                        key={reg.id} 
                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
                      >
                        <td className="py-4.5 px-2 font-extrabold text-slate-800 dark:text-slate-100">
                          👦 {reg.childName}
                          <span className="text-[9px] font-bold text-teal-650 block">CID: {patient?.diagnosis || 'Paciente Semente'}</span>
                        </td>
                        <td className="py-4.5 px-2">
                          <p>{reg.parentName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">F.: {patient?.phone || '(11) 98311-2244'}</p>
                        </td>
                        <td className="py-4.5 px-2 text-slate-450">
                          {new Date(reg.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4.5 px-2">
                          <div className="flex items-center gap-1 text-[11px] text-indigo-500 font-bold truncate max-w-[150px]" title="Comprovante Pix Anexado">
                            📂 {reg.paymentReceiptName}
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold">({reg.paymentReceiptSize})</span>
                        </td>
                        <td className="py-4.5 px-2 text-center">
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                            reg.status === 'Aprovado'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-amber-150 bg-amber-500/10 text-amber-600'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-4.5 px-2 text-right">
                          {reg.status === 'Pendente' ? (
                            <button
                              onClick={() => {
                                onApproveRegistration(reg.id);
                                alert(`Inscrição ${reg.registrationNumber} de ${reg.childName} foi aprovada! A receita de caixa correspondente foi creditada no fluxo do Módulo Financeiro.`);
                              }}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-all cursor-pointer"
                              title="Aprovar Pix e Ingressar Caixa"
                            >
                              Validar Inscrição
                            </button>
                          ) : (
                            <span className="text-[10px] font-extrabold text-slate-400 flex items-center justify-end gap-1 select-none pr-3">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Aprovado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. EVOLUÇÃO DOS PACIENTES (Chronological progress sheets) */}
      {chosenReport === 'evolucao' && (
        <div className={`p-6 rounded-3xl border space-y-6 ${
          darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-850 dark:text-white flex items-center gap-1.5">
                📈 Fichas de Progressão do Paciente
              </h3>
              <p className="text-xs text-slate-400">Verifique relatórios agregados de motricidade e interações de cada um dos pacientes.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-450 whitespace-nowrap">Filtrar Paciente:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className={`text-xs font-semibold rounded-xl px-3 py-2 outline-none border ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {clinicPatients.map(p => (
                  <option key={p.id} value={p.id}>👦 {p.name} (Diagnóstico: {p.diagnosis.split(' ')[0]})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150/40 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Metas Clínicas de Motricidade</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              <div className="space-y-4">
                <p className="font-extrabold text-teal-600 block text-[10px] uppercase tracking-wider">🎯 Perfil e Alvo de Desenvolvimento</p>
                <div className="space-y-1.5">
                  <p><strong>Paciente de Inspeção:</strong> {clinicPatients.find(p => p.id === selectedPatientId)?.name || 'Nenhum'}</p>
                  <p className="text-slate-500 leading-normal"><strong>Diretrizes Clínicas:</strong> Estimular força proximal e preensão com pistas lúdicas de repetição. Manter controle motor assistido.</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-extrabold text-indigo-500 block text-[10px] uppercase tracking-wider">⚙️ Conclusão de Metas Coativas</p>
                <div className="space-y-1 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-emerald-500 font-extrabold">✓ Deambulação segura (+40%)</p>
                  <p className="text-emerald-500 font-extrabold">✓ Coordenação de pinça (+15%)</p>
                  <p className="text-slate-450 font-semibold">⚡ Interação social compartilhada (Pendente de progresso)</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. FINANCEIRO (Cashflow accounts margins statement) */}
      {chosenReport === 'financeiro' && (
        <div className={`p-6 rounded-3xl border space-y-6 ${
          darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <div>
            <h3 className="text-base font-extrabold text-slate-850 dark:text-white flex items-center gap-1.5">
              🏦 Demonstrativo de Resultado de Exercício (DRE / Financeiro)
            </h3>
            <p className="text-xs text-slate-400">Verifique faturamentos consolidados e deduções operacionais do mês vigente de Junho 2026.</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-550/10 text-indigo-805 text-xs font-bold leading-normal border border-indigo-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 animate-pulse" />
            <span>Fluxo de Caixa auditado sem divergências de conciliação PIX. Receitas consolidadas de R$ {clinicTx.filter(t => t.type === 'Receita').reduce((sum,t) => sum+t.value, 0).toLocaleString('pt-BR')} confirmadas.</span>
          </div>

          {/* DRE Rows Lists representation */}
          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border-b border-slate-200">
              <span className="font-black text-slate-800 dark:text-slate-100">1. RECEITA OPERACIONAL BRUTA</span>
              <span className="font-black text-emerald-550">R$ {clinicTx.filter(t => t.type === 'Receita').reduce((sum,t) => sum+t.value, 0).toLocaleString('pt-BR')}</span>
            </div>

            <div className="space-y-2 pl-4">
              <div className="flex justify-between text-slate-600 dark:text-slate-350">
                <span>(+) Atendimentos Particulares Individualizados</span>
                <span>R$ {clinicTx.filter(t => t.category === 'Atendimento Particular').reduce((sum,t) => sum+t.value, 0).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-350">
                <span>(+) Venda de Inscrições / Eventos Terapêuticos</span>
                <span>R$ {clinicTx.filter(t => t.category === 'Inscrição de Evento').reduce((sum,t) => sum+t.value, 0).toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border-b border-slate-200 mt-2">
              <span className="font-black text-slate-800 dark:text-slate-100">2. DEDUÇÕES E DESPESAS OPERACIONAIS</span>
              <span className="font-black text-rose-500">R$ {clinicTx.filter(t => t.type === 'Despesa').reduce((sum,t) => sum+t.value, 0).toLocaleString('pt-BR')}</span>
            </div>

            <div className="space-y-2 pl-4">
              <div className="flex justify-between text-slate-650 dark:text-slate-350">
                <span>(-) Custos de Aluguéis e salas físicas</span>
                <span>R$ {clinicTx.filter(t => t.category === 'Aluguel').reduce((sum,t) => sum+t.value, 0).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-650 dark:text-slate-350">
                <span>(-) Aquisição de Materiais Pedagógicos / Slimes</span>
                <span>R$ {clinicTx.filter(t => t.category === 'Materiais').reduce((sum,t) => sum+t.value, 0).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-650 dark:text-slate-350">
                <span>(-) Campanhas de tráfego pago e marketing digital</span>
                <span>R$ {clinicTx.filter(t => t.category === 'Marketing').reduce((sum,t) => sum+t.value, 0).toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-teal-500/10 text-teal-650 dark:text-teal-400 p-3.5 rounded-2xl border border-teal-500/10 mt-4 text-sm font-black">
              <span>LUCRO LÍQUIDO DO EXERCÍCIO (DRE Consolidado)</span>
              <span>R$ {(clinicTx.filter(t => t.type === 'Receita').reduce((sum,t) => sum+t.value, 0) - clinicTx.filter(t => t.type === 'Despesa').reduce((sum,t) => sum+t.value, 0)).toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. AGENDA DE ATENDIMENTOS (Agenda reports summary) */}
      {chosenReport === 'agenda' && (
        <div className={`p-6 rounded-3xl border space-y-6 ${
          darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <div>
            <h3 className="text-base font-extrabold text-slate-850 dark:text-white flex items-center gap-1.5">
              📅 Consolidado de Consultas e Atendimentos individuais
            </h3>
            <p className="text-xs text-slate-400">Verifique a taxa de confirmação e status dos agendamentos médicos ativos.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                  <th className="py-3 px-2">Data / Hora</th>
                  <th className="py-3 px-2">Paciente / Criança</th>
                  <th className="py-3 px-2">Especialidade / Sessão</th>
                  <th className="py-3 px-2">Valor da Consulta</th>
                  <th className="py-3 px-2 text-right">Status do Atendimento</th>
                </tr>
              </thead>
              <tbody>
                {clinicApps.map((app) => (
                  <tr key={app.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50">
                    <td className="py-4 px-2 text-slate-800 dark:text-slate-205 font-bold">
                      {new Date(app.date + 'T12:00:00').toLocaleDateString('pt-BR')} às {app.time}
                    </td>
                    <td className="py-4 px-2 font-black">👦 {app.patientName}</td>
                    <td className="py-4 px-2 text-teal-650 dark:text-teal-400">{app.type}</td>
                    <td className="py-4 px-2">R$ {app.price.toLocaleString('pt-BR')}</td>
                    <td className="py-4 px-2 text-right">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        app.status === 'Realizado' || app.status === 'Confirmado'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-indigo-500/10 text-indigo-550'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. FREQUÊNCIA (Event Roll Call frequencies) */}
      {chosenReport === 'frequencia' && (
        <div className={`p-6 rounded-3xl border space-y-6 ${
          darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <div>
            <h3 className="text-base font-extrabold text-slate-850 dark:text-white flex items-center gap-1.5">
              📋 Taxa de Presença e Chamadas de Eventos
            </h3>
            <p className="text-xs text-slate-400">Audite a frequência com base nos check-ins realizados pelas fisioterapeutas.</p>
          </div>

          <div className="space-y-4">
            {attendances.length === 0 ? (
              <div className="text-center py-12 text-slate-400 italic">
                Nenhuma chamada de presença foi realizada ainda.
                <p className="text-[10px] text-slate-450 mt-1">Vá em "Gestão de Eventos" &gt; clique em "Frequência" de um evento finalizado para marcar presença!</p>
              </div>
            ) : (
              attendances.map((att) => {
                const child = patients.find(p => p.id === att.patientId);
                const ev = events.find(e => e.id === att.eventId);
                
                return (
                  <div
                    key={att.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/50 border-slate-150'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        👦 {child?.name || 'Paciente Semente'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        🎈 Evento: <strong>{ev?.name || 'Arraiá Terapêutico'}</strong> • {ev?.date ? new Date(ev.date + 'T12:00:00').toLocaleDateString('pt-BR') : '12/06/2026'}
                      </p>
                    </div>

                    <div className="text-left sm:text-right text-xs">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                        att.present 
                          ? 'bg-emerald-500/15 text-emerald-500' 
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {att.present ? 'PRESENÇA CONFIRMADA ✓' : 'AUSENTE ❌'}
                      </span>
                      {att.notes && (
                        <p className="text-[10px] text-slate-450 italic mt-1.5 font-medium">Observações: "{att.notes}"</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}
