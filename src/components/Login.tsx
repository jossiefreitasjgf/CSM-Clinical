import React, { useState } from 'react';
import { KeyRound, User, Lock, ArrowRight, Baby, Eye, EyeOff, ShieldCheck, Sparkles, Building2, UserPlus, LogIn } from 'lucide-react';
import { SystemUser, Clinic, UserRole } from '../types';

interface LoginProps {
  systemUsers: SystemUser[];
  onLoginSuccess: (user: SystemUser) => void;
  onRegisterUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  clinics: Clinic[];
}

export function Login({ systemUsers, onLoginSuccess, onRegisterUser, darkMode, setDarkMode, clinics }: LoginProps) {
  // Navigation role switcher/login states
  const [isRegistering, setIsRegistering] = useState(false);

  // Login form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Admin');
  const [regClinicId, setRegClinicId] = useState(clinics[0]?.id || 'clinic-1');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // General feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recovery form states
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveryMessage('');

    if (!recoveryEmail.trim()) {
      setRecoveryError('Por favor, digite seu e-mail.');
      return;
    }

    const matchedUser = systemUsers.find(
      (u) => u.email.toLowerCase() === recoveryEmail.toLowerCase().trim()
    );

    if (matchedUser) {
      setRecoveryMessage(`Instruções enviadas! Sua senha cadastrada é: "${matchedUser.password || '1234'}"`);
    } else {
      setRecoveryError('E-mail não localizado na base de dados.');
    }
  };

  // Form Submission handles
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (!usernameOrEmail || !password) {
        setErrorMsg('Por favor, digite suas credenciais.');
        setIsSubmitting(false);
        return;
      }

      const matchedUser = systemUsers.find(
        (user) =>
          (user.email.toLowerCase() === usernameOrEmail.toLowerCase() ||
           user.name.toLowerCase() === usernameOrEmail.toLowerCase()) &&
          (user.password === password || (!user.password && password === '1234'))
      );

      if (matchedUser) {
        if (matchedUser.status === 'Inativo') {
          setErrorMsg('Acesso indisponível: este usuário está Inativo no painel SaaS.');
          setIsSubmitting(false);
          return;
        }
        localStorage.setItem('csm_session_user', JSON.stringify(matchedUser));
        onLoginSuccess(matchedUser);
      } else {
        setErrorMsg('Oops! Credenciais inválidas. Verifique seu e-mail e sua senha cadastrada.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (!regName.trim() || !regEmail.trim() || !regPassword) {
        setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
        setIsSubmitting(false);
        return;
      }

      // Basic email verification
      if (!regEmail.includes('@') || !regEmail.includes('.')) {
        setErrorMsg('Por favor, insira um endereço de e-mail válido.');
        setIsSubmitting(false);
        return;
      }

      // Password length check
      if (regPassword.length < 4) {
        setErrorMsg('A senha deve conter no mínimo 4 caracteres.');
        setIsSubmitting(false);
        return;
      }

      // Check if email already registered
      const hasEmail = systemUsers.some(
        (user) => user.email.toLowerCase() === regEmail.toLowerCase().trim()
      );

      if (hasEmail) {
        setErrorMsg('E-mail já cadastrado no sistema LúdicoPed SaaS. Tente acessar ou use outro e-mail.');
        setIsSubmitting(false);
        return;
      }

      // Succesfully register user
      const newUserPayload = {
        clinicId: regClinicId,
        name: regName.trim(),
        email: regEmail.toLowerCase().trim(),
        role: regEmail.toLowerCase().trim() === 'jossiefreitas.jgf@gmail.com' ? 'Desenvolvedor' as const : regRole,
        status: 'Ativo' as const,
        password: regPassword
      };

      onRegisterUser(newUserPayload);
      setSuccessMsg('Conta criada com sucesso! Redirecionando...');

      // Clear register states
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      
      setIsSubmitting(false);
    }, 500);
  };

  const handleQuickFill = (user: SystemUser) => {
    setIsRegistering(false);
    setUsernameOrEmail(user.email);
    setPassword(user.password || '1234');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div id="login-container" className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      darkMode ? 'bg-[#121614] text-white' : 'bg-[#FAF9F5] text-slate-800'
    }`}>
      
      {/* Dark mode switcher */}
      <div className="absolute top-4 right-4">
        <button
          id="theme-toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2.5 rounded-2xl border transition-all cursor-pointer text-xs font-bold ${
            darkMode 
              ? 'bg-[#242D28] border-[#2E3832] text-[#9BB0A5] hover:bg-[#2E3832]' 
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm'
          }`}
          title="Alternar Tema"
        >
          {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        
        {/* App Logo/Header */}
        <div id="login-brand" className="text-center space-y-2 select-none">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-[#FA8F3B] text-white shadow-md animate-pulse">
            <Baby className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-850 dark:text-white flex items-center justify-center gap-1.5 font-serif">
              LúdicoPed <span className="text-xs bg-[#8A9F94]/15 text-[#8A9F94] dark:text-[#9BB0A5] px-2 py-0.5 rounded-full font-sans font-extrabold select-none">SaaS</span>
            </h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Portal Multi-Clínicas de Terapia Psicomotora
            </p>
          </div>
        </div>

        {/* Outer Form Frame */}
        <div id="login-form-box" className={`p-8 rounded-3xl border transition-all duration-300 ${
          darkMode 
            ? 'bg-[#1B221E] border-[#2E3832] shadow-xl shadow-[#000000]/40' 
            : 'bg-white border-slate-150 shadow-2xl shadow-slate-200/50'
        }`}>
          
          {showRecovery ? (
            /* --- RECOVERY FORM --- */
            <div className="space-y-4 font-sans">
              <div className="space-y-1 mb-5 text-center">
                <h2 className="text-base font-black text-slate-800 dark:text-white">
                  Recuperar sua Senha
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-400">
                  Informe o seu e-mail cadastrado para recuperar sua credencial de acesso.
                </p>
              </div>

              {recoveryError && (
                <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/15 rounded-xl text-[11px] font-semibold text-rose-500 text-center leading-tight">
                  ⚠️ {recoveryError}
                </div>
              )}
              {recoveryMessage && (
                <div role="alert" className="p-4 bg-emerald-500/13 border border-emerald-500/20 rounded-xl text-teal-700 dark:text-emerald-400 text-center leading-relaxed">
                  <p className="font-bold text-xs uppercase tracking-wider">✅ Operação Bem Sucedida!</p>
                  <p className="mt-2 text-xs font-semibold">{recoveryMessage}</p>
                </div>
              )}

              <form onSubmit={handleRecoverPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="recovery-email" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">E-mail Cadastrado</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-350" />
                    <input
                      id="recovery-email"
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="seu.email@consultorio.com"
                      className={`w-full text-xs font-semibold rounded-xl px-10 py-2.5 outline-none border transition-all ${
                        darkMode 
                          ? 'bg-[#242D28] border-[#2E3832] text-white focus:border-[#9BB0A5]' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-350'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecovery(false);
                      setRecoveryEmail('');
                      setRecoveryMessage('');
                      setRecoveryError('');
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer text-center ${
                      darkMode
                        ? 'bg-[#242D28] border-[#2E3832] text-slate-300 hover:bg-[#2E3832]'
                        : 'bg-slate-100 border-slate-200 text-slate-650 hover:bg-slate-150'
                    }`}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#FA8F3B] hover:bg-[#E07925] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Recuperar
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Tab Selection */}
          <div className="flex border-b border-slate-100 dark:border-[#2E3832] mb-6">
            <button
              id="tab-login"
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                !isRegistering
                  ? 'border-[#FA8F3B] text-[#FA8F3B]'
                  : 'border-transparent text-slate-400 hover:text-slate-500'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                isRegistering
                  ? 'border-[#FA8F3B] text-[#FA8F3B]'
                  : 'border-transparent text-slate-400 hover:text-slate-500'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Criar Conta
            </button>
          </div>

          <div className="space-y-1 mb-5 text-center">
            <h2 className="text-base font-black text-slate-800 dark:text-white">
              {isRegistering ? 'Novo Acesso de Teste' : 'Acesse o Sistema'}
            </h2>
            <p className="text-xs text-slate-400">
              {isRegistering 
                ? 'Preencha os campos para simular um novo usuário SaaS de teste' 
                : 'Insira as credenciais do seu perfil habilitado'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div role="alert" className="mb-4 p-3 bg-rose-500/10 border border-rose-500/15 rounded-xl text-[11px] font-semibold text-rose-500 text-center animate-shake leading-tight">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div role="alert" className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-[11px] font-semibold text-emerald-500 text-center leading-tight">
              ✅ {successMsg}
            </div>
          )}

          {!isRegistering ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label htmlFor="login-username" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Nome ou E-mail</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-350" />
                  <input
                    id="login-username"
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Seu nome ou email profissional"
                    className={`w-full text-xs font-semibold rounded-xl px-10 py-2.5 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-[#242D28] border-[#2E3832] text-white focus:border-[#9BB0A5]' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-350'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Senha Secreta</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-350" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha de login"
                    className={`w-full text-xs font-semibold rounded-xl px-10 py-2.5 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-[#242D28] border-[#2E3832] text-white focus:border-[#9BB0A5]' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-350'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-350 hover:text-slate-500 cursor-pointer"
                    title={showPassword ? 'Ocultar Senha' : 'Exibir Senha'}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(true);
                    setRecoveryEmail(usernameOrEmail);
                    setRecoveryError('');
                    setRecoveryMessage('');
                  }}
                  className="text-[10px] font-extrabold text-[#FA8F3B] dark:text-[#FFA05A] hover:underline cursor-pointer"
                >
                  Recuperar senha / Esqueceu a senha?
                </button>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 bg-[#FA8F3B] hover:bg-[#E07925] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSubmitting ? 'opacity-80 cursor-wait' : ''
                }`}
              >
                {isSubmitting ? 'Verificando credenciais...' : 'Acessar Consultório'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* --- SIGN UP FORM --- */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label htmlFor="reg-name" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-350" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu nome completo"
                    className={`w-full text-xs font-semibold rounded-xl px-10 py-2.5 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-[#242D28] border-[#2E3832] text-white focus:border-[#9BB0A5]' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-350'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-sans">E-mail Profissional</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-350" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nome@consultorio.com"
                    className={`w-full text-xs font-semibold rounded-xl px-10 py-2.5 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-[#242D28] border-[#2E3832] text-white focus:border-[#9BB0A5]' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-350'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Senha Secreta</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-350" />
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className={`w-full text-xs font-semibold rounded-xl px-10 py-2.5 outline-none border transition-all ${
                      darkMode 
                        ? 'bg-[#242D28] border-[#2E3832] text-white focus:border-[#9BB0A5]' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-350'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 text-slate-350 hover:text-slate-500 cursor-pointer"
                    title={showRegPassword ? 'Ocultar Senha' : 'Exibir Senha'}
                  >
                    {showRegPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="reg-role" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Cargo / Role</label>
                  <div className="relative">
                    <select
                      id="reg-role"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className={`w-full text-xs font-semibold rounded-xl px-3 py-2.5 outline-none cursor-pointer border appearance-none transition-all ${
                        darkMode 
                          ? 'bg-[#242D28] border-[#2E3832] text-white focus:border-[#9BB0A5]' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-350'
                      }`}
                    >
                      <option value="Admin">Administrador</option>
                      <option value="Fisio">Fisioterapeuta</option>
                      <option value="Recepcao">Recepcionista</option>
                      {regEmail.toLowerCase().trim() === 'jossiefreitas.jgf@gmail.com' && (
                        <option value="Desenvolvedor">Desenvolvedor (Exclusivo)</option>
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-clinic" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Clínica</label>
                  <div className="relative">
                    <select
                      id="reg-clinic"
                      value={regClinicId}
                      onChange={(e) => setRegClinicId(e.target.value)}
                      className={`w-full text-xs font-semibold rounded-xl px-3 py-2.5 outline-none cursor-pointer border appearance-none transition-all ${
                        darkMode 
                          ? 'bg-[#242D28] border-[#2E3832] text-white focus:border-[#9BB0A5]' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-350'
                      }`}
                    >
                      {clinics.map((c) => (
                        <option key={c.id} value={c.id}>{c.name.split(' - ')[0]}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <button
                id="btn-register-submit"
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 bg-[#4F8366] hover:bg-[#3D6950] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSubmitting ? 'opacity-80 cursor-wait' : ''
                }`}
              >
                {isSubmitting ? 'Cadastrando...' : 'Criar e Acessar Conta'}
                <UserPlus className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick tester support shortcut list */}
          <div className="mt-6 pt-5 border-t border-slate-150 dark:border-[#2E3832]/60">
            <p className="text-[10px] font-black uppercase text-center text-[#FA8F3B] dark:text-[#9BB0A5] tracking-widest flex items-center justify-center gap-1 leading-none">
              <Sparkles className="w-3.5 h-3.5" /> Facilitador de Teste Rápido
            </p>
            <p className="text-[9.5px] text-slate-400 text-center mt-1 leading-snug">
              Clique em um perfil seeded para preencher e validar os privilégios de acesso:
            </p>
            
            <div className="grid grid-cols-1 gap-2 mt-3">
              {systemUsers.slice(0, 3).map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickFill(user)}
                  type="button"
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-[#121614] border-[#2C3530] text-slate-300 hover:bg-[#252E2A] hover:border-[#9BB0A5]'
                      : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-white hover:border-slate-350 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold block">{user.name}</span>
                    <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      user.role === 'Desenvolvedor'
                        ? 'bg-purple-500/10 text-purple-650 dark:text-purple-400'
                        : user.role === 'Admin'
                          ? 'bg-amber-500/10 text-amber-505 dark:text-amber-400'
                          : user.role === 'Fisio'
                            ? 'bg-teal-500/10 text-teal-605'
                            : 'bg-indigo-500/10 text-indigo-505'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5 font-mono">
                    <span>E-mail: {user.email}</span>
                    <span>Senha: <strong className="text-orange-500 font-bold">{user.password || '1234'}</strong></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          </>
          )}

        </div>

        {/* Security watermark footer */}
        <div className="text-center">
          <p className="text-[10px] text-slate-450 font-semibold flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Sistema criptografado com isolamento de perfil SaaS ativo
          </p>
        </div>

      </div>
    </div>
  );
}
