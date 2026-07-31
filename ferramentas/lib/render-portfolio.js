/**
 * render-portfolio.js — HTML do portfólio publicado no WordPress.
 *
 * A saída é FRAGMENTO, não documento: entra num bloco core/html do Gutenberg
 * e o tema Newsup fornece cabeçalho, rodapé e a moldura. Por isso todo CSS
 * daqui é prefixado com `.pf-`, para não disputar com o CSS do tema.
 */

const CSS = `
<style>
.pf-wrap{max-width:1100px;margin:0 auto;font-size:16px;line-height:1.65}
.pf-chamada{font-size:1.15rem;opacity:.85;margin:0 0 2rem}
.pf-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem}
.pf-card{border:1px solid rgba(128,128,128,.3);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;transition:transform .15s ease,box-shadow .15s ease}
.pf-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.12)}
.pf-card img{width:100%;height:180px;object-fit:cover;display:block;background:rgba(128,128,128,.12)}
.pf-card-corpo{padding:1rem 1.1rem 1.2rem;display:flex;flex-direction:column;gap:.6rem;flex:1}
.pf-card h3{margin:0;font-size:1.05rem;line-height:1.35}
.pf-card p{margin:0;font-size:.92rem;opacity:.85;flex:1}
.pf-chips{display:flex;flex-wrap:wrap;gap:.35rem}
.pf-chip{font-size:.75rem;padding:.18rem .55rem;border-radius:999px;border:1px solid rgba(128,128,128,.35);opacity:.9}
.pf-meta{font-size:.8rem;opacity:.7}
.pf-cadeado{font-size:.8rem;opacity:.75}
.pf-hero{margin:0 0 1.5rem}
.pf-hero h1{margin:0 0 .4rem;line-height:1.2}
.pf-secao{margin:2rem 0}
.pf-secao h2{font-size:1.15rem;margin:0 0 .6rem;text-transform:uppercase;letter-spacing:.06em;opacity:.75}
.pf-galeria{display:grid;gap:1.2rem;margin:2rem 0}
.pf-galeria figure{margin:0}
.pf-galeria img{width:100%;border:1px solid rgba(128,128,128,.3);border-radius:8px;display:block}
.pf-galeria figcaption{font-size:.85rem;opacity:.75;margin-top:.4rem}
.pf-repo{border:1px solid rgba(128,128,128,.35);border-left-width:4px;border-radius:8px;padding:1rem 1.2rem;margin:2rem 0}
.pf-repo h2{margin:0 0 .5rem;font-size:1rem;text-transform:uppercase;letter-spacing:.06em}
.pf-repo pre{background:rgba(128,128,128,.12);padding:.7rem .9rem;border-radius:6px;overflow-x:auto;margin:.6rem 0;font-size:.85rem}
.pf-contato{margin:2rem 0;padding-top:1.2rem;border-top:1px solid rgba(128,128,128,.3);font-size:.95rem}
.pf-voltar{display:inline-block;margin-bottom:1rem;font-size:.9rem}
@media (max-width:600px){.pf-card img{height:150px}}
</style>`.trim();

function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function chips(itens) {
  return `<div class="pf-chips">${itens.map(i => `<span class="pf-chip">${escapar(i)}</span>`).join('')}</div>`;
}

// As imagens vão para uma pasta FIXA em wp-content/uploads/portfolio/, não
// para a biblioteca de mídia. Assim a URL é determinística e o HTML gerado já
// nasce correto — sem precisar mapear id de anexo para URL depois do upload.
function urlImagem(arquivo, config) {
  return config.baseImagens.replace(/\/+$/, '') + '/' + arquivo;
}

// O slug tem que ser o MESMO que o publicador usa como post_name, senão o
// card aponta para uma página que não existe.
function slugProjeto(id, config) {
  return '/' + config.prefixoSlug + id;
}

function renderIndice(projetos, area, config) {
  const indice = config.indices.find(i => i.area === area);
  const cards = projetos.map(p => {
    const capa = p.imagens[0];
    const url = escapar(slugProjeto(p.id, config));
    return `
    <article class="pf-card">
      <a href="${url}">
        <img src="${escapar(urlImagem(capa.arquivo, config))}" alt="${escapar(capa.legenda)}" loading="lazy">
      </a>
      <div class="pf-card-corpo">
        <h3><a href="${url}">${escapar(p.nome)}</a></h3>
        <p>${escapar(p.resumo)}</p>
        ${chips(p.stack.slice(0, 4))}
        <div class="pf-meta">${escapar(p.periodo)} · ${escapar(p.duracao)}</div>
        ${p.repo ? '<div class="pf-cadeado">🔒 repositório privado</div>' : ''}
      </div>
    </article>`;
  }).join('\n');

  return `${CSS}
<div class="pf-wrap">
  <p class="pf-chamada">${escapar(indice.chamada)}</p>
  <div class="pf-grade">
${cards}
  </div>
</div>`;
}

function renderProjeto(projeto, pessoal, config) {
  const galeria = projeto.imagens.map(img => `
    <figure>
      <img src="${escapar(urlImagem(img.arquivo, config))}" alt="${escapar(img.legenda)}" loading="lazy">
      <figcaption>${escapar(img.legenda)}</figcaption>
    </figure>`).join('\n');

  const blocoRepo = projeto.repo
    ? `<div class="pf-repo">
    <h2>🔒 Código-fonte</h2>
    <pre><code>git clone ${escapar(config.gitBase)}/${escapar(projeto.repo)}</code></pre>
    <p>${escapar(config.avisoRepo)}</p>
  </div>`
    : `<div class="pf-repo">
    <h2>Código-fonte</h2>
    <p>${escapar(config.avisoSemRepo)}</p>
  </div>`;

  const blocoPatch = projeto.patch
    ? `<div class="pf-repo">
    <h2>A contribuição</h2>
    <p><code>${escapar(projeto.patch.commit)}</code> — ${escapar(projeto.patch.titulo)}</p>
    <p>${escapar(String(projeto.patch.arquivos))} arquivos, ${escapar(String(projeto.patch.linhas))} linhas, com o teste do projeto ajustado junto.</p>
    <p>Projeto original: <a href="${escapar(projeto.patch.upstream)}" rel="noopener">${escapar(projeto.patch.upstream)}</a></p>
  </div>`
    : '';

  const voltar = projeto.areas.includes('frontend') ? 'portfolio-frontend' : 'portfolio-backend';

  return `${CSS}
<div class="pf-wrap">
  <a class="pf-voltar" href="/${escapar(voltar)}">← voltar ao portfólio</a>

  <header class="pf-hero">
    <p class="pf-meta">${escapar(projeto.periodo)} · ${escapar(projeto.duracao)}</p>
    <p>${escapar(projeto.resumo)}</p>
    ${chips(projeto.stack)}
  </header>

  <section class="pf-secao">
    <h2>O problema</h2>
    <p>${escapar(projeto.problema)}</p>
  </section>

  <section class="pf-secao">
    <h2>A arquitetura</h2>
    <p>${escapar(projeto.arquitetura)}</p>
  </section>

  <section class="pf-secao">
    <h2>O resultado</h2>
    <p>${escapar(projeto.resultado)}</p>
  </section>

  <div class="pf-galeria">
${galeria}
  </div>

  ${blocoRepo}
  ${blocoPatch}

  <div class="pf-contato">
    <strong>${escapar(pessoal.nome)}</strong> — ${escapar(pessoal.email)} · ${escapar(pessoal.telefone)}
  </div>
</div>`;
}

module.exports = { renderIndice, renderProjeto, escapar };
