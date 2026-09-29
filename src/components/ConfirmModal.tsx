import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  ShieldAlert, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext.tsx';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  requireAdmin?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Sim, Excluir',
  cancelText = 'Cancelar',
  danger = true,
  requireAdmin = true,
  onConfirm,
  onCancel
}) => {
  const { isAdmin, openLoginModal } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (requireAdmin && !isAdmin) {
      openLoginModal(`Para realizar "${title}", é necessário autenticar como Administrador.`);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await onConfirm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao executar a ação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              danger
                ? 'bg-rose-100 text-rose-600'
                : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            {danger ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 pr-2">
            <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {requireAdmin && !isAdmin && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Permissão de Administrador Necessária</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Você precisa estar autenticado como Administrador para efetivar a remoção deste registro.
              </p>
              <button
                type="button"
                onClick={() => openLoginModal(`Autentique-se como Administrador para ${title.toLowerCase()}`)}
                className="w-full mt-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Fazer Login como Admin</span>
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                danger
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:bg-rose-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:bg-indigo-300'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
