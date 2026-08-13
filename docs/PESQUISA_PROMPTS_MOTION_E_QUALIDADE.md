# Pesquisa — a origem dos "prompts de qualidade" que circulam na internet

**Data:** 2026-08-13 · **Pedido:** Carlos

Carlos trouxe dois prompts que viu circulando na internet (prints de tela) e
perguntou: **de onde vêm essas dicas (livros, cursos), em que se baseiam, e o
que vale aprender delas que ainda não está no currículo.**

Este documento guarda a pergunta, os dois textos como foram recebidos, a
pesquisa de origem, a crítica dos prompts e o cruzamento com o currículo real —
para consulta futura, sem depender de reabrir a conversa.

---

## Os dois prompts, como foram recebidos

> **2. Prompt:**
> Utilize a Skill Motion Principles GitHub.com/kylezantos/design-principles e
> garanta que toda interface do sistema tem skeleton, lazyloading, smooth
> animation de entrada, saída, carregamento, progresso em todos os elementos.

> **3. Prompt:**
> Garanta que o sistema tenha: Observabilidade (Sentry, Datadog, NewRelic, Open
> Telemetry) Qualidade e Lint de Código (Arch-contract, Biome, Comilint, Knip,
> Stryke) Testes unitários e integração e end-to-end (Codecov, Playwright)

Transcrição com os erros do original preservados: `Comilint` é **commitlint**,
`Stryke` é **Stryker**, e `design-principles` é o nome errado do repositório
(ver abaixo).

---

## 1. A fonte do Prompt 2 está com o nome errado

`kylezantos/design-principles` **não existe**. O repositório real é
**`kylezantos/design-motion-principles`** — uma skill de motion design com dois
modos: **criar** componentes com movimento, e **auditar** animação existente.

E o ponto mais importante: **não é uma biblioteca de princípios.** É uma síntese
de três autores que discordam entre si de propósito, e o valor está em escolher
qual pesa mais no contexto:

| Lente | Filosofia | Pergunta-guia |
|---|---|---|
| **Emil Kowalski** — autor do Sonner e do Vaul, curso `animations.dev` | Contenção e velocidade | "Isso deveria animar?" |
| **Jakub Krehel** — `krehel.com` | Polimento de produto em produção | "Está sutil o bastante?" |
| **Jhey Tompkins** — `jhey.dev`, @jh3yy | Experimentação criativa | "No que isso poderia virar?" |

A skill traz um **"anti-slop checklist"** que marca como defeito exatamente:
*fade-ins uniformes*, *animação no mount de conteúdo estático* e *`ease` puro sem
curva declarada*. Guardar isso para a seção 4.

---

## 2. De onde vem, de verdade, o Prompt 2 (motion, skeleton, lazy)

Não é invenção de 2025. É uma linhagem de ~55 anos, e ela se divide em **duas
raízes que o prompt mistura sem perceber**.

### Raiz A — estética do movimento (animação clássica → web)

- **"The Illusion of Life"** (Frank Thomas & Ollie Johnston, Disney, 1981) — os
  12 princípios da animação: antecipação, follow-through, slow in/slow out,
  staging. Tudo que hoje se chama "smooth animation" é derivado disso.
- **Val Head, "Designing Interface Animation"** (Rosenfeld Media, 2016) e
  **Rachel Nabors, "Animation at Work"** (A Book Apart, 2017) — a tradução dos
  12 princípios para interface. O trabalho da Val Head sobre **desordem
  vestibular** é a origem da media query `prefers-reduced-motion` e do critério
  **WCAG 2.1 SC 2.3.3 (Animation from Interactions)**.
- **Material Design Motion** (Google) e **"Designing Fluid Interfaces"**
  (Apple, WWDC 2018) — os dois documentos que fixaram durações (200–300 ms),
  curvas de easing e a ideia de **animação interruptível baseada em física**
  (spring), que é o que Framer Motion implementa.

### Raiz B — percepção de tempo (psicologia experimental → performance)

- **Miller (1968)**, *Response time in man-computer conversational
  transactions* → os três limites: **0,1 s** (parece instantâneo), **1 s** (o
  pensamento não quebra), **10 s** (o usuário desiste). Popularizado por
  **Jakob Nielsen, "Usability Engineering"** (1993).
- **Doherty & Thadani (IBM, 1982)**, *The Economic Value of Rapid Response
  Time* → o **limiar de 400 ms**, onde a produtividade do operador dispara.
