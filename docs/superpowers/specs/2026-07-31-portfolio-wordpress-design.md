# Portfólio técnico publicado no WordPress — design

**Data:** 2026-07-31
**Repositório:** `curriculo` (branch `main`, commit direto — ver `docs/DIARIO.md`)
**Site alvo:** https://carloslopes.programandosolucoes.com.br/

## Objetivo

Publicar um portfólio dos 12 projetos técnicos do usuário no WordPress dele,
com descrição, funcionalidades, stack e imagens de cada um, e com link HTTP
para o repositório privado — link que o próprio painel Git nega a quem não
tem credencial, forçando o contato.

## Decisões do usuário (2026-07-31)

| Decisão | Escolha |
|---|---|
| Alvo | Menu próprio de portfólio cobrindo frontend **e** backend |
| Curadoria | Os 7 projetos freelance consolidados + os 5 secundários = **12** |
| Sigilo | Pode citar nome de cliente e detalhe técnico (ver "Risco aceito") |
| Imagens | Subir os projetos em Docker e capturar prints reais com Playwright |
| Publicação | Página WordPress com HTML próprio, via WP-CLI |
| Estrutura | `Portfólio > Frontend / Backend` + uma página por projeto |
| Portão do repositório | Link HTTP direto; o painel nega quem não tem credencial |

## Estado do ambiente (verificado, não presumido)

- **WordPress** em `~/domains/carloslopes.programandosolucoes.com.br/public_html/`,
  no **mesmo Hostinger e mesma conta SSH** do painel Git
  (`ssh -p 65002 u560021660@git.programandosolucoes.com.br`).
- Tema **Newsup** (Themeansar), Gutenberg puro. Elementor e Elementor Pro
  estão instalados mas **não são usados** por este design.
- **WP-CLI disponível** no servidor em `/usr/local/bin/wp`. UpdraftPlus
  instalado (usado para o backup pré-publicação).
- **Smart HTTP com Basic Auth já existe** no painel Git
  (`git-server.php`) — nada precisa ser construído para o portão.
- **Acesso de convidado** (`lib/guest.php`) é opt-in triplo: exige
  `guest_enabled` + IP autorizado + repositório marcado público. Não vaza
  por padrão. **Verificar o estado real em produção antes de publicar.**
- **32 repositórios** no painel. Quatro projetos do portfólio não têm
  repositório lá — tratado em "Projetos sem repositório".

## Os 12 projetos

Os sete primeiros já existem em `cv/mestre.json`; os cinco últimos são
acrescentados por este trabalho.

| # | `id` | Projeto | Áreas | Repositório |
|---|---|---|---|---|
| 1 | `discador` | Plataforma de Discador VoIP para Call Center | backend, frontend, infra | `painel-discador.git` |
| 2 | `omnichannel` | Plataforma de Atendimento Omnichannel Multi-tenant | backend, frontend | `conversio.git`, `zib.git` |
| 3 | `pedagio` | Retaguarda de Pedágio Eletrônico (SLT) | backend | `slt.git` |
| 4 | `analise-audio` | Análise de Qualidade de Chamadas por DSP | backend, frontend, ia | `analisador-chamadas.git` |
| 5 | `sipproxy` | SIP Proxy e SBC para FusionPBX | backend, infra | `sipproxy-fusionpbx.git` |
| 6 | `rpa` | Motor de Automação Autônoma de Interação Web | backend, ia | `vagas-automation-suite.git` |
| 7 | `painel-git` | Plataforma Própria de Hospedagem Git | backend, frontend, infra | `painel-git.git` |
| 8 | `evoluai` | Plataforma de Análise de Interações com IA (EvoluAI v2) | frontend, backend, ia | — (ver abaixo) |
| 9 | `email-cleanup` | Bot Autônomo de Limpeza de Caixa Postal | backend, ia | `email_cleanup_bot.git` |
| 10 | `asterisk-lab` | Laboratório de Asterisk como Media Server | infra, backend | `asterisk-media-server-lab.git` |
| 11 | `vitalpbx-whatsapp` | WhatsApp Calling da Meta integrado a PBX | backend, infra | `vitalpbx-whatsapp-calling.git` |
| 12 | `pfsense-api` | Correções na API REST de firewall pfSense | backend, infra | **card aberto**, sem repo privado |

