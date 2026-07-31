/**
 * gerar-portfolio.js — gera os fragmentos HTML do portfólio.
 *
 * Lê `cv/mestre.json` e `portfolio/config.json` e escreve
 * `portfolio/build/*.html`: dois índices (frontend e backend) e uma página
 * por projeto.
 *
 * NENHUM arquivo em `portfolio/build/` deve ser editado à mão: são derivados
 * e a próxima execução sobrescreve. Para mudar o conteúdo, mude o mestre.
 *
 * Uso: node ferramentas/gerar-portfolio.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { validarProjetos, projetosDaArea } = require('./lib/portfolio');
const { renderIndice, renderProjeto } = require('./lib/render-portfolio');

const RAIZ = path.join(__dirname, '..');
const DIR_PORTFOLIO = path.join(RAIZ, 'portfolio');
const DIR_BUILD = path.join(DIR_PORTFOLIO, 'build');
const DIR_IMG = path.join(DIR_PORTFOLIO, 'img');

function lerJson(caminho) {
  try {
    return JSON.parse(fs.readFileSync(caminho, 'utf8'));
  } catch (err) {
    console.error(`[gerar-portfolio] Não consegui ler ${path.relative(RAIZ, caminho)}: ${err.message}`);
    process.exit(1);
  }
}

function main() {
  const mestre = lerJson(path.join(RAIZ, 'cv', 'mestre.json'));
  const config = lerJson(path.join(DIR_PORTFOLIO, 'config.json'));

  try {
    validarProjetos(mestre.projetos);
  } catch (err) {
    console.error(`[gerar-portfolio] ${err.message}`);
    process.exit(1);
  }

  // Uma imagem declarada e ausente vira card quebrado no ar. Falha aqui.
  const faltando = [];
  for (const projeto of mestre.projetos) {
    for (const img of projeto.imagens) {
      if (!fs.existsSync(path.join(DIR_IMG, img.arquivo))) {
        faltando.push(`${projeto.id}: ${img.arquivo}`);
      }
    }
  }
  if (faltando.length > 0) {
    console.error(`[gerar-portfolio] Imagens declaradas no mestre que não existem em portfolio/img/:\n  ${faltando.join('\n  ')}`);
    process.exit(1);
  }

  fs.mkdirSync(DIR_BUILD, { recursive: true });

  // O publicador precisa do título de cada página, e título não cabe no nome
  // do arquivo (acento, espaço, travessão). Sai daqui, num manifesto.
  const paginas = [];

  for (const indice of config.indices) {
    const projetos = projetosDaArea(mestre.projetos, indice.area);
    const destino = path.join(DIR_BUILD, `${indice.slug}.html`);
    fs.writeFileSync(destino, renderIndice(projetos, indice.area, config));
    paginas.push({ slug: indice.slug, titulo: indice.titulo, arquivo: `${indice.slug}.html` });
    console.log(`[gerar-portfolio] ${indice.slug.padEnd(20)} ${String(projetos.length).padStart(2)} projetos`);
  }

  for (const projeto of mestre.projetos) {
    const slug = `${config.prefixoSlug}${projeto.id}`;
    fs.writeFileSync(path.join(DIR_BUILD, `${slug}.html`), renderProjeto(projeto, mestre.pessoal, config));
    paginas.push({ slug, titulo: projeto.nome, arquivo: `${slug}.html` });
  }

  fs.writeFileSync(path.join(DIR_BUILD, 'paginas.json'), JSON.stringify(paginas, null, 2) + '\n');

  console.log(`\n[gerar-portfolio] ${paginas.length} página(s) em portfolio/build/ (+ paginas.json).`);
}

main();