- **Luke Wroblewski (2013)**, *Mobile Design Details: Avoid the Spinner* → é
  aqui que nasce o termo **skeleton screen**. A tese não é estética: um spinner
  comunica *espera indefinida*, um esqueleto comunica *estrutura chegando*.
- **RAIL** (equipe do Chrome, 2015) → o orçamento de engenharia: **100 ms** para
  responder a input, **10 ms por frame** de animação, **1000 ms** para carregar.
  Evoluiu para os **Core Web Vitals / INP**, e é daí que saem `loading="lazy"`,
  `React.lazy`/Suspense e code-splitting.

### A síntese que vale levar

Skeleton, lazy loading e animação não são estilo — são **as três respostas de
engenharia para três faixas de tempo diferentes**:

| Faixa | O certo | Por quê |
|---|---|---|
| < ~200 ms | não mostrar nada | qualquer feedback vira flicker |
| ~200 ms – 1 s | skeleton | comunica estrutura, não espera |
| > 1 s | indicador de progresso **real** | indeterminado quebra a confiança |

---

## 3. De onde vem o Prompt 3 (observabilidade, lint, testes)

É praticamente o índice de quatro livros.

### Observabilidade

- O termo vem de **teoria de controle**: **Rudolf Kálmán (1960)** — um sistema é
  observável se dá para inferir seu estado interno só pelas saídas.
- **"Dapper"** (Google, 2010) — o paper que inventou tracing distribuído.
  OpenTelemetry é neto direto dele (fusão do OpenTracing com o OpenCensus,
  CNCF 2019).
- **"Site Reliability Engineering"** (Google, 2016) — os **Four Golden Signals**
  (latência, tráfego, erros, saturação) e, sobretudo, **SLI / SLO / error
  budget**. Complementado por **"Implementing Service Level Objectives"**
  (Alex Hidalgo, 2020).
- **"Observability Engineering"** (Majors, Fong-Jones & Miranda, O'Reilly,
  2022) — a tese central: *monitoramento responde perguntas que você previu;
  observabilidade responde perguntas que você não previu*. Daí eventos
  estruturados de alta cardinalidade, e não só métricas agregadas.
- Métodos práticos: **USE** (Brendan Gregg, recursos) e **RED** (Tom Wilkie,
  serviços). Os "três pilares" (log/métrica/trace) vêm de um post do **Peter
  Bourgon (2017)** — hoje considerado uma simplificação ruim, inclusive pela
  própria Majors.

### Lint, formatação e contrato de arquitetura

- **`lint`** é de 1978 — Stephen C. Johnson, Bell Labs, para C.
- "Formatação não é assunto de opinião" vem do **gofmt** (Rob Pike: *"o estilo do
  gofmt não é o favorito de ninguém, mas o gofmt é o favorito de todo mundo"*)
  → **Prettier** (2017) → **Biome** (Prettier + ESLint reescritos em Rust).
- **commitlint / Conventional Commits** vem da convenção de commit do
  **AngularJS (2014)**, que existia para gerar CHANGELOG automático, e casa com
  **SemVer**. Não é burocracia: é a entrada de um pipeline de release.
- **"Arch-contract" não existe com esse nome.** O que existe é a família
  **ArchUnit** (Java) / **ArchUnitTS** / **eslint-plugin-boundaries** /
  **pytest-archon** / **dependency-cruiser**. O conceito é **"fitness
  function"**, de **"Building Evolutionary Architectures"** (Ford, Parsons &
  Kua, 2017), aplicado sobre a **Dependency Rule** do *Clean Architecture*
  (Martin, 2017) e a arquitetura hexagonal (Cockburn, 2005). Em uma frase:
  **transformar decisão de arquitetura em teste que quebra o build**.
- **Knip** é eliminação de código morto — mesma linhagem de tree-shaking de
  compilador.

### Testes

- **Pirâmide de testes** — Mike Cohn, *"Succeeding with Agile"* (2009),
  refinada por Martin Fowler e Ham Vocke (*The Practical Test Pyramid*, 2018).
- **Testing Trophy** — Kent C. Dodds (2018), que inverte a pirâmide em favor de
  integração. É esse modelo, não a pirâmide, que justifica o "unitários +
  integração + e2e" do prompt.
- **"Software Engineering at Google"** (2020) — testes small/medium/large,
  testes herméticos, Beyoncé Rule.
