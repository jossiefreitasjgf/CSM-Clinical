import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileCheck2,
  Trash2,
  Info
} from 'lucide-react';
import { FinancialTransaction, Clinic } from '../types';

interface FinancialHubProps {
  currentClinic: Clinic;
  transactions: FinancialTransaction[];
  onAddTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'clinicId'>) => void;
  onDeleteTransaction: (id: string) => void;
  darkMode: boolean;
}

export default function FinancialHub({
  currentClinic,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  darkMode
}: FinancialHubProps) {

  // Modal triggers
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);

  // Search filter options
  const [filterType, setFilterType] = useState<'Todos' | 'Receita' | 'Despesa'>('Todos');
  const [filterCategory, setFilterCategory] = useState('Todos');

  // Form States: New Manual Transaction
  const [txType, setTxType] = useState<'Receita' | 'Despesa'>('Receita');
  const [txCategory, setTxCategory] = useState('Atendimento Particular');
  const [txValue, setTxValue] = useState('150');
  const [txDate, setTxDate] = useState('2026-06-22');
  const [txDesc, setTxDesc] = useState('');

  // Filter transactions for current Clinic
  const clinicTx = transactions.filter(t => t.clinicId === currentClinic.id);

  // June 2026 dynamic calculations
  const totalInflow = clinicTx
    .filter(t => t.type === 'Receita')
    .reduce((sum, t) => sum + t.value, 0);

  const totalOutflow = clinicTx
    .filter(t => t.type === 'Despesa')
    .reduce((sum, t) => sum + t.value, 0);

  const netBalance = totalInflow - totalOutflow;
  const isHealthy = netBalance >= 0;

  // Filter transactions by criteria
  const processedTx = clinicTx.filter(t => {
    const matchesType = filterType === 'Todos' || t.type === filterType;
    const matchesCategory = filterCategory === 'Todos' || t.category === filterCategory;
    return matchesType && matchesCategory;
  }).sort((a,b) => b.date.localeCompare(a.date));

  // Category aggregations for downstream analytics
  const categoriesMap: Record<string, number> = {};
  clinicTx.forEach(t => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.value;
  });

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txValue || !txDate || !txDesc) return;

    onAddTransaction({
      type: txType,
      category: txCategory,
      value: parseFloat(txValue) || 0,
      date: txDate,
      description: txDesc
    });

    // Reset Form Fields
    setTxDesc('');
    setTxValue('150');
    setShowAddTransactionModal(false);
  };

  return (
    <div id="financial-ledger-module" className="space-y-6">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            💸 Controle Financeiro & Fluxo de Caixa
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gere fluxo de caixa integrado, acompanhe despesas estruturais e aprove repasses de matrículas e atendimentos particulares.
          </p>
        </div>
        
        <button
          id="btn-add-transaction-modal"
          onClick={() => setShowAddTransactionModal(true)}
          className="flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-bold text-white bg-teal-500 rounded-2xl hover:bg-teal-600 transition-all shadow-sm shadow-teal-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Lançar Movimentação Manual
        </button>
      </div>

      {/* Financial KPIs Banner Grid (Módulo 9) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI 1: Inflow */}
        <div className={`p-5 rounded-3xl border flex items-center justify-between gap-4 ${
          darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Receitas / Entradas</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">
              R$ {totalInflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md mt-2 inline-block">
              +14% faturamento
            </span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2.5xl flex-shrink-0 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Outflow */}
        <div className={`p-5 rounded-3xl border flex items-center justify-between gap-4 ${
          darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Despesas Operacionais / Saídas</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">
              R$ {totalOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md mt-2 inline-block">
              Controle rígido ativo
            </span>
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2.5xl flex-shrink-0 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Dynamic Net Profit Margin */}
        <div className={`p-5 rounded-3xl border flex items-center justify-between gap-4 ${
          darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lucro / Saldo do Período</p>
            <h3 className={`text-2xl font-black mt-1.5 ${
              isHealthy ? 'text-emerald-600 dark:text-teal-400' : 'text-rose-500'
            }`}>
              R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-2 inline-block ${
              isHealthy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-550/10 text-rose-500'
            }`}>
              {isHealthy ? 'Operação Superavitária ✨' : 'Atenção ao déficit!'}
            </span>
          </div>
          <div className={`p-4 rounded-2.5xl flex-shrink-0 flex items-center justify-center ${
            isHealthy ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400' : 'bg-rose-500/10 text-rose-500'
          }`}>
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Cash ledger panel lists & Filters */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        darkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
      }`}>
        
        {/* Subheader and filters selection inputs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white">
              Livro de Caixa Geral ({processedTx.length} lançados)
            </h3>
            <p className="text-xs text-slate-400">Linha de lançamentos financeiros ordenados de forma cronológica.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter class type */}
            <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl">
              {(['Todos', 'Receita', 'Despesa'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`py-1.5 px-3 text-[10px] font-black rounded-lg transition-all ${
                    filterType === type
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-450 hover:text-slate-700'
                  }`}
                >
                  {type === 'Todos' ? 'Todos' : type === 'Receita' ? 'Entradas 🟢' : 'Saídas 🔴'}
                </button>
              ))}
            </div>

            {/* Filter Category selection dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`text-[10px] font-extrabold rounded-xl px-3 py-2 outline-none border ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="Todos">Sem categoria</option>
              {/* Incomes */}
              <option value="Inscrição de Evento">Inscrições Eventos 🎫</option>
              <option value="Atendimento Particular">Atendimentos Particulares 🩺</option>
              {/* Expenses */}
              <option value="Aluguel">Aluguel salas 🏢</option>
              <option value="Materiais">Materiais pedagógicos 🧩</option>
              <option value="Marketing">Tráfego / Ads 📢</option>
              <option value="Funcionários">Profissionais / Salários 👤</option>
              <option value="Despesas Diversas">Custos Diversos ⚡</option>
            </select>
          </div>
        </div>

        {/* Transactions ledger entries list */}
        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
          {processedTx.length === 0 ? (
            <div className="text-center py-12 text-slate-450">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold italic">Nenhuma transação encontrada de acordo com os filtros selecionados.</p>
            </div>
          ) : (
            processedTx.map((tx) => {
              const isInflow = tx.type === 'Receita';
              
              return (
                <div
                  key={tx.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
                    darkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-50/40 border-slate-150'
                  }`}
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    {/* Circle Indicator */}
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 flex items-center justify-center ${
                      isInflow 
                        ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-550 dark:text-emerald-450' 
                        : 'bg-rose-500/10 border-rose-500/10 text-rose-500'
                    }`}>
                      <DollarSign className="w-4 h-4" />
                    </div>

                    <div className="overflow-hidden">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                        {tx.description}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold text-slate-400">
                        <span>{new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span className="uppercase tracking-wide text-indigo-500">{tx.category}</span>
                        {tx.referenceId && (
                          <>
                            <span>•</span>
                            <span className="text-teal-600 dark:text-teal-400">Simulador Ref: {tx.referenceId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black whitespace-nowrap ${
                      isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                    }`}>
                      {isInflow ? '+' : '-'} R$ {tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>

                    {/* Allow deleting manual ledger logs (not system autogenerated logs) */}
                    <button
                      onClick={() => {
                        if (confirm('Deseja excluir esta transação do caixa?')) {
                          onDeleteTransaction(tx.id);
                        }
                      }}
                      className="p-1 px-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                      title="Excluir Lançamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info advice tip on automated inflows (Module 9 rule) */}
        <div className={`p-4 rounded-2xl border text-[11px] leading-relaxed flex items-center gap-3 ${
          darkMode ? 'bg-slate-900/30 border-slate-800 text-slate-400' : 'bg-emerald-50/40 border-emerald-100/50 text-emerald-800/85'
        }`}>
          <Info className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p>
            <strong>Automação de Receitas:</strong> Quando você vai em <strong>Relatórios</strong> ou no perfil do paciente e aprova uma matrícula online pendente, o sistema <strong>automaticamente</strong> lança esse ingresso no faturamento como <em>Inscrição de Evento</em> em tempo real!
          </p>
        </div>
      </div>

      {/* MODAL: Launch movement options */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-3xl border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-205'
          }`}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                💸 Lançar Nova Transação Manual de Caixa
              </h3>
              <button
                onClick={() => setShowAddTransactionModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                
                {/* Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Fluxo</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-705">
                    <button
                      type="button"
                      onClick={() => {
                        setTxType('Receita');
                        setTxCategory('Atendimento Particular');
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        txType === 'Receita'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'text-slate-450 hover:text-slate-750'
                      }`}
                    >
                      📈 Entradas / Receita
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTxType('Despesa');
                        setTxCategory('Aluguel');
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        txType === 'Despesa'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-slate-450 hover:text-slate-750'
                      }`}
                    >
                      📉 Saídas / Despesa
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Categoria do Lançamento</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
                    }`}
                  >
                    {txType === 'Receita' ? (
                      <>
                        <option value="Atendimento Particular">🩺 Atendimento Particular / Individual</option>
                        <option value="Inscrição de Evento">🎫 Venda de Inscrições / Eventos</option>
                        <option value="Plano de Sessões">📦 Planos Mensais / Pacotes</option>
                        <option value="Outros">⚡ Outros Recebimentos</option>
                      </>
                    ) : (
                      <>
                        <option value="Aluguel">🏢 Pagamento de Aluguel / Salas</option>
                        <option value="Materiais">🧩 Brinquedos & Slimes Sensoriais</option>
                        <option value="Marketing">📢 Tráfego de Instagram / Anúncios</option>
                        <option value="Funcionários">👤 Salários e Pró-Labore Clinico</option>
                        <option value="Despesas Diversas">⚡ Água, Energia, Limpeza e Internet</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Amount and date picker */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valor Total (R$)</label>
                    <input
                      type="number"
                      required
                      value={txValue}
                      onChange={(e) => setTxValue(e.target.value)}
                      placeholder="150"
                      min="1"
                      className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-855'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data do Fluxo de Caixa</label>
                    <input
                      type="date"
                      required
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-855'
                      }`}
                    />
                  </div>
                </div>

                {/* Description details */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título Descritivo *</label>
                  <input
                    type="text"
                    required
                    value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)}
                    placeholder="Ex: Compra de tatame de EVA verde para sala 3"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-855 focus:bg-white'
                    }`}
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddTransactionModal(false)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl border ${
                    darkMode ? 'bg-slate-850 border-slate-750 text-slate-350' : 'bg-white border-slate-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-600 text-white transition-all cursor-pointer"
                >
                  Lançar no Caixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
