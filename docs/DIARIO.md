# Diário de trabalho — currículo e portfólio

Registro do que foi conversado, decidido e construído, para não depender de
lembrar nem de reabrir histórico de conversa. Organizado por frente, em ordem
cronológica dentro de cada uma.

**Como usar:** procure primeiro na tabela de decisões — ela responde "por que
está assim?". As seções detalhadas explicam como se chegou lá.

**Manutenção:** este arquivo é atualizado a cada frente nova. Se algo foi
decidido em conversa e não está aqui, está perdido.

---

## Tabela de decisões

| # | Decisão | Escolha | Quem | Onde detalha |
|---|---|---|---|---|
| 1 | Modelos de MOS avaliados entram no CV? | Sim, redigidos como avaliação comparativa | usuário | [Inventário de áudio](#1-inventário-dos-projetos-de-áudio) |
| 2 | Como o bot de vagas aparece no CV | Motor de automação web (RPA) genérico, sem citar candidatura própria | usuário | [Inventário dos demais](#2-inventário-dos-demais-projetos) |
| 3 | Papel no projeto de pedágio | Arquiteto de Software Hands-On, 2 meses de Discovery | usuário | [slt](#3-slt--clone-e-contrato) |
| 4 | Pedágio no CV: alocação ou contratação direta? | Projeto freelance entregue direto | usuário | [slt](#3-slt--clone-e-contrato) |
| 5 | Datas dos projetos | Fixadas por evidência de git; só omnichannel é estimativa | Claude, aprovado pelo usuário | [Datas](#4-fechamento-das-datas) |
| 6 | Sobreposição de períodos | Legítima — usuário é PJ e pega trabalhos em paralelo | usuário | [Datas](#4-fechamento-das-datas) |
| 7 | Onde vive o material de carreira | Repositório próprio `curriculo`, separado do código | usuário | [Repositório](#5-repositório-próprio) |
| 8 | Ferramenta de aderência no repositório novo | Autocontida: snapshot JSON, sem Prisma, banco, IA ou rede | Claude | [Ferramenta](#6-ferramenta-de-aderência-autocontida) |
| 9 | Objetivo dos múltiplos currículos | Migrar de área de verdade, não só pegar vagas vizinhas | usuário | [Multi-perfil](#8-multi-perfil-do-desenho-à-execução) |
| 10 | Tratamento do histórico VoIP | Reenquadrar na língua da área-alvo, mesmos fatos | usuário | [Multi-perfil](#8-multi-perfil-do-desenho-à-execução) |
| 11 | Arquitetura do multi-perfil | Mestre + receita por perfil | usuário (contra recomendação) | [Multi-perfil](#8-multi-perfil-do-desenho-à-execução) |
| 12 | Formato dos dados | JSON, não YAML | restrição técnica | [Multi-perfil](#8-multi-perfil-do-desenho-à-execução) |
| 13 | Quantos perfis | Nove: voip, ia, dev, frontend, devops, dados, seguranca, qa, rpa | usuário | [Perfis](#9-os-nove-perfis) |
| 14 | Perfil mobile | Recusado — não existe material | Claude | [Perfis](#9-os-nove-perfis) |
| 15 | Currículos à prova de ATS | Sim, com regras de renderização documentadas | usuário | [ATS](#10-regras-de-ats) |
| 16 | Exportação | Botões de PDF e Word no HTML, sem biblioteca | usuário | [ATS](#10-regras-de-ats) |
| 17 | Perfil padrão (o que vai para os bots) | `dev` por ora, a revisar com os números finais | Claude, a confirmar | [Perfis](#9-os-nove-perfis) |
| 18 | O que dos "prompts de qualidade" entra no CV | Só o que já era verdade e não estava escrito (Nível 1) | Claude | [Prompts de qualidade](#15-prompts-de-qualidade-pesquisa-de-origem-e-o-que-entrou-no-cv-2026-08-13) |
| 19 | Code review nos empregos formais (elev, tw-solutions) | Confirmado pelo usuário — bullets escritos | usuário | [Prompts de qualidade](#15-prompts-de-qualidade-pesquisa-de-origem-e-o-que-entrou-no-cv-2026-08-13) |
| 20 | `cv.txt` dos bots de candidatura | Sincronizado com o perfil `dev`; era de 30/07, com título de VoIP | usuário | [Prompts de qualidade](#15-prompts-de-qualidade-pesquisa-de-origem-e-o-que-entrou-no-cv-2026-08-13) |

---

## 1. Inventário dos projetos de áudio

**Pedido:** retomar a análise do currículo; depois, entrar nos projetos de
análise de áudio e listar tudo em uso, incluindo as bibliotecas Python.

**O que se descobriu.** `analisador-chamadas` e `nextqualify-auditor` estavam
descritos no documento de estratégia em uma única frase. O código real mostra
muito mais:

- **DSP próprio em NumPy**: energia RMS por frame, janelas deslizantes
  vetorizadas, FFT com features espectrais (flatness, flux, centroide),
  estimativa de ruído de fundo por percentil.
- **Normas ITU-T implementadas do zero**: E-model G.107 (R-factor → MOS),
  P.862.1 (PESQ→MOS-LQO), P.835 (SIG/BAK/OVRL).
- **IA local em CPU**: faster-whisper int8, LLM GGUF via llama.cpp, ONNX
  Runtime. Motivo: os áudios são de clientes e não podem sair da máquina.
- **Benchmark de modelos neurais** com corpus rotulado: DNSMOS, TorchAudio
  SQUIM e NISQA, com decisão documentada por eixo de discriminação **e por
  licenciamento** (NISQA tem pesos CC BY-NC, inviável comercialmente).
- **Multi-tenancy com isolamento físico** por UUID, porque `recording_id` é
  sequencial por PBX e um layout global sobrescreveria áudio entre clientes.

**Bibliotecas** (extraídas dos dois `.venv`, não do requirements): numpy,
flask, requests, python-dotenv, faster-whisper, llama-cpp-python, onnxruntime,
urllib3 em produção; torch, torchaudio, librosa, matplotlib, pandas na
avaliação; pytest e responses nos testes. Python 3.14.4, ffmpeg 8.0.1.

**Decisão do usuário:** os modelos avaliados e desligados também contam como
material de currículo. Ficaram redigidos como *avaliação comparativa de
modelos*, que é o que foram — e é competência mais rara que "instalei a lib".

---

## 2. Inventário dos demais projetos

**Pedido:** o mesmo levantamento para todos os outros projetos.

Feito lendo manifestos e código reais (`package.json`, `composer.json`,
`requirements.txt`), não README. Achados que mudaram o CV:

- **Discador VoIP** — o engine de IVR é uma **linguagem de fluxo própria com
  16 primitivas** interpretada pelo dialplan, não um menu fixo. Tem cliente
  próprio da API do Proxmox VE, ODBC realtime completo e 15 suítes pytest.
- **Omnichannel** — os 5 gateways de WhatsApp estão atrás de uma interface de
  driver: **padrão Strategy aplicado a integração**, o achado arquitetural
  mais forte do portfólio.
- **painel-git** — **WebDAV RFC 4918 implementado do zero** (com LOCK/UNLOCK e
  mutex FIFO), protocolo git smart HTTP, e autenticação por desafio
  criptográfico com chave SSH tratando replay.
- **sipproxy** — **13 cenários SIPp** de conformidade de protocolo, e painel
  Flask com SQLAlchemy 2.0 por reflection sobre as tabelas do motor.

**Decisão do usuário:** o bot de vagas entra no CV como **motor de automação
autônoma de interação web (RPA)**, sem expor que a finalidade é candidatura
própria. É descrição fiel: o código é um motor genérico com adaptadores.

---

## 3. `slt` — clone e contrato

**Pedido:** baixar o `slt` do painel-git e fazer o mesmo levantamento.

Clonado via `ssh://…:65002/…/repos/slt.git`. 3.950 linhas Python, 1 commit.
Stack bem mais madura do que constava: FastAPI, `cryptography` com **10
combinações de AES** (128/256 em CBC, ECB, CFB, OFB, CTR), protobuf,
stomp.py/ActiveMQ, **Locust** (teste de carga — nenhum outro projeto tem),
mypy, PyInstaller. Três serializadores intercambiáveis (Protobuf, JSON,
SOAP/XML) e licenciamento próprio com RSA-2048 e hash de hardware.

**O PDF do contrato resolveu as datas.** Proposta da EASYCODE para a AstraMobi,
24/11/2025, alocando Arquiteto Hands-On e Desenvolvedor Full-Stack para uma
fase de Discovery de 2 meses de um sistema de pedágio **free-flow** (LiDAR,
reconhecimento de placa, contagem de eixos).

**Confirmado pelo usuário:** atuou como **Arquiteto de Software Hands-On**, e o
trabalho durou os 2 meses de Discovery. Datas do CV: **12/2025 – 01/2026**.

**Confidencialidade:** o PDF é marcado confidencial e contém rate card e custo
mensal por perfil. Nada desses valores entrou no CV nem em documento algum —
foram lidos só para datar e identificar o papel. Cargo, escopo e período são
do usuário; a tabela de preços do fornecedor não é.

**Redação escolhida:** o CV apresenta como projeto freelance contratado e
entregue direto, não como alocação via consultoria. Muda a cadeia comercial,
não o trabalho — e a descrição ficou restrita ao que foi executado, sem
afirmar negociação de contrato ou gestão de conta.

**Pendência registrada:** `projeto/keys/chave.aes` e `iv.aes` estão versionados
no repositório do `slt`. Se forem de produção, vale rotacionar.

---

## 4. Fechamento das datas

**Pedido:** colocar valores convenientes para fechar o item.

Base de cada data, para ser defensável em entrevista:

| Projeto | Data | Base |
|---|---|---|
| Discador VoIP | 01/2025 – 07/2026 | 18 meses de commits incrementais em 3 repos |
| Hospedagem Git | 08/2025 – atual | 129 commits contínuos |
| Pedágio | 12/2025 – 01/2026 | contrato + confirmação |
| Omnichannel | 02/2026 – 07/2026 | ⚠️ **estimada** — o `zib` entrou em commit único |
| Motor RPA | 06/2026 – atual | bots em 06, suite com 190 commits em 07 |
| Análise de áudio | 07/2026 – atual | 39 + 43 commits |
| SIP Proxy | 07/2026 – atual | 56 commits |

Regra seguida: onde o git tem histórico incremental, a data é o histórico. Onde
o repositório é despejo de commit único, o git só prova o fim — aí houve
estimativa, sinalizada como tal.

**Esclarecimento do usuário:** os períodos podem se sobrepor porque ele atua
como **PJ** e pega quantos trabalhos quiser em paralelo. A ressalva sobre
sobreposição foi removida.

---

## 5. Repositório próprio

**Pedido:** mover o material de currículo para pasta própria e enviar ao
`git.programandosolucoes.com.br` num repositório só dele.

Criado o repositório **`curriculo`** (32º do painel), com `git init --bare` via
SSH — mesmo caminho que o `create_repo()` do painel faz; os hooks de política
se auto-sincronizam no primeiro acesso.

**O `cv.txt` foi copiado, não movido.** Onze pontos do código dos bots leem
esse arquivo em runtime; mover quebraria a automação. A regra de sincronia está
no README: este repositório é a fonte de verdade, e o arquivo precisa ser
copiado de volta a cada atualização.

**Achado sobre o remoto da suite:** `vagas-automation-suite` usa sintaxe scp
(`user@host:path`), que **não aceita porta** e por isso tenta a 22, enquanto o
servidor só atende na **65002**. `git push origin` falha ali até corrigir com
`git remote set-url` para a forma `ssh://…:65002/…`. Não foi corrigido — é
configuração do usuário.

---

## 6. Ferramenta de aderência autocontida

O `aderencia.js` original depende de Prisma, do banco `coleta.db` e — por
importar o filtro de área — de toda a cadeia de provedores de IA com chaves.
Nada disso é necessário para comparar texto com texto.

A versão do repositório novo troca o banco por um **snapshot JSON** (1.129
vagas, 30 categorias) e copia isolada a única função de que precisava
(`termoBateNoTexto`, regex pura). Resultado: roda logo após o clone com `node`,
sem `npm install`, banco, chave de API ou rede.

**Consequência aceita:** `ferramentas/lib/termos-mercado.js` e o da suite são
cópias e podem divergir. Documentado no README.

---

## 7. Medição do CV: antes e depois

Comparação no mesmo vocabulário de 379 termos — a única honesta:

| | termos no CV | aderência média | lacunas |
|---|---|---|---|
| CV antigo | 57 | 33% | 96 |
| CV novo | 216 | 45% | 68 |

**Cuidado com leitura errada:** o relatório de 27/07 dizia "45%", mas medido
com vocabulário menor — régua mais fácil. Na régua nova o CV antigo vale 33%.
O ganho real é +12 pontos e 28 lacunas fechadas.

Fecharam com o inventário: Git, React, TypeScript. Continuam abertas e são
lacuna real de conhecimento: Azure, SQL Server, DAX, C#/.NET, LGPD, Excel
avançado, SAP, ITIL.

---

## 8. Multi-perfil: do desenho à execução

**Pedido:** vários currículos com o mesmo conteúdo, focados por área.

**Objetivo declarado pelo usuário:** migrar de área de verdade — sair de VoIP e
entrar em desenvolvimento, dados, DevOps, IA. Isso obrigou o CV a reposicionar
narrativa, não só reordenar tópicos.

**Arquitetura escolhida pelo usuário:** mestre + receita por perfil, contra a
recomendação de fonte de dados única. O risco levantado (a receita crescer até
virar um segundo currículo, e as versões divergirem em fatos) foi contido por
uma **regra de fronteira**: todo texto mora no mestre, a receita só seleciona e
ordena. Fatos como empresa, cargo e período existem uma vez só.

**JSON e não YAML** porque o repositório precisa rodar após o clone sem
`npm install`, e o Node não traz parser de YAML.

Documentos: [spec](superpowers/specs/2026-07-30-cv-multi-perfil-design.md) e
[plano](superpowers/plans/2026-07-30-cv-multi-perfil.md).

---

## 9. Os nove perfis

| Perfil | Título | Alvo | Vagas | Linha de base |
|---|---|---|---|---|
| `voip` | Arquiteto de Soluções VoIP Sênior | termo | **0** | impossível hoje |
| `ia` | Engenheiro de Inteligência Artificial (IA) Sênior | termo | 36 | **60%** |
| `dev` | Desenvolvedor Backend Sênior | categoria | 62 | 50% / 48% |
| `frontend` | Desenvolvedor Frontend Sênior | termo | 23 | 56% |
| `devops` | Engenheiro DevOps / SRE Sênior | categoria | 53 | 52% / 43% |
| `dados` | Engenheiro de Dados / BI | categoria | 32 | 64% |
| `seguranca` | Analista de Segurança Sênior | categoria | 33 | 27% |
| `qa` | Analista de QA / Automação | categoria | 21 | 42% |
| `rpa` | Automação de Processos e Integração | termo | 15 | 38% |

### Três achados de medição que mudaram decisões

**VoIP tem demanda zero — por falta de coleta, não de mercado.** Nenhuma das
1.129 vagas cita Asterisk, VoIP, SIP, PABX ou Kamailio, e não há categoria de
telecom entre as 30 coletadas. Otimizar cegamente contra essa medição
empurraria a carreira para longe da maior força. Obrigou uma regra na
ferramenta: **"nenhuma vaga no alvo" não é 0% de aderência** — são conclusões
opostas.

**RPA: uma análise minha estava errada.** A primeira leitura concluiu "lacuna
de ferramenta" medindo a presença de UiPath e Blue Prism. Errado: nunca
perguntei aos dados o que as vagas *pedem*. Ranqueando de verdade, a ferramenta
proprietária não aparece e o que domina é **"automação de processos", em 10 das
15 vagas** — ausente do CV como frase, embora o trabalho exista de sobra. Era
lacuna de redação. Lição registrada no spec: **medir o que as vagas pedem,
nunca a presença do que eu suponho que elas peçam.**

**Mobile foi recusado.** 6 vagas, mas o motivo não é volume: nenhum dos 30
repositórios usa React Native, Flutter, Kotlin ou Swift. Seria currículo sobre
experiência inexistente.

### Um defeito de ferramenta que a medição expôs

Buscar o termo `ios` por substring casou **929 vagas**, batendo dentro de
"negóc**ios**", "benefíc**ios**" e "relatór**ios**". Número que parece dado e
não é. O filtro por termo passou a exigir **fronteira de palavra**.

---

## 10. Regras de ATS

**Pedido:** currículos à prova de ATS, e exportação para PDF e Word.

Restrição de renderização, não de conteúdo. O `cv.txt` já é o artefato mais
seguro; as regras valem para o HTML e o PDF dele.

**Proibido:** layout multi-coluna (o extrator lê na ordem do fluxo e duas
colunas viram frases intercaladas), tabela para conteúdo, texto em imagem ou
SVG, cabeçalho e rodapé de página, texto injetado por CSS, posicionamento
absoluto.

**Obrigatório:** títulos de seção convencionais, datas em `MM/AAAA` uniformes,
cargo e empresa em linha identificável, e **sigla junto da forma expandida** na
primeira ocorrência — a regra de maior retorno por esforço, porque a vaga pode
buscar qualquer das duas formas.

**Exportação:** PDF pela impressão do navegador (preserva texto selecionável,
que é o que o ATS lê) e Word serializando o HTML com tipo MIME
`application/msword`, sem biblioteca. A barra de botões vive fora do container
exportado e some em `@media print`, então não entra em nenhum dos dois — coberto
por teste, porque o defeito só apareceria no arquivo já enviado para uma vaga.

---

## 11. Estado da execução

Branch `feat/cv-multi-perfil`. **45 testes passando.**

| Task | Entrega | Estado |
|---|---|---|
| 1 | Snapshot com `link` + exportador | ✅ |
| 2 | Montagem mestre + receita | ✅ |
| 3 | Renderização em texto | ✅ |
| 4 | Renderização HTML/ATS + botões | ✅ |
| 5 | Conteúdo mestre (78 blocos de texto) | ✅ |
| 6 | As nove receitas | ✅ |
| 7 | Gerador — 18 arquivos | ✅ |
| 8 | Aderência por perfil (`--perfil`) | ⬜ |
| 9 | Medição comparativa e documentação | ⬜ |

**Defeito corrigido no caminho:** todo relatório de aderência saía com
`Link: undefined`, porque o snapshot foi exportado sem o campo `link`.

---

## 13. Simulador de ATS

**Pedido pelo usuário três vezes.** Construído em `ferramentas/simular-ats.js`,
com `lib/parser-cv.js` e `lib/triagem.js`.

Responde o que a aderência não respondia: **quais vagas me chamariam, e por que
as outras não.** Simula as duas etapas na ordem em que um ATS faz — primeiro
extrai a estrutura e descarta o que não consegue ler, só então compara
palavras-chave.

```bash
node ferramentas/simular-ats.js --perfil=dev
node ferramentas/simular-ats.js --perfil=dev --todas --limiar=0.5
```

### Três decisões contra número enganoso

- Vaga com menos de 3 termos reconhecidos vira **indeterminado**, não
  reprovação: aprovar ou reprovar por um termo é ruído apresentado como
  resultado.
- As indeterminadas ficam **fora do denominador** da taxa de aprovação, senão
  inventariam reprovação que não houve.
- Tempo de carreira pela **união** dos períodos, nunca pela soma: quem atua
  como PJ em contratos paralelos teria o dobro de experiência inventado.

### Taxa de aprovação simulada

| Perfil | Taxa | Base |
|---|---|---|
| `ia` | 86% | 6 de 7 |
| `qa` | 75% | 3 de 4 |
| `dados` | 71% | 10 de 14 |
| `dev` | 68% | 15 de 22 |
| `frontend` | 68% | 13 de 19 |
| `rpa` | 60% | 12 de 20 |
| `devops` | 43% | 10 de 23 |
| `seguranca` | 14% | 1 de 7 |

O `seguranca` confirma pela terceira métrica: 14% não se resolve escrevendo
melhor. A maioria das vagas cai em indeterminado (40 de 62 no `dev`), porque
tem poucos termos reconhecidos no campo de requisitos.

### Achado 1 — o CV antigo é ilegível para um ATS

O simulador extraiu **zero empregos** de `cv/cv.txt`, que é a versão que está
nos bots hoje. O formato antigo é `- Cargo (Empresa) | 09/2024 - 11/2025
(Local)`: com empresa e local entre parênteses, os campos não se separam. Mais
três títulos de seção não reconhecidos (`COMPETÊNCIAS PRINCIPAIS`, `PROJETOS
FREELANCE / PORTFÓLIO TÉCNICO`, `INTERESSES`).

O formato novo — `Cargo | Empresa | período | Local` — extrai os 12 sem erro.

Ressalva: o parser é uma simulação e um ATS comercial pode ser mais tolerante.
Mas empresa entre parênteses é problema conhecido de triagem, e o formato novo
é objetivamente mais parseável.

### Achado 2 — focar o currículo destruía a senioridade

Este foi **defeito do desenho, encontrado pelo próprio simulador**. Ao incluir
só os empregos relevantes, os perfis perdiam anos de carreira:

| Perfil | Antes | Depois |
|---|---|---|
| `voip` | 12,2 anos | 12,2 |
| `devops`, `seguranca` | 9,7 | 12,2 |
| `dev` | 8,1 | 12,2 |
| `qa` | 7,6 | 12,2 |
| `rpa` | 6,9 | 12,2 |
| `ia` | 5,8 | 12,2 |
| `dados` | 5,7 | 12,2 |
| `frontend` | **4,7** | 12,2 |

Um filtro de "10+ anos de experiência" reprovaria 7 dos 9 perfis.

**Correção aplicada:** a receita ganhou `incluir_experiencia_compacta`. Os
empregos fora do foco entram só com cargo, empresa e período, sem bullets — a
cronologia fica inteira, e o foco acontece nos bullets, não em apagar história.
Custo em tamanho pequeno: o `frontend` foi de 1.329 para 1.435 palavras.

A regra que eu tinha seguido estava errada: currículo com cronologia truncada
levanta suspeita de lacuna, e o ATS conta anos pela data mais antiga.

---

## 12. Pendências

| Item | Situação |
|---|---|
| ~~Simulador de ATS~~ | **Feito** — ver seção 13 |
| **`cv/cv.pdf` desatualizado** | É o PDF que vai anexado; ainda é a versão de 25/07, anterior a tudo |
| **Arquivos antigos em `cv/`** | `cv.txt`, `cv.pdf` e `cv-2026-07.html` convivem com a estrutura nova; decidir se apaga ou mantém |
| **Perfil `padrao`** | `dev` por ora; revisar com os números finais (`dados` e `ia` têm aderência maior) |
| **Coletar vagas de telecom** | Sem isso o perfil `voip` é gerado e não medido |
| **Remoto da suite em sintaxe scp** | `git push origin` falha por causa da porta; um `git remote set-url` resolve |
| **Contas múltiplas nas plataformas** | Usuário mencionou a intenção; risco de violação de termos e de perder a conta principal foi apontado, sem resposta ainda |
| **Chaves versionadas no `slt`** | `chave.aes` e `iv.aes` no repositório |

---

## 14. Portfólio publicado no WordPress (2026-07-31)

Spec em `docs/superpowers/specs/2026-07-31-portfolio-wordpress-design.md`,
plano em `docs/superpowers/plans/2026-07-31-portfolio-wordpress.md`.

**No ar:** 14 páginas em `https://carloslopes.programandosolucoes.com.br/`
(IDs 566 a 579), com o menu `Portfólio > Frontend / Backend`.

### Comandos executados no servidor

```bash
# painel Git — criação dos bare repos que faltavam
ssh -p 65002 u560021660@git.programandosolucoes.com.br \
  'cd ~/domains/git.programandosolucoes.com.br/public_html/git/repos && \
   git init --bare --initial-branch=master asterisk-media-server-lab.git && \
   git init --bare --initial-branch=main   vitalpbx-whatsapp-calling.git'

# leitura: conferir que o acesso de convidado está desligado (estava)
ssh … 'grep -o "\"guest_enabled\":[^,}]*" …/git/_private/config.json'

# WordPress — publicação (ferramentas/publicar-wp.sh)
wp export --dir=/tmp --post_type=page      # backup antes de escrever
scp portfolio/img/* …/wp-content/uploads/portfolio/
wp post create|update …                    # 14 páginas, casadas por slug
wp --skip-plugins menu create "Principal"
wp --skip-plugins menu item add-custom|add-post 107 …
wp --skip-plugins menu location assign 107 primary
```

### Três armadilhas que só apareceram no ar

1. **O tema não tinha menu registrado.** O Newsup caía no fallback que lista
   *todas* as páginas, então as 14 páginas novas invadiram a navegação em
   ordem alfabética. Resolvido criando o menu `Principal` (term 107) e
   atribuindo ao local `primary` — o fallback só desliga quando existe menu.
2. **Permalink é `/index.php/<slug>/`, não `/<slug>`.** Todos os cards
   apontavam para 404. Corrigido no gerador (`basePagina` em
   `portfolio/config.json`), sem mexer na configuração do site.
3. **O LiteSpeed Cache polui a saída do WP-CLI** com "Purged all caches
   successfully", o que quebra `--porcelain`. Usar `wp --skip-plugins`.
   Atenção: `--skip-themes` junto derruba os locais de menu do tema.

### Verificado

- `git clone` sem credencial nas URLs publicadas → **401**, em todos os repos.
- Rodar `publicar-wp.sh` duas vezes → 14 "atualizada", nenhuma duplicada.
- As 5 imagens do índice carregam (`complete: true`); o branco na captura de
  página inteira era artefato do `loading="lazy"`, não 404.
- `gerar-cv.js` continua produzindo os 9 CVs sem uma linha de diferença.

### Em aberto

- Clone **com** credencial válida não foi testado (exige a senha do usuário).
- EvoluAI e o painel do SIP proxy não subiram com dados; ficaram com diagrama.
  Se o banco de dev do EvoluAI for semeado, dá para recapturar e republicar —
  o publicador é idempotente.

---

## 15. Prompts de qualidade: pesquisa de origem e o que entrou no CV (2026-08-13)

**Pedido:** Carlos trouxe dois prompts vistos na internet — um mandando aplicar
uma skill de motion design com skeleton, lazy loading e animação em toda a
interface, outro mandando garantir observabilidade, lint e testes com uma lista
de ferramentas. Perguntou de onde vêm essas dicas (livros, cursos), em que se
baseiam, e o que vale aprender que ainda não está no currículo.

Pesquisa completa, com os dois textos originais preservados, a linhagem de cada
ideia e a crítica dos prompts:
[PESQUISA_PROMPTS_MOTION_E_QUALIDADE.md](PESQUISA_PROMPTS_MOTION_E_QUALIDADE.md).

### O que a pesquisa achou

- O repositório citado no prompt (`kylezantos/design-principles`) **não
  existe** — o real é `kylezantos/design-motion-principles`, e a skill dele
  classifica como defeito ("anti-slop") exatamente o que o prompt manda fazer:
  fade-in uniforme e animação no mount de conteúdo estático.
- Os dois prompts listam **ferramenta em vez de critério**. O de observabilidade
  empilha três backends de APM concorrentes (Sentry, Datadog, New Relic) mais a
  camada de instrumentação (OTel), quando o correto é OTel instrumentando e
  **um** backend.
- A linhagem real: Disney (1981) → Val Head/Rachel Nabors → Material/Apple para
  o movimento; Miller (1968) → Doherty (IBM, 1982) → Wroblewski (2013) → RAIL
  (2015) para skeleton e lazy; Kálmán (1960) → Dapper (2010) → SRE Book (2016)
  → Observability Engineering (2022) para observabilidade; Cohn (2009) → Fowler
  → Testing Trophy → DeMillo/Lipton/Sayward (1978) para testes e mutação.

### Critério do que entrou no CV

Só o **Nível 1**: trabalho que já era verdade e só não estava escrito. Nada de
OpenTelemetry, mutation testing, fitness function ou acessibilidade entrou —
seria declarar competência inexistente. A lista completa das nove mudanças está
na seção 6 do documento de pesquisa.

O achado que sustenta o item mais forte: a `painel-git` tem fluxo de code review
de verdade (`lib/pr.php` com `create_pr`, `approve_pr`, `comment_pr`,
`merge_pr`, `pr_compute_diff`) e política de branch aplicada por hook
(`lib/policy.php`). "Code review" era lacuna em 3 vagas e estava ausente do CV
de quem **construiu** o mecanismo.

### Efeito medido

Linha de base gerada do HEAD em worktree separado, contra o mesmo snapshot de
1.129 vagas — a diferença é atribuível só a esta edição:

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

Os 102 testes continuam passando. `voip` segue não mensurável — não há vaga de
telecom no snapshot (frente 2 das próximas frentes).

**O que o número não diz:** não houve ganho de capacidade nenhum. O salto é
grande porque três termos de alta frequência estavam ausentes por omissão de
escrita — o CV só parou de esconder o que já existia.

### Calibragem registrada

Nenhum dos termos dos dois prompts (Sentry, Datadog, NewRelic, OTel, Biome,
commitlint, Knip, Stryker, Codecov) aparece nas 1.129 vagas coletadas. O que
essas vagas pedem e falta continua sendo Azure, SQL Server, C#/.NET,
Totvs/Protheus e SAP. Esses prompts são a régua do mercado freelance/remoto/
internacional, não a do CLT de InfoJobs — os dois caminhos são legítimos, mas
não são o mesmo investimento.

### Confirmado depois: code review nos empregos formais

O usuário confirmou que havia code review formal na `elev` e na `tw-solutions`.
Os bullets foram escritos, dobrando os já existentes em vez de criar linha nova:

- **`elev`** — "supervisionando 11 desenvolvedores **e conduzindo o code review
  das entregas do time**" (variantes base, dev, frontend, qa, dados, rpa).
- **`tw-solutions`** — "referência técnica **dos pipelines de CI/CD e do code
  review de pull request** no Bitbucket" (variantes base, dev, devops, qa).

**A aderência não mudou com isso, e é esperado:** a ferramenta conta presença de
termo, e "code review" já tinha entrado pela competência. O que mudou é a
evidência — quem lê o CV agora vê *onde* a prática aconteceu, em vez de uma
competência declarada sem lastro no histórico. Bom lembrete de que o número mede
palavra-chave, não qualidade de candidatura.

### Sincronia com os bots

O `cv.txt` dos dois bots (`bots/infojobs/` e `bots/vagas/` da
`vagas-automation-suite`) era de **30/07 e trazia o título "Arquiteto de
Soluções VoIP Sênior"** — anterior a todo o trabalho multi-perfil. Substituído
pelo perfil `dev` e commitado lá (`7abd194b`), com autorização do usuário.

**Ponto para revisar:** `dev` é o padrão por volume de vagas (62), não por
aderência. Depois desta rodada, `frontend` (72%) e `dados` (67%) pontuam acima
de `dev` (66%) — a decisão 17 continua valendo a revisão.
