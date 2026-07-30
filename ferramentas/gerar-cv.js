/**
 * gerar-cv.js — Gera os currículos de todos os perfis.
 *
 * Combina `cv/mestre.json` com cada receita em `perfis/*.json` e escreve
 * `cv/<perfil>/cv.txt` e `cv/<perfil>/cv.html`.
 *
 * NENHUM arquivo em `cv/<perfil>/` deve ser editado à mão: são derivados e a
 * próxima execução sobrescreve. Para mudar o currículo, mude o mestre.
 *
 * Uso: node ferramentas/gerar-cv.js [--perfil=dev]
 */

const fs = require('node:fs');
const path = require('node:path');
const { montarCv } = require('./lib/montar-cv');
const { renderTxt } = require('./lib/render-txt');
const { renderHtml } = require('./lib/render-html');

const RAIZ = path.join(__dirname, '..');
const DIR_PERFIS = path.join(RAIZ, 'perfis');
const DIR_CV = path.join(RAIZ, 'cv');

function lerJson(caminho) {
  try {
    return JSON.parse(fs.readFileSync(caminho, 'utf8'));
  } catch (err) {
    console.error(`[gerar-cv] Não consegui ler ${path.relative(RAIZ, caminho)}: ${err.message}`);
    process.exit(1);
  }
}

function argumentoPerfil() {
  const arg = process.argv.find(a => a.startsWith('--perfil='));
  return arg ? arg.split('=')[1] : null;
}

function main() {
  const mestre = lerJson(path.join(DIR_CV, 'mestre.json'));

  const filtro = argumentoPerfil();
  const arquivos = fs.readdirSync(DIR_PERFIS).filter(f => f.endsWith('.json')).sort();
  const receitas = arquivos
    .map(f => lerJson(path.join(DIR_PERFIS, f)))
    .filter(r => !filtro || r.id === filtro);

  if (receitas.length === 0) {
    console.error(`[gerar-cv] Nenhum perfil${filtro ? ` com id "${filtro}"` : ''} encontrado em perfis/.`);
    process.exit(1);
  }

  // Exatamente um perfil vai para os bots de candidatura; dois padrões
  // significaria escolher em silêncio, e zero deixaria os bots com CV velho.
  if (!filtro) {
    const padroes = receitas.filter(r => r.padrao === true).map(r => r.id);
    if (padroes.length !== 1) {
      console.error(`[gerar-cv] Deve haver exatamente um perfil com "padrao": true. Encontrados: ${padroes.join(', ') || 'nenhum'}`);
      process.exit(1);
    }
  }

  let padraoGerado = null;
  for (const receita of receitas) {
    let cv;
    try {
      cv = montarCv(mestre, receita);
    } catch (err) {
      console.error(`[gerar-cv] Perfil "${receita.id}": ${err.message}`);
      process.exit(1);
    }

    const destino = path.join(DIR_CV, receita.id);
    fs.mkdirSync(destino, { recursive: true });
    const txt = renderTxt(cv);
    fs.writeFileSync(path.join(destino, 'cv.txt'), txt);
    fs.writeFileSync(path.join(destino, 'cv.html'), renderHtml(cv));

    const palavras = txt.split(/\s+/).filter(Boolean).length;
    console.log(
      `[gerar-cv] ${receita.id.padEnd(10)} ${String(cv.secoes.length).padStart(2)} seções  ` +
      `${String(palavras).padStart(4)} palavras  →  cv/${receita.id}/`,
    );
    if (receita.padrao) padraoGerado = receita.id;
  }

  console.log(`\n[gerar-cv] ${receitas.length} perfil(is), ${receitas.length * 2} arquivo(s).`);

  if (padraoGerado) {
    console.log(`\nPerfil padrão: ${padraoGerado}. Para sincronizar com os bots de candidatura:`);
    console.log(`  cp cv/${padraoGerado}/cv.txt ../vagas-automation-suite/bots/infojobs/cv.txt`);
    console.log(`  cp cv/${padraoGerado}/cv.txt ../vagas-automation-suite/bots/vagas/cv.txt`);
  }
}

main();
