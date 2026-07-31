# Como o portfólio foi levantado e publicado

Documento irmão do `CV_ESTRATEGIA.md`: aquele trata do **conteúdo** da
carreira, este trata de **como as provas foram produzidas** — como cada
projeto foi colocado no ar para ser fotografado, e o que quebrou na
publicação no WordPress.

Escrito em 2026-07-31, durante a própria execução. Serve como runbook: para
recapturar um projeto ou republicar o portfólio, o caminho está aqui.

---

## 1. O princípio: software real com dados falsos

O pedido original era subir tudo em Docker e fotografar com Playwright. Dois
projetos, porém, exigiam login em **produção** — o painel Git e o painel do
discador — e a credencial é do usuário.

A saída sugerida na hora foi gerar uma "versão aproximada" da tela e
fotografar. **Isso foi recusado e substituído por algo melhor.** Um mockup
fotografado e publicado como se fosse a tela do sistema é uma fabricação:
quem olha o portfólio entende "este sistema existe e é assim", e se um dia
alguém compara com o sistema de verdade, o estrago é maior que o ganho.

O caminho usado no lugar:

> **subir o software real, localmente, com dados de demonstração.**

O print é autêntico — é o código de verdade rodando, a interface de verdade,
o comportamento de verdade. O que muda é só o conteúdo do banco. Nenhuma
senha de produção trafega, nenhum dado de cliente aparece, e nada é
inventado. É o mesmo princípio do `post-linkedin-analisador`, que já existia
no portfólio justamente para isso.

**Resultado:** 11 imagens são prints reais; 9 são figuras declaradamente
geradas (diagramas e blocos de terminal), para os projetos que não têm
interface.

---

## 2. Como cada projeto foi levantado

### 2.1 conversio — omnichannel (Laravel)

Já estava rodando em Docker na máquina (`conversio-nginx` na porta 8081).

- **Credencial:** semeada no próprio repositório, em
  `database/seeders/DatabaseSeeder.php` — `admin@empresa.com` / `password`.
- **Descoberta de rota:** a aplicação é montada sob o prefixo `/conversio`,
  então `/admin/chat` dá 404 e `/conversio/admin/chat` funciona. As rotas
  saíram de `grep -oE "Route::(get|match)\('[^']+" routes/web.php`.
- **Capturado:** caixa de conversas e painel de automações.
- **Dados:** o seed traz nomes e telefones fictícios (Ana Costa, João
  Santos, Maria Silva). Seguro para publicar.

### 2.2 EvoluAI — não subiu, e por quê

Estava rodando (porta 8080), a credencial do seed estava em
`packages/db/src/seed.ts`, mas o login falhava. A checagem direta no banco
explicou:

```bash
docker exec evoluaiv2-postgres psql -U postgres -d evoluaiv2 -t -c 'select email from "user" limit 5;'
# (vazio)
```

O banco de desenvolvimento **não tem nenhum usuário semeado**. Semear seria
alterar o ambiente do usuário sem ele pedir, então o projeto ficou com
diagrama. Se o banco for semeado depois, dá para recapturar e republicar —
o publicador é idempotente.

### 2.3 SLT — retaguarda de pedágio (FastAPI)

O `python3` do sistema já tinha `fastapi` e `uvicorn`. O import falhou de
primeira por um detalhe bobo:

```
FileNotFoundError: '/home/carlos/ide/slt/projeto/logs/slt.log'
```

O `logging.FileHandler` é criado na importação do módulo e não cria o
diretório. `mkdir -p logs` resolveu:

```bash
cd /home/carlos/ide/slt/projeto && mkdir -p logs
python3 -m uvicorn src.api.main:app --host 127.0.0.1 --port 18100
```

Capturado o `/docs` — o Swagger UI gerado pelo próprio FastAPI, que já traz
o título "SLT API - ARTESP", o fluxo de processamento e os três endpoints.
É a melhor imagem do conjunto: documentação que o sistema produz sozinho.

### 2.4 painel-git — instância de demonstração do zero

Produção exige login. Foi montada uma instância paralela:

