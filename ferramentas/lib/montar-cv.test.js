const { test } = require('node:test');
const assert = require('node:assert');
const { montarCv, resolverBullets, validarReceita } = require('./montar-cv');

const MESTRE = {
  pessoal: { nome: 'Fulano', local: 'São Paulo, SP', telefone: '+55 11 0000-0000',
             email: 'f@exemplo.com', links: ['exemplo.com'] },
  resumos: { dev: 'Resumo de dev.', voip: 'Resumo de voip.' },
  conquistas: [{ id: 'c1', texto: 'Reduzi custo em 30%.' }],
  competencias: {
    back: { titulo: 'Backend', itens: ['Node.js', 'Python'] },
    front: { titulo: 'Frontend', itens: ['React'] },
  },
  experiencia: [
    { id: 'emp1', empresa: 'Empresa Um', cargo: 'Dev Sênior', periodo: '01/2020 - 12/2022',
      local: 'São Paulo', bullets: { base: ['Fiz coisas de telefonia.'], dev: ['Construí APIs.'] } },
    { id: 'emp2', empresa: 'Empresa Dois', cargo: 'Analista', periodo: '01/2023 - atual',
      local: 'Remoto', bullets: { base: ['Operei plataforma.'] } },
  ],
  projetos: [
    { id: 'p1', nome: 'Projeto Um', contexto: 'freelance', periodo: '01/2024 - atual',
      bullets: { base: ['Fiz um projeto.'] } },
  ],
  formacao: [{ curso: 'Bacharelado', instituicao: 'Universidade', periodo: '2016 - 2020' }],
  certificacoes: ['Certificação X'],
  idiomas: ['Português: nativo'],
};

const RECEITA = {
  id: 'dev', titulo: 'Desenvolvedor Backend Sênior', padrao: true,
  ordem: ['resumo', 'competencias', 'experiencia'],
  competencias: ['back'],
  incluir_experiencia: ['emp2', 'emp1'],
  incluir_projetos: ['p1'],
  incluir_conquistas: ['c1'],
  categorias_alvo: ['Desenvolvedor'],
};

test('usa a variante do perfil quando ela existe', () => {
  assert.deepEqual(resolverBullets(MESTRE.experiencia[0], 'dev'), ['Construí APIs.']);
});

test('cai na base quando o perfil não tem variante', () => {
  assert.deepEqual(resolverBullets(MESTRE.experiencia[1], 'dev'), ['Operei plataforma.']);
});

test('item sem variante e sem base aborta apontando item e perfil', () => {
  const quebrado = { id: 'emp3', empresa: 'X', cargo: 'Y', periodo: '01/2020', bullets: { qa: ['só qa'] } };
  assert.throws(() => resolverBullets(quebrado, 'dev'), /emp3[\s\S]*dev/);
});

test('respeita a ordem das seções declarada na receita', () => {
  const cv = montarCv(MESTRE, RECEITA);
  assert.deepEqual(cv.secoes.map(s => s.tipo), ['resumo', 'competencias', 'experiencia']);
});

test('respeita a ordem do array de inclusão, não a ordem do mestre', () => {
  const cv = montarCv(MESTRE, RECEITA);
  const exp = cv.secoes.find(s => s.tipo === 'experiencia');
  assert.deepEqual(exp.itens.map(i => i.empresa), ['Empresa Dois', 'Empresa Um']);
});

test('usa o título canônico da seção, não o nome do tipo', () => {
  const cv = montarCv(MESTRE, RECEITA);
  assert.equal(cv.secoes.find(s => s.tipo === 'experiencia').titulo, 'EXPERIÊNCIA PROFISSIONAL');
});

test('inclui só os grupos de competência pedidos', () => {
  const cv = montarCv(MESTRE, RECEITA);
  const comp = cv.secoes.find(s => s.tipo === 'competencias');
  assert.deepEqual(comp.grupos.map(g => g.titulo), ['Backend']);
});

test('id inexistente na inclusão aborta em vez de sumir em silêncio', () => {
  const receita = { ...RECEITA, incluir_experiencia: ['emp1', 'nao-existe'] };
  assert.throws(() => montarCv(MESTRE, receita), /nao-existe/);
});

test('perfil sem resumo no mestre aborta', () => {
  const receita = { ...RECEITA, id: 'dados' };
  assert.throws(() => montarCv(MESTRE, receita), /dados/);
});

test('receita com categorias_alvo e filtro_termos juntos é rejeitada', () => {
  assert.throws(
    () => validarReceita({ ...RECEITA, filtro_termos: ['rpa'] }),
    /categorias_alvo[\s\S]*filtro_termos/,
  );
});

test('receita sem alvo nenhum é rejeitada', () => {
  const { categorias_alvo, ...semAlvo } = RECEITA;
  assert.throws(() => validarReceita(semAlvo), /alvo/);
});

test('datas fora do formato MM/AAAA são rejeitadas', () => {
  const mestre = structuredClone(MESTRE);
  mestre.experiencia[0].periodo = '2020-2022';
  assert.throws(() => montarCv(mestre, RECEITA), /emp1[\s\S]*2020-2022/);
});
