import { GoogleGenAI } from '@google/genai';

export async function gerarDiagnosticoIA(dados: {
  equipamentoTipo: string;
  marca: string;
  modelo: string;
  defeitoRelatado: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `Você é um engenheiro sênior especialista em assistência técnica e manutenção de equipamentos (eletrônica, informática, smartphones, eletrodomésticos e equipamentos industriais).
Analise os seguintes dados de uma nova Ordem de Serviço:
- Tipo de Equipamento: ${dados.equipamentoTipo || 'Equipamento eletrônico'}
- Marca: ${dados.marca || 'Não informada'}
- Modelo: ${dados.modelo || 'Não informado'}
- Defeito Relatado pelo Cliente: "${dados.defeitoRelatado}"

Retorne uma resposta em JSON estrito (sem markdown extra, apenas JSON válido) com as seguintes chaves:
{
  "provaveisCausas": ["Causa 1", "Causa 2", "Causa 3"],
  "testesRecomendados": ["Passo 1 do teste em bancada", "Passo 2 do teste"],
  "possiveisPecas": ["Peça ou componente provável 1", "Peça 2"],
  "laudoSugerido": "Texto técnico formal pronto para ser colado no campo de diagnóstico da OS",
  "tempoEstimadoHoras": 2,
  "complexidade": "Baixa" | "Média" | "Alta" | "Crítica"
}`;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text?.trim() || '{}';
      return JSON.parse(responseText);
    } catch (err: any) {
      console.warn('[AI Service] Falha na chamada da Gemini API, usando fallback analítico:', err?.message || err);
    }
  }

  // Fallback heurístico inteligente
  const lowerDefeito = dados.defeitoRelatado.toLowerCase();
  let complexidade: 'Baixa' | 'Média' | 'Alta' | 'Crítica' = 'Média';
  let tempo = 2;
  const provaveisCausas: string[] = [];
  const testes: string[] = [];
  const pecas: string[] = [];

  if (lowerDefeito.includes('não liga') || lowerDefeito.includes('nao liga') || lowerDefeito.includes('curto')) {
    provaveisCausas.push('Curto-circuito na linha de alimentação primária (mosfets ou diodos)');
    provaveisCausas.push('Falha no circuito integrado regulador de tensão PWM ou fonte interna');
    testes.push('Teste de impedância com multímetro nas bobinas e fusíveis de entrada');
    testes.push('Injeção de tensão controlada com câmera térmica para identificar componentes aquecidos');
    pecas.push('CI Regulador PWM', 'Mosfets de chaveamento SMD', 'Fusistor / Fusível');
    complexidade = 'Alta';
    tempo = 3;
  } else if (lowerDefeito.includes('tela') || lowerDefeito.includes('quebr') || lowerDefeito.includes('display')) {
    provaveisCausas.push('Ruptura física da matriz LCD/OLED por impacto mecânico');
    provaveisCausas.push('Mau contato ou fratura no cabo flex/flat de vídeo');
    testes.push('Inspeção visual com microscópio da fita de dados e conector FPC');
    testes.push('Teste em bancada com display de teste para confirmar integridade da placa lógica');
    pecas.push('Módulo Display Frontal Completo', 'Fita isolante térmica Kapton');
    complexidade = 'Média';
    tempo = 1.5;
  } else if (lowerDefeito.includes('esquent') || lowerDefeito.includes('aquec') || lowerDefeito.includes('barulho') || lowerDefeito.includes('desliga')) {
    provaveisCausas.push('Pasta térmica totalmente desidratada e perda de condutividade térmica');
    provaveisCausas.push('Obstrução severa por poeira nas aletas dissipadoras e microventilador travado');
    testes.push('Monitoramento térmico via software de diagnóstico e termômetro infravermelho');
    testes.push('Teste de rotação e corrente do cooler');
    pecas.push('Pasta Térmica de Alta Condutividade', 'Cooler / Ventoinha de reposição');
    complexidade = 'Baixa';
    tempo = 1;
  } else {
    provaveisCausas.push('Degradação de componentes eletrônicos passivos por desgaste de tempo de uso');
    provaveisCausas.push('Falha no firmware ou corrupção de sistema de arquivos e partição');
    testes.push('Varredura completa de hardware e testes de estresse sob carga');
    pecas.push('Insumos de manutenção e testes');
  }

  return {
    provaveisCausas,
    testesRecomendados: testes,
    possiveisPecas: pecas,
    laudoSugerido: `Análise preliminar em bancada constatou provável anomalia associada a ${provaveisCausas[0] || 'falha no circuito elétrico'}. Recomendada checagem com multímetro e substituição preventiva dos componentes danificados para normalização do funcionamento.`,
    tempoEstimadoHoras: tempo,
    complexidade
  };
}