**Regra das áreas:** `frontend` e `backend` decidem em qual índice o projeto
aparece, e todo projeto precisa de pelo menos um dos dois. `infra` e `ia` são
rótulos adicionais — viram chip na página, não criam item de menu. Um projeto
com as duas áreas principais aparece nos dois índices, com uma única página
de detalhe.

## Arquitetura

### Fonte única de verdade

`cv/mestre.json` continua sendo o único lugar onde fatos são escritos. O
array `projetos` cresce de 7 para 12 e cada projeto ganha campos que o CV
não usa e o portfólio usa:

```jsonc
{
  "id": "painel-git",
  "nome": "Plataforma Própria de Hospedagem Git",
  "contexto": "projeto próprio/freelance",
  "periodo": "08/2025 - atual",
  "bullets": { /* já existe, consumido pelos 9 CVs */ },

  // novos, exclusivos do portfólio:
  "areas": ["backend", "frontend", "infra"],
  "resumo": "Uma linha, aparece no card do índice.",
  "problema": "O que existia antes e por que não servia.",
  "arquitetura": "Como foi resolvido, em 2-3 parágrafos.",
  "resultado": "O que passou a ser possível. Números quando houver.",
  "stack": ["PHP 8.2", "WebDAV", "AES-256-GCM", "HMAC"],
  "duracao": "9-11 meses",
  "repo": "painel-git.git",        // ou null
  "imagens": [
    { "arquivo": "painel-git-01-repos.png", "legenda": "Lista de repositórios" }
  ]
}
```

Os 9 CVs continuam lendo o mesmo arquivo e ignoram os campos novos. Nenhum
fato pode divergir entre CV e portfólio porque só existe uma cópia dele.

O conteúdo de `problema`/`arquitetura`/`resultado` é **derivado do
inventário já apurado** em `docs/CV_ESTRATEGIA.md` (seções "Os 7 projetos
freelance consolidados", "Inventário técnico dos demais projetos" e
"Projetos secundários"), não escrito do zero.

### Gerador

`ferramentas/gerar-portfolio.js`, irmão de `gerar-cv.js`:

- Lê `cv/mestre.json` e `portfolio/config.json` (rótulos, ordem, textos fixos).
- Produz em `portfolio/build/`: `frontend.html`, `backend.html` e
  `projeto-<id>.html` (12 arquivos).
- **Node puro, sem `npm install`** — mesma restrição do resto do repositório.
- Cada arquivo é um fragmento HTML com CSS embutido e escopado em `.pf-*`,
  destinado a um bloco `core/html` do Gutenberg. Sem `<html>`, `<head>` ou
  `<body>`: o tema Newsup fornece a moldura.
- Um projeto com `areas` contendo `frontend` e `backend` aparece nos dois
  índices; a página de detalhe é uma só.

### Publicador

`ferramentas/publicar-wp.sh`, executado da máquina local via SSH:

1. **Backup**: dispara o UpdraftPlus por WP-CLI e exporta as páginas atuais
   (`wp export`) antes de qualquer escrita.
2. **Mídia**: `wp media import` das imagens de `portfolio/img/`, guardando o
   mapa `arquivo → URL` para o gerador reescrever os `src`.
3. **Páginas**: para cada uma das 14 páginas, `wp post create` na primeira vez
   e `wp post update` nas seguintes, casadas pelo `post_name` (slug).
   **Idempotente**: rodar de novo atualiza, não duplica.
4. **Menu**: `wp menu item add-post` cria `Portfólio` com os filhos
   `Frontend` e `Backend`. As páginas de projeto ficam fora do menu,
   alcançadas pelos cards.
5. **Cache**: `wp litespeed-purge all` ao final (LiteSpeed Cache está ativo).

Cada comando remoto executado fica registrado em `docs/DIARIO.md`, conforme
a prática já adotada no repositório.

### Estrutura publicada