- **Cobertura (Codecov)**: o texto canônico é **Fowler, *TestCoverage* (2012)**
  — *cobertura serve para achar código não testado, nunca como meta*. Virar meta
  é lei de Goodhart.
- **Mutation testing (Stryker)** é a resposta séria a isso: **DeMillo, Lipton &
  Sayward (1978)**, *Hints on Test Data Selection*. Injeta defeitos no código e
  mede quantos a suíte **pega**. Google publicou o uso em escala em 2018
  (Petrović & Ivanković, ICSE-SEIP).
- **Playwright**: Selenium (2004) → WebDriver → Puppeteer → Playwright
  (Microsoft, feito pelos mesmos autores do Puppeteer).
- O guarda-chuva de tudo: **"Continuous Delivery"** (Humble & Farley, 2010) e
  **"Accelerate"** (Forsgren, Humble & Kim, 2018). Este último é a evidência
  *empírica* (DORA) de que automação de teste, CI e monitoramento predizem
  desempenho de entrega — é o livro que transforma o Prompt 3 de checklist de
  ferramenta em argumento.

---

## 4. O defeito dos dois prompts

Os dois têm o mesmo vício: **listam ferramentas em vez de critérios**, e por
isso pedem coisas que os próprios autores originais chamariam de erro.

**Prompt 2** — "skeleton, lazy loading e animação em **todos** os elementos":

- Contradiz a lente do Emil Kowalski, que é a pergunta *"isso deveria
  animar?"*. Animar tudo é o anti-padrão que a própria skill detecta.
- Lazy loading em tudo **piora** o LCP: a imagem principal acima da dobra nunca
  pode ser lazy.
- Skeleton em resposta de 80 ms produz flicker — fica pior que não ter nada.
- Não menciona `prefers-reduced-motion`, que é o único item da lista que é
  **obrigação de acessibilidade**, não escolha estética.

**Prompt 3** — "Sentry, Datadog, NewRelic, OpenTelemetry":

- São **três backends de APM concorrentes** mais a camada de instrumentação. A
  leitura correta do cânone é: **OTel instrumenta, e você escolhe UM backend**.
  Mandar tudo para três é custo triplicado e três versões da verdade.
- Nenhuma dessas ferramentas *é* observabilidade. Sem SLI/SLO definidos, é
  dashboard caro.
- Pedir Codecov **e** Stryker na mesma frase sem hierarquia é o erro que o
  Fowler alerta: cobertura vira meta. O certo é: cobertura acha buraco,
  mutação mede qualidade.

Isso encaixa na régua que já vale neste repositório: **medir o efeito, não a
intenção**. Os prompts medem intenção (ferramenta instalada).

---

## 5. Cruzamento com o currículo real

Termos checados diretamente contra `cv/mestre.json`, antes das mudanças desta
sessão:

| Área | Já tinha | Não tinha |
|---|---|---|
| Observabilidade | Zabbix (19x), Nagios, NOC, Sentry, pino, healthcheck, MTTD −40%, 99,99% uptime, DR | OpenTelemetry, Grafana, Prometheus, Datadog, New Relic, **SLO/SLI**, tracing distribuído |
| Testes | pytest, PHPUnit, Cypress, Vitest, node:test, Locust, SIPp, mypy/black/flake8, "cobertura de testes" | Codecov e gate de cobertura, **mutation testing**, BDD, Selenium, **Playwright como ferramenta de teste** |
| Lint / commits | black, flake8, mypy, Pint (Laravel) | **ESLint/Biome/Prettier** (nada no lado JS/TS), commitlint, Conventional Commits, Knip, SonarQube |
| Arquitetura | Strategy com 5 drivers atrás de interface, multi-tenancy, RBAC | **fitness function / ArchUnit**, "clean architecture" como termo |
| Frontend | React 18, TS, Next.js, Tailwind, Radix, shadcn, "design system com tokens" | **acessibilidade, WCAG, a11y, prefers-reduced-motion, Lighthouse, Core Web Vitals, skeleton, lazy, Storybook, Figma** — tudo zero |

### O que vale aprender, em ordem de retorno

**Nível 1 — trabalho já feito, só não nomeado (custo ≈ zero).**
*Aplicado nesta sessão — ver seção 6.*

1. **SLI / SLO / Four Golden Signals.** *"99,99% de uptime"*, *"MTTD −40% com
   novos templates de observabilidade"* e *"DR para 100+ clientes"* são trabalho
   de SRE escrito em português de NOC. Renomear custa nada.
