#!/usr/bin/env node
/**
 * simular-ats.js — Simula a triagem automatizada de um currículo, vaga a vaga.
 *
 * Diferente de `aderencia.js`, que responde "quanto do mercado meu currículo
 * cobre", aqui a pergunta é: **quais vagas me chamariam, e por que as outras
 * não?**
 *
 * O que faz, na ordem em que um ATS faz:
 *   1. tenta EXTRAIR do currículo o que o sistema extrairia — contato, seções,
 *      empregos, datas, tempo de carreira — e relata o que não conseguiu;
 *   2. TRIA cada vaga do banco, com veredito e motivo;
 *   3. consolida: taxa de aprovação, ranking dos termos que mais bloqueiam, e
 *      a lista das vagas que passariam.
 *
 * AUTOCONTIDO: sem npm install, banco, chave de API ou rede. Node.js 18+.
 *
 *   node ferramentas/simular-ats.js                    # currículo genérico
 *   node ferramentas/simular-ats.js --perfil=dev       # um perfil, contra o alvo dele
 *   node ferramentas/simular-ats.js --perfil=dev --todas    # contra as 1.129 vagas
 *   node ferramentas/simular-ats.js --perfil=dev --limiar=0.5
 */

const fs = require('node:fs');
const path = require('node:path');
const { termosNoTexto } = require('./lib/aderencia');
const { selecionarVagas } = require('./lib/selecionar-vagas');
const { parsearCv } = require('./lib/parser-cv');
const { triar, consolidar, VEREDITOS, LIMIAR_PADRAO } = require('./lib/triagem');

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
    console.error(`[ATS] ${oQueE} não encontrado em ${path.relative(RAIZ, caminho)} — abortando.`);
    process.exit(1);
  }
}

function argumento(nome) {
  const arg = process.argv.find(a => a.startsWith(`--${nome}=`));
  return arg ? arg.split('=')[1] : null;
}

function resolverAlvo(perfilId, vagas, todas) {
  if (todas) {
    return {
      caminhoCv: perfilId ? path.join(RAIZ, 'cv', perfilId, 'cv.txt') : path.join(RAIZ, 'cv', 'cv.txt'),
      rotulo: perfilId || 'genérico',
      vagas: vagas.filter(v => v.requisitos),
      descricaoAlvo: 'todas as vagas com requisitos',
    };
  }
  if (!perfilId) {
    return {
      caminhoCv: path.join(RAIZ, 'cv', 'cv.txt'),
      rotulo: 'genérico',
      ...selecionarVagas(vagas, { id: 'generico', categorias_alvo: CATEGORIAS_GENERICAS }),
    };
  }
  const receita = JSON.parse(
    lerObrigatorio(path.join(RAIZ, 'perfis', `${perfilId}.json`), `Perfil "${perfilId}"`),
  );
  return {
    caminhoCv: path.join(RAIZ, 'cv', perfilId, 'cv.txt'),
    rotulo: perfilId,
    ...selecionarVagas(vagas, receita),
  };
}