```
Menu:  Home | Portfólio ▾ | Certificados | Graduações | ...
                 ├─ Frontend   → /portfolio-frontend
                 └─ Backend    → /portfolio-backend

/portfolio-frontend   índice em grade, só projetos com areas ⊇ frontend
/portfolio-backend    índice em grade, só projetos com areas ⊇ backend
/portfolio/<id>       12 páginas de detalhe
```

### Anatomia da página de projeto

Título · uma linha do que é · o que faz e para quem · problema → arquitetura
→ resultado · chips de stack · período e duração · galeria de imagens com
legenda · bloco do repositório · contato.

O bloco do repositório mostra a URL e o comando pronto para copiar:

```
git clone https://git.programandosolucoes.com.br/git/repos/<repo>.git
```

com a nota: *código-fonte privado, credenciais sob solicitação*. Quem não
tem credencial recebe o 401 do próprio painel. Nada de novo é construído
para isso e `git-server.php` **não é alterado**.

## Imagens

O usuário pediu prints reais, subindo os projetos em Docker. Nem todos
sobem, então a captura é organizada em faixas, com escada de fallback:
**print de UI real > captura de terminal/saída > diagrama de arquitetura**.
Nenhum card fica sem imagem.

As faixas classificam **fontes de captura, não projetos**. Um mesmo projeto
pode ter imagens de faixas diferentes: o `discador` recebe print real do
painel (faixa A) e diagrama do motor de discagem (faixa C), porque o motor
depende de Asterisk e tronco para funcionar.

### Faixa A — já no ar, captura imediata

| Projeto | Onde |
|---|---|
| painel-git | produção, `https://git.programandosolucoes.com.br/git/` |
| Análise de chamadas | LXC 604 + harness `post-linkedin-analisador` (tenant fictício e PBX mockado, feito exatamente para isto) |
| painel-discador | LXC 604, porta 5000 |

### Faixa B — sobe local, o grosso do trabalho

conversio (Laravel), zib (Vite/React 18), EvoluAI v2 (Bun/Next),
ivr-flow-designer, vagas-automation-suite (painel web), SLT (Swagger UI do
FastAPI), sipproxy-fusionpbx (painel Flask + Kamailio).

### Faixa C — não sobe sozinho, fallback

| Projeto | Motivo | Substituto |
|---|---|---|
| vitalpbx-whatsapp-calling | exige PBX real + Meta Graph API | diagrama |
| motordediscagem | exige Asterisk + tronco | diagrama |
| email_cleanup_bot | CLI, sem UI | captura de terminal |
| asterisk-media-server-lab | a saída é SIPp/terminal | captura de terminal |
| pfsense-restapi-fixes | documentação mkdocs | print do mkdocs servido |

### Regras de captura

- Playwright **sempre headless**, e fechar o browser ao terminar.
- Viewport fixo 1440×900, tema claro, para as imagens ficarem coerentes.
- Imagens versionadas em `portfolio/img/<id>-NN-<slug>.png`.
- Playwright **não** entra no contrato "roda sem `npm install`": a captura é
  passo manual e ocasional; gerar e publicar consomem só os PNG commitados.

## Projetos sem repositório no painel — resolvido em 2026-07-31

| Projeto | Situação | Decisão |
|---|---|---|
| asterisk-media-server-lab | só local, 17 commits | **criado e publicado** (`asterisk-media-server-lab.git`, HEAD `master`) |
| vitalpbx-whatsapp-calling | sem `.git`, 3 arquivos de documentação | **criado e publicado** (`vitalpbx-whatsapp-calling.git`, HEAD `main`, commit inicial) |
| pfsense-restapi-fixes | fork de terceiros | **card aberto, sem repo privado** — ver abaixo |
| EvoluAI v2 | repo da Apex no GitHub | **sem link** — não é do usuário para expor; o card informa "código proprietário do cliente" |

### O caso do pfSense

`pfsense-restapi-fixes` é um fork do `pfrest/pfSense-pkg-RESTAPI` (Apache
2.0, 3052 commits de terceiros). A autoria do usuário são 5 commits, sendo
um o fix técnico — `550f8750 Fix false conflict when creating DHCP static
mapping inside primary pool`, 4 arquivos e 94 linhas, com o teste do upstream
ajustado junto.

