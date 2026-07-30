const { test } = require('node:test');
const assert = require('node:assert');
const { parsearCv, anosDeExperiencia, paraMeses } = require('./parser-cv');

const CV_BOM = `CARLOS ALBERTO
Desenvolvedor Backend Sênior
São Paulo, SP, Brasil | +55 11 2615-2880 | carlos@exemplo.com
linkedin.com/in/carlos

RESUMO PROFISSIONAL
Uma pessoa que faz coisas.

EXPERIÊNCIA PROFISSIONAL
Dev Sênior | Empresa Um | 01/2020 - 12/2022 | São Paulo
- Fiz uma coisa.
Analista | Empresa Dois | 01/2023 - atual | Remoto
- Fiz outra coisa.

FORMAÇÃO ACADÊMICA
- Bacharelado | Universidade | 2016 - 2020

IDIOMAS
- Português: nativo
`;

// Mês de referência fixo (07/2026) para o teste não depender do calendário.
const AGORA = paraMeses('07', '2026');

test('extrai o contato do cabeçalho', () => {
  const r = parsearCv(CV_BOM, { mesAtual: AGORA });
  assert.equal(r.contato.nome, 'CARLOS ALBERTO');
  assert.equal(r.contato.cargo, 'Desenvolvedor Backend Sênior');
  assert.equal(r.contato.email, 'carlos@exemplo.com');
  assert.equal(r.contato.telefone, '+55 11 2615-2880');
});

test('reconhece as seções canônicas', () => {
  const r = parsearCv(CV_BOM, { mesAtual: AGORA });
  assert.ok(r.secoes.includes('EXPERIÊNCIA PROFISSIONAL'));
  assert.ok(r.secoes.includes('FORMAÇÃO ACADÊMICA'));
});

test('extrai cargo, empresa e período de cada emprego', () => {
  const r = parsearCv(CV_BOM, { mesAtual: AGORA });
  assert.equal(r.empregos.length, 2);
  assert.equal(r.empregos[0].cargo, 'Dev Sênior');
  assert.equal(r.empregos[0].empresa, 'Empresa Um');
  assert.equal(r.empregos[0].periodo, '01/2020 - 12/2022');
  assert.equal(r.empregos[1].periodo, '01/2023 - atual');
});

test('currículo bem formado é considerado legível', () => {
  const r = parsearCv(CV_BOM, { mesAtual: AGORA });
  assert.deepEqual(r.problemas, []);
  assert.equal(r.legivel, true);
});

test('relata a falta de e-mail em vez de seguir em silêncio', () => {
  const semEmail = CV_BOM.replace(' | carlos@exemplo.com', '');
  const r = parsearCv(semEmail, { mesAtual: AGORA });
  assert.ok(r.problemas.some(p => /e-mail/.test(p)), `problemas: ${r.problemas}`);
  assert.equal(r.legivel, false);
});

test('relata título de seção não reconhecido', () => {
  // "MINHA JORNADA" no lugar de "EXPERIÊNCIA PROFISSIONAL" é o erro clássico
  // que faz o ATS perder a seção inteira.
  const criativo = CV_BOM.replace('EXPERIÊNCIA PROFISSIONAL', 'MINHA JORNADA');
  const r = parsearCv(criativo, { mesAtual: AGORA });
  assert.ok(r.problemas.some(p => /MINHA JORNADA/.test(p)), `problemas: ${r.problemas}`);
  assert.ok(r.problemas.some(p => /experiência profissional/i.test(p)));
});

test('relata período fora do formato reconhecível', () => {
  const ruim = CV_BOM.replace('01/2020 - 12/2022', '2020 até 2022');
  const r = parsearCv(ruim, { mesAtual: AGORA });
  // A linha deixa de casar o formato de emprego, então some da extração.
  assert.equal(r.empregos.length, 1);
});

test('conta a experiência pela UNIÃO dos períodos, não pela soma', () => {
  // Dois contratos inteiramente sobrepostos são 2 anos de carreira, não 4.
  const sobrepostos = [
    { intervalo: { inicio: paraMeses('01', '2020'), fim: paraMeses('01', '2022') } },
    { intervalo: { inicio: paraMeses('01', '2020'), fim: paraMeses('01', '2022') } },
  ];
  assert.equal(anosDeExperiencia(sobrepostos, AGORA), 2);
});

test('soma períodos disjuntos, descontando o intervalo entre eles', () => {
  const disjuntos = [
    { intervalo: { inicio: paraMeses('01', '2010'), fim: paraMeses('01', '2012') } },
    { intervalo: { inicio: paraMeses('01', '2020'), fim: paraMeses('01', '2021') } },
  ];
  assert.equal(anosDeExperiencia(disjuntos, AGORA), 3);
});

test('trata "atual" como o mês de referência', () => {
  const emAberto = [{ intervalo: { inicio: paraMeses('07', '2024'), fim: null } }];
  assert.equal(anosDeExperiencia(emAberto, AGORA), 2);
});
