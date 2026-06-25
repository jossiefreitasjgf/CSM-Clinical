import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  FileText, 
  Download, 
  ExternalLink, 
  Sparkles, 
  History, 
  GraduationCap, 
  Activity, 
  Heart,
  Baby,
  Stethoscope,
  ChevronRight,
  Printer,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';

interface StudySearchProps {
  darkMode: boolean;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  category: string;
  timestamp: string;
  responseText: string;
  sources: { title: string; uri: string }[];
}

const PRESETS = [
  { 
    id: 'p1', 
    label: 'Paralisia Cerebral', 
    query: 'Intervenções de fisioterapia motora e conceito Bobath na Paralisia Cerebral Infantil', 
    category: 'Neuropediatria',
    icon: Baby,
    description: 'Protocolos de neuroplasticidade, Bobath e facilitação neuromuscular'
  },
  { 
    id: 'p2', 
    label: 'Estimulação Precoce', 
    query: 'Estimulação precoce e marcos de desenvolvimento motor em bebês prematuros na UTI Neonatal', 
    category: 'Estimulação Precoce',
    icon: Heart,
    description: 'Intervenções sensório-motoras na primeira infância e neonatologia'
  },
  { 
    id: 'p3', 
    label: 'Bronquiolite Pediátrica', 
    query: 'Eficácia da fisioterapia respiratória e técnicas de desobstrução na Bronquiolite Obliterante Infantil', 
    category: 'Fisioterapia Respiratória',
    icon: Activity,
    description: 'Técnicas de higiene brônquica e reabilitação respiratória pediátrica'
  },
  { 
    id: 'p4', 
    label: 'Escoliose Infantil', 
    query: 'Tratamento conservador de Escoliose Idiopática Infantil e exercícios terapêuticos específicos', 
    category: 'Ortopedia Pediátrica',
    icon: GraduationCap,
    description: 'Reeducação postural, coletes e exercícios tridimensionais em crianças'
  },
  { 
    id: 'p5', 
    label: 'Síndrome de Down', 
    query: 'Fisioterapia pediátrica na hipotonia e aquisição da marcha em crianças com Síndrome de Down', 
    category: 'Desenvolvimento e Síndromes',
    icon: Stethoscope,
    description: 'Fortalecimento, equilíbrio e transições motoras na trissomia 21'
  },
  { 
    id: 'p6', 
    label: 'Transtorno do Espectro Autista', 
    query: 'Integração sensorial e coordenação motora global na fisioterapia para crianças com TEA', 
    category: 'Desenvolvimento e Síndromes',
    icon: Sparkles,
    description: 'Planejamento motor, propriocepção e regulação sensorial através do movimento'
  }
];

const CATEGORIES = [
  'Todos',
  'Neuropediatria',
  'Estimulação Precoce',
  'Fisioterapia Respiratória',
  'Ortopedia Pediátrica',
  'Desenvolvimento e Síndromes'
];

