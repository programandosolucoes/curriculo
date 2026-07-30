const { test } = require('node:test');
const assert = require('node:assert');
const { renderTxt } = require('./render-txt');

const CV = {
  perfil: 'dev', titulo: 'Desenvolvedor Backend Sênior',
  pessoal: { nome: 'Fulano de Tal', local: 'São Paulo, SP, Brasil',
             telefone: '+55 11 0000-0000', email: 'f@exemplo.com',
             links: ['linkedin.com/in/fulano', 'exemplo.com'] },
  secoes: [
    { tipo: 'resumo', titulo: 'RESUMO PROFISSIONAL', texto: 'Sou uma pessoa.' },
    { tipo: 'competencias', titulo: 'COMPETÊNCIAS',
      grupos: [{ titulo: 'Backend', itens: ['Node.js', 'Python'] }] },
    { tipo: 'experiencia', titulo: 'EXPERIÊNCIA PROFISSIONAL',
      itens: [{ empresa: 'Empresa Um', cargo: 'Dev Sênior', periodo: '01/2020 - 12/2022',
                local: 'São Paulo', bullets: ['Construí APIs.', 'Liderei squad.'] }] },
    { tipo: 'idiomas', titulo: 'IDIOMAS', itens: ['Português: nativo'] },
  ],
};

test('abre com nome e título do perfil', () => {
  const linhas = renderTxt(CV).split('\n');
  assert.equal(linhas[0], 'FULANO DE TAL');
  assert.equal(linhas[1], 'Desenvolvedor Backend Sênior');
});

test('traz os dados de contato no topo', () => {
  const txt = renderTxt(CV);
  assert.match(txt, /\+55 11 0000-0000/);
  assert.match(txt, /f@exemplo\.com/);
  assert.match(txt, /linkedin\.com\/in\/fulano/);
});

test('usa os títulos canônicos de seção', () => {
  const txt = renderTxt(CV);
  for (const titulo of ['RESUMO PROFISSIONAL', 'COMPETÊNCIAS', 'EXPERIÊNCIA PROFISSIONAL', 'IDIOMAS']) {
    assert.ok(txt.includes(titulo), `faltou a seção ${titulo}`);
  }
});

test('cargo, empresa e período ficam na mesma linha identificável', () => {
  const txt = renderTxt(CV);
  assert.match(txt, /Dev Sênior \| Empresa Um \| 01\/2020 - 12\/2022/);
});

test('não usa caractere que atrapalha parser de ATS', () => {
  const txt = renderTxt(CV);
  for (const proibido of ['•', '—', '–', '\t']) {
    assert.ok(!txt.includes(proibido), `texto contém "${proibido}"`);
  }
});

test('termina com quebra de linha', () => {
  assert.ok(renderTxt(CV).endsWith('\n'));
});
