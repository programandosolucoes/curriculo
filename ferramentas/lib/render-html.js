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
  .barra {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px dashed var(--linha);
  }
  .barra button {
    font: inherit; font-size: 10pt; cursor: pointer;
    padding: 7px 14px; border-radius: 6px;
    color: var(--tinta); background: #f4f4f6; border: 1px solid var(--linha);
  }
  .barra button:hover { background: #e8e8ec; }
  .barra .dica { font-size: 9.5pt; color: var(--suave); align-self: center; margin: 0; }
  @media print {
    body { max-width: none; padding: 0; font-size: 10.5pt; }
    @page { margin: 14mm; }
    h2, h3, li { break-inside: avoid; }
    .barra { display: none; }
  }
`;

/**
 * Script de exportação, embutido no arquivo.
 *
 * PDF sai pela impressão do próprio navegador — é o caminho que preserva o
 * texto selecionável, que é o que o ATS lê. "Salvar como PDF" no diálogo.
 *
 * Word sai serializando o HTML do currículo com o tipo MIME do Word, sem
 * biblioteca nenhuma: o Word abre HTML e converte. A barra de botões fica
 * fora do container exportado, então não vai junto para dentro do documento.
 */
function scriptExportacao(nomeArquivo) {
  return `
document.getElementById('btn-pdf').addEventListener('click', function () {
  window.print();
});

document.getElementById('btn-doc').addEventListener('click', function () {
  var conteudo = document.getElementById('curriculo').innerHTML;
  var estilo = document.getElementById('estilo-cv').innerHTML;
  var documento =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office"' +
    ' xmlns:w="urn:schemas-microsoft-com:office:word"' +
    ' xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8"><style>' + estilo + '</style></head>' +
    '<body>' + conteudo + '</body></html>';

  // O BOM faz o Word reconhecer o UTF-8 e não corromper os acentos.
  var blob = new Blob(['\\ufeff', documento], { type: 'application/msword' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = ${JSON.stringify(nomeArquivo)} + '.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});
`;
}

/** Nome de arquivo seguro, sem acento nem espaço. */
function nomeDeArquivo(nome, perfil) {
  const limpo = String(nome)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `CV-${limpo}-${perfil}`;
}

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

  const arquivo = nomeDeArquivo(pessoal.nome, cv.perfil);

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(pessoal.nome)} - ${escapar(cv.titulo)}</title>
<style id="estilo-cv">${ESTILO}</style>
</head>
<body>
<div class="barra">
  <button type="button" id="btn-pdf">Baixar PDF</button>
  <button type="button" id="btn-doc">Baixar Word (.doc)</button>
  <p class="dica">No diálogo de impressão, escolha "Salvar como PDF".</p>
</div>

<div id="curriculo">
<h1>${escapar(pessoal.nome)}</h1>
<p class="cargo">${escapar(cv.titulo)}</p>
<p class="contato">${contato}</p>
${links ? `<p class="contato">${links}</p>` : ''}

${corpo}
</div>

<script>${scriptExportacao(arquivo)}</script>
</body>
</html>
`;
}

module.exports = { renderHtml };
