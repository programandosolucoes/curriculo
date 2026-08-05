const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { validarProjetos, projetosDaArea } = require('./portfolio');

const mestre = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'cv', 'mestre.json'), 'utf8'),
);

test('o mestre tem os 26 projetos do portfólio', () => {
  assert.strictEqual(mestre.projetos.length, 26);
});

test('a auditoria de AMD é projeto próprio, com repositório', () => {
  const auditor = mestre.projetos.find(p => p.id === 'auditor-amd');
  assert.ok(auditor, 'o auditor de AMD sumiu do mestre');
  assert.strictEqual(auditor.repo, 'nextqualify-auditor.git');
  // o motor é portado do projeto irmão; os dois precisam continuar existindo
  assert.ok(mestre.projetos.find(p => p.id === 'analise-audio'));
});

test('todos os projetos do mestre passam na validação', () => {
  assert.doesNotThrow(() => validarProjetos(mestre.projetos));
});

test('os dois índices têm projetos', () => {
  assert.ok(projetosDaArea(mestre.projetos, 'frontend').length > 0);
  assert.ok(projetosDaArea(mestre.projetos, 'backend').length > 0);
});

test('EvoluAI não expõe repositório (código do cliente)', () => {
  assert.strictEqual(mestre.projetos.find(p => p.id === 'evoluai').repo, null);
});

test('pfSense não expõe repositório privado (fork público de terceiros)', () => {
  assert.strictEqual(mestre.projetos.find(p => p.id === 'pfsense-api').repo, null);
});

test('os bullets dos 7 projetos originais continuam intactos', () => {
  for (const id of ['discador', 'omnichannel', 'pedagio', 'analise-audio', 'sipproxy', 'rpa', 'painel-git']) {
    const projeto = mestre.projetos.find(p => p.id === id);
    assert.ok(projeto, `projeto ${id} sumiu do mestre`);
    assert.ok(Array.isArray(projeto.bullets?.base) && projeto.bullets.base.length > 0,
      `projeto ${id} perdeu os bullets que os CVs consomem`);
  }
});
