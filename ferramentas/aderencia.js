/**
 * aderencia.js — Compara o CV deste repositório com as vagas do mercado já
 * coletadas, pra responder duas perguntas: "quais vagas batem melhor com o
 * que eu já tenho?" e, principalmente, "o que o mercado está pedindo que
 * ainda não está no meu CV?".
 *
 * VERSÃO AUTOCONTIDA. O original vive no `vagas-automation-suite` e depende
 * de Prisma, do banco `coleta.db` e — por tabela — da cadeia de provedores de
 * IA. Aqui nada disso é necessário: as vagas vêm de um snapshot JSON commitado
 * em `dados/vagas-coletadas.json` e os únicos módulos usados são regex e
 * vocabulário puro. Clonou, roda:
 *
 *     node ferramentas/aderencia.js
 *
 * Sem `npm install`, sem banco, sem chave de API, sem rede. Requer apenas
 * Node.js 18 ou superior.
 *
 * O relatório é impresso e salvo em `aderencia/AAAA-MM-DD-aderencia-cv.md`.
 */

const fs = require('fs');
const path = require('path');
const {
  termosNoTexto, avaliarVaga, montarRankingTermos,
  calcularAderenciaMedia, montarRelatorioMarkdown,
} = require('./lib/aderencia');

const RAIZ = path.join(__dirname, '..');
const CAMINHO_CV = path.join(RAIZ, 'cv', 'cv.txt');
const CAMINHO_VAGAS = path.join(RAIZ, 'dados', 'vagas-coletadas.json');
const DIR_SAIDA = path.join(RAIZ, 'aderencia');

const CATEGORIAS_RELEVANTES = [
  'Desenvolvedor', 'DevOps', 'Suporte Técnico', 'Segurança da Informação',
  'Analista de Sistemas', 'Engenheiro de Software', 'QA', 'Analista de Dados',
];

/** Lê um arquivo obrigatório e aborta com mensagem útil se faltar. */
function lerObrigatorio(caminho, oQueE) {
  try {
    return fs.readFileSync(caminho, 'utf8');
  } catch {
    console.error(`[Aderência] ${oQueE} não encontrado em ${path.relative(RAIZ, caminho)} — abortando.`);
    process.exit(1);
  }
}

function main() {
  const cvText = lerObrigatorio(CAMINHO_CV, 'CV');
  const cvTermos = termosNoTexto(cvText);

  let vagas;
  try {
    vagas = JSON.parse(lerObrigatorio(CAMINHO_VAGAS, 'Snapshot de vagas'));
  } catch (err) {
    console.error(`[Aderência] Snapshot de vagas ilegível (${err.message}) — abortando.`);
    process.exit(1);
  }

  // Mesmo recorte do original: só categorias do perfil e só vagas que trazem
  // requisitos de verdade (sem isso a média de aderência fica sem sentido).
  const relevantes = vagas.filter(v =>
    CATEGORIAS_RELEVANTES.includes(v.categoria) && v.requisitos
  );

  console.log(`[Aderência] ${relevantes.length} vaga(s) com requisitos reais nas categorias do perfil (de ${vagas.length} coletadas).\n`);
  if (relevantes.length === 0) {
    console.error('[Aderência] Nada a avaliar. Atualize o snapshot (ver README).');
    process.exit(1);
  }

  const avaliacoes = relevantes.map(vaga => avaliarVaga(vaga, cvTermos));
  const rankingTermos = montarRankingTermos(avaliacoes, cvTermos);
  const aderenciaMedia = calcularAderenciaMedia(avaliacoes);

  console.log(`Termos do vocabulário encontrados no CV: ${cvTermos.length}`);
  console.log(`Aderência média: ${aderenciaMedia !== null ? aderenciaMedia + '%' : 'não calculável (nenhum termo reconhecido nas vagas)'}\n`);
  console.log('Top termos pedidos pelo mercado que NÃO estão no seu CV:');
  const lacunas = rankingTermos.filter(t => !t.noCv).slice(0, 10);
  if (lacunas.length === 0) console.log('  (nenhuma lacuna — o CV cobre todos os termos pedidos)');
  else lacunas.forEach(t => console.log(`  - ${t.termo} (${t.vagas} vaga(s))`));

  const dataHoje = new Date().toISOString().slice(0, 10);
  if (!fs.existsSync(DIR_SAIDA)) fs.mkdirSync(DIR_SAIDA, { recursive: true });
  const arquivoSaida = path.join(DIR_SAIDA, `${dataHoje}-aderencia-cv.md`);
  fs.writeFileSync(arquivoSaida, montarRelatorioMarkdown(avaliacoes, rankingTermos, dataHoje));
  console.log(`\n[Aderência] Relatório completo salvo em ${path.relative(RAIZ, arquivoSaida)}`);
}

main();