2. **Playwright como ferramenta de teste.** Já estava no CV, mas só como scraper
   do `email_cleanup_bot`. O mercado pede Playwright em 2 vagas de QA.
3. **Code review, documentação técnica e versionamento.** Pedidos em 3 a 5 vagas
   cada nos perfis dev/frontend/devops e ausentes do CV — sendo que a
   `painel-git` tem fluxo de pull request completo (`lib/pr.php`: `create_pr`,
   `approve_pr`, `comment_pr`, `merge_pr`, `pr_compute_diff`) e política de
   branch aplicada por hook (`lib/policy.php`).

**Nível 2 — aprendizado real, barato, com laboratório disponível.**

4. **OpenTelemetry + Grafana/Prometheus.** É a lacuna genuína: o monitoramento é
   da era de infra (Zabbix = métrica de host), não da era de aplicação (trace
   correlacionado). O caso perfeito já existe: uma chamada que atravessa painel
   → motor de discagem → Asterisk → webhook é um trace distribuído de manual.
   Grafana aparece como lacuna em 2 vagas; **Datadog e New Relic não aparecem em
   nenhuma** — não gastar dinheiro com eles.
5. **Conventional Commits + commitlint + CHANGELOG automático.** 30+
   repositórios e uma plataforma Git própria com política auto-aplicada — dá
   para **impor no servidor**, o que quase ninguém pode dizer em entrevista.
6. **Biome (ou ESLint + Prettier) no lado JS/TS.** Há lint e tipagem estática em
   Python e em Laravel, e nada em React/TS. Assimetria visível em code review.

**Nível 3 — raro, vira diferencial.**

7. **Mutation testing** (Stryker para JS/TS, `mutmut`/`cosmic-ray` para Python).
   Hoje "716 + 218 + 121 testes" é afirmação não verificável. Com mutation score
   vira medida: *"minha suíte pega X% dos defeitos injetados"*.
8. **Fitness function de arquitetura.** O caso ideal já existe: os 5 drivers de
   WhatsApp atrás de `WhatsAppDriverInterface` no `conversio`. Um teste que
   quebra o build se a camada de aplicação importar um driver concreto é a
   versão executável do padrão Strategy que o CV já declara.

**Nível 4 — o buraco mais visível contra a própria alegação.**

9. **Acessibilidade (WCAG, a11y, `prefers-reduced-motion`).** O CV se apresenta
   como *"Desenvolvedor Frontend Sênior"* e tem **zero** menção a
   acessibilidade. É o único item onde a alegação de senioridade é **checável e
   falharia**. Tem base legal no Brasil (LBI 13.146/2015; eMAG no setor
   público) — mesma família da lacuna de LGPD já mapeada no
   [CV_ESTRATEGIA.md](CV_ESTRATEGIA.md).
10. **Core Web Vitals / INP / Lighthouse.** É o conteúdo de engenharia por trás
    de "skeleton e lazy". A SPA vanilla com canvas desenhando forma de onda, e
    jobs de análise que demoram minutos, são o estudo de caso literal.

### A calibragem honesta

Cruzando os dois prompts com os relatórios de aderência de 04/08: **nenhum** dos
termos citados (Sentry, Datadog, NewRelic, OTel, Biome, commitlint, Knip,
Stryker, Codecov) aparece nas vagas coletadas. O que essas vagas de
InfoJobs/Vagas.com.br pedem e falta é outra coisa: **Azure (8), SQL Server (7),
C# (4), .NET (3), Totvs/Protheus (6/5), SAP (4)**.

- Alvo **CLT via InfoJobs/Vagas.com.br** → esses dois prompts movem quase nada;
  o que move é AZ-900 e o ecossistema Microsoft, como o `CV_ESTRATEGIA.md` já
  concluiu.
- Alvo **freelance/PJ, remoto ou internacional** → esses dois prompts são
  exatamente a régua usada, e os itens 4, 7, 8 e 9 são o que separa "faz sistema
  que funciona" de "faz sistema que outra pessoa consegue operar".

Os dois caminhos são legítimos. Não são o mesmo investimento.

---

## 6. O que foi aplicado no currículo nesta sessão

Só o **Nível 1** — o que já era verdade e só não estava escrito. Nada de
Nível 2, 3 ou 4 entrou: seria declarar competência que não existe.

