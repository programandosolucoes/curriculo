const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { PADRAO_DATA } = require('./secoes');

const MESTRE = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'cv', 'mestre.json'), 'utf8'),
);
const PERFIS = ['voip', 'ia', 'dev', 'frontend', 'devops', 'dados', 'seguranca', 'qa', 'rpa'];

test('tem um resumo para cada um dos nove perfis', () => {
  for (const perfil of PERFIS) {
    assert.ok(MESTRE.resumos[perfil], `falta o resumo do perfil "${perfil}"`);
  }
});

test('todo item de experiência e projeto tem id único', () => {
  for (const chave of ['experiencia', 'projetos', 'conquistas']) {
    const ids = MESTRE[chave].map(i => i.id);
    assert.equal(new Set(ids).size, ids.length, `ids repetidos em ${chave}`);
    assert.ok(ids.every(Boolean), `item sem id em ${chave}`);
  }
});

test('todo item de experiência e projeto tem bullets.base', () => {
  for (const chave of ['experiencia', 'projetos']) {
    for (const item of MESTRE[chave]) {
      assert.ok(
        item.bullets && item.bullets.base && item.bullets.base.length > 0,
        `"${item.id}" em ${chave} não tem bullets.base`,
      );
    }
  }
});

test('todo período está no formato MM/AAAA', () => {
  for (const chave of ['experiencia', 'projetos']) {
    for (const item of MESTRE[chave]) {
      assert.ok(PADRAO_DATA.test(item.periodo), `"${item.id}": período "${item.periodo}" fora do formato`);
    }
  }
});

test('a experiência profissional cobre todos os empregos do CV atual', () => {
  // Guarda contra perder um emprego na migração para o mestre.
  assert.ok(MESTRE.experiencia.length >= 11, `só ${MESTRE.experiencia.length} empregos migrados`);
});

test('os sete projetos do portfólio estão presentes', () => {
  assert.ok(MESTRE.projetos.length >= 7, `só ${MESTRE.projetos.length} projetos migrados`);
});

test('siglas aparecem junto da forma expandida em algum lugar do conteúdo', () => {
  // Regra de ATS com maior retorno: a vaga pode buscar qualquer das duas formas.
  const tudo = JSON.stringify(MESTRE).toLowerCase();
  const pares = [
    ['inteligência artificial', 'ia'],
    ['robotic process automation', 'rpa'],
    ['answering machine detection', 'amd'],
  ];
  for (const [expandido, sigla] of pares) {
    assert.ok(tudo.includes(expandido), `falta a forma expandida de "${sigla}": "${expandido}"`);
  }
});