function relatorioMarkdown(alvo, estrutura, resumo, resultados, limiar, dataHoje) {
  const aprovadas = resultados
    .filter(r => r.veredito === VEREDITOS.APROVADO)
    .sort((a, b) => b.cobertura - a.cobertura);

  let md = `# Simulação de triagem por ATS — ${alvo.rotulo} — ${dataHoje}\n\n`;
  md += `Currículo: \`${path.relative(RAIZ, alvo.caminhoCv)}\`\n`;
  md += `Alvo: ${alvo.descricaoAlvo} (${alvo.vagas.length} vagas)\n`;
  md += `Limiar de aprovação: ${Math.round(limiar * 100)}% dos termos exigidos\n\n`;

  md += `> **O que isto simula.** Um ATS trabalha em duas etapas: primeiro tenta\n`;
  md += `> extrair a estrutura do currículo (contato, seções, empregos, datas) e\n`;
  md += `> descarta o que não consegue ler; só então compara palavras-chave com a\n`;
  md += `> vaga. O valor aqui não é o percentual — é o **motivo** de cada recusa.\n\n`;

  md += `## Etapa 1 — o que o sistema conseguiu extrair\n\n`;
  md += `| Campo | Valor |\n|---|---|\n`;
  md += `| Nome | ${estrutura.contato.nome || '**não extraído**'} |\n`;
  md += `| Cargo | ${estrutura.contato.cargo || '**não extraído**'} |\n`;
  md += `| E-mail | ${estrutura.contato.email || '**não extraído**'} |\n`;
  md += `| Telefone | ${estrutura.contato.telefone || '**não extraído**'} |\n`;
  md += `| Empregos reconhecidos | ${estrutura.empregos.length} |\n`;
  md += `| Formação reconhecida | ${estrutura.formacao.length} |\n`;
  md += `| Tempo de carreira | ${estrutura.anosExperiencia !== null ? estrutura.anosExperiencia + ' anos' : 'não calculável'} |\n`;
  md += `| Seções reconhecidas | ${estrutura.secoes.length} |\n\n`;

  if (estrutura.problemas.length === 0) {
    md += `Nenhum problema de extração. O currículo passa da etapa de estrutura.\n\n`;
  } else {
    md += `**Problemas de extração — estes derrubam o currículo antes de qualquer comparação:**\n\n`;
    estrutura.problemas.forEach(p => { md += `- ${p}\n`; });
    md += `\n`;
  }

  md += `> O tempo de carreira é contado pela **união** dos períodos, não pela\n`;
  md += `> soma: contratos em paralelo não viram o dobro de experiência.\n\n`;

  md += `## Etapa 2 — resultado da triagem\n\n`;
  md += `| Resultado | Vagas |\n|---|---|\n`;
  md += `| Aprovado | ${resumo.aprovado} |\n`;
  md += `| Reprovado por palavra-chave | ${resumo.reprovado_palavras} |\n`;
  md += `| Reprovado por estrutura | ${resumo.reprovado_estrutura} |\n`;
  md += `| Indeterminado (vaga com poucos termos) | ${resumo.indeterminado} |\n\n`;
  md += resumo.taxaAprovacao !== null
    ? `**Taxa de aprovação: ${resumo.taxaAprovacao}%** (${resumo.aprovado} de ${resumo.avaliadas} vagas avaliadas).\n\n`
    : `**Nenhuma vaga pôde ser avaliada** — não é reprovação, é falta de dado.\n\n`;
  md += `As indeterminadas ficam fora do denominador: contá-las inventaria\n`;
  md += `reprovação que não houve.\n\n`;

  md += `## O que mais bloqueia\n\n`;
  md += `Termos exigidos pelas vagas que reprovaram, ordenados por quantas\n`;
  md += `destravariam. É a lista acionável deste relatório.\n\n`;
  md += `| Termo | Vagas que destrava |\n|---|---|\n`;
  resumo.bloqueadores.slice(0, 20).forEach(b => { md += `| ${b.termo} | ${b.vagas} |\n`; });
  if (resumo.bloqueadores.length === 0) md += `| (nenhum) | — |\n`;
  md += `\n`;

  md += `## Vagas que passariam (${aprovadas.length})\n\n`;
  if (aprovadas.length === 0) md += `Nenhuma.\n`;
  aprovadas.slice(0, 40).forEach(r => {
    md += `### ${r.vaga.titulo} — ${Math.round(r.cobertura * 100)}%\n`;
    md += `- Categoria: ${r.vaga.categoria} | Empresa: ${r.vaga.empresa || 'não informada'}\n`;
    md += `- Link: ${r.vaga.link}\n`;
    md += `- Cobre: ${r.cobertos.join(', ')}\n`;
    if (r.faltantes.length) md += `- Ainda falta: ${r.faltantes.join(', ')}\n`;
    md += `\n`;
  });
  if (aprovadas.length > 40) md += `_(${aprovadas.length - 40} outras omitidas)_\n`;

  return md;
}