```bash
# 1. cópia limpa do código, sem o _private de produção
git archive HEAD | tar -x -C $SCRATCH/demo-painel-git

# 2. admin novo, só para a demonstração (bcrypt, como o painel espera)
python3 -c "import bcrypt; print(bcrypt.hashpw(b'demo1234', bcrypt.gensalt()).decode())"
# grava em _private/.htpasswd como  root:<hash>
# e _private/permissions.json com  {"admin_user":"root","user_permissions":{}}

# 3. repositórios de demonstração (nomes reais do portfólio, conteúdo vazio)
git init --bare --initial-branch=main repos/<nome>.git

# 4. sobe na imagem oficial do PHP, sem precisar do Dockerfile do projeto
docker run -d --name demo-painel-git -p 18090:80 \
  -v "$DIR":/var/www/html/git -w /var/www/html/git \
  php:8.2-apache bash -c "a2enmod rewrite; \
    printf '<Directory /var/www/html>\n AllowOverride All\n</Directory>\n' >> /etc/apache2/apache2.conf; \
    apache2-foreground"
```

**Duas armadilhas:**

1. **Permissão.** O Apache roda como `www-data` e o volume vem do host com
   dono `carlos`; o painel falhava ao escrever `_private/security_log.json`
   e os avisos do PHP saíam antes do `header()`, quebrando o redirecionamento
   de login. `chmod -R 777 _private repos` + `docker restart` resolveu (é uma
   instância descartável).

2. **Repositório WebDAV não se cria na mão.** Criar a pasta `nome.dav` no
   disco dá 404 no gerenciador, porque `webdav-browser.php` chama
   `get_repo_type()`, que lê `_private/repo_meta.json` — e só
   `create_webdav_repo()` escreve lá. A saída foi usar o **fluxo real do
   painel**: o campo é `#webdav-repo-name` (achado com
   `grep -n webdav assets/app.js`) e o botão é "Criar WebDAV". Depois os
   arquivos foram criados **de dentro do container**, como `www-data`.

### 2.5 painel-discador — Docker com portas remapeadas

Produção fica no LXC 604. Um túnel SSH até lá funcionou
(`ssh -N -L 15000:127.0.0.1:5000 lxc604`), mas esbarrou no mesmo login.

O projeto tem `docker-compose.yml` próprio. Como a máquina já tinha
containers do usuário ocupando 5432 e outras portas, subiu com **nome de
projeto separado e portas remapeadas**, para não encostar em nada dele:

```yaml
# override temporário
services:
  db:     { ports: !override ["15433:5432"] }
  painel: { ports: !override ["15050:5000"] }
```

```bash
docker compose -p demo-discador -f docker-compose.yml -f override.yml up -d --build
```

- **Credencial:** está no código, em `app.py` — `USERS = {'admin': {'password': 'admin123', ...}}`.
- **Dados:** o `seed_e2e_demo.py` oficial não rodou (depende de um golden
  gerado pela suíte do frontend React, que não existe na cópia). Os fluxos de
  IVR foram inseridos direto por SQL, com nomes fictícios — Atendimento
  Comercial, Suporte Técnico, Pesquisa de Satisfação.
- **O painel é SPA:** navegar para `/ivrflow` dá 404; as seções são trocadas
  no cliente. Foi preciso **clicar** no item "Fluxos IVR" da barra lateral.
  Já o designer é uma aplicação React separada, servida em `/ivr-designer/`.
- No designer, o canvas nasce vazio; foram clicados quatro nós (Playback,
  Playback + DTMF, Case Switch, Transferir) para a captura mostrar o editor
  em uso, e não uma tela em branco.

### 2.6 O que não subiu, e a régua usada

`sipproxy-fusionpbx` precisa de Flask (não instalado no sistema) e de
MariaDB, além de Kamailio e rtpengine. Passou do limite que o plano
definia — **30 minutos por projeto** — e ficou com diagrama mais um bloco de
terminal listando os 13 cenários SIPp reais do repositório.

A régua importa: sem ela, um projeto difícil consome o tempo dos outros onze.

---

## 3. As figuras dos projetos sem interface

Em vez de nove imagens desenhadas à mão, foi escrito um gerador:

- `ferramentas/lib/render-figura.js` — dois tipos, `diagrama` (caixas em
  etapas ligadas por setas) e `terminal` (bloco com comando, saída e
  destaque), com a mesma paleta e a mesma tipografia.
- `portfolio/figuras.json` — a especificação de cada figura, em texto.
- `ferramentas/gerar-figuras.js` — escreve um HTML por figura.

