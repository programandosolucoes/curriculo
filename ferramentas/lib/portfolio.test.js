const { test } = require('node:test');
const assert = require('node:assert');
const { validarProjetos, projetosDaArea, AREAS_PRINCIPAIS } = require('./portfolio');

function projetoValido(extra = {}) {
  return {
    id: 'painel-git',
    nome: 'Plataforma Própria de Hospedagem Git',
    periodo: '08/2025 - atual',
    areas: ['backend', 'frontend'],
    resumo: 'Alternativa self-hosted a GitHub, em PHP puro.',
    problema: 'Repositórios privados custavam caro.',
    arquitetura: 'Smart HTTP e WebDAV implementados do zero.',
    resultado: '32 repositórios em produção.',
    stack: ['PHP 8.2', 'WebDAV'],
    duracao: '9-11 meses',
    repo: 'painel-git.git',
    imagens: [{ arquivo: 'painel-git-01-repos.png', legenda: 'Lista de repositórios' }],
    ...extra,
  };
}

test('aceita um projeto completo', () => {
  const projetos = [projetoValido()];
  assert.strictEqual(validarProjetos(projetos), projetos);
});

test('aceita repo nulo (projeto sem repositório publicável)', () => {
  assert.doesNotThrow(() => validarProjetos([projetoValido({ repo: null })]));
});

test('recusa projeto sem area principal', () => {
  assert.throws(
    () => validarProjetos([projetoValido({ areas: ['infra'] })]),
    /painel-git.*frontend.*backend/s,
  );
});

test('recusa area desconhecida', () => {
  assert.throws(
    () => validarProjetos([projetoValido({ areas: ['backend', 'blockchain'] })]),
    /blockchain/,
  );
});

test('recusa campo obrigatorio ausente', () => {
  const semResumo = projetoValido();
  delete semResumo.resumo;
  assert.throws(() => validarProjetos([semResumo]), /resumo/);
});

test('recusa projeto sem imagem', () => {
  assert.throws(() => validarProjetos([projetoValido({ imagens: [] })]), /imagem/);
});

test('recusa id repetido', () => {
  assert.throws(
    () => validarProjetos([projetoValido(), projetoValido()]),
    /repetido/,
  );
});

test('filtra por area preservando a ordem', () => {
  const a = projetoValido({ id: 'a', areas: ['backend'] });
  const b = projetoValido({ id: 'b', areas: ['frontend', 'backend'] });
  const c = projetoValido({ id: 'c', areas: ['frontend'] });
  assert.deepStrictEqual(projetosDaArea([a, b, c], 'backend').map(p => p.id), ['a', 'b']);
  assert.deepStrictEqual(projetosDaArea([a, b, c], 'frontend').map(p => p.id), ['b', 'c']);
});

test('as areas principais sao exatamente frontend e backend', () => {
  assert.deepStrictEqual(AREAS_PRINCIPAIS, ['frontend', 'backend']);
});
