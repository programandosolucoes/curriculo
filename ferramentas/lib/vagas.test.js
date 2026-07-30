const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const CAMINHO = path.join(__dirname, '..', '..', 'dados', 'vagas-coletadas.json');
const OBRIGATORIOS = ['link', 'titulo', 'categoria', 'plataforma', 'requisitos'];

test('o snapshot traz todos os campos que o relatório usa', () => {
  const vagas = JSON.parse(fs.readFileSync(CAMINHO, 'utf8'));
  assert.ok(vagas.length > 0, 'snapshot vazio');

  // O relatório imprime o link de cada vaga; sem o campo, sai "undefined".
  const comRequisitos = vagas.filter(v => v.requisitos);
  assert.ok(comRequisitos.length > 0, 'nenhuma vaga com requisitos');

  for (const campo of OBRIGATORIOS) {
    const faltando = comRequisitos.filter(v => v[campo] === undefined);
    assert.equal(faltando.length, 0, `${faltando.length} vaga(s) sem o campo "${campo}"`);
  }
});

test('todo link do snapshot é uma URL', () => {
  const vagas = JSON.parse(fs.readFileSync(CAMINHO, 'utf8'));
  const invalidos = vagas.filter(v => !/^https?:\/\//.test(v.link || ''));
  assert.equal(invalidos.length, 0, `${invalidos.length} vaga(s) com link inválido`);
});
