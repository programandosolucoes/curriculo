# curriculo

Repositório do currículo de Carlos Alberto: a fonte de verdade do CV, o
material de estratégia que sustenta cada afirmação escrita nele, e a
ferramenta que mede a aderência do currículo às vagas reais do mercado.

Separado do `vagas-automation-suite` de propósito: lá é **código** de
automação; aqui é **conteúdo de carreira**.

## Rodando depois do clone

Não precisa de `npm install`, banco de dados, chave de API nem rede.
Só Node.js 18 ou superior:

```bash
git clone ssh://…/repos/curriculo.git
cd curriculo
node ferramentas/aderencia.js      # ou: npm run aderencia
```

Para ver o currículo formatado, abra `cv/cv-2026-07.html` no navegador
(`xdg-open cv/cv-2026-07.html`) — é um arquivo único, sem dependências.

## Estrutura

```
cv/
  cv.txt              fonte de verdade do CV em texto — é o que a ferramenta lê
  cv.pdf              versão em PDF anexada nas candidaturas
  cv-2026-07.html     mesma revisão em HTML, para revisar e gerar o PDF
docs/
  CV_ESTRATEGIA.md    documento vivo: inventário técnico dos projetos feito a
                      partir do código real, decisões de redação, e a base de
                      evidência de cada data escrita no CV
ferramentas/
  aderencia.js        compara o CV com as vagas coletadas
  lib/                vocabulário de mercado e lógica de avaliação
dados/
  vagas-coletadas.json  snapshot de 1.129 vagas reais em 30 categorias
aderencia/
  AAAA-MM-DD-aderencia-cv.md   relatórios gerados
```

## Como usar o `cv-2026-07.html`

Três controles no topo da página:

- **Destacar inclusões** — vem ligado; o amarelo é o que entrou na revisão de
  07/2026. Desligue para ver como o currículo fica de verdade.
- **Tema** — claro/escuro.
- **Imprimir / PDF** — layout A4, sem destaques e sem a barra de controles.
  É por aqui que se gera o `cv.pdf`.

## A ferramenta de aderência

`ferramentas/aderencia.js` cruza os termos técnicos do `cv/cv.txt` com os
requisitos das vagas em `dados/vagas-coletadas.json` e responde:

- **aderência média** — quanto do que o mercado pede já está escrito no CV;
- **lacunas ranqueadas** — os termos mais pedidos que o CV não menciona,
  ordenados por número de vagas.

O vocabulário fica em `ferramentas/lib/termos-mercado.js`: é **dado
editável**, não código. Para a ferramenta enxergar uma tecnologia nova, basta
acrescentar o termo lá.

### Por que é uma cópia adaptada, e não o original

O `aderencia.js` do `vagas-automation-suite` depende de Prisma, do banco
`coleta.db` e — por importar o filtro de área — de toda a cadeia de provedores
de IA com suas chaves. Nada disso é necessário para comparar texto com texto.
Esta versão troca o banco por um snapshot JSON e copia isolada a única função
de que precisava do filtro (`termoBateNoTexto`, regex pura, em
`ferramentas/lib/texto.js`), de modo que o repositório rode sozinho.

**Consequência:** `ferramentas/lib/termos-mercado.js` e o `core/termos-mercado.js`
da suite são cópias e **podem divergir**. Ao acrescentar termos, atualize os
dois — ou trate este como o canônico e copie para lá.

### Atualizando o snapshot de vagas

O snapshot é uma foto do `coleta.db` da suite. Para regerá-lo depois de uma
nova coleta:

```bash
node -e "
const {DatabaseSync}=require('node:sqlite'), fs=require('fs');
const db=new DatabaseSync('../vagas-automation-suite/coleta.db',{readOnly:true});
fs.writeFileSync('dados/vagas-coletadas.json', JSON.stringify(
  db.prepare('SELECT titulo, categoria, plataforma, empresa, senioridade, descricaoResumo, requisitos FROM Vaga WHERE ativa = 1').all(), null, 1));
"
```

## Sincronia do `cv.txt` com os bots

Os bots de automação leem o CV em runtime, em `bots/infojobs/cv.txt` e
`bots/vagas/cv.txt` dentro do `vagas-automation-suite`. Por isso o arquivo
existe nos dois lugares.

**Este repositório é a fonte de verdade.** Ao editar o CV aqui, copie de volta:

```bash
cp cv/cv.txt ../vagas-automation-suite/bots/infojobs/cv.txt
cp cv/cv.txt ../vagas-automation-suite/bots/vagas/cv.txt
```

## Estado atual (2026-07-30)

- `cv/cv.txt` e `cv/cv-2026-07.html` estão na revisão nova, com as seções de
  IA & LLM, Processamento de Sinais, Ecossistema Python, Segurança Aplicada e
  o portfólio de 7 projetos freelance.
- `cv/cv.pdf` **ainda é o PDF antigo** — precisa ser regerado a partir do HTML
  (botão *Imprimir / PDF*).
- Medição no mesmo vocabulário de 379 termos:

  | | termos no CV | aderência média | lacunas |
  |---|---|---|---|
  | CV antigo | 57 | 33% | 96 |
  | CV novo | 216 | 45% | 68 |

  Fecharam com o inventário: Git, React, TypeScript. Continuam abertas e são
  lacuna real de conhecimento (não de redação): Azure, SQL Server, DAX,
  C#/.NET, LGPD, Excel avançado, SAP, ITIL.
