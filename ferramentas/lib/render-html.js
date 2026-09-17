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

/** Cópia local em `cv/vendor/` (vale sem internet); o CDN cobre o HTML aberto fora do repositório. */
const JSPDF_LOCAL = '../vendor/jspdf.umd.min.js';
const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js';

/**
 * Troca por espaço inquebrável os espaços de um período ("2025 - Present"),
 * para a quebra de linha do PDF não partir a data. Partida no hífen, o
 * extrator de texto junta as duas linhas e engole o traço ("2025 presente",
 * medido em 17/09/2026). O jsPDF só quebra em espaço comum; depois de
 * quebrar, o espaço normal volta, e o texto extraído não muda.
 *
 * Embutida no HTML por `toString()`, por isso não usa nada de fora dela. As
 * palavras de "em curso" repetem `PALAVRA_ATUAL`; o teste confere as duas.
 */
function protegerPeriodos(texto) {
  return texto.replace(
    /(?:\d{2}\/)?\d{4} - (?:(?:\d{2}\/)?\d{4}|atual|Present|presente)/g,
    function (periodo) { return periodo.replace(/ /g, '\u00a0'); },
  );
}

/**
 * Script de exportação, embutido no arquivo.
 *
 * PDF sai do jsPDF, escrito como TEXTO, e é baixado direto. A impressão do
 * navegador foi abandonada por dois defeitos medidos no Firefox (16/09/2026):
 * põe título e caminho `file://` no topo de cada página, e a fonte com
 * ligaduras quebra a extração do texto — o e-mail saía como
 * "carlosalberto4�@gmail.com" para o ATS. Helvetica padrão não tem ligadura.
 * Bibliotecas que "fotografam" a página (html2pdf, html2canvas) ficaram de
 * fora de propósito: geram imagem, e imagem o ATS não lê.
 *
 * O PDF é montado a partir do DOM de #curriculo, então o texto é o mesmo do
 * HTML — não existe um segundo lugar onde o conteúdo possa divergir.
 *
 * Word sai serializando o HTML do currículo com o tipo MIME do Word, sem
 * biblioteca nenhuma: o Word abre HTML e converte. A barra de botões fica
 * fora do container exportado, então não vai junto para dentro do documento.
 */
