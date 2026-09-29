import React, { useState } from 'react';
import { 
  KeyRound, 
  X, 
  LogIn, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext.tsx';

export const AdminLoginModal: React.FC = () => {
  const { 
    isLoginModalOpen, 
    loginReason, 
    closeLoginModal, 
    loginWithCredentials, 
    loading 
  } = useAdminAuth();

  const [usuario, setUsuario] = useState('b.ritieller@gmail.com');
  const [senha, setSenha] = useState('');
  const [pin, setPin] = useState('123456');
  const [showSenha, setShowSenha] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

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
        setSuccessMsg('Acesso liberado com sucesso!');
        setTimeout(() => {
          closeLoginModal();
        }, 350);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Autenticação</h3>
            <p className="text-[11px] text-slate-500">
              {loginReason || 'Informe Usuário, Senha e PIN'}
            </p>
          </div>
          <button
            onClick={closeLoginModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          {errorMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Usuário */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Usuário / E-mail
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="admin ou seu e-mail"
                  required
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* PIN */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  PIN de Segurança
                </label>
                <span className="text-[10px] text-indigo-600 font-mono">Padrão: 123456</span>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="123456"
                  maxLength={10}
                  required
                  className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-mono tracking-wider"
                />
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{submitting ? 'Verificando...' : 'Confirmar e Entrar'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
