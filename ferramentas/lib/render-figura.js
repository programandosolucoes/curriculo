/**
 * render-figura.js — HTML das figuras do portfólio.
 *
 * Gera as imagens dos projetos que não têm interface: diagramas de
 * arquitetura e blocos de terminal com saída real. A saída é um documento
 * HTML completo, capturado depois em PNG pelo Playwright — assim todas as
 * figuras saem com a mesma linguagem visual, e corrigir o estilo é mexer
 * num arquivo só.
 */

const { escapar } = require('./render-portfolio');

const PALETA = {
  fundo: '#0f172a',
  caixa: '#1e293b',
  borda: '#334155',
  texto: '#e2e8f0',
  apagado: '#94a3b8',
  destaque: '#38bdf8',
  acento: '#a78bfa',
  ok: '#34d399',
};

const BASE = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${PALETA.fundo};color:${PALETA.texto};
    font-family:'DejaVu Sans',system-ui,-apple-system,sans-serif;
    width:1200px;padding:40px}
  .fig-titulo{font-size:22px;font-weight:600;margin-bottom:4px}
  .fig-sub{font-size:14px;color:${PALETA.apagado};margin-bottom:28px}
  .fig-nota{margin-top:24px;font-size:13px;color:${PALETA.apagado};
    border-left:3px solid ${PALETA.acento};padding-left:12px;line-height:1.6}
`;

/**
 * Diagrama: colunas de caixas ligadas por setas.
 * spec = { titulo, subtitulo, etapas: [{ rotulo, caixas: [{ nome, detalhe }] }], nota }
 */
function renderDiagrama(spec) {
  const etapas = spec.etapas.map((etapa, i) => {
    const caixas = etapa.caixas.map(c => `
      <div class="cx">
        <div class="cx-nome">${escapar(c.nome)}</div>
        ${c.detalhe ? `<div class="cx-det">${escapar(c.detalhe)}</div>` : ''}
      </div>`).join('');
    const seta = i < spec.etapas.length - 1 ? '<div class="seta">→</div>' : '';
    return `
    <div class="etapa">
      ${etapa.rotulo ? `<div class="et-rotulo">${escapar(etapa.rotulo)}</div>` : '<div class="et-rotulo">&nbsp;</div>'}
      <div class="et-caixas">${caixas}</div>
    </div>
    ${seta}`;
  }).join('');

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
  ${BASE}
  .fluxo{display:flex;align-items:stretch;gap:14px}
  .etapa{flex:1;display:flex;flex-direction:column;gap:10px}
  .et-rotulo{font-size:11px;text-transform:uppercase;letter-spacing:.09em;
    color:${PALETA.destaque};font-weight:600}
  .et-caixas{display:flex;flex-direction:column;gap:10px;flex:1}
  .cx{background:${PALETA.caixa};border:1px solid ${PALETA.borda};
    border-radius:10px;padding:14px 16px;flex:1;display:flex;
    flex-direction:column;justify-content:center;gap:5px}
  .cx-nome{font-size:15px;font-weight:600;line-height:1.3}
  .cx-det{font-size:12px;color:${PALETA.apagado};line-height:1.45}
  .seta{display:flex;align-items:center;font-size:26px;
    color:${PALETA.destaque};padding-top:20px}
  </style></head><body>
    <div class="fig-titulo">${escapar(spec.titulo)}</div>
    <div class="fig-sub">${escapar(spec.subtitulo || '')}</div>
    <div class="fluxo">${etapas}</div>
    ${spec.nota ? `<div class="fig-nota">${escapar(spec.nota)}</div>` : ''}
  </body></html>`;
}

/**
 * Terminal: bloco de saída real de comando.
 * spec = { titulo, subtitulo, linhas: [{ tipo: 'cmd'|'saida'|'destaque', texto }], nota }
 */
