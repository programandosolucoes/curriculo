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

test('emprego compacto entra sem bullets, só com a cronologia', () => {
  const receita = { ...RECEITA, incluir_experiencia: ['emp1'], incluir_experiencia_compacta: ['emp2'] };
  const cv = montarCv(MESTRE, receita);
  const exp = cv.secoes.find(s => s.tipo === 'experiencia');
  assert.equal(exp.itens.length, 2);
  assert.equal(exp.itens[0].compacto, false);
  assert.ok(exp.itens[0].bullets.length > 0);
  assert.equal(exp.itens[1].compacto, true);
  assert.deepEqual(exp.itens[1].bullets, []);
  // A cronologia é o motivo de existir: cargo, empresa e período continuam lá.
  assert.equal(exp.itens[1].empresa, 'Empresa Dois');
  assert.equal(exp.itens[1].periodo, '01/2023 - atual');
});

test('o mesmo emprego nas duas listas é rejeitado', () => {
  const receita = { ...RECEITA, incluir_experiencia: ['emp1'], incluir_experiencia_compacta: ['emp1'] };
  assert.throws(() => montarCv(MESTRE, receita), /emp1[\s\S]*duplicado/);
});

// ── Idiomas ───────────────────────────────────────────────────────────────
// A tradução só traz texto. Empresa e período vêm sempre do mestre.

const TRADUCAO_EN = {
  pessoal: { local: 'São Paulo, Brazil' },
  resumos: { dev: 'Dev summary.' },
  conquistas: { c1: 'Cut costs by 30%.' },
  competencias: { back: { titulo: 'Backend', itens: ['Node.js', 'Python'] } },
  experiencia: {
    emp1: { cargo: 'Senior Dev', local: 'São Paulo', bullets: { dev: ['Built APIs.'] } },
    emp2: { cargo: 'Analyst', local: 'Remote', bullets: { base: ['Ran a platform.'] } },
  },
  projetos: { p1: { nome: 'Project One', contexto: 'freelance', bullets: { base: ['Built a project.'] } } },
  formacao: { Bacharelado: 'Bachelor' },
  certificacoes: { 'Certificação X': 'Certification X' },
  idiomas: { 'Português: nativo': 'Portuguese: native' },
};

const RECEITA_EN = {
  ...RECEITA,
  titulo: 'Desenvolvedor Backend Sênior',
  titulos: { en: 'Senior Backend Developer' },
  idiomas: ['en'],
  ordem: ['resumo', 'conquistas', 'competencias', 'experiencia', 'projetos', 'formacao', 'certificacoes', 'idiomas'],
};

function montarEn(traducao = TRADUCAO_EN, receita = RECEITA_EN) {
  return montarCv(MESTRE, receita, { idioma: 'en', traducao });
}

test('em inglês, texto vem da tradução e fatos vêm do mestre', () => {
  const cv = montarEn();
  assert.equal(cv.titulo, 'Senior Backend Developer');
  assert.equal(cv.pessoal.local, 'São Paulo, Brazil');
  assert.equal(cv.pessoal.email, 'f@exemplo.com');
  const exp = cv.secoes.find(s => s.tipo === 'experiencia');
  assert.deepEqual(exp.itens.map(i => [i.cargo, i.empresa]), [['Analyst', 'Empresa Dois'], ['Senior Dev', 'Empresa Um']]);
  assert.deepEqual(exp.itens[1].bullets, ['Built APIs.']);
  const form = cv.secoes.find(s => s.tipo === 'formacao');
  assert.deepEqual(form.itens, [{ curso: 'Bachelor', instituicao: 'Universidade', periodo: '2016 - 2020' }]);
});

test('em inglês, títulos de seção e "atual" saem no idioma', () => {
  const cv = montarEn();
  assert.equal(cv.idioma, 'en');
  assert.equal(cv.secoes.find(s => s.tipo === 'experiencia').titulo, 'PROFESSIONAL EXPERIENCE');
  const exp = cv.secoes.find(s => s.tipo === 'experiencia');
  assert.equal(exp.itens[0].periodo, '01/2023 - Present');
  assert.equal(cv.secoes.find(s => s.tipo === 'projetos').itens[0].periodo, '01/2024 - Present');
});

test('o id de saída leva o idioma, para os arquivos não se sobrescreverem', () => {
  assert.equal(montarEn().perfil, 'dev-en');
  assert.equal(montarCv(MESTRE, RECEITA).perfil, 'dev');
});

test('tradução ausente aborta apontando o trecho', () => {
  const traducao = structuredClone(TRADUCAO_EN);
  delete traducao.experiencia.emp1.bullets.dev;
  assert.throws(() => montarEn(traducao), /experiencia[\s\S]*emp1[\s\S]*dev/);
});

test('item de lista sem tradução aborta em vez de sair em português', () => {
  const traducao = structuredClone(TRADUCAO_EN);
  delete traducao.certificacoes['Certificação X'];
  assert.throws(() => montarEn(traducao), /Certificação X/);
});

test('tradução com número de bullets diferente do mestre aborta', () => {
  // Sinal de que o mestre mudou depois da tradução.
  const traducao = structuredClone(TRADUCAO_EN);
  traducao.experiencia.emp2.bullets.base.push('Extra.');
  assert.throws(() => montarEn(traducao), /emp2[\s\S]*2[\s\S]*1/);
});

test('idioma sem título declarado na receita aborta', () => {
  const { titulos, ...semTitulos } = RECEITA_EN;
  assert.throws(() => montarEn(TRADUCAO_EN, semTitulos), /titulos[\s\S]*en/);
});

test('idioma pedido sem arquivo de tradução aborta', () => {
  assert.throws(() => montarCv(MESTRE, RECEITA_EN, { idioma: 'en' }), /mestre\.en\.json/);
});

test('idioma desconhecido aborta', () => {
  assert.throws(() => montarCv(MESTRE, RECEITA_EN, { idioma: 'xx', traducao: {} }), /xx/);
});
