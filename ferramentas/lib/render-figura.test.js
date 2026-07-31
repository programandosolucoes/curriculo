const { test } = require('node:test');
const assert = require('node:assert');
const { renderFigura } = require('./render-figura');

test('diagrama monta as etapas com seta entre elas', () => {
  const html = renderFigura({
    tipo: 'diagrama',
    titulo: 'Do transponder à concessionária',
    subtitulo: 'SLT',
    etapas: [
      { rotulo: 'Pista', caixas: [{ nome: 'Antena CIR', detalhe: '915 MHz' }] },
      { rotulo: 'SLT', caixas: [{ nome: 'Parser', detalhe: 'OBUID + payload' }] },
    ],
    nota: 'ISO/IEC 18000-63.',
  });
  assert.match(html, /Antena CIR/);
  assert.match(html, /915 MHz/);
  assert.match(html, /→/);
  assert.match(html, /ISO\/IEC 18000-63\./);
});

test('diagrama escapa conteúdo', () => {
  const html = renderFigura({
    tipo: 'diagrama',
    titulo: 'x',
    etapas: [{ caixas: [{ nome: '<script>alert(1)</script>' }] }],
  });
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
});

test('terminal marca comando, saída e destaque de forma distinta', () => {
  const html = renderFigura({
    tipo: 'terminal',
    titulo: 'Cenários SIPp',
    linhas: [
      { tipo: 'cmd', texto: 'ls tests/scenarios/' },
      { tipo: 'saida', texto: 'g729-inbound-uac.xml' },
      { tipo: 'destaque', texto: '13 cenários' },
    ],
  });
  assert.match(html, /class="ln cmd"/);
  assert.match(html, /class="ln dst"/);
  assert.match(html, /g729-inbound-uac\.xml/);
  assert.match(html, /13 cenários/);
});

test('tipo desconhecido falha com o nome do arquivo na mensagem', () => {
  assert.throws(
    () => renderFigura({ tipo: 'pintura', arquivo: 'x.png' }),
    /x\.png.*pintura/,
  );
});