function scriptExportacao(nomeArquivo, autor, assunto) {
  return `
var JSPDF_CDN = ${JSON.stringify(JSPDF_CDN)};

function comJsPdf(continuar) {
  if (window.jspdf && window.jspdf.jsPDF) { continuar(window.jspdf.jsPDF); return; }
  var script = document.createElement('script');
  script.src = JSPDF_CDN;
  script.onload = function () { continuar(window.jspdf.jsPDF); };
  script.onerror = function () {
    alert('Não consegui carregar o gerador de PDF (nem cv/vendor/jspdf.umd.min.js, nem o CDN). ' +
          'Alternativa: Ctrl+P e desmarcar "cabeçalhos e rodapés".');
  };
  document.head.appendChild(script);
}

var protegerPeriodos = ${protegerPeriodos.toString()};

function textoDe(el) {
  return el.textContent.replace(/\\s+/g, ' ').trim();
}

function gerarPdf(JsPDF) {
  var doc = new JsPDF({ unit: 'pt', format: 'a4', compress: true });
  var MARGEM_X = 48, MARGEM_TOPO = 46, MARGEM_BASE = 46;
  var larguraPagina = doc.internal.pageSize.getWidth();
  var alturaPagina = doc.internal.pageSize.getHeight();
  var largura = larguraPagina - 2 * MARGEM_X;
  var TINTA = [17, 17, 17], SUAVE = [68, 68, 68], LINHA = [187, 187, 187];
  var y = MARGEM_TOPO;

  function caber(altura) {
    if (y + altura > alturaPagina - MARGEM_BASE) { doc.addPage(); y = MARGEM_TOPO; }
  }

  // manterCom: altura que precisa caber junto com a primeira linha, para um
  // título não ficar sozinho no pé da página, separado do que ele intitula.
  function bloco(texto, o) {
    doc.setFont('helvetica', o.negrito ? 'bold' : 'normal');
    doc.setFontSize(o.tamanho);
    doc.setTextColor(o.cor[0], o.cor[1], o.cor[2]);
    var entrelinha = o.tamanho * 1.35;
    var recuo = o.recuo || 0;
    var linhas = doc.splitTextToSize(protegerPeriodos(texto), largura - recuo)
      .map(function (l) { return l.replace(/\\u00a0/g, ' '); });
    y += o.antes || 0;
    // Item de lista curto não se parte entre duas páginas.
    var inteiro = o.inteiro && linhas.length <= 4 ? linhas.length * entrelinha : entrelinha;
    caber(inteiro + (o.manterCom || 0));
    for (var i = 0; i < linhas.length; i++) {
      caber(entrelinha);
      if (i === 0 && o.marcador) doc.text(o.marcador, MARGEM_X + recuo - 10, y, { baseline: 'top' });
      doc.text(linhas[i], MARGEM_X + recuo, y, { baseline: 'top' });
      y += entrelinha;
    }
    y += o.depois || 0;
  }

  var filhos = document.getElementById('curriculo').children;
  for (var i = 0; i < filhos.length; i++) {
    var el = filhos[i];
    var classe = el.classList;
    if (el.tagName === 'H1') {
      bloco(textoDe(el), { tamanho: 20, negrito: true, cor: TINTA, depois: 2 });
    } else if (el.tagName === 'H2') {
      bloco(textoDe(el), { tamanho: 11.5, negrito: true, cor: TINTA, antes: 12, manterCom: 40 });
      doc.setDrawColor(LINHA[0], LINHA[1], LINHA[2]);
      doc.setLineWidth(0.6);
      doc.line(MARGEM_X, y + 1, larguraPagina - MARGEM_X, y + 1);
      y += 7;
    } else if (el.tagName === 'H3') {
      bloco(textoDe(el), { tamanho: 10.5, negrito: true, cor: TINTA, antes: 6, depois: 1, manterCom: 28 });
    } else if (el.tagName === 'UL') {
      for (var j = 0; j < el.children.length; j++) {
        bloco(textoDe(el.children[j]), { tamanho: 10, cor: TINTA, recuo: 14, marcador: '•', depois: 2, inteiro: true });
      }
      y += 3;
    } else if (classe.contains('cargo')) {
      bloco(textoDe(el), { tamanho: 12.5, negrito: true, cor: SUAVE, depois: 5 });
    } else if (classe.contains('contato')) {
      bloco(textoDe(el), { tamanho: 9.5, cor: SUAVE, depois: 1 });
    } else if (classe.contains('grupo-titulo')) {
      bloco(textoDe(el), { tamanho: 10.5, negrito: true, cor: TINTA, antes: 5, depois: 1, manterCom: 14 });
    } else if (el.tagName === 'P') {
      bloco(textoDe(el), { tamanho: 10, cor: TINTA, depois: 3 });
    }
  }

  doc.setProperties({
    title: document.title,
    author: ${JSON.stringify(autor)},
    subject: ${JSON.stringify(assunto)},
    creator: 'curriculo / gerar-cv.js',
  });
  doc.save(${JSON.stringify(nomeArquivo)} + '.pdf');
}

document.getElementById('btn-pdf').addEventListener('click', function () {
  comJsPdf(gerarPdf);
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
    // Emprego compacto sai só com o cabeçalho: sem bullets, e sem <ul> vazio.
    return item.bullets.length
      ? `<h3>${cabecalho}</h3>\n${lista(item.bullets)}`
      : `<h3>${cabecalho}</h3>`;
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

/** Valor do atributo `lang`: leitor de tela e hifenização dependem dele. */
const LANG_HTML = { pt: 'pt-BR', en: 'en', it: 'it' };

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
<html lang="${LANG_HTML[cv.idioma] || LANG_HTML.pt}">
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
  <p class="dica">O PDF é gerado e baixado direto: texto selecionável, sem cabeçalho nem rodapé do navegador.</p>
</div>

<div id="curriculo">
<h1>${escapar(pessoal.nome)}</h1>
<p class="cargo">${escapar(cv.titulo)}</p>
<p class="contato">${contato}</p>
${links ? `<p class="contato">${links}</p>` : ''}

${corpo}
</div>

<script src="${JSPDF_LOCAL}"></script>
<script>${scriptExportacao(arquivo, pessoal.nome, cv.titulo)}</script>
</body>
</html>
`;
}

module.exports = { renderHtml, protegerPeriodos };