| Onde | Mudança |
|---|---|
| `resumos.devops` | "tempo médio de detecção" → **MTTD**; "garanti 99,99% de uptime" → **objetivo de disponibilidade (SLO) de 99,99%** |
| `resumos.qa` | acrescenta **automação de navegador com Playwright e Puppeteer** e o fluxo de **code review por pull request** |
| `resumos.dev` | acrescenta **versionamento e code review por pull request** e **documentação técnica versionada junto do código** |
| `conquistas.uptime` | "garanti 99,99% de uptime" → **cumpri o objetivo de disponibilidade (SLO) de 99,99%** |
| `competencias.cloud` | item de observabilidade ganha "templates próprios de coleta"; item novo: **SLI/SLO com MTTD como métrica de operação** |
| `competencias.desenvolvimento` | Git sai do item genérico e vira dois itens: **versionamento com code review por PR, política de branch por hook e migrations versionadas**, e **documentação técnica (runbooks, manuais, documentos de arquitetura e lições aprendidas)** |
| `competencias.qa` | Cypress ganha **Playwright e Puppeteer**; item novo de **code review por PR, política de branch e histórico auditável** |
| `projetos.painel-git` | bullet novo em `base` e `dev` sobre o fluxo de code review; **variante `qa` nova** com PR, política por hook e PHPUnit |
| `perfis/qa.json` | `painel-git` entra na lista de projetos, para sustentar a afirmação de code review no currículo de QA |

### Efeito medido

Linha de base gerada a partir do HEAD em worktree separado, contra o **mesmo
snapshot** de 1.129 vagas — a diferença é atribuível só a esta edição:

| Perfil | Antes | Depois | Δ | Lacunas fechadas |
|---|---|---|---|---|
| `dev` | 53% | **66%** | +13 | documentação técnica, versionamento, code review |
| `frontend` | 62% | **72%** | +10 | versionamento, documentação técnica, code review |
| `seguranca` | 28% | **38%** | +10 | versionamento, documentação técnica |
| `devops` | 46% | **50%** | +4 | versionamento, documentação técnica |
| `dados` | 64% | **67%** | +3 | versionamento |
| `qa` | 56% | **58%** | +2 | playwright, versionamento |
| `ia` | 55% | **57%** | +2 | versionamento |
| `rpa` | 62% | **64%** | +2 | versionamento |
| `voip` | — | — | — | sem vagas coletadas no alvo, segue não mensurável |

102 testes continuam passando.

O que isso diz e o que não diz: o salto é grande porque três termos de alta
frequência estavam ausentes por **omissão de escrita**, não por falta de
competência. Não houve ganho de capacidade nenhum — só o CV parou de esconder o
que já existia.

---

## 7. Em aberto

- ~~**Code review nos empregos formais.**~~ **Resolvido em 13/08:** Carlos
  confirmou que havia code review formal na `elev` e na `tw-solutions`, e os
  bullets foram escritos nas duas. A aderência **não** se moveu com isso — a
  ferramenta conta presença de termo, e "code review" já tinha entrado pela
  competência. O que mudou é a evidência: quem lê o CV agora vê *onde* a prática
  aconteceu. Lembrete de que o número mede palavra-chave, não candidatura.
- Nenhum item de Nível 2, 3 ou 4 foi para o CV. Cada um deles exige fazer o
  trabalho antes: instrumentar um projeto com OTel, rodar mutation testing numa
  suíte real, escrever uma fitness function, auditar acessibilidade.
- A ordem sugerida, se for atrás disso: **OTel no discador** (maior retorno, tem
  laboratório) → **mutation testing no motor de RPA** (716 testes prontos, é só
  medir) → **acessibilidade** (fecha o buraco do perfil frontend).

---

## Fontes

- [kylezantos/design-motion-principles](https://github.com/kylezantos/design-motion-principles)
  — o repositório real da skill do Prompt 2
- [ArchUnitTS](https://github.com/LukasNiessen/ArchUnitTS) ·
  [eslint-plugin-boundaries](https://www.npmjs.com/package/eslint-plugin-boundaries) ·
  [pytest-archon](https://pypi.org/project/pytest-archon/) ·
  [go-arch-lint](https://github.com/fe3dback/go-arch-lint) — o que existe de
  verdade no lugar do inexistente "arch-contract"
- Documentos deste repositório: [CV_ESTRATEGIA.md](CV_ESTRATEGIA.md),
  [DIARIO.md](DIARIO.md), `cv/mestre.json`, `aderencia/2026-08-13-*.md`
