import React, { useState } from 'react';
import { 
  Wrench, 
  KeyRound, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  LogIn,
  ArrowRight
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext.tsx';
import type { Tecnico } from '../types/os.ts';

interface LoginPageProps {
  tecnicos?: Tecnico[];
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { loginWithCredentials, loading } = useAdminAuth();

  const [usuario, setUsuario] = useState('b.ritieller@gmail.com');
  const [senha, setSenha] = useState('');
  const [pin, setPin] = useState('123456');
  const [showSenha, setShowSenha] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!usuario.trim()) {
      setErrorMsg('Informe o usuário ou e-mail.');
      return;
    }
    if (!senha.trim()) {
      setErrorMsg('Informe a senha.');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Informe o PIN de segurança.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginWithCredentials(usuario, senha, pin);
      if (res.success) {
        setSuccessMsg('Acesso autorizado!');
        setTimeout(() => {
          onLoginSuccess();
        }, 400);
      } else {
        setErrorMsg(res.message || 'Credenciais inválidas.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar login.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Background subtle glow */}
      <div className="fixed inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 relative z-10">
        
        {/* Left: Thematic 3D Image Banner */}
        <div className="relative min-h-[240px] md:min-h-full bg-slate-950 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
          <img
            src="/src/assets/images/tech_service_workbench_1790699998802.jpg"
            alt="Bancada de Assistência Técnica e Manutenção"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Brand Tag */}
          <div className="relative z-10 p-5 sm:p-6 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/90 backdrop-blur-md flex items-center justify-center text-white shadow-lg border border-indigo-400/30">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-base font-extrabold text-white tracking-tight">OS Master</span>
          </div>

          {/* Bottom subtle label */}
          <div className="relative z-10 p-5 sm:p-6">
            <p className="text-xs font-semibold text-slate-200">Sistema de Gestão & Assistência Técnica</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Terminal Operacional de Bancada</p>
          </div>
        </div>

        {/* Right: Clean 3-Field Security Form (Usuário, Senha, PIN) */}
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-slate-900">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Acesso ao Sistema</h2>
              <p className="text-xs text-slate-400 mt-1">Informe suas credenciais para autenticar</p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Usuário */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Usuário ou E-mail
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="Digite seu usuário ou e-mail"
                    autoComplete="username"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Senha */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    required
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showSenha ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 3: PIN de Segurança */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    PIN de Segurança
                  </label>
                  <span className="text-[10px] text-indigo-400 font-mono">Padrão: 123456</span>
                </div>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN numérico (ex: 123456)"
                    maxLength={10}
                    required
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono tracking-wider transition-colors"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showPin ? 'Ocultar PIN' : 'Exibir PIN'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{submitting ? 'Autenticando...' : 'Entrar no Sistema'}</span>
              </button>
            </form>
          </div>

          {/* Quick Access / Demo link */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={onLoginSuccess}
              className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Acessar sem login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-400 font-mono">v2.4</span>
          </div>

        </div>

      </div>
    </div>
  );
};
