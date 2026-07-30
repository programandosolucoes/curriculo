const { test } = require('node:test');
const assert = require('node:assert');
const { selecionarVagas } = require('./selecionar-vagas');

const VAGAS = [
  { titulo: 'Dev Node', categoria: 'Desenvolvedor', requisitos: 'Node.js e React' },
  { titulo: 'SRE', categoria: 'DevOps', requisitos: 'Kubernetes' },
  { titulo: 'Analista RPA', categoria: 'Analista de Sistemas', requisitos: 'Automação de processos com UiPath' },
  { titulo: 'Contador', categoria: 'Contabilidade', requisitos: 'Negócios e benefícios' },
  { titulo: 'Sem requisito', categoria: 'Desenvolvedor', requisitos: '' },
];

test('seleciona por categoria quando a receita usa categorias_alvo', () => {
  const { vagas } = selecionarVagas(VAGAS, { id: 'dev', categorias_alvo: ['Desenvolvedor'] });
  assert.equal(vagas.length, 1);
  assert.equal(vagas[0].titulo, 'Dev Node');
});

test('descarta vaga sem requisitos, que não dá para medir', () => {
  const { vagas } = selecionarVagas(VAGAS, { id: 'dev', categorias_alvo: ['Desenvolvedor'] });
  assert.ok(!vagas.some(v => v.titulo === 'Sem requisito'));
});

test('seleciona por termo quando a receita usa filtro_termos', () => {
  const { vagas } = selecionarVagas(VAGAS, { id: 'rpa', filtro_termos: ['uipath', 'rpa'] });
  assert.equal(vagas.length, 1);
  assert.equal(vagas[0].titulo, 'Analista RPA');
});

test('o filtro por termo usa fronteira de palavra, nunca substring', () => {
  // "ios" por substring casa dentro de "negócios" e "benefícios" — medido na
  // prática, isso inflou um alvo de 6 para 929 vagas.
  const { vagas } = selecionarVagas(VAGAS, { id: 'mobile', filtro_termos: ['ios'] });
  assert.equal(vagas.length, 0, 'casou substring dentro de outra palavra');
});

test('descreve o alvo de forma legível', () => {
  const porCategoria = selecionarVagas(VAGAS, { id: 'dev', categorias_alvo: ['Desenvolvedor', 'QA'] });
  assert.match(porCategoria.descricaoAlvo, /Desenvolvedor, QA/);

  const porTermo = selecionarVagas(VAGAS, { id: 'rpa', filtro_termos: ['uipath'] });
  assert.match(porTermo.descricaoAlvo, /termo/i);
});
