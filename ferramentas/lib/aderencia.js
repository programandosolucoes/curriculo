/**
 * aderencia.js (core) — Lógica pura de comparação CV × vagas coletadas,
 * usada pelo script raiz `aderencia.js`. Sem Prisma, sem filesystem — só
 * recebe texto e listas de vagas já carregadas, pra ser testável sem rede
 * nem banco (mesmo padrão de core/buscador-compatibilidade.js).
 */

const termosMercado = require('./termos-mercado');
const { termoBateNoTexto } = require('./texto');

function termosNoTexto(texto) {
  const textoLower = (texto || '').toLowerCase();
  return termosMercado.filter(termo => termoBateNoTexto(termo, textoLower));
}

/**
 * @param {object} vaga - precisa de titulo e requisitos
 * @param {string[]} cvTermos - termos de core/termos-mercado.js já achados no CV
 */
function avaliarVaga(vaga, cvTermos) {
  const termosNaVaga = termosNoTexto(`${vaga.titulo} ${vaga.requisitos}`);
  const termosCobertos = termosNaVaga.filter(t => cvTermos.includes(t));
  const termosFaltantes = termosNaVaga.filter(t => !cvTermos.includes(t));
  const aderenciaPercentual = termosNaVaga.length
    ? Math.round((100 * termosCobertos.length) / termosNaVaga.length)
    : null;
  return { vaga, termosNaVaga, termosCobertos, termosFaltantes, aderenciaPercentual };
}

/**
 * @param {Array<{termosNaVaga: string[]}>} avaliacoes
 * @param {string[]} cvTermos
 * @returns {Array<{termo: string, vagas: number, noCv: boolean}>} ordenado
 *   por número de vagas (mais pedido primeiro).
 */
function montarRankingTermos(avaliacoes, cvTermos) {
  const contagemPorTermo = new Map();
  for (const avaliacao of avaliacoes) {
    for (const termo of avaliacao.termosNaVaga) {
      contagemPorTermo.set(termo, (contagemPorTermo.get(termo) || 0) + 1);
    }
  }
  return [...contagemPorTermo.entries()]
    .map(([termo, vagasCount]) => ({ termo, vagas: vagasCount, noCv: cvTermos.includes(termo) }))
    .sort((a, b) => b.vagas - a.vagas);
}

function calcularAderenciaMedia(avaliacoes) {
  const comAderencia = avaliacoes.filter(a => a.aderenciaPercentual !== null);
  if (comAderencia.length === 0) return null;
  return Math.round(comAderencia.reduce((soma, a) => soma + a.aderenciaPercentual, 0) / comAderencia.length);
}

function montarRelatorioMarkdown(avaliacoes, rankingTermos, dataHoje) {
  const aderenciaMedia = calcularAderenciaMedia(avaliacoes);
  const cobertos = rankingTermos.filter(t => t.noCv).slice(0, 20);
  const lacunas = rankingTermos.filter(t => !t.noCv).slice(0, 20);

  let md = `# Aderência do CV às vagas coletadas — ${dataHoje}\n\n`;
  md += `${avaliacoes.length} vaga(s) analisada(s) (categorias do perfil, com requisitos reais coletados).\n`;
  md += aderenciaMedia !== null ? `Aderência média: **${aderenciaMedia}%**.\n\n` : '\n';

  md += `> ⚠️ **Como ler o "% de aderência" por vaga:** é sobreposição de\n`;
  md += `> palavras-chave (core/termos-mercado.js), não um julgamento real da\n`;
  md += `> vaga. Uma vaga que só menciona 1 termo reconhecido (ex: só\n`;
  md += `> "Scrum") pode aparecer com 100% mesmo sendo, na prática, pouco\n`;
  md += `> aderente — o número não pondera quantidade nem relevância dos\n`;
  md += `> termos, só a proporção dos que batem. A seção "Vagas com maior\n`;
  md += `> aderência" é só um recorte de exemplos; o ranking de termos\n`;
  md += `> (cobertos/lacunas) agrega várias vagas e é a parte confiável do\n`;
  md += `> relatório pra decidir o que estudar no CV.\n\n`;

  md += `## Vagas com maior aderência ao seu CV\n\n`;
  avaliacoes
    .filter(a => a.aderenciaPercentual !== null)
    .sort((a, b) => b.aderenciaPercentual - a.aderenciaPercentual)
    .slice(0, 15)
    .forEach(a => {
      md += `### ${a.vaga.titulo} — ${a.aderenciaPercentual}%\n`;
      md += `- Empresa: ${a.vaga.empresa || 'não informada'} | Plataforma: ${a.vaga.plataforma} | Senioridade: ${a.vaga.senioridade || 'não informada'}\n`;
      md += `- Link: ${a.vaga.link}\n`;
      md += `- Termos que batem: ${a.termosCobertos.join(', ') || '(nenhum)'}\n`;
      md += `- Termos que faltam no CV: ${a.termosFaltantes.join(', ') || '(nenhum)'}\n\n`;
    });

  md += `## Termos que o mercado mais pede e que JÁ estão no seu CV (pontos fortes confirmados)\n\n`;
  cobertos.forEach(t => { md += `- **${t.termo}** — pedido em ${t.vagas} vaga(s)\n`; });

  md += `\n## Termos que o mercado mais pede e que NÃO estão no seu CV (candidatos a estudar/incluir)\n\n`;
  if (lacunas.length === 0) md += 'Nenhuma lacuna detectada com o vocabulário atual de core/termos-mercado.js.\n';
  lacunas.forEach(t => { md += `- **${t.termo}** — pedido em ${t.vagas} vaga(s)\n`; });

  return md;
}

module.exports = { termosNoTexto, avaliarVaga, montarRankingTermos, calcularAderenciaMedia, montarRelatorioMarkdown };
