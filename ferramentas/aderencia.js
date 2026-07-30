/**
 * aderencia.js — Compara um currículo deste repositório com as vagas do
 * mercado já coletadas, e responde duas perguntas: "quais vagas batem melhor
 * com o que eu tenho?" e, principalmente, "o que o mercado pede que ainda não
 * está no meu currículo?".
 *
 * AUTOCONTIDO: as vagas vêm de um snapshot JSON commitado, e os módulos usados
 * são regex e vocabulário puro. Clonou, roda — sem npm install, banco, chave de
 * API ou rede. Requer Node.js 18+.
 *
 *   node ferramentas/aderencia.js                # currículo genérico
 *   node ferramentas/aderencia.js --perfil=dev   # um perfil, contra o alvo dele
 */

const fs = require('node:fs');
const path = require('node:path');
const {
  termosNoTexto, avaliarVaga, montarRankingTermos,
  calcularAderenciaMedia, montarRelatorioMarkdown,
} = require('./lib/aderencia');
const { selecionarVagas } = require('./lib/selecionar-vagas');

const RAIZ = path.join(__dirname, '..');
const CAMINHO_VAGAS = path.join(RAIZ, 'dados', 'vagas-coletadas.json');
const DIR_SAIDA = path.join(RAIZ, 'aderencia');

const CATEGORIAS_GENERICAS = [
  'Desenvolvedor', 'DevOps', 'Suporte Técnico', 'Segurança da Informação',
  'Analista de Sistemas', 'Engenheiro de Software', 'QA', 'Analista de Dados',
];

function lerObrigatorio(caminho, oQueE) {
  try {
    return fs.readFileSync(caminho, 'utf8');
  } catch {
    console.error(`[Aderência] ${oQueE} não encontrado em ${path.relative(RAIZ, caminho)} — abortando.`);
    process.exit(1);
  }
}

function argumentoPerfil() {
  const arg = process.argv.find(a => a.startsWith('--perfil='));
  return arg ? arg.split('=')[1] : null;
}

/** Resolve de onde ler o CV e quais vagas medir, com ou sem perfil. */
function resolverAlvo(perfilId, vagas) {
  if (!perfilId) {
    return {
      caminhoCv: path.join(RAIZ, 'cv', 'cv.txt'),
      rotulo: 'genérico',
      ...selecionarVagas(vagas, { id: 'generico', categorias_alvo: CATEGORIAS_GENERICAS }),
    };
  }
  const caminhoReceita = path.join(RAIZ, 'perfis', `${perfilId}.json`);
  const receita = JSON.parse(lerObrigatorio(caminhoReceita, `Perfil "${perfilId}"`));
  return {
    caminhoCv: path.join(RAIZ, 'cv', perfilId, 'cv.txt'),
    rotulo: perfilId,
    ...selecionarVagas(vagas, receita),
  };
}

function main() {
  const perfilId = argumentoPerfil();
  const vagas = JSON.parse(lerObrigatorio(CAMINHO_VAGAS, 'Snapshot de vagas'));
  const alvo = resolverAlvo(perfilId, vagas);

  const cvText = lerObrigatorio(alvo.caminhoCv, `CV do perfil "${alvo.rotulo}"`);
  const cvTermos = termosNoTexto(cvText);

  // "Nenhuma vaga no alvo" NÃO é 0% de aderência: uma coisa é o currículo não
  // falar a língua do mercado, outra é não haver mercado medido. Imprimir 0%
  // aqui produziria a conclusão oposta à verdadeira.
  if (alvo.vagas.length === 0) {
    console.error(`[Aderência] Perfil "${alvo.rotulo}": nenhuma vaga no alvo (${alvo.descricaoAlvo}).`);
    console.error('[Aderência] Isso NÃO significa aderência zero — significa que o alvo não foi coletado.');
    console.error('[Aderência] Nenhum relatório gravado. Colete vagas dessa área antes de medir.');
    process.exit(2);
  }

  console.log(`[Aderência] Perfil "${alvo.rotulo}" — ${alvo.vagas.length} vaga(s) no alvo (${alvo.descricaoAlvo}).\n`);

  const avaliacoes = alvo.vagas.map(vaga => avaliarVaga(vaga, cvTermos));
  const rankingTermos = montarRankingTermos(avaliacoes, cvTermos);
  const aderenciaMedia = calcularAderenciaMedia(avaliacoes);

  console.log(`Termos do vocabulário encontrados no CV: ${cvTermos.length}`);
  console.log(`Aderência média: ${aderenciaMedia !== null ? aderenciaMedia + '%' : 'não calculável'}\n`);
  console.log('Top termos pedidos pelo mercado que NÃO estão neste CV:');
  const lacunas = rankingTermos.filter(t => !t.noCv).slice(0, 10);
  if (lacunas.length === 0) console.log('  (nenhuma lacuna)');
  else lacunas.forEach(t => console.log(`  - ${t.termo} (${t.vagas} vaga(s))`));

  const dataHoje = new Date().toISOString().slice(0, 10);
  fs.mkdirSync(DIR_SAIDA, { recursive: true });
  const nome = perfilId ? `${dataHoje}-aderencia-${perfilId}.md` : `${dataHoje}-aderencia-cv.md`;
  const arquivoSaida = path.join(DIR_SAIDA, nome);
  fs.writeFileSync(arquivoSaida, montarRelatorioMarkdown(avaliacoes, rankingTermos, dataHoje));
  console.log(`\n[Aderência] Relatório salvo em ${path.relative(RAIZ, arquivoSaida)}`);
}

main();
