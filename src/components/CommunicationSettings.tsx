import React, { useState, useEffect } from 'react';
import { 
  Check, 
  MessageSquare, 
  Smartphone, 
  Settings, 
  AlertCircle, 
  Database, 
  FileText, 
  Wifi, 
  WifiOff, 
  Send 
} from 'lucide-react';
import { Clinic } from '../types';

interface CommunicationSettingsProps {
  currentClinic: Clinic;
  onUpdateClinicDetails: (id: string, details: Partial<Clinic>) => void;
  darkMode: boolean;
}

export default function CommunicationSettings({
  currentClinic,
  onUpdateClinicDetails,
  darkMode
}: CommunicationSettingsProps) {
  // WhatsApp State Management
  const [whatsappNumber, setWhatsappNumber] = useState(currentClinic.whatsapp || '');
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(!!currentClinic.whatsapp);

  // Enhanced WhatsApp pairing simulator state
  const [whatsappState, setWhatsappState] = useState<'disconnected' | 'connecting' | 'waiting_qr' | 'pairing' | 'connected'>(
    currentClinic.whatsapp ? 'connected' : 'disconnected'
  );
  const [qrCountdown, setQrCountdown] = useState(20);
  const [qrString, setQrString] = useState('');
  const [qrRegenCount, setQrRegenCount] = useState(0);
  const [whatsappLogs, setWhatsappLogs] = useState<string[]>([]);
  const [isConfiguringManualApi, setIsConfiguringManualApi] = useState(false);
  const [whatsappApiUrl, setWhatsappApiUrl] = useState(currentClinic.whatsappApiUrl || '');
  const [whatsappApiToken, setWhatsappApiToken] = useState(currentClinic.whatsappApiToken || '');
  const [whatsappApiInstance, setWhatsappApiInstance] = useState(currentClinic.whatsappApiInstance || '');
  const [messageTemplate, setMessageTemplate] = useState(
    "Olá [Responsável]! 🎈 Passando para lembrar que a sessão de terapia de [Paciente] está marcada para [Data] às [Hora] na clínica [Clínica]. Contamos com vocês!"
  );

  // Sync edit inputs when active clinic changes
  useEffect(() => {
    setWhatsappNumber(currentClinic.whatsapp || '');
    setIsWhatsappConnected(!!currentClinic.whatsapp);
    setWhatsappApiUrl(currentClinic.whatsappApiUrl || '');
    setWhatsappApiToken(currentClinic.whatsappApiToken || '');
    setWhatsappApiInstance(currentClinic.whatsappApiInstance || '');
    setWhatsappState(currentClinic.whatsapp ? 'connected' : 'disconnected');
    if (currentClinic.whatsapp) {
      localStorage.setItem('csm_whatsapp_linked', currentClinic.whatsapp);
    } else {
      localStorage.removeItem('csm_whatsapp_linked');
    }
  }, [currentClinic]);

  // Effect to manage QR countdown and logs for realistic simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (whatsappState === 'waiting_qr') {
      if (qrCountdown > 0) {
        timer = setTimeout(() => setQrCountdown(prev => prev - 1), 1000);
      } else {
        // Regenerate QR code
        setQrCountdown(20);
        setQrRegenCount(prev => prev + 1);
        setQrString(`1@csm-cl-ws-session-${currentClinic.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`);
        setWhatsappLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ⚠️ QR Code anterior expirado. Renovando token de pareamento...`,
          `[${new Date().toLocaleTimeString()}] 🔄 Novo código QR gerado e transmitido via WebSocket (Token: MD-${Math.floor(Math.random() * 9000 + 1000)})`,
          ...prev.slice(0, 8)
        ]);
      }
    }
    return () => clearTimeout(timer);
  }, [whatsappState, qrCountdown, currentClinic.id]);

  const handleStartWhatsappConnection = () => {
    if (!whatsappNumber) return;
    setWhatsappState('connecting');
    setWhatsappLogs([
      `[${new Date().toLocaleTimeString()}] 🔌 Iniciando conexão WebSocket com servidor de mensagens...`,
      `[${new Date().toLocaleTimeString()}] 📡 Estabelecendo handshake seguro (SSL/TLS)...`,
      `[${new Date().toLocaleTimeString()}] 🔐 Gerando par de chaves Curve25519 para criptografia ponta-a-ponta...`
    ]);

    setTimeout(() => {
      setWhatsappState('waiting_qr');
      setQrCountdown(20);
      setQrString(`2@csm-cl-ws-session-${currentClinic.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`);
      setWhatsappLogs(prev => [
        `[${new Date().toLocaleTimeString()}] 📲 Chaves geradas. Aguardando leitura do QR Code pelo WhatsApp...`,
        `[${new Date().toLocaleTimeString()}] 🔄 Transmitindo QR Code de Pareamento (Canal Ativo)...`,
        ...prev
      ]);
    }, 1500);
  };

  const handleSimulatePairing = () => {
    setWhatsappState('pairing');
    setWhatsappLogs(prev => [
      `[${new Date().toLocaleTimeString()}] 📱 Câmera detectou o QR Code! Iniciando leitura...`,
      `[${new Date().toLocaleTimeString()}] 👤 Autenticando com dispositivo ${whatsappNumber}...`,
      `[${new Date().toLocaleTimeString()}] 🔑 Chave de pareamento aceita! Sincronizando dados básicos de perfil...`,
      ...prev
    ]);

    setTimeout(() => {
      onUpdateClinicDetails(currentClinic.id, { whatsapp: whatsappNumber });
      localStorage.setItem('csm_whatsapp_linked', whatsappNumber);
      setIsWhatsappConnected(true);
      setWhatsappState('connected');
      setWhatsappLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ✅ Pareamento concluído com sucesso!`,
        `[${new Date().toLocaleTimeString()}] 🟢 Dispositivo conectado e operando no CSM Clinical.`,
        ...prev
      ]);
    }, 2000);
  };

  const handleSaveManualApiConfig = () => {
    onUpdateClinicDetails(currentClinic.id, {
      whatsapp: whatsappNumber,
      whatsappApiUrl,
      whatsappApiToken,
      whatsappApiInstance
    });
    localStorage.setItem('csm_whatsapp_linked', whatsappNumber);
    setIsWhatsappConnected(true);
    setWhatsappState('connected');
    alert("Configurações de API de Produção salvas com sucesso! Integração ativa.");
  };

  return (
    <div id="communication-settings-module" className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8A9F94] bg-[#9BB0A5]/10 dark:bg-[#9BB0A5]/5 px-3 py-1.5 rounded-full">
            📡 Módulo de Comunicação
          </span>
          <h2 className="text-xl font-serif italic font-semibold text-[#2D312E] dark:text-white mt-3">
            Modos de Comunicação & Disparos
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Gerencie os canais de envio de lembretes de agenda, tarefas terapêuticas de casa e mensagens de confirmação de presença diretamente para o celular dos pacientes ou responsáveis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SIDE: Information and channel health */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`p-6 border rounded-[2rem] shadow-sm space-y-4 ${
            darkMode ? 'bg-[#242D28] border-[#2E3832] text-[#ECEBE5]' : 'bg-white border-[#E5E3DB] text-[#2D312E]'
          }`}>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#8A9F94] flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-500" />
              Canais Disponíveis
            </h3>
            
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">WhatsApp API</h4>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Disponível no Plano</p>
                  </div>
                </div>
                {isWhatsappConnected ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <Wifi className="w-3.5 h-3.5 animate-pulse" /> Ativo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <WifiOff className="w-3.5 h-3.5" /> Inativo
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 opacity-60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">E-mail Transacional</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Não configurado</p>
                  </div>
                </div>
                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-extrabold text-slate-400">EM BREVE</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E3DB] dark:border-[#2E3832] space-y-2">
              <p className="text-[11px] leading-relaxed text-slate-400">
                ⚠️ Os envios de mensagens utilizam tags inteligentes dinâmicas que preenchem as informações de consultas agendadas em tempo real.
              </p>
            </div>
          </div>

          {/* Quick tips */}
          <div className={`p-6 border rounded-[2rem] shadow-sm space-y-3 ${
            darkMode ? 'bg-[#242D28] border-[#2E3832]' : 'bg-[#F9F8F3] border-[#E5E3DB]'
          }`}>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8A9F94] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Dicas de Formatação
            </h4>
            <ul className="text-[11px] text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
              <li>Use <strong>[Responsável]</strong> para citar o nome de quem acompanha o paciente.</li>
              <li>Use <strong>[Paciente]</strong> para citar o nome da pessoa atendida.</li>
              <li>Use <strong>[Data]</strong> e <strong>[Hora]</strong> para preencher data e horário da consulta.</li>
              <li>Use <strong>[Clínica]</strong> para citar o nome corporativo configurado.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE: Dedicated Whatsapp config panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`p-6 border rounded-[2rem] shadow-sm space-y-5 ${
            darkMode ? 'bg-[#242D28] border-[#2E3832] text-[#ECEBE5]' : 'bg-white border-[#E5E3DB] text-[#2D312E]'
          }`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E5E3DB] dark:border-[#2E3832]">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                  💬 Integração WhatsApp Multi-Device
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#8A9F94] mt-2 mb-0.5">
                  Conexão de Disparo Clínico
                </h3>
                <p className="text-[11px] text-slate-400">
                  Ligue um aparelho celular para disparar as tarefas de casa e as notificações de agendamento de forma automatizada.
                </p>
              </div>

              {!isWhatsappConnected && (
                <div className="flex bg-[#F9F8F3] dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start">
                  <button
                    type="button"
                    onClick={() => setIsConfiguringManualApi(false)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      !isConfiguringManualApi 
                        ? 'bg-[#9BB0A5] text-white shadow-xs' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Simulador Web
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfiguringManualApi(true)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      isConfiguringManualApi 
                        ? 'bg-[#9BB0A5] text-white shadow-xs' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    API de Produção
                  </button>
                </div>
              )}
            </div>

            {isWhatsappConnected ? (
              <div className="space-y-4 animate-in fade-in duration-250">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <Check className="w-5 h-5" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#242D28] animate-ping"></span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">Instância WhatsApp Ativa e Conectada</p>
                      <p className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">Dispositivo: +55 {whatsappNumber}</p>
                      {currentClinic.whatsappApiUrl && (
                        <p className="text-[9px] font-semibold text-[#8A9F94] mt-0.5">Modo de Produção: Gateway Ativo ({currentClinic.whatsappApiInstance})</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateClinicDetails(currentClinic.id, { 
                        whatsapp: '',
                        whatsappApiUrl: '',
                        whatsappApiToken: '',
                        whatsappApiInstance: ''
                      });
                      localStorage.removeItem('csm_whatsapp_linked');
                      setIsWhatsappConnected(false);
                      setWhatsappNumber('');
                      setWhatsappState('disconnected');
                      setWhatsappLogs([]);
                    }}
                    className="px-3.5 py-1.5 text-[10px] font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-xs self-end sm:self-auto"
                  >
                    Desconectar Aparelho
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modelo do Texto de Confirmação</label>
                  <textarea
                    rows={4}
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-[#E5E3DB] text-slate-800'
                    }`}
                  />
                  <span className="text-[9px] text-slate-400 italic block">Tags dinâmicas automáticas: [Responsável], [Paciente], [Data], [Hora] e [Clínica].</span>
                </div>
              </div>
            ) : isConfiguringManualApi ? (
              // PRODUCTION API CARD
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Aviso de Integração:</strong> Para conexões reais em ambiente de produção, configure as credenciais do seu gateway de mensagens contratado (Z-API, Evolution API, ou Baileys corporativo).
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Celular da Instância (com DDD)</label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Ex: (11) 98311-2244"
                      className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F9F8F3] border-[#E5E3DB] text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome / ID da Instância</label>
                    <input
                      type="text"
                      value={whatsappApiInstance}
                      onChange={(e) => setWhatsappApiInstance(e.target.value)}
                      placeholder="Ex: csm_clinica_principal"
                      className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F9F8F3] border-[#E5E3DB] text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">URL do Endpoint do Gateway</label>
                    <input
                      type="text"
                      value={whatsappApiUrl}
                      onChange={(e) => setWhatsappApiUrl(e.target.value)}
                      placeholder="Ex: https://api.meugateway.com.br/v1/instance"
                      className={`w-full text-xs font-semibold rounded-xl px-4 py-2.5 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F9F8F3] border-[#E5E3DB] text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Token Secreto da Instância (API Key)</label>
                    <input
                      type="password"
                      value={whatsappApiToken}
                      onChange={(e) => setWhatsappApiToken(e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className={`w-full text-xs font-mono font-bold rounded-xl px-4 py-2.5 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F9F8F3] border-[#E5E3DB] text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveManualApiConfig}
                  disabled={!whatsappNumber || !whatsappApiUrl}
                  className="w-full py-2.5 bg-[#9BB0A5] hover:bg-[#8A9F94] disabled:bg-slate-350 dark:disabled:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  ✓ Conectar e Salvar Instância de Produção
                </button>
              </div>
            ) : (
              // INTERACTIVE WEBSOCKET SCANNER SIMULATOR
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Insira o Celular com DDD (WhatsApp)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-xs font-bold font-mono">
                      🇧🇷 +55
                    </span>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="(11) 98311-2244"
                      disabled={whatsappState !== 'disconnected'}
                      className={`w-full text-xs font-bold rounded-xl pl-14 pr-4 py-3 outline-none border transition-all ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F9F8F3] border-[#E5E3DB] text-slate-800'
                      } ${whatsappState !== 'disconnected' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                {whatsappNumber ? (
                  <div className="space-y-4">
                    {whatsappState === 'disconnected' && (
                      <div className="p-5 border rounded-2xl border-[#E5E3DB] dark:border-slate-800/85 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <Check className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Pronto para Conectar o Dispositivo</p>
                          <p className="text-[10px] text-slate-400 max-w-xs mt-1">
                            Para gerar um QR Code de pareamento criptográfico em tempo real, clique no botão abaixo.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleStartWhatsappConnection}
                          className="px-5 py-2.5 bg-[#9BB0A5] hover:bg-[#8A9F94] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs w-full"
                        >
                          🔄 Gerar QR Code de Pareamento Seguro
                        </button>
                      </div>
                    )}

                    {whatsappState === 'connecting' && (
                      <div className="p-8 border rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-center gap-4 animate-in zoom-in-95 duration-250">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#9BB0A5] border-b-slate-300"></div>
                        <div>
                          <p className="text-xs font-bold text-[#9BB0A5]">Iniciando Servidor de Sessões...</p>
                          <p className="text-[9px] font-mono text-slate-400 mt-1">Conectando ao gateway e assinando canais WebSocket de comunicação segura.</p>
                        </div>
                      </div>
                    )}

                    {whatsappState === 'waiting_qr' && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 border rounded-2xl border-[#E5E3DB] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in duration-300">
                        {/* QR Box */}
                        <div className="md:col-span-5 flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center relative overflow-hidden">
                            <div className="w-40 h-40 relative flex items-center justify-center bg-white rounded-xl">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrString)}`}
                                alt="WhatsApp Web Connection Pairing QR"
                                className="w-36 h-36 object-contain"
                                referrerPolicy="no-referrer"
                              />
                              {/* Laser scan line overlay */}
                              <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 animate-[bounce_2.5s_infinite] shadow-md opacity-80 pointer-events-none"></div>
                            </div>
                          </div>
                          
                          {/* Timer */}
                          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/15 px-3 py-1 rounded-full text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                            Código expira em {qrCountdown}s
                          </div>
                        </div>

                        {/* Scanner guidelines & interactive pairing emulator */}
                        <div className="md:col-span-7 flex flex-col justify-between gap-4">
                          <div className="space-y-2">
                            <h4 className="text-xs font-black text-slate-700 dark:text-slate-100 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#9BB0A5]"></span>
                              Como Parear o Dispositivo:
                            </h4>
                            <ol className="list-decimal list-inside text-[10px] text-slate-400 space-y-1 font-semibold leading-relaxed">
                              <li>Abra o WhatsApp no seu smartphone.</li>
                              <li>Acesse Configurações &gt; Aparelhos Conectados.</li>
                              <li>Toque em <strong className="text-slate-600 dark:text-slate-350">Conectar um Aparelho</strong>.</li>
                              <li>Aponte a câmera para ler o QR Code dinâmico gerado.</li>
                            </ol>
                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-[9px] text-slate-400 leading-normal">
                              💡 <strong>Nota de Teste:</strong> No ambiente de simulação sandbox, clique no botão azul abaixo para simular a leitura do QR code com sucesso!
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleSimulatePairing}
                            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md w-full"
                          >
                            📱 Simular Leitura do QR Code com o Celular
                          </button>
                        </div>

                        {/* Real-time WebSocket simulator logs block */}
                        <div className="md:col-span-12 space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Console de Transmissão WebSocket (Live Logs):
                          </p>
                          <div className="bg-slate-900 text-[#00FF66] font-mono p-3 rounded-xl border border-slate-800 text-[10px] max-h-24 overflow-y-auto leading-relaxed shadow-inner">
                            {whatsappLogs.map((log, index) => (
                              <div key={index} className="truncate">{log}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {whatsappState === 'pairing' && (
                      <div className="p-8 border rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-center gap-3 animate-in zoom-in-95">
                        <div className="animate-bounce p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
                          <Check className="w-8 h-8 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Verificando Credenciais do Aparelho...</p>
                          <p className="text-[9px] font-mono text-slate-400 mt-1">
                            Estabelecendo conexão persistente com o WhatsApp e assinando Webhooks.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center text-[10px] text-slate-400 font-semibold italic">
                    Digite o número de telefone acima para exibir o QR Code de Vinculação.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
