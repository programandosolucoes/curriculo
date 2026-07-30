/**
 * exportar-snapshot.js — Regera `dados/vagas-coletadas.json` a partir do banco
 * do coletor no `vagas-automation-suite`.
 *
 * O snapshot existe para este repositório rodar sozinho: sem ele seria preciso
 * Prisma e o banco da suite. Roda com a stdlib (`node:sqlite`), sem instalar
 * nada.
 *
 * Uso: node ferramentas/exportar-snapshot.js [caminho/para/coleta.db]
 */

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const RAIZ = path.join(__dirname, '..');
const BANCO_PADRAO = path.join(RAIZ, '..', 'vagas-automation-suite', 'coleta.db');
const SAIDA = path.join(RAIZ, 'dados', 'vagas-coletadas.json');

// Campos consumidos pela ferramenta de aderência e pelo relatório. `link` é
// obrigatório: o relatório imprime o endereço de cada vaga.
const CAMPOS = [
  'link', 'titulo', 'categoria', 'plataforma',
  'empresa', 'senioridade', 'descricaoResumo', 'requisitos',
];

function main() {
  const banco = process.argv[2] || BANCO_PADRAO;
  if (!fs.existsSync(banco)) {
    console.error(`[snapshot] Banco não encontrado em ${banco}`);
    console.error('[snapshot] Passe o caminho como argumento se o repositório da suite estiver em outro lugar.');
    process.exit(1);
  }

  const db = new DatabaseSync(banco, { readOnly: true });
  const vagas = db.prepare(`SELECT ${CAMPOS.join(', ')} FROM Vaga WHERE ativa = 1`).all();
  db.close();

  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, JSON.stringify(vagas, null, 1));

  const categorias = new Set(vagas.map(v => v.categoria));
  console.log(`[snapshot] ${vagas.length} vaga(s) em ${categorias.size} categoria(s) → ${path.relative(RAIZ, SAIDA)}`);
}

main();