function main() {
  const perfilId = argumento('perfil');
  const todas = process.argv.includes('--todas');
  const limiar = argumento('limiar') ? Number(argumento('limiar')) : LIMIAR_PADRAO;
  if (Number.isNaN(limiar) || limiar <= 0 || limiar > 1) {
    console.error('[ATS] --limiar precisa ser um número entre 0 e 1 (ex: --limiar=0.5).');
    process.exit(1);
  }

  const vagas = JSON.parse(lerObrigatorio(CAMINHO_VAGAS, 'Snapshot de vagas'));
  const alvo = resolverAlvo(perfilId, vagas, todas);
  const cvText = lerObrigatorio(alvo.caminhoCv, `CV do perfil "${alvo.rotulo}"`);

  // Mesma regra da aderência: alvo vazio não é 0%, é falta de dado.
  if (alvo.vagas.length === 0) {
    console.error(`[ATS] Perfil "${alvo.rotulo}": nenhuma vaga no alvo (${alvo.descricaoAlvo}).`);
    console.error('[ATS] Isso NÃO significa reprovação — significa que o alvo não foi coletado.');
    console.error('[ATS] Use --todas para triar contra o banco inteiro.');
    process.exit(2);
  }

  const estrutura = parsearCv(cvText);
  const cvTermos = termosNoTexto(cvText);

  console.log(`\n=== ETAPA 1: o que o ATS conseguiu extrair de "${alvo.rotulo}" ===\n`);
  console.log(`  Nome ................ ${estrutura.contato.nome || 'NÃO EXTRAÍDO'}`);
  console.log(`  Cargo ............... ${estrutura.contato.cargo || 'NÃO EXTRAÍDO'}`);
  console.log(`  E-mail .............. ${estrutura.contato.email || 'NÃO EXTRAÍDO'}`);
  console.log(`  Telefone ............ ${estrutura.contato.telefone || 'NÃO EXTRAÍDO'}`);
  console.log(`  Empregos ............ ${estrutura.empregos.length}`);
  console.log(`  Formação ............ ${estrutura.formacao.length}`);
  console.log(`  Tempo de carreira ... ${estrutura.anosExperiencia !== null ? estrutura.anosExperiencia + ' anos' : 'não calculável'}`);
  if (estrutura.problemas.length) {
    console.log('\n  PROBLEMAS DE EXTRAÇÃO (derrubam antes de comparar com a vaga):');
    estrutura.problemas.forEach(p => console.log(`    - ${p}`));
  } else {
    console.log('\n  Sem problemas de extração.');
  }

  const resultados = alvo.vagas.map(vaga => ({
    vaga,
    ...triar(estrutura, cvTermos, vaga, termosNoTexto, { limiar }),
  }));
  const resumo = consolidar(resultados);

  console.log(`\n=== ETAPA 2: triagem contra ${alvo.vagas.length} vaga(s) — ${alvo.descricaoAlvo} ===\n`);
  console.log(`  Aprovado ......................... ${resumo.aprovado}`);
  console.log(`  Reprovado por palavra-chave ...... ${resumo.reprovado_palavras}`);
  console.log(`  Reprovado por estrutura .......... ${resumo.reprovado_estrutura}`);
  console.log(`  Indeterminado (poucos termos) .... ${resumo.indeterminado}`);
  console.log(
    resumo.taxaAprovacao !== null
      ? `\n  TAXA DE APROVAÇÃO: ${resumo.taxaAprovacao}% (${resumo.aprovado} de ${resumo.avaliadas} avaliadas)`
      : '\n  Nenhuma vaga pôde ser avaliada — falta de dado, não reprovação.',
  );

  if (resumo.bloqueadores.length) {
    console.log('\n  O QUE MAIS BLOQUEIA (termo → vagas que destravaria):');
    resumo.bloqueadores.slice(0, 10).forEach(b => console.log(`    ${b.termo.padEnd(26)} ${b.vagas}`));
  }

  const dataHoje = new Date().toISOString().slice(0, 10);
  fs.mkdirSync(DIR_SAIDA, { recursive: true });
  const nome = `${dataHoje}-ats-${alvo.rotulo}${todas ? '-todas' : ''}.md`;
  const saida = path.join(DIR_SAIDA, nome);
  fs.writeFileSync(saida, relatorioMarkdown(alvo, estrutura, resumo, resultados, limiar, dataHoje));
  console.log(`\n[ATS] Relatório completo em ${path.relative(RAIZ, saida)}\n`);
}

main();
