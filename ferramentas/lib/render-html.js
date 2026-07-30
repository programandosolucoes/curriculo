/**
 * render-html.js — Currículo resolvido → HTML de coluna única.
 *
 * O HTML existe para duas coisas: revisar no navegador e gerar o PDF que vai
 * anexado. Como esse PDF passa por triagem automatizada, o layout é
 * deliberadamente pobre:
 *
 *   - uma coluna só, porque o extrator lê na ordem do fluxo e duas colunas
 *     viram frases intercaladas;
 *   - sem tabela, imagem, SVG, cabeçalho/rodapé de página ou posicionamento
 *     absoluto;
 *   - sem texto injetado por CSS (`content:`), que não sai na extração;
 *   - cabeçalho de seção como texto real em <h2>.
 *
 * Bonito é secundário. O que importa é o texto sair inteiro e na ordem certa.
 */

function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const ESTILO = `
  :root { --tinta: #111; --suave: #444; --linha: #bbb; }
  * { box-sizing: border-box; }
  body {
    margin: 0 auto; max-width: 820px; padding: 32px 28px 64px;
    font-family: Calibri, Carlito, "Segoe UI", Arial, sans-serif;
    font-size: 11pt; line-height: 1.45; color: var(--tinta); background: #fff;
  }
  h1 { font-size: 20pt; margin: 0; letter-spacing: .01em; }
  .cargo { font-size: 12.5pt; color: var(--suave); margin: 2px 0 8px; font-weight: 600; }
  .contato { font-size: 10pt; color: var(--suave); margin: 0; }
  .contato a { color: inherit; }
  h2 {
    font-size: 11.5pt; margin: 22px 0 8px; padding-bottom: 3px;
    border-bottom: 1px solid var(--linha); letter-spacing: .04em;
  }
  h3 { font-size: 11pt; margin: 12px 0 3px; font-weight: 700; }
  p { margin: 0 0 8px; }
  ul { margin: 4px 0 10px; padding-left: 20px; }
  li { margin-bottom: 3px; }
  .grupo-titulo { font-weight: 700; margin: 10px 0 2px; }
  @media print {
    body { max-width: none; padding: 0; font-size: 10.5pt; }
    @page { margin: 14mm; }
    h2, h3, li { break-inside: avoid; }
  }
`;

function lista(itens) {
  return `<ul>\n${itens.map(i => `  <li>${escapar(i)}</li>`).join('\n')}\n</ul>`;
}

const RENDERIZADORES = {
  resumo: secao => `<p>${escapar(secao.texto)}</p>`,

  conquistas: secao => lista(secao.itens),

  competencias: secao => secao.grupos.map(grupo =>
    `<p class="grupo-titulo">${escapar(grupo.titulo)}</p>\n${lista(grupo.itens)}`,
  ).join('\n'),

  experiencia: secao => secao.itens.map(item => {
    const cabecalho = [item.cargo, item.empresa, item.periodo, item.local]
      .filter(Boolean).map(escapar).join(' | ');
    return `<h3>${cabecalho}</h3>\n${lista(item.bullets)}`;
  }).join('\n'),

  projetos: secao => secao.itens.map(item => {
    const cabecalho = [item.nome, item.contexto, item.periodo]
      .filter(Boolean).map(escapar).join(' | ');
    return `<h3>${cabecalho}</h3>\n${lista(item.bullets)}`;
  }).join('\n'),

  formacao: secao => lista(
    secao.itens.map(i => [i.curso, i.instituicao, i.periodo].filter(Boolean).join(' | ')),
  ),

  certificacoes: secao => lista(secao.itens),

  idiomas: secao => lista(secao.itens),
};

/**
 * @param {object} cv objeto devolvido por `montarCv`
 * @returns {string} documento HTML completo
 */
function renderHtml(cv) {
  const { pessoal } = cv;
  const contato = [pessoal.local, pessoal.telefone, pessoal.email].filter(Boolean).map(escapar).join(' | ');
  const links = (pessoal.links || []).map(escapar).join(' | ');

  const corpo = cv.secoes.map(secao => {
    const renderizador = RENDERIZADORES[secao.tipo];
    if (!renderizador) throw new Error(`Sem renderizador de HTML para a seção "${secao.tipo}".`);
    return `<h2>${escapar(secao.titulo)}</h2>\n${renderizador(secao)}`;
  }).join('\n\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(pessoal.nome)} - ${escapar(cv.titulo)}</title>
<style>${ESTILO}</style>
</head>
<body>
<h1>${escapar(pessoal.nome)}</h1>
<p class="cargo">${escapar(cv.titulo)}</p>
<p class="contato">${contato}</p>
${links ? `<p class="contato">${links}</p>` : ''}

${corpo}
</body>
</html>
`;
}

module.exports = { renderHtml };