export default function StudySearch({ darkMode }: StudySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Results
  const [responseText, setResponseText] = useState<string>('');
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  
  // States for actions
  const [copied, setCopied] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('csm_study_search_history');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao ler histórico de buscas:', e);
    }
  }, []);

  // Save history helper
  const saveSearchToHistory = (queryStr: string, cat: string, text: string, srcList: { title: string; uri: string }[]) => {
    try {
      const newItem: SearchHistoryItem = {
        id: `search-${Date.now()}`,
        query: queryStr,
        category: cat,
        timestamp: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        responseText: text,
        sources: srcList
      };

      const updated = [newItem, ...searchHistory.filter(item => item.query !== queryStr)].slice(0, 15);
      setSearchHistory(updated);
      localStorage.setItem('csm_study_search_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Erro ao salvar histórico:', e);
    }
  };

  // Rotation of loading subtitles to make it engaging and realistic
  useEffect(() => {
    if (!loading) return;
    const steps = [
      'Buscando artigos científicos na web...',
      'Analisando ensaios clínicos e revisões sistemáticas...',
      'Filtrando evidências de bases médicas (PubMed, SciELO, Cochrane)...',
      'Sintetizando formas de tratamento e recomendações práticas...',
      'Estruturando o relatório clínico para Fisioterapia Infantil...'
    ];
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % steps.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (queryToSearch: string, categoryToSearch?: string) => {
    if (!queryToSearch.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponseText('');
    setSources([]);

    const activeCat = categoryToSearch || selectedCategory;

    try {
      const response = await fetch('/api/search-studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: queryToSearch,
          category: activeCat === 'Todos' ? '' : activeCat
        })
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor de buscas clínicas.');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResponseText(data.responseText);
      setSources(data.sources || []);
      
      // Save successfully to local history
      saveSearchToHistory(queryToSearch, activeCat, data.responseText, data.sources || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro inesperado ao pesquisar. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setSearchQuery(preset.query);
    setSelectedCategory(preset.category);
    handleSearch(preset.query, preset.category);
  };

  const handleSelectHistoryItem = (item: SearchHistoryItem) => {
    setSearchQuery(item.query);
    setSelectedCategory(item.category);
    setResponseText(item.responseText);
    setSources(item.sources);
    setShowHistory(false);
    setError(null);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('csm_study_search_history');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(responseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Simple, beautiful standard formatting for pediatric clinical references
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(45, 49, 46); // #2D312E
      doc.text('CSM Clinical - Biblioteca Científica', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 15, 26);
      doc.line(15, 28, 195, 28);

      // Query title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(242, 125, 38); // Brand Orange Accent
      doc.text('Consulta Realizada:', 15, 36);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      const splitQuery = doc.splitTextToSize(searchQuery, 180);
      doc.text(splitQuery, 15, 42);

      // Response body (naive parser for markdown text formatting for standard readability)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);

      const splitText = doc.splitTextToSize(
        responseText.replace(/[\#\*]/g, ''), // Strip simple markdown symbols for plain text PDF rendering
        180
      );

      let currentY = 55;
      splitText.forEach((line: string) => {
        if (currentY > 275) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, 15, currentY);
        currentY += 5.5;
      });

      // Sources
      if (sources.length > 0) {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        currentY += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(45, 49, 46);
        doc.text('Fontes e Evidências Clínicas (Artigos Científicos):', 15, currentY);
        currentY += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);

        sources.slice(0, 5).forEach((src, idx) => {
          if (currentY > 280) {
            doc.addPage();
            currentY = 20;
          }
          const srcText = `[${idx + 1}] ${src.title} - ${src.uri}`;
          const splitSrc = doc.splitTextToSize(srcText, 180);
          doc.text(splitSrc, 15, currentY);
          currentY += 8;
        });
      }

      doc.save(`CSM_Relatorio_Clinico_${Date.now()}.pdf`);
    } catch (e) {
      console.error('Erro ao gerar PDF:', e);
      alert('Erro ao gerar o PDF de estudos clínicos. A síntese é muito longa para renderização simples.');
    }
  };

  const stepsText = [
    'Buscando artigos científicos na web...',
    'Analisando ensaios clínicos e revisões sistemáticas...',
    'Filtrando evidências de bases médicas (PubMed, SciELO, Cochrane)...',
    'Sintetizando formas de tratamento e recomendações práticas...',
    'Estruturando o relatório clínico para Fisioterapia Infantil...'
  ];

  return (
    <div id="study-search-module" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-[#9BB0A5]/10 dark:bg-[#9BB0A5]/5 text-[#8A9F94] dark:text-[#9BB0A5] rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8A9F94] bg-[#9BB0A5]/10 dark:bg-[#9BB0A5]/5 px-3 py-1 rounded-full">
              P&D / Prática Baseada em Evidências
            </span>
          </div>
          <h1 className="font-serif italic font-extrabold text-2xl text-slate-800 dark:text-white leading-tight">
            Biblioteca de Estudos & Casos Clínicos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pesquisa em tempo real na web e síntese científica de condutas terapêuticas, revisões sistemáticas e evidências para fisioterapia pediátrica infantil.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-search-history"
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              showHistory
                ? 'bg-[#9BB0A5] text-white'
                : darkMode
                  ? 'bg-[#242D28] text-slate-300 border border-[#2E3832] hover:bg-[#2E3832]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico de Pesquisa ({searchHistory.length})</span>
          </button>
        </div>
      </div>

      {/* History Slide-down Overlay Panel */}
      {showHistory && (
        <div id="search-history-panel" className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-[#1B221E] border-[#2E3832]' : 'bg-[#E5E3DB]/20 border-[#cbd5e1]'
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-inherit">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8A9F94] flex items-center gap-1.5">
              <History className="w-4 h-4" />
              Buscas Recentes e Consultas Salvas
            </h3>
            <button
              id="btn-clear-search-history"
              onClick={clearHistory}
              disabled={searchHistory.length === 0}
              className="text-[10px] font-extrabold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 uppercase tracking-widest disabled:opacity-50 cursor-pointer"
            >
              Limpar Tudo
            </button>
          </div>

          {searchHistory.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
              Nenhuma busca no histórico ainda. Realize uma busca clínica para salvar automaticamente.
            </p>
          ) : (
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectHistoryItem(item)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    darkMode
                      ? 'bg-[#242D28] border-[#2E3832] hover:bg-[#2E3832] text-white'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#9BB0A5]/25 text-[#8A9F94] rounded">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs font-bold truncate pr-3">{item.query}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Interactive Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control Column (Presets and Query Inputs) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Real-time Query Card */}
          <div id="query-generator-card" className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB]'
          }`}>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#8A9F94] mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#9BB0A5]" />
              Pesquisa Personalizada
            </h3>

            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="text-[10px] font-extrabold text-[#9BB0A5] uppercase tracking-wider block mb-1.5">
                  Área Pediátrica de Foco
                </label>
                <div className="relative">
                  <select
                    id="search-category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full text-xs font-semibold rounded-xl px-3 py-2.5 outline-none border transition-all appearance-none cursor-pointer ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-[#9BB0A5]' 
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#9BB0A5] text-slate-800'
                    }`}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label className="text-[10px] font-extrabold text-[#9BB0A5] uppercase tracking-wider block mb-1.5">
                  Dúvida Clínica, Caso ou Conduta
                </label>
                <textarea
                  id="search-query-textarea"
                  rows={4}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex: Recursos de gameterapia na reabilitação motora de hemiparesia espástica infantil..."
                  className={`w-full text-xs font-medium rounded-xl p-3 outline-none border transition-all resize-none ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-[#9BB0A5]' 
                      : 'bg-[#F9F8F3] border-[#cbd5e1] focus:bg-white focus:border-[#9BB0A5] text-slate-800'
                  }`}
                />
              </div>

              {/* Action Button */}
              <button
                id="btn-execute-clinical-search"
                onClick={() => handleSearch(searchQuery)}
                disabled={loading || !searchQuery.trim()}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  loading || !searchQuery.trim()
                    ? 'bg-slate-350 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-[#9BB0A5] hover:bg-[#8A9F94] hover:shadow-md'
                }`}
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>{loading ? 'Buscando Evidências...' : 'Buscar Estudos e Condutas'}</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Library Card */}
          <div id="presets-library-card" className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#8A9F94] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#9BB0A5]" />
                Casos Frequentes Padrão
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Selecione um tópico comum de fisioterapia infantil para consultar artigos de revisão e diretrizes médicas instantaneamente.
            </p>

            <div className="space-y-2.5">
              {PRESETS.map((p) => {
                const IconComponent = p.icon;
                return (
                  <button
                    id={`preset-btn-${p.id}`}
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    disabled={loading}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                      darkMode
                        ? 'bg-[#1B221E]/40 border-[#2E3832] hover:bg-[#2E3832] text-white'
                        : 'bg-slate-50 border-slate-200 hover:bg-[#9BB0A5]/10 hover:border-[#9BB0A5] text-slate-800'
                    } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className="p-1.5 bg-[#9BB0A5]/15 text-[#8A9F94] rounded-lg mt-0.5 shrink-0">
                      <IconComponent className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">{p.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug truncate">
                        {p.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Output Column (Synthesized Report & Citations) */}
        <div className="lg:col-span-8">
          
          {/* Loading State Skeleton with Step Updates */}
          {loading && (
            <div id="search-loading-container" className={`p-8 rounded-2xl border text-center flex flex-col items-center justify-center min-h-[500px] space-y-6 ${
              darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB]'
            }`}>
              <div className="relative flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-[#9BB0A5]"></div>
                <GraduationCap className="absolute w-6 h-6 text-[#9BB0A5] animate-bounce" />
              </div>

              <div className="space-y-2 max-w-md">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Consultando Bases Médicas Digitais
                </p>
                <div className="h-1.5 w-48 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-[#9BB0A5] rounded-full animate-progress" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs font-medium text-[#8A9F94] dark:text-[#9BB0A5] transition-all duration-500 min-h-8">
                  {stepsText[loadingStep]}
                </p>
              </div>

              <div className="text-[10px] text-slate-400 max-w-sm leading-relaxed border-t pt-4 border-slate-100 dark:border-slate-800">
                Aviso: Nossa pesquisa de IA consulta publicações científicas reais em tempo real por meio da pesquisa na web para consolidar as melhores diretrizes possíveis de fisioterapia pediátrica.
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div id="search-error-container" className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-center flex flex-col items-center justify-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-800 dark:text-rose-300">
                Falha ao Buscar Evidências
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 max-w-md">
                {error}
              </p>
              <button
                id="btn-retry-clinical-search"
                onClick={() => handleSearch(searchQuery)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Empty / Intro State */}
          {!loading && !error && !responseText && (
            <div id="search-empty-container" className={`p-8 rounded-2xl border text-center flex flex-col items-center justify-center min-h-[500px] space-y-4 ${
              darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#E5E3DB]'
            }`}>
              <span className="p-4 bg-[#9BB0A5]/10 dark:bg-[#9BB0A5]/5 text-[#8A9F94] dark:text-[#9BB0A5] rounded-full">
                <BookOpen className="w-8 h-8" />
              </span>
              <h3 className="font-serif italic font-semibold text-lg text-slate-800 dark:text-white">
                Pronto para Consultar a Ciência
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                Insira uma patologia, sintoma ou técnica de fisioterapia pediátrica na barra lateral, ou selecione um dos casos clínicos frequentes recomendados para obter a conduta terapêutica atualizada de acordo com as diretrizes internacionais baseadas em evidências.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mt-4 text-left">
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                  darkMode ? 'bg-[#1B221E] border-[#2E3832] text-slate-300' : 'bg-[#E5E3DB]/15 border-[#cbd5e1] text-slate-700'
                }`}>
                  🔬 <strong>Bases Sólidas:</strong> Conecta e sintetiza material verídico com links do Google Acadêmico, PubMed, Scielo e outras revistas médicas.
                </div>
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                  darkMode ? 'bg-[#1B221E] border-[#2E3832] text-slate-300' : 'bg-[#E5E3DB]/15 border-[#cbd5e1] text-slate-700'
                }`}>
                  👶 <strong>Exclusivo Pediátrico:</strong> Estruturado sob medida para patologias motoras, respiratórias, ortopédicas e neurológicas infantis.
                </div>
              </div>
            </div>
          )}

          {/* Results Display Area */}
          {!loading && !error && responseText && (
            <div id="search-results-panel" className="space-y-6">
              
              {/* Report Canvas */}
              <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm relative ${
                darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-white border-[#cbd5e1]'
              }`}>
                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-5 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-black uppercase tracking-widest px-2.5 py-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Conduta Científica Gerada
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id="btn-copy-clinical-text"
                      onClick={handleCopyText}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                        copied
                          ? 'bg-emerald-550 border-emerald-550 text-white'
                          : darkMode
                            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                      title="Copiar Relatório"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>

                    <button
                      id="btn-download-clinical-pdf"
                      onClick={handleDownloadPDF}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                        darkMode
                          ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                      title="Salvar como PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Salvar PDF</span>
                    </button>
                  </div>
                </div>

                {/* Synthesis Output using Markdown */}
                <div className={`prose prose-sm max-w-none dark:prose-invert ${
                  darkMode ? 'prose-headings:text-white prose-p:text-slate-200' : 'prose-headings:text-slate-900 prose-p:text-slate-800'
                }`}>
                  <div className="markdown-body">
                    <Markdown>{responseText}</Markdown>
                  </div>
                </div>
              </div>

              {/* Citations & Evidence links */}
              {sources.length > 0 && (
                <div id="evidence-sources-panel" className={`p-6 rounded-2xl border ${
                  darkMode ? 'bg-[#1B221E] border-[#2E3832]' : 'bg-[#E5E3DB]/20 border-[#cbd5e1]'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#8A9F94] mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-[#9BB0A5]" />
                    Estudos Originais e Fontes Clínicas Localizadas
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Clique nos links abaixo para acessar diretamente os artigos científicos, periódicos, diretrizes ou ensaios clínicos localizados para este tema terapêutico.
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {sources.map((src, idx) => (
                      <a
                        id={`source-link-${idx}`}
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-3 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer hover:translate-x-0.5 ${
                          darkMode
                            ? 'bg-[#242D28] border-[#2E3832]/80 hover:bg-[#2E3832] text-slate-200'
                            : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-800 hover:border-[#9BB0A5]'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-snug line-clamp-1">
                            {src.title}
                          </p>
                          <p className="text-[9.5px] text-slate-400 mt-1 truncate">
                            {src.uri}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
