const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { montarCv, validarReceita } = require('./montar-cv');

const RAIZ = path.join(__dirname, '..', '..');
const MESTRE = JSON.parse(fs.readFileSync(path.join(RAIZ, 'cv', 'mestre.json'), 'utf8'));
const IDS = ['voip', 'ia', 'dev', 'frontend', 'devops', 'dados', 'seguranca', 'qa', 'rpa'];

function lerReceita(id) {
  return JSON.parse(fs.readFileSync(path.join(RAIZ, 'perfis', `${id}.json`), 'utf8'));
}

test('as nove receitas existem e são válidas', () => {
  for (const id of IDS) {
    const receita = lerReceita(id);
    assert.equal(receita.id, id, `perfis/${id}.json declara id "${receita.id}"`);
    assert.ok(receita.titulo, `perfis/${id}.json sem título`);
    validarReceita(receita);
  }
});

test('exatamente um perfil é o padrão', () => {
  const padroes = IDS.filter(id => lerReceita(id).padrao === true);
  assert.equal(padroes.length, 1, `perfis marcados como padrão: ${padroes.join(', ') || 'nenhum'}`);
});

test('toda receita monta sem erro contra o mestre', () => {
  for (const id of IDS) {
    assert.doesNotThrow(() => montarCv(MESTRE, lerReceita(id)), `perfil "${id}" não monta`);
  }
});

test('os fatos são idênticos entre todos os perfis', () => {
  // O motivo de existir um mestre: duas versões que se contradizem em datas
  // parecem pior que um currículo genérico.
  const fatosPorPerfil = IDS.map(id => {
    const cv = montarCv(MESTRE, lerReceita(id));
    const exp = cv.secoes.find(s => s.tipo === 'experiencia');
    const mapa = new Map();
    for (const item of (exp ? exp.itens : [])) {
      mapa.set(item.empresa, `${item.cargo}|${item.periodo}|${item.local}`);
    }
    return { id, mapa };
  });

  const referencia = new Map();
  for (const { mapa } of fatosPorPerfil) {
    for (const [empresa, fatos] of mapa) {
      if (!referencia.has(empresa)) referencia.set(empresa, fatos);
    }
  }
  for (const { id, mapa } of fatosPorPerfil) {
    for (const [empresa, fatos] of mapa) {
      assert.equal(fatos, referencia.get(empresa),
        `perfil "${id}" diverge nos fatos de "${empresa}"`);
    }
  }
});

test('todo perfil inclui pelo menos três empregos e um projeto', () => {
  for (const id of IDS) {
    const receita = lerReceita(id);
    assert.ok((receita.incluir_experiencia || []).length >= 3, `perfil "${id}" com poucos empregos`);
    assert.ok((receita.incluir_projetos || []).length >= 1, `perfil "${id}" sem projetos`);
  }
});

test('seção declarada na ordem tem os dados correspondentes na receita', () => {
  // Guarda contra o array de inclusão ser preenchido sem a seção existir na
  // ordem (o conteúdo seria montado e descartado em silêncio) e contra a
  // seção existir sem nada para incluir (sairia vazia no currículo).
  for (const id of IDS) {
    const r = lerReceita(id);
    const temConquistas = (r.incluir_conquistas || []).length > 0;
    const ordemTemConquistas = r.ordem.includes('conquistas');
    assert.equal(temConquistas, ordemTemConquistas,
      `perfil "${id}": incluir_conquistas e a ordem discordam sobre a seção de conquistas`);
  }
});

// ── Receitas em outros idiomas ────────────────────────────────────────────

const { renderTxt } = require('./render-txt');

function receitasMultilingues() {
  return fs.readdirSync(path.join(RAIZ, 'perfis'))
    .filter(f => f.endsWith('.json'))
    .map(f => lerReceita(f.replace(/\.json$/, '')))
    .filter(r => Array.isArray(r.idiomas));
}

function lerTraducao(idioma) {
  return JSON.parse(fs.readFileSync(path.join(RAIZ, 'cv', `mestre.${idioma}.json`), 'utf8'));
}

test('receita com idiomas monta em cada idioma declarado', () => {
  const receitas = receitasMultilingues();
  assert.ok(receitas.length > 0, 'nenhuma receita declara idiomas');
  for (const r of receitas) {
    for (const idioma of r.idiomas) {
      assert.doesNotThrow(
        () => montarCv(MESTRE, r, { idioma, traducao: lerTraducao(idioma) }),
        `perfil "${r.id}" não monta em "${idioma}"`,
      );
    }
  }
});

test('versão traduzida não carrega texto em português', () => {
  // Nomes próprios (empresa, instituição) e contato ficam no original e
  // saem da conta — o ".com" do e-mail não é a preposição.
  const nomesProprios = [
    ...MESTRE.experiencia.map(e => e.empresa),
    ...MESTRE.formacao.map(f => f.instituicao),
    MESTRE.pessoal.email,
    ...MESTRE.pessoal.links,
  ];
  const marcas = /ção|ções|ão\b|\b(atual|não|para|com|uma|dos|das|pelo|pela)\b/i;
  for (const r of receitasMultilingues()) {
    for (const idioma of r.idiomas) {
      let texto = renderTxt(montarCv(MESTRE, r, { idioma, traducao: lerTraducao(idioma) }));
      for (const nome of nomesProprios) texto = texto.split(nome).join('');
      texto = texto.split('São Paulo').join('');
      const linha = texto.split('\n').find(l => marcas.test(l));
      assert.equal(linha, undefined, `perfil "${r.id}" (${idioma}) com português: ${linha}`);
    }
  }
});
