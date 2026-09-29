import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  FileText 
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal.tsx';
import type { Cliente, OrdemServico } from '../types/os.ts';

export const ClientesView: React.FC<{
  clientes: Cliente[];
  ordens: OrdemServico[];
  onSaveCliente: (dados: Omit<Cliente, 'id' | 'createdAt'>, id?: string) => Promise<void>;
  onDeleteCliente: (id: string) => Promise<void>;
  onSelectOS: (os: OrdemServico) => void;
}> = ({
  clientes,
  ordens,
  onSaveCliente,
  onDeleteCliente,
  onSelectOS
}) => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deleteTargetCliente, setDeleteTargetCliente] = useState<Cliente | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PF');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('São Paulo');
  const [uf, setUf] = useState('SP');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setEditingCliente(null);
    setNome('');
    setEmail('');
    setTelefone('');
    setWhatsapp('');
    setCpfCnpj('');
    setTipoPessoa('PF');
    setCep('');
    setLogradouro('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setCidade('São Paulo');
    setUf('SP');
    setObservacoes('');
    setModalOpen(true);
  };

  const openEditModal = (c: Cliente) => {
    setEditingCliente(c);
    setNome(c.nome);
    setEmail(c.email);
    setTelefone(c.telefone);
    setWhatsapp(c.whatsapp);
    setCpfCnpj(c.cpfCnpj);
    setTipoPessoa(c.tipoPessoa);
    setCep(c.cep);
    setLogradouro(c.logradouro);
    setNumero(c.numero);
    setComplemento(c.complemento || '');
    setBairro(c.bairro);
    setCidade(c.cidade);
    setUf(c.uf);
    setObservacoes(c.observacoes || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      alert('Nome e telefone são campos obrigatórios.');
      return;
    }

    try {
      setSaving(true);
      await onSaveCliente(
        {
          nome,
          email,
          telefone,
          whatsapp: whatsapp || telefone.replace(/\D/g, ''),
          cpfCnpj,
          tipoPessoa,
          cep,
          logradouro,
          numero,
          complemento,
          bairro,
          cidade,
          uf,
          observacoes
        },
        editingCliente?.id
      );
      setModalOpen(false);
    } catch (err: any) {
      alert(`Erro ao salvar cliente: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredClientes = clientes.filter(c => {
    const term = search.toLowerCase();
    return (
      c.nome.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.telefone.includes(term) ||
      c.cpfCnpj.includes(term)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Gestão de Clientes</h1>
          <p className="text-sm text-slate-400">
            Base cadastral de clientes, contatos, histórico de ordens e atalho para WhatsApp.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between gap-3 text-white">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, CPF/CNPJ, e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Total: <strong className="text-white">{filteredClientes.length}</strong> clientes
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.map((c) => {
          const clientOrdens = ordens.filter(os => os.clienteId === c.id);
          const rawWhatsapp = (c.whatsapp || c.telefone).replace(/\D/g, '');
          const cleanPhone = rawWhatsapp.startsWith('55') ? rawWhatsapp : `55${rawWhatsapp}`;

          return (
            <div
              key={c.id}
              className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-md hover:shadow-lg hover:border-indigo-500/50 hover:bg-[#131d33] transition-all flex flex-col justify-between text-white"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-white text-base">{c.nome}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {c.tipoPessoa}
                      </span>
                      {c.cpfCnpj && (
                        <span className="text-xs text-slate-400 font-mono">{c.cpfCnpj}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Editar Cliente"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetCliente(c)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Excluir Cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contacts */}
                <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.telefone}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.logradouro && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.logradouro}, {c.numero} - {c.cidade}/{c.uf}</span>
                    </div>
                  )}
                </div>

                {/* Recent OSs for this client */}
                <div className="border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Histórico de Ordens ({clientOrdens.length})
                    </span>
                  </div>
                  {clientOrdens.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Nenhuma OS aberta</p>
                  ) : (
                    <div className="space-y-1">
                      {clientOrdens.slice(0, 2).map((os) => (
                        <div
                          key={os.id}
                          onClick={() => onSelectOS(os)}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-800/60 hover:bg-indigo-950/40 hover:text-indigo-300 cursor-pointer transition-colors border border-slate-750"
                        >
                          <span className="font-mono font-bold text-indigo-400">{os.numeroOS}</span>
                          <span className="truncate max-w-[120px] text-slate-300 text-[11px]">{os.equipamento.tipo}</span>
                          <span className="font-semibold text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                            {os.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom WhatsApp CTA */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 text-xs font-bold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conversar no WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Cadastrar / Editar Cliente */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome Completo / Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Pessoa</label>
                  <select
                    value={tipoPessoa}
                    onChange={(e) => setTipoPessoa(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  >
                    <option value="PF">Pessoa Física (PF)</option>
                    <option value="PJ">Pessoa Jurídica (PJ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefone Principal *</label>
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="5511999999999"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Endereço (Rua, Av.)</label>
                  <input
                    type="text"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    placeholder="Rua das Flores, 123"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cidade</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    maxLength={2}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl uppercase"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  {saving ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetCliente)}
        title="Excluir Cliente"
        message={`Deseja realmente remover o cliente "${deleteTargetCliente?.nome}"? O histórico de ordens continuará preservado.`}
        confirmText="Sim, Excluir"
        danger={true}
        requireAdmin={true}
        onConfirm={async () => {
          if (deleteTargetCliente) {
            await onDeleteCliente(deleteTargetCliente.id);
            setDeleteTargetCliente(null);
          }
        }}
        onCancel={() => setDeleteTargetCliente(null)}
      />
    </div>
  );
};