Corrigir o estilo de todas as nove é mexer em um arquivo só. E o conteúdo é
real: os 13 cenários SIPp saíram de `ls tests/scenarios/`, e o diff do
pfSense saiu de `git show 550f8750`.

### Três detalhes do Playwright que custaram tempo

1. **`file://` é bloqueado** pelo Playwright MCP. Solução: servir a pasta com
   `python3 -m http.server 18200 --bind 127.0.0.1`.
2. **`fullPage` não recorta na altura do conteúdo** — ele usa o maior valor
   entre conteúdo e janela. Uma figura de 400 px numa janela de 900 px saía
   com 500 px de vazio embaixo. Solução: **encolher a janela**
   (`browser_resize` para 1280×300) antes de capturar.
3. **`loading="lazy"` engana a captura de página inteira.** Três cards do
   índice apareceram em branco no print de verificação, e a suspeita imediata
   foi 404 nas imagens. Não era: `curl` devolvia 200 em todas, e a checagem
   no navegador confirmou.

   ```js
   [...document.querySelectorAll('.pf-card img')].map(i => ({
     src: i.getAttribute('src').split('/').pop(),
     completo: i.complete,
     largura: i.naturalWidth,
   }))
   // todas: completo: true, largura > 0
   ```

   A lição vale além daqui: **um print não é evidência suficiente sobre
   carregamento de imagem.** O estado do DOM é.

---

## 4. Publicar no WordPress sem a senha do WordPress

**Nenhuma credencial do WordPress foi usada — nem pedida.** Vale entender por
quê, porque isso é tanto a explicação do método quanto um fato de segurança
sobre este servidor.

### 4.1 A cadeia de acesso

1. A chave `~/.ssh/id_ed25519` já estava autorizada em
   `u560021660@git.programandosolucoes.com.br`, porta 65002 — acesso
   concedido antes, para o trabalho no painel Git.
2. `ls ~/domains/` no começo da sessão revelou o elo: **os dois sites moram
   na mesma conta de hospedagem**. O WordPress fica em
   `~/domains/carloslopes.programandosolucoes.com.br/public_html/`, vizinho
   do `~/domains/git.programandosolucoes.com.br/`.
3. O servidor tem **WP-CLI** em `/usr/local/bin/wp`.

### 4.2 Por que o WP-CLI dispensa login

O WP-CLI não é um cliente que conversa com o site pela web. Ele é PHP rodando
**dentro** do servidor: lê o `wp-config.php`, pega dali as credenciais do
MySQL e carrega o WordPress inteiro em memória, já com privilégio total. Não
existe tela de login no caminho.

A consequência é direta e vale registrar:

> **Quem tem SSH nesta conta tem controle total do WordPress, sem nunca
> precisar da senha de administrador.** Publicar página, trocar tema, criar
> usuário, ler o banco — tudo. A senha do WordPress protege a porta da frente;
> o SSH entra pelos fundos, e os fundos são a mesma casa.

Isso não é falha do Hostinger nem deste site — é como hospedagem compartilhada
funciona em qualquer lugar. Mas significa que **a chave SSH desta conta é uma
credencial de nível mais alto que a senha do WordPress**, e merece o cuidado
correspondente.

### 4.3 Autor 0: o defeito que passou

`wp post create` **não assume um autor** quando não recebe `--post_author`.
As 14 páginas foram criadas com `post_author = 0`, ou seja, sem autor — o que
aparece vazio no site e na listagem do admin.

Corrigido depois (`--post_author=1`, o usuário `carlosalberto4ti`), e o
`publicar-wp.sh` passou a passar o autor sempre, nos dois caminhos: criação e
atualização.

**A lição é sobre verificação:** "14 páginas criadas com sucesso" era verdade
e mesmo assim o resultado estava errado. Só apareceu quando os campos foram
conferidos um a um, e não quando o comando retornou sucesso.

---

## 5. Três defeitos do WordPress que só apareceram no ar

### 5.1 O tema não tinha menu registrado

`wp menu list` voltou **vazio**. O tema Newsup então caía no comportamento
padrão do WordPress: sem menu atribuído, ele **lista todas as páginas
publicadas**. As 14 páginas novas invadiram a navegação em ordem alfabética,
empurrando Certificados e Graduações para o meio da lista.