Espelhar o fork inteiro num repositório privado seria hospedar código alheio
e pôr cadeado em cima de código público. **Decisão do usuário (2026-07-31):
este card é aberto** — aponta para o projeto upstream público e exibe o diff
na própria página. O contraste com os demais cards é intencional e vira
argumento: ler uma base de três mil commits, identificar um falso positivo e
corrigir ajustando o teste.

### Comandos executados no servidor (registro)

```bash
# criação dos bare repos, com HEAD casando a branch local (evita o bug de
# "remote HEAD refers to nonexistent ref" já visto em outros repos do painel)
ssh -p 65002 u560021660@git.programandosolucoes.com.br \
  'cd ~/domains/git.programandosolucoes.com.br/public_html/git/repos && \
   git init --bare --initial-branch=master asterisk-media-server-lab.git && \
   git init --bare --initial-branch=main   vitalpbx-whatsapp-calling.git'

# push local (ssh:// carrega a porta 65002)
git push -u origin master   # asterisk-media-server-lab
git push -u origin main     # vitalpbx-whatsapp-calling
```

Não foi preciso registrar permissão: `can_access_repo()` em `lib/auth.php`
dá acesso total ao `admin_user` e nega todo o resto por ausência de entrada
em `permissions.json` — exatamente o comportamento que o portfólio quer.

### Portão verificado na prática

```
GET /git/repos/asterisk-media-server-lab.git/info/refs?service=git-upload-pack
→ HTTP 401, WWW-Authenticate: Basic realm="Git Server Access"
```

Vale para as duas formas de URL aceitas pelo `.htaccess`
(`/git/<repo>.git` e `/git/repos/<repo>.git`). **Falta verificar o caminho
positivo** — clone com credencial válida — o que exige a senha e fica como
verificação manual do usuário.

## Riscos e restrições

1. **A faixa B é a maior parte do esforço.** O site pode ir ao ar com a
   faixa A e os projetos que subirem de primeira; o publicador é idempotente,
   então republicar depois é barato. Sem captura completa não há bloqueio.
2. **Risco aceito — dados em prints.** O usuário autorizou citar clientes e
   detalhe técnico; esta decisão é dele e está registrada. Distinção que
   permanece válida: nomear cliente é uma coisa, exibir nome, telefone ou
   gravação de terceiro num print é LGPD. Onde houver dado pessoal real, usar
   fixture (já existe no `post-linkedin-analisador`) ou mascarar.
3. **Editar a página no WordPress é perdido** na próxima publicação. A regra
   passa a ser: conteúdo muda em `cv/mestre.json`.
4. **Produção não é working tree.** Vale para o painel Git e vale aqui: toda
   escrita no site é por WP-CLI/SSH, com backup antes.
5. **Nada é publicado sem OK explícito no momento da publicação**, conforme a
   política de merge/deploy do usuário.

## Fora de escopo

- Alterar `git-server.php` ou qualquer código do painel Git.
- Ligar acesso de convidado a qualquer repositório.
- Formulário de contato novo: os canais já existentes no site (WhatsApp,
  e-mail, LinkedIn) são reaproveitados.
- Traduzir o portfólio (o WPGlobus está instalado, mas fica para depois).
- Mexer nos 9 CVs gerados ou na ferramenta de aderência.

## Critérios de conclusão

- `node ferramentas/gerar-portfolio.js` roda em clone limpo, sem
  `npm install`, e produz 14 arquivos.
- As duas páginas de índice e as 12 de projeto existem no ar, com o menu
  `Portfólio > Frontend / Backend` navegável.
- Todo card tem imagem, e todo projeto com repositório mostra o comando de
  clone HTTP.
- Um `git clone` da URL publicada, sem credencial, é **negado**; com
  credencial válida, **funciona**. Verificado na prática, não presumido.
- Rodar `publicar-wp.sh` duas vezes seguidas não duplica página nem item de
  menu.