function renderTerminal(spec) {
  const linhas = spec.linhas.map(l => {
    if (l.tipo === 'cmd') return `<div class="ln cmd"><span class="pr">$</span> ${escapar(l.texto)}</div>`;
    if (l.tipo === 'destaque') return `<div class="ln dst">${escapar(l.texto)}</div>`;
    return `<div class="ln">${escapar(l.texto)}</div>`;
  }).join('');

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
  ${BASE}
  .term{background:#0b1120;border:1px solid ${PALETA.borda};border-radius:10px;
    overflow:hidden}
  .term-barra{background:${PALETA.caixa};padding:10px 14px;display:flex;
    align-items:center;gap:8px;border-bottom:1px solid ${PALETA.borda}}
  .bolha{width:11px;height:11px;border-radius:50%}
  .b1{background:#f87171}.b2{background:#fbbf24}.b3{background:#34d399}
  .term-nome{font-size:12px;color:${PALETA.apagado};margin-left:8px}
  .term-corpo{padding:18px 20px;font-family:'DejaVu Sans Mono',ui-monospace,monospace;
    font-size:13.5px;line-height:1.75}
  .ln{white-space:pre-wrap;word-break:break-word}
  .cmd{color:${PALETA.texto};margin-top:6px}
  .pr{color:${PALETA.ok};font-weight:700}
  .dst{color:${PALETA.destaque};font-weight:600}
  .term-corpo .ln:not(.cmd):not(.dst){color:${PALETA.apagado}}
  </style></head><body>
    <div class="fig-titulo">${escapar(spec.titulo)}</div>
    <div class="fig-sub">${escapar(spec.subtitulo || '')}</div>
    <div class="term">
      <div class="term-barra">
        <span class="bolha b1"></span><span class="bolha b2"></span><span class="bolha b3"></span>
        <span class="term-nome">${escapar(spec.terminal || 'bash')}</span>
      </div>
      <div class="term-corpo">${linhas}</div>
    </div>
    ${spec.nota ? `<div class="fig-nota">${escapar(spec.nota)}</div>` : ''}
  </body></html>`;
}

/**
 * Tabela: comparação com números medidos.
 * spec = { titulo, subtitulo, colunas: [...], nota,
 *          linhas: [{ celulas: [...], melhores: [i], licenca, alerta }] }
 *
 * `melhores` marca em qual coluna aquela linha vence; `alerta` sinaliza a
 * linha cuja licença impede uso comercial — que é metade do argumento aqui.
 */
function renderTabela(spec) {
  const cabecalho = spec.colunas.map(c => `<th>${escapar(c)}</th>`).join('');

  const corpo = spec.linhas.map(linha => {
    const melhores = new Set(linha.melhores || []);
    const celulas = linha.celulas.map((celula, i) => {
      const classe = melhores.has(i) ? ' class="melhor"' : '';
      const licenca = i === 0 && linha.licenca
        ? `<span class="lic">${escapar(linha.licenca)}</span>` : '';
      return `<td${classe}>${escapar(celula)}${licenca}</td>`;
    }).join('');
    return `<tr class="ln${linha.alerta ? ' alerta' : ''}">${celulas}</tr>`;
  }).join('\n');

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
  ${BASE}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th{text-align:left;padding:10px 14px;font-size:11px;text-transform:uppercase;
    letter-spacing:.08em;color:${PALETA.destaque};border-bottom:1px solid ${PALETA.borda}}
  th:not(:first-child),td:not(:first-child){text-align:right;font-variant-numeric:tabular-nums}
  td{padding:12px 14px;border-bottom:1px solid rgba(51,65,85,.5)}
  tr.ln:hover{background:rgba(148,163,184,.05)}
  td:first-child{font-weight:600}
  .lic{display:block;font-weight:400;font-size:11.5px;color:${PALETA.apagado};margin-top:3px}
  .melhor{color:${PALETA.ok};font-weight:700}
  tr.alerta td:first-child .lic{color:#fbbf24}
  /* o aviso fica DENTRO da linha da licença; no ::after do <td> ele cairia
     abaixo do .lic, que é bloco, e sobraria solto no meio da tabela */
  tr.alerta td:first-child .lic::after{content:' ⚠'}
  </style></head><body>
    <div class="fig-titulo">${escapar(spec.titulo)}</div>
    <div class="fig-sub">${escapar(spec.subtitulo || '')}</div>
    <table><thead><tr>${cabecalho}</tr></thead><tbody>
${corpo}
    </tbody></table>
    ${spec.nota ? `<div class="fig-nota">${escapar(spec.nota)}</div>` : ''}
  </body></html>`;
}

function renderFigura(spec) {
  if (spec.tipo === 'diagrama') return renderDiagrama(spec);
  if (spec.tipo === 'terminal') return renderTerminal(spec);
  if (spec.tipo === 'tabela') return renderTabela(spec);
  throw new Error(`Figura "${spec.arquivo}": tipo desconhecido "${spec.tipo}".`);
}

module.exports = { renderFigura, renderDiagrama, renderTerminal, renderTabela };