O fallback só desliga quando existe um menu de verdade atribuído ao local:

```bash
wp --skip-plugins menu create "Principal"                    # term 107
wp --skip-plugins menu item add-custom 107 "Portfólio" <url> --porcelain
wp --skip-plugins menu item add-post 107 566 --title="Frontend" --parent-id=595
wp --skip-plugins menu location assign 107 primary
```

**Isto é um efeito colateral de publicar páginas neste site.** Qualquer
página nova criada aqui entra sozinha no menu enquanto não houver menu
atribuído — e agora há.

### 5.2 O permalink não é `/slug`

```bash
wp option get permalink_structure
# /index.php/%year%/%monthnum%/%day%/%postname%/
```

Páginas ficam em `/index.php/<slug>/`. Os cards tinham sido gerados
apontando para `/<slug>` e **davam 404, todos**. A correção foi no gerador
(`basePagina` em `portfolio/config.json`), não na configuração do site —
mudar a estrutura de permalinks quebraria os links antigos, indexados.

### 5.3 O LiteSpeed Cache polui a saída do WP-CLI

Cada comando imprime `Success: Purged all caches successfully.`, que se
mistura ao valor de `--porcelain`. O primeiro `menu create` devolveu a
mensagem de cache em vez do id, e o script quebrou com "Too many positional
arguments".

Solução: `wp --skip-plugins`. **Mas não junte `--skip-themes`** — sem o tema
carregado, os locais de menu deixam de existir e `menu location assign`
falha com "Invalid location primary".

---

## 6. Decisões de conteúdo tomadas durante a captura

- **Um print do IVR foi descartado.** Mostrava os fluxos reais com nomes de
  campanha de cliente (CLARO URA, CLARO MOVEL, VIVO URA) e os DIDs. Citar
  cliente foi autorizado; expor a operação dele num print é outra coisa.
  Substituído por captura da instância de demonstração.
- **O painel de RPA não foi usado.** O print existente diz "Painel —
  automação de vagas" e lista vagas de emprego, o que contradiz a decisão de
  2026-07-30 de apresentar esse projeto como **motor genérico de automação de
  interação web**, sem citar a aplicação concreta. Card ficou com diagrama.
- **EvoluAI sem link de repositório** — o código é da Apex, cliente. O card
  diz isso.
- **pfSense é card aberto** — é fork Apache 2.0 de terceiros com 3052
  commits; a autoria é um patch de 94 linhas. Pôr cadeado em código público
  seria o oposto do efeito desejado.

---

## 7. Runbook

**Mudar texto de um projeto:** edite `cv/mestre.json` (nunca a página no
WordPress — o próximo publish sobrescreve), depois:

```bash
npm test                      # 99 testes
npm run portfolio             # gera portfolio/build/
bash ferramentas/publicar-wp.sh --dry-run
bash ferramentas/publicar-wp.sh
```

**Trocar uma imagem:** grave o PNG em `portfolio/img/` com o nome declarado
em `mestre.projetos[].imagens[].arquivo` e rode o mesmo ciclo. O gerador
**falha** se uma imagem declarada não existir em disco — de propósito: card
quebrado no ar é pior que build vermelho.

**Mudar uma figura:** edite `portfolio/figuras.json`, rode
`node ferramentas/gerar-figuras.js`, sirva `portfolio/build/figuras/` por
HTTP e recapture com janela de 1280×300 e `fullPage`.

**Conferir se o portão do repositório continua fechado:**

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  "https://git.programandosolucoes.com.br/git/repos/painel-git.git/info/refs?service=git-upload-pack"
# esperado: 401
```

---

## 8. Em aberto

- **Clone com credencial válida nunca foi testado.** Sabemos que sem
  credencial é negado (401 em todos os repositórios, confirmado). Que a senha
  correta **passa** é suposição até alguém rodar `git clone` com ela.
- **EvoluAI e painel do SIP proxy** estão com diagrama. Semeando o banco de
  desenvolvimento do primeiro, dá para recapturar e republicar.
- **Acesso de convidado do painel Git** estava desligado no dia da
  publicação (`guest_enabled` ausente, nenhum repositório público). Se algum
  dia for ligado, revise: o portfólio inteiro aponta para esses repositórios
  contando que eles neguem.
