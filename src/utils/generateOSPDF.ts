import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { OrdemServico } from '../types/os.ts';
import type { EmpresaConfig } from '../components/OSPrintModal.tsx';

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const formatDate = (isoString?: string) => {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
};

export const generateOSPDF = (
  os: OrdemServico,
  empresa: EmpresaConfig,
  format: 'a4' | '80mm',
  viaType: 'cliente' | 'oficina' | 'unica' = 'unica'
) => {
  if (format === 'a4') {
    generateA4PDF(os, empresa, viaType);
  } else {
    generate80mmPDF(os, empresa);
  }
};

/**
 * GERAÇÃO DIRETA DE PDF A4 (VETORIAL, NÍTIDO, 100% CONFIÁVEL)
 */
function generateA4PDF(
  os: OrdemServico,
  empresa: EmpresaConfig,
  viaType: 'cliente' | 'oficina' | 'unica'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 16;

  // 1. CABEÇALHO DA EMPRESA
  let logoOffset = 0;
  if (empresa.logoUrl && empresa.logoUrl.startsWith('data:image')) {
    try {
      // Determine format from data url
      let imgType = 'PNG';
      if (empresa.logoUrl.includes('image/jpeg') || empresa.logoUrl.includes('image/jpg')) {
        imgType = 'JPEG';
      }
      doc.addImage(empresa.logoUrl, imgType, margin, currentY - 2, 28, 16);
      logoOffset = 32;
    } catch (e) {
      console.warn('Erro ao inserir logo no PDF:', e);
      logoOffset = 0;
    }
  }

  // Nome e dados da empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text(empresa.nome.toUpperCase(), margin + logoOffset, currentY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);

  if (empresa.subtitulo) {
    doc.text(empresa.subtitulo, margin + logoOffset, currentY + 7);
  }

  const cnpjLine = `CNPJ/CPF: ${empresa.cnpj}${empresa.inscricaoEstadual ? ` • IE: ${empresa.inscricaoEstadual}` : ''}`;
  doc.text(cnpjLine, margin + logoOffset, currentY + 11);

  const contactLine = `${empresa.endereco} - ${empresa.cidadeUf} • Tel: ${empresa.telefone}`;
  doc.text(contactLine, margin + logoOffset, currentY + 15);

  if (empresa.email) {
    doc.text(`E-mail: ${empresa.email}`, margin + logoOffset, currentY + 19);
  }

  // Lado direito: Dados da OS
  const viaLabel = viaType === 'cliente' ? 'VIA DO CLIENTE' : viaType === 'oficina' ? 'VIA DA OFICINA' : 'ORDEM DE SERVIÇO';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(viaLabel, pageWidth - margin, currentY, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(os.numeroOS, pageWidth - margin, currentY + 7, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(`Entrada: ${formatDate(os.dataAbertura)}`, pageWidth - margin, currentY + 12, { align: 'right' });

  // Badge Status
  const statusStr = os.status.replace('_', ' ').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setDrawColor(0, 0, 0);
  doc.rect(pageWidth - margin - 35, currentY + 14, 35, 6);
  doc.text(statusStr, pageWidth - margin - 17.5, currentY + 18.2, { align: 'center' });

  currentY += 25;

  // Linha divisória horizontal
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 5;

  // 2. DUAS COLUNAS: CLIENTE E APARELHO
  const colWidth = (contentWidth - 6) / 2;
  const col2X = margin + colWidth + 6;

  // Coluna 1: Cliente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('1. DADOS DO CLIENTE', margin, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);
  doc.text(os.cliente?.nome || 'Cliente não informado', margin, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  doc.text(`CPF/CNPJ: ${os.cliente?.cpfCnpj || '-'}`, margin, currentY + 8.5);
  doc.text(`Telefone: ${os.cliente?.telefone || '-'}`, margin, currentY + 12.5);
  doc.text(`E-mail: ${os.cliente?.email || '-'}`, margin, currentY + 16.5);
  if (os.cliente?.logradouro) {
    const endStr = `${os.cliente.logradouro}, ${os.cliente.numero || 'S/N'} - ${os.cliente.bairro || ''}, ${os.cliente.cidade || ''}/${os.cliente.uf || ''}`;
    doc.text(doc.splitTextToSize(endStr, colWidth), margin, currentY + 20.5);
  }

  // Coluna 2: Aparelho
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('2. EQUIPAMENTO & ATENDIMENTO', col2X, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);
  const equipStr = `${os.equipamento.tipo} ${os.equipamento.marca} ${os.equipamento.modelo}`.trim();
  doc.text(equipStr || 'Equipamento', col2X, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  doc.text(`Nº de Série / IMEI: ${os.equipamento.numeroSerie || 'Não informado'}`, col2X, currentY + 8.5);
  doc.text(`Técnico Responsável: ${os.tecnico?.nome || 'Oficina Geral'}`, col2X, currentY + 12.5);
  doc.text(`Previsão de Entrega: ${os.dataPrevisao ? formatDate(os.dataPrevisao) : 'A definir'}`, col2X, currentY + 16.5);
  doc.text(`Acessórios: ${os.equipamento.acessorios || 'Nenhum acessório deixado'}`, col2X, currentY + 20.5);

  currentY += 28;

  // Linha divisória
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // 3. DEFEITO RELATADO & DIAGNÓSTICO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('3. DEFEITO RELATADO PELO CLIENTE', margin, currentY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  const defeitoLines = doc.splitTextToSize(`"${os.defeitoRelatado}"`, contentWidth);
  doc.text(defeitoLines, margin, currentY + 4);

  currentY += 5 + (defeitoLines.length * 3.5);

  if (os.diagnosticoTecnico || os.solucaoAplicada) {
    if (os.diagnosticoTecnico) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text('DIAGNÓSTICO TÉCNICO:', margin, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const diagLines = doc.splitTextToSize(os.diagnosticoTecnico, contentWidth);
      doc.text(diagLines, margin, currentY + 3.5);
      currentY += 4 + (diagLines.length * 3.5);
    }

    if (os.solucaoAplicada) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text('SOLUÇÃO APLICADA:', margin, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const solLines = doc.splitTextToSize(os.solucaoAplicada, contentWidth);
      doc.text(solLines, margin, currentY + 3.5);
      currentY += 4 + (solLines.length * 3.5);
    }
  }

  // Linha divisória
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // 4. TABELA DE ITENS / SERVIÇOS (AUTOTABLE)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('4. DISCRIMINAÇÃO DE SERVIÇOS E PEÇAS', margin, currentY);
  currentY += 2;

  const tableBody = os.itens.map(item => [
    item.descricao,
    item.tipo === 'SERVICO' ? 'SERVIÇO' : 'PEÇA',
    item.quantidade.toString(),
    formatCurrency(item.valorUnitario),
    formatCurrency(item.subtotal)
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Descrição do Item', 'Tipo', 'Qtd', 'Unitário', 'Subtotal']],
    body: tableBody,
    theme: 'plain',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    }
  });

  // Position after table
  // @ts-ignore
  currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 4 : currentY + 30;

  // TOTAIS À DIREITA
  const totalBoxX = pageWidth - margin - 65;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);

  doc.text('Subtotal Serviços:', totalBoxX, currentY);
  doc.text(formatCurrency(os.valorServicos), pageWidth - margin, currentY, { align: 'right' });
  currentY += 4;

  doc.text('Subtotal Peças:', totalBoxX, currentY);
  doc.text(formatCurrency(os.valorPecas), pageWidth - margin, currentY, { align: 'right' });
  currentY += 4;

  if (os.desconto > 0) {
    doc.text('Desconto:', totalBoxX, currentY);
    doc.text(`- ${formatCurrency(os.desconto)}`, pageWidth - margin, currentY, { align: 'right' });
    currentY += 4;
  }

  // Linha total
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(totalBoxX, currentY, pageWidth - margin, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL:', totalBoxX, currentY);
  doc.text(formatCurrency(os.valorTotal), pageWidth - margin, currentY, { align: 'right' });
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Pagamento: ${os.formaPagamento || 'A combinar'} (${os.statusPagamento})`, totalBoxX, currentY);
  if (empresa.chavePix) {
    currentY += 3.5;
    doc.text(`Chave PIX: ${empresa.chavePix}`, totalBoxX, currentY);
  }

  currentY += 8;

  // 5. TERMO DE GARANTIA
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('TERMO DE GARANTIA & CONDIÇÕES:', margin, currentY);
  currentY += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 90);
  const garantiaText = os.termoGarantia ||
    'Garantia legal de 90 dias conforme Art. 26 do Código de Defesa do Consumidor, válida exclusivamente para os serviços executados e peças aplicadas discriminadas nesta ordem. Não cobrimos danos causados por quedas, umidade, curto-circuito, mau uso ou intervenção de terceiros. Aparelhos não retirados em até 90 dias após a conclusão estarão sujeitos a cobrança de taxa de guarda ou descarte conforme legislação.';
  
  const garantiaLines = doc.splitTextToSize(garantiaText, contentWidth);
  doc.text(garantiaLines, margin, currentY);
  currentY += (garantiaLines.length * 3) + 12;

  // 6. ASSINATURAS
  if (currentY > 265) {
    doc.addPage();
    currentY = 30;
  }

  const sigWidth = 75;
  const sigCol2X = pageWidth - margin - sigWidth;

  // Assinatura Cliente
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, margin + sigWidth, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(os.cliente?.nome || 'Assinatura do Cliente', margin + (sigWidth / 2), currentY + 3.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Retirei o equipamento testado e em perfeitas condições', margin + (sigWidth / 2), currentY + 6.5, { align: 'center' });

  // Assinatura Técnico / Empresa
  doc.line(sigCol2X, currentY, sigCol2X + sigWidth, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(os.tecnico?.nome || empresa.nome, sigCol2X + (sigWidth / 2), currentY + 3.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Responsável Técnico / Assistência Técnica', sigCol2X + (sigWidth / 2), currentY + 6.5, { align: 'center' });

  // Download real do PDF
  doc.save(`OrdemServico_${os.numeroOS}.pdf`);
}

/**
 * GERAÇÃO DIRETA DE CUPOM 80MM (BOBINA TÉRMICA)
 */
function generate80mmPDF(os: OrdemServico, empresa: EmpresaConfig) {
  // Height dynamic
  const receiptHeight = 180 + (os.itens.length * 6);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, Math.max(160, receiptHeight)]
  });

  const margin = 5;
  const width = 70;
  let currentY = 8;

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(empresa.nome.toUpperCase(), 40, currentY, { align: 'center' });
  currentY += 4;

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.text(`CNPJ: ${empresa.cnpj}`, 40, currentY, { align: 'center' });
  currentY += 3.5;
  doc.text(`Tel: ${empresa.telefone}`, 40, currentY, { align: 'center' });
  currentY += 3.5;
  doc.text(`${empresa.endereco}`, 40, currentY, { align: 'center' });
  currentY += 4;

  doc.setLineWidth(0.2);
  doc.line(margin, currentY, 75, currentY);
  currentY += 4;

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text('COMPROVANTE NAO FISCAL', 40, currentY, { align: 'center' });
  currentY += 4;
  doc.setFontSize(12);
  doc.text(os.numeroOS, 40, currentY, { align: 'center' });
  currentY += 4;
  doc.setFontSize(7.5);
  doc.setFont('courier', 'normal');
  doc.text(`DATA: ${formatDate(os.dataAbertura)}`, 40, currentY, { align: 'center' });
  currentY += 3.5;
  doc.text(`STATUS: ${os.status.replace('_', ' ').toUpperCase()}`, 40, currentY, { align: 'center' });
  currentY += 4;

  doc.line(margin, currentY, 75, currentY);
  currentY += 4;

  // Cliente e Aparelho
  doc.text(`CLIENTE: ${os.cliente?.nome || '-'}`, margin, currentY);
  currentY += 3.5;
  doc.text(`CONTATO: ${os.cliente?.telefone || '-'}`, margin, currentY);
  currentY += 3.5;
  const equip = `${os.equipamento.tipo} ${os.equipamento.marca} ${os.equipamento.modelo}`.trim();
  doc.text(`APARELHO: ${equip}`, margin, currentY);
  currentY += 3.5;
  doc.text(`SERIAL: ${os.equipamento.numeroSerie || 'N/A'}`, margin, currentY);
  currentY += 4;

  doc.line(margin, currentY, 75, currentY);
  currentY += 4;

  // Itens
  doc.setFont('courier', 'bold');
  doc.text('ITENS / SERVICOS:', margin, currentY);
  currentY += 3.5;

  doc.setFont('courier', 'normal');
  os.itens.forEach(item => {
    const desc = item.descricao.length > 22 ? item.descricao.substring(0, 22) + '..' : item.descricao;
    doc.text(`${item.quantidade}x ${desc}`, margin, currentY);
    doc.text(formatCurrency(item.subtotal), 75, currentY, { align: 'right' });
    currentY += 3.5;
  });

  doc.line(margin, currentY, 75, currentY);
  currentY += 4;

  // Totais
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL A PAGAR:', margin, currentY);
  doc.text(formatCurrency(os.valorTotal), 75, currentY, { align: 'right' });
  currentY += 4;

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.text(`PAGTO: ${os.formaPagamento || 'A combinar'} (${os.statusPagamento})`, margin, currentY);
  if (empresa.chavePix) {
    currentY += 3.5;
    doc.text(`PIX: ${empresa.chavePix}`, margin, currentY);
  }
  currentY += 4;

  doc.line(margin, currentY, 75, currentY);
  currentY += 4;

  // Garantia e Assinatura
  doc.setFontSize(6.5);
  const gar = 'GARANTIA: 90 dias conforme CDC art. 26 para servicos discriminados. Aparelhos nao retirados em 90 dias serao destinados a guarda.';
  const garLines = doc.splitTextToSize(gar, width);
  doc.text(garLines, margin, currentY);
  currentY += (garLines.length * 2.8) + 8;

  doc.line(15, currentY, 65, currentY);
  currentY += 3;
  doc.text('Assinatura do Cliente', 40, currentY, { align: 'center' });
  currentY += 5;
  doc.text('*** Obrigado pela preferencia! ***', 40, currentY, { align: 'center' });

  doc.save(`Cupom_${os.numeroOS}.pdf`);
}
