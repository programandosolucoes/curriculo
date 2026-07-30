const { test } = require('node:test');
const assert = require('node:assert');
const { triar, consolidar, VEREDITOS } = require('./triagem');

// Extrator de termos de mentira: devolve os que aparecem no texto, com
// fronteira de palavra. Mantém o teste independente do vocabulário real.
const VOCAB = ['node.js', 'react', 'azure', 'sql', 'docker', 'python', 'aws'];
const extrair = texto => {
  const t = String(texto).toLowerCase();
  return VOCAB.filter(v => new RegExp(`(^|[^\\p{L}\\p{N}])${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}\\p{N}]|$)`, 'u').test(t));
};

const CV_LEGIVEL = { legivel: true, problemas: [] };
const CV_ILEGIVEL = { legivel: false, problemas: ['não encontrou e-mail no cabeçalho'] };

test('reprova por estrutura antes de olhar a vaga', () => {
  const vaga = { titulo: 'Dev', requisitos: 'node.js react sql docker' };
  const r = triar(CV_ILEGIVEL, ['node.js', 'react', 'sql', 'docker'], vaga, extrair);
  assert.equal(r.veredito, VEREDITOS.REPROVADO_ESTRUTURA);
  assert.match(r.motivo, /e-mail/);
  // Não chegou a comparar palavra nenhuma.
  assert.deepEqual(r.exigidos, []);
  assert.equal(r.cobertura, null);
});

test('aprova quando cobre o limiar de termos exigidos', () => {
  const vaga = { titulo: 'Dev', requisitos: 'node.js react sql docker' };
  const r = triar(CV_LEGIVEL, ['node.js', 'react', 'sql', 'docker'], vaga, extrair);
  assert.equal(r.veredito, VEREDITOS.APROVADO);
  assert.equal(r.cobertura, 1);
});

test('reprova por palavra-chave e nomeia o que faltou', () => {
  const vaga = { titulo: 'Dev', requisitos: 'node.js react azure sql docker aws' };
  const r = triar(CV_LEGIVEL, ['node.js', 'react'], vaga, extrair);
  assert.equal(r.veredito, VEREDITOS.REPROVADO_PALAVRAS);
  assert.deepEqual(r.faltantes.sort(), ['aws', 'azure', 'docker', 'sql']);
  assert.match(r.motivo, /azure/);
});

test('vaga com poucos termos vira indeterminado, não reprovação', () => {
  // Uma vaga que só menciona "sql" não sustenta veredito: aprovar ou reprovar
  // por um único termo seria ruído apresentado como resultado.
  const vaga = { titulo: 'Analista', requisitos: 'conhecimento em sql' };
  const r = triar(CV_LEGIVEL, [], vaga, extrair);
  assert.equal(r.veredito, VEREDITOS.INDETERMINADO);
  assert.equal(r.cobertura, null);
});

test('o limiar é configurável', () => {
  const vaga = { titulo: 'Dev', requisitos: 'node.js react azure sql' };
  const cv = ['node.js', 'react'];
  assert.equal(triar(CV_LEGIVEL, cv, vaga, extrair, { limiar: 0.9 }).veredito, VEREDITOS.REPROVADO_PALAVRAS);
  assert.equal(triar(CV_LEGIVEL, cv, vaga, extrair, { limiar: 0.4 }).veredito, VEREDITOS.APROVADO);
});

test('a consolidação ranqueia os termos que mais bloqueiam', () => {
  const vagas = [
    { titulo: 'A', requisitos: 'node.js azure sql docker' },
    { titulo: 'B', requisitos: 'react azure sql python' },
    { titulo: 'C', requisitos: 'node.js react azure aws' },
  ];
  const cv = ['node.js', 'react'];
  const resultados = vagas.map(v => triar(CV_LEGIVEL, cv, v, extrair));
  const c = consolidar(resultados);
  assert.equal(c.bloqueadores[0].termo, 'azure', 'azure derruba as três vagas');
  assert.equal(c.bloqueadores[0].vagas, 3);
});

test('a taxa de aprovação ignora as vagas indeterminadas', () => {
  const resultados = [
    { veredito: VEREDITOS.APROVADO, faltantes: [] },
    { veredito: VEREDITOS.REPROVADO_PALAVRAS, faltantes: ['azure'] },
    { veredito: VEREDITOS.INDETERMINADO, faltantes: [] },
    { veredito: VEREDITOS.INDETERMINADO, faltantes: [] },
  ];
  const c = consolidar(resultados);
  // 1 aprovada de 2 avaliadas = 50%. Contar as indeterminadas daria 25% e
  // inventaria reprovação que não houve.
  assert.equal(c.avaliadas, 2);
  assert.equal(c.taxaAprovacao, 50);
});

test('nenhuma vaga avaliada devolve taxa nula, nunca zero', () => {
  const c = consolidar([{ veredito: VEREDITOS.INDETERMINADO, faltantes: [] }]);
  assert.equal(c.taxaAprovacao, null, '0% diria que o currículo foi reprovado; não foi avaliado');
});
