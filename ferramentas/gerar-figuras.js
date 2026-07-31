/**
 * gerar-figuras.js — gera o HTML das figuras dos projetos sem interface.
 *
 * Lê `portfolio/figuras.json` e escreve um HTML por figura em
 * `portfolio/build/figuras/`. Cada arquivo é depois capturado em PNG pelo
 * Playwright, com o nome declarado em `arquivo`, e vai para `portfolio/img/`.
 *
 * Uso: node ferramentas/gerar-figuras.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { renderFigura } = require('./lib/render-figura');

const RAIZ = path.join(__dirname, '..');
const DIR_FIGURAS = path.join(RAIZ, 'portfolio', 'build', 'figuras');

function main() {
  let figuras;
  try {
    figuras = JSON.parse(fs.readFileSync(path.join(RAIZ, 'portfolio', 'figuras.json'), 'utf8'));
  } catch (err) {
    console.error(`[gerar-figuras] Não consegui ler portfolio/figuras.json: ${err.message}`);
    process.exit(1);
  }

  fs.mkdirSync(DIR_FIGURAS, { recursive: true });

  for (const figura of figuras) {
    const destino = path.join(DIR_FIGURAS, figura.arquivo.replace(/\.png$/, '.html'));
    try {
      fs.writeFileSync(destino, renderFigura(figura));
    } catch (err) {
      console.error(`[gerar-figuras] ${err.message}`);
      process.exit(1);
    }
    console.log(`[gerar-figuras] ${figura.tipo.padEnd(9)} ${figura.arquivo}`);
  }

  console.log(`\n[gerar-figuras] ${figuras.length} figura(s) em portfolio/build/figuras/.`);
  console.log('Capture cada uma em PNG para portfolio/img/ com o mesmo nome do campo "arquivo".');
}

main();
