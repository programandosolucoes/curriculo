# Estratégia de CV — valorização, certificações e multi-perfil

Doc vivo (não é um plano fechado) — registra a direção de pensamento sobre
como aumentar a aderência real do CV às vagas coletadas. Início: rodada de
aderência de 2026-07-27 (ver `aderencia/2026-07-27-aderencia-cv.md`).

## Contexto: resultado da rodada de 2026-07-27

236 vagas analisadas (8 categorias de TI do perfil), aderência média 45%.
Pontos fortes confirmados: SQL (45 vagas), Power BI (27), Python (21), AWS
(15), DevOps (14), Docker/CI-CD (11 cada), Scrum (10). Lacunas mais
pedidas que não aparecem no CV: Git (20), Azure (18), React (11), ETL
(11), LGPD (11), Excel avançado (11), SQL Server (10), C# (8), TypeScript
(7), DAX (7), ITIL (7), SAP (7).

## Esclarecimento do usuário (importante, não é achado meu)

Boa parte do que o relatório lista como "lacuna" **não é lacuna real de
conhecimento** — é lacuna de **documentação no CV** ou de **certificação
formal** sobre uma experiência que já existe. Duas situações distintas,
que pedem tratamento diferente:

1. **Tenho a experiência, só não está escrita no CV** → resolve só
   editando o CV (não é "mentir", é tornar explícito o que já é real).
2. **Tenho a experiência prática, mas não tenho o certificado formal** →
   aqui a honestidade importa: dá pra descrever a experiência prática
   normalmente (ex: "provisionamento de VMs no Azure em produção"), mas
   evitar redigir como se fosse uma certificação que não existe (ex: não
   escrever "Microsoft Certified: Azure" sem ter o certificado — escrever
   o que foi feito na prática, e listar a certificação separadamente como
   meta, se for o caso).

**Minha tentativa de categorização das lacunas do relatório (a confirmar
com o usuário — só ele sabe o nível real de cada uma):**

| Termo | Categoria provável | Raciocínio |
|---|---|---|
| Git | (1) só falta escrever | CV já cita CI/CD, Bitbucket, Jenkins — pressupõe Git no dia a dia |
| Azure | (1) ou (2) | Se já usou na prática, só falta escrever; se quer o peso de certificação, existe AZ-900 (barato, rápido) |
| LGPD | (1) ou (2) | CV já tem WAF/OWASP/segurança — LGPD é extensão natural da mesma área |
| ITIL | (2) provável | Framework consagrado por certificação (ITIL Foundation) — se já aplica na prática via NOC/SRE, vale nomear a prática E considerar o Foundation (curso curto) |
| Excel avançado / ETL / DAX / Power Query | (1) provável | Complementam o Power BI que já está no CV — evolução natural, não salto |
| React / TypeScript / Next.js | (3) a confirmar | Fora do forte atual (CV cita Angular, mas antigo) — pode ser lacuna real |
| SQL Server / C# / .NET | (3) a confirmar | Ecossistema Microsoft — CV é forte em MySQL/PostgreSQL/Node/PHP, stack diferente |
| SAP / Protheus / Totvs | (3), nicho à parte | ERPs específicos — só vale investir se for mirar vagas de "Analista de Sistemas" corporativo |

(1) = só escrever no CV · (2) = escrever a prática + certificação é decisão à parte · (3) = candidato real a curso

## Cursos/certificações candidatas (se o usuário confirmar categoria 2 ou 3)

- **AZ-900 (Azure Fundamentals)** — curto, barato, fecha a lacuna de Azure com credencial formal; simétrico ao "AWS Foundations" que já está no CV.
- **ITIL Foundation** — curto, universalmente reconhecido, alinhado com o histórico de NOC/SRE/DR do CV.
- **PL-300 (Power BI Data Analyst)** — formaliza DAX/Power Query/ETL, que já são vizinhos do Power BI existente.
- **Curso de LGPD / Encarregado de Dados (DPO)** — vários cursos curtos reconhecidos no mercado brasileiro; complementa a seção de segurança do CV.
- Git: não tem certificação de mercado relevante — só precisa entrar como skill escrita.

## Proposta do usuário: CV/perfil multi-grupo (várias versões, uma por área)

Ideia: em vez de um único CV genérico, ter **várias versões do CV** (ou do
"perfil" usado pro match), cada uma com ênfase diferente por grupo de
vaga (ex: um CV puxando pra DevOps/Cloud, outro puxando pra VoIP/Telecom,
outro puxando pra Dados/BI) — e rodar `aderencia.js` separadamente pra
cada perfil contra as categorias relevantes daquele grupo, ajustando
ênfase até maximizar aderência por grupo.

**Opinião (Claude):** concordo com a ideia — é prática padrão de busca de
emprego (CV genérico dilui densidade de palavra-chave pra qualquer vaga
específica; recrutador e ATS recompensam CV que "conta uma história"
clara pro cargo). A arquitetura atual já facilita isso a baixo custo:

- `core/termos-mercado.js` + `core/aderencia.js` já são genéricos o
  bastante pra rodar contra qualquer texto de CV — só precisa de um
  ponto de entrada que aceite "qual perfil rodar" (hoje é fixo em
  `bots/infojobs/cv.txt`).
- Os bots já têm o precedente de "um `cv.txt` por bot" — estender pra
  "um `cv.txt` por perfil/grupo" é evolução natural, não reescrita.

**Ressalvas a considerar antes de implementar:**

1. **Fonte única de fatos.** As variantes não podem divergir em datas,
   empresas, métricas — só podem divergir em ênfase/ordem/o que é
   destacado. Risco real: duas versões do CV que se contradizem em fatos
   parecem pior que um CV único, não melhor. Vale manter um arquivo
   "mestre" com os fatos e derivar as variantes dele (manual ou script),
   não escrever cada variante do zero.
2. **Candidatura automática vs. score de aderência são coisas
   separadas.** O score (`aderencia.js`) já funciona pra qualquer CV
   sem mudança nenhuma. Já a CANDIDATURA automática (bots `apply.js`)
   assumir qual CV anexar por vaga é outro problema — precisa confirmar
   se InfoJobs/Vagas.com.br aceitam anexo de CV por candidatura
   individual ou só um CV fixo por conta/perfil da plataforma (não
   verificado ainda). Vale testar isso ANTES de investir em trocar CV
   automaticamente por candidatura.
3. Nada disso bloqueia o primeiro passo, que é independente: 2 ou 3
   variantes de CV escritas manualmente (DevOps/Cloud, VoIP/Telecom,
   Dados/BI) e `aderencia.js` rodado uma vez pra cada uma, pra já
   enxergar o ganho antes de automatizar qualquer coisa.

## Seção de IA/LLM no CV (pedido do usuário, 2026-07-27)

O CV atual não tem nenhuma seção de IA/LLM — apesar de o usuário ter
experiência real e atual nessa área, em dois níveis diferentes:

1. **Uso de ferramentas de codificação assistida por IA na prática
   diária** — usuário usa Claude Code, e sabe conduzir o processo de
   especificação (spec-driven development: brainstorm → spec → plano →
   implementação → revisão) mesmo em contextos sem plugin/skill pronta,
   porque entende o processo de verdade, não só aciona ferramenta pronta.
   Isso é uma habilidade real e valorizada em 2026 (engenharia assistida
   por IA/"AI-assisted engineering"), diferente de simplesmente "usar
   ChatGPT" — vale nomear explicitamente, não só como ferramenta mas como
   metodologia de trabalho.
2. **Experiência prática construindo COM múltiplos provedores de IA** —
   já documentada em código real neste próprio projeto
   (`core/ia-provider.js`): cadeia de fallback com 7 provedores
   (OpenRouter, OpenAI, Anthropic, NVIDIA NIM, OpenCode Zen), dois
   formatos de API (OpenAI-compatível e Anthropic Messages). Isso é
   experiência de integração real, não só "uso a ferramenta".

**Pedido:** listar os principais fornecedores de IA (fornece vocabulário
pro CV E pro `core/termos-mercado.js`, já que vagas reais já citam "IA
generativa" nos requisitos — visto ao vivo numa vaga júnior coletada).
Candidatos: OpenAI/ChatGPT, Anthropic/Claude (Claude Code), Google
Gemini, Meta Llama, Mistral, DeepSeek, NVIDIA NIM, OpenRouter, AWS
Bedrock, Azure OpenAI — mais os conceitos/práticas: prompt engineering,
RAG, agentes de IA/multi-agente, MCP (Model Context Protocol, o usuário
já usa via pfSense MCP), fine-tuning, embeddings.

**Fonte de evidência real: os outros projetos do usuário no painel-git.**
Em vez de escrever a seção de IA de forma genérica, minerar os projetos
já existentes (repositórios hospedados no painel-git, alguns clonados em
`~/ide/`) pra virar bullets concretos e verificáveis, ex:
- `vagas-automation-suite` (este projeto): motor multi-provedor de IA
  com fallback em cadeia; automação de candidatura com geração de
  respostas via IA a partir do CV.
- `pfsense-mcp` (instalado, ver memória do usuário): uso de MCP pra
  automação/gestão de infraestrutura de rede via IA.
- `analisador-chamadas`/`nextqualify-auditor`: análise de qualidade de
  chamadas por processamento de sinal (não é IA generativa, mas é
  detecção automatizada — vale avaliar se entra na seção de IA ou fica
  separado, a definir).
- `evoluaiv2-merge`: plataforma de scoring de atendimento com IA (ver
  memória do usuário sobre o projeto).
- Outros projetos no painel-git ainda não inventariados nesta sessão —
  próximo passo é listar o que existe lá e extrair achados técnicos
  reais de cada um (não assumir pela leitura de memória antiga, inspecionar
  o código real, mesma disciplina já usada neste projeto).

## Inventário completo dos projetos do painel-git (2026-07-27)

Levantamento real: SSH em `git.programandosolucoes.com.br` (porta 65002),
listagem de `public_html/git/repos/`, clone completo dos 30 repositórios
pra `/tmp/.../painel-git-survey/` (histórico de commits + arquivos —
apagado ao final da sessão, é scratch), estatísticas via `git log`/
`git ls-files`, e 13 sub-agentes paralelos investigando os repositórios
sem contexto óbvio (README + código-fonte de verdade, não só nome).
Metodologia pedida pelo usuário: cada projeto vale ~3 meses de trabalho
freelance por padrão, ajustado pra cima quando o tamanho/complexidade
real sustentar isso.

### Triagem: exclusões e fusões

**Excluídos (não são trabalho freelance):**
- `art.git` — backup pessoal de pasta de documentos (67658 arquivos, é
  um dump, não um projeto).
- `asterisk.git` / `bcg729-1.0.2.git` / `g729.git` — só backups de
  tarballs de terceiros (Asterisk, codec G.729), não código autoral.
- `discador.git` / `manual-chat.git` / `meu-novo-app.git` /
  `teste-gitolite.git` — vazios ou só um README placeholder.
- `conversio-mail-mock.git` — utilitário de teste do `conversio`, não é
  projeto separado.
- `airllm.git`, `email_cleanup_bot.git`, `mxq-pro-linux.git` — projetos
  pessoais/hobby (não freelance), mas relevantes pra seção de IA/homelab
  do CV (ver abaixo).
- `manualdesuporte.git` — demo single-file pequena (chatbot em JS puro,
  1334 linhas), real mas pequena demais pra virar item de freelance —
  vale no máximo uma linha de "front-end vanilla JS" se sobrar espaço.

**Fundidos em UM projeto cada (evolução/módulos do mesmo produto, não
freelances separados):**
- `infojobs_automation` + `vagas_automation` + `vagas-automation-suite`
  → uma linha evolutiva (automação de candidatura, já documentada à
  exaustão nas sessões deste repositório).
- `zib` + `conversio` → confirmado pelo próprio código: `conversio` é
  uma reescrita documentada (`DOCUMENTACAO_COMPARATIVA_ZIB_CONVERSIO.md`)
  do `zib` (Node/React, gerado no Replit) pra Laravel/PHP, visando
  hospedagem própria (shared hosting) em vez de depender de infra Node.
- `painel-discador` + `motordediscagem` + `dbdialer` + `ivr-custom` +
  `ivr-flow-designer` + `installer-lxc-dialer` + `mailling-detalhes` →
  confirmado pelo autor dos commits (`admin@painel-discador` aparece
  dentro de `ivr-custom`) que são módulos de UMA MESMA plataforma de
  discador: painel web, motor de discagem, schema de banco + engine de
  IVR via ODBC, dialplan Asterisk JSON-driven, editor visual de fluxo,
  runbook de provisionamento de infra, e importador de mailing.

### Os 7 projetos freelance consolidados (stack, metodologia, duração estimada)

| # | Projeto | Stack / metodologia | Evidência de duração real | Estimativa |
|---|---|---|---|---|
| 1 | **Automação de candidatura a vagas** (infojobs/vagas/suite) | Node.js, Puppeteer, Prisma/SQLite, motor de regras próprio, IA multi-provedor (7 fallbacks: OpenRouter/OpenAI/Anthropic/NVIDIA NIM/OpenCode Zen), engenharia assistida por IA (Claude Code, spec-driven) | Commits concentrados entre 30/06 e 27/07/2026 | 3 meses (padrão) |
| 2 | **Plataforma de Discador VoIP para Call Center** (painel + motor + IVR + infra) | Python, Flask, PostgreSQL (realtime ODBC), React, Asterisk ARI/PJSIP (compilado do zero), LXC + Docker/docker-compose, webhooks assíncronos, NAT/iptables multi-tenant | `dbdialer`: commits de 30/01/2025 a 08/07/2026 (18 meses); `motordediscagem`: 30/01/2025 a 13/03/2026; `painel-discador`: 23/09/2025 a 16/07/2026 — evolução incremental genuína (protótipo CSV → arquitetura MVC → discagem horizontal com controle multinível → engine de IVR completo) | **12-18 meses** — maior projeto do portfólio |
| 3 | **Plataforma de Atendimento Omnichannel Multi-tenant** (zib → conversio) | zib: React 18/TS, Node/Express, Drizzle ORM, Postgres (Supabase/Neon), LiveKit/mediasoup (vídeo+IA de segmentação), WAHA/WaVoIP · conversio: reescrita Laravel 12, 5 drivers de WhatsApp, IA (Groq/Llama3) em jobs assíncronos de sentimento/qualidade, RBAC multi-tenant, motor de automação, suíte de testes própria | zib: 500 arquivos, produto completo (~17 páginas) · conversio: 531 arquivos, 46 commits em 10 dias, mas cobrindo reescrita INTEIRA com paridade de features | **5-6 meses** — maior complexidade técnica do portfólio (2 implementações completas do mesmo domínio) |
| 4 | **painel-git — plataforma própria de hospedagem Git** | PHP, WebDAV, CI/CD com dispatch assinado HMAC, criptografia AES-256-GCM, gestão de chaves SSH, backup/restore | 129 commits, 22/08/2025 a 26/07/2026 (quase 1 ano, ainda ativo) | **9-11 meses** |
| 5 | **Análise de qualidade de chamadas / auditoria de classificador AMD** (analisador-chamadas + nextqualify-auditor) | Python 3.14, DSP próprio em NumPy (FFT/espectro), E-model ITU-T G.107 (R-factor→MOS) implementado do zero, IA **local em CPU** (faster-whisper int8 + LLM GGUF via llama.cpp + ONNX Runtime/DNSMOS), Flask + SQLite (WAL), multi-tenancy com isolamento físico, SPA vanilla sem build, Docker/gunicorn/systemd — ver inventário técnico detalhado abaixo | Bursts intensos e curtos (9 dias / 39 commits e 1 dia / 43 commits) | 3 meses (padrão) |
| 6 | **SIP proxy Kamailio** (sipproxy-fusionpbx) | Python, Docker, Kamailio, foco NAT/modo transparent (clone enxuto do dSIPRouter) | 51 commits em 3 dias, projeto ativo/recente | 3 meses (padrão) |
| 7 | **Sistema de Leitura de Transponder — retaguarda de pedágio eletrônico** (slt) | Python, FastAPI/uvicorn, `cryptography` (AES-128/256 em 5 modos), Protobuf + JSON + SOAP/XML, JMS/STOMP (ActiveMQ), licenciamento RSA-2048 por hardware, PyInstaller, pytest/Locust/mypy; normas ISO/IEC 18000-63 e 29167-10 + Resolução ARTESP 001/2014 | 1 commit (30/06/2026) é só o despejo do código; **a duração real veio do contrato**, não do git | **2 meses** — fase de Discovery, papel de **Arquiteto de Software Hands-On** (confirmado pelo usuário em 2026-07-30) |

### Vocabulário novo pro CV (linguagens, stacks, metodologias)

Confirmado por código real, não por nome do repositório:

- **Linguagens/runtimes novos ou reforçados:** PHP com Laravel de verdade
  (framework moderno, não só scripts soltos), TypeScript + React (via
  zib/ivr-flow-designer), PowerShell + Batch (scripting Windows
  cross-platform, via mxq-pro-linux), FastAPI (Python, usado em 2
  projetos distintos: slt e airllm).
- **Padrões de arquitetura:** multi-tenancy com RBAC granular (zib E
  conversio, dois exemplos reais), motor de automação/regras próprio
  (bot conversacional com estado, engine de IVR JSON-driven),
  arquitetura orientada a webhook assíncrono (em vez de polling),
  cadeia de fallback multi-provedor (já documentado na seção de IA).
- **Infra/DevOps:** LXC + Docker comparados lado a lado pra mesma stack,
  ODBC realtime (Asterisk↔PostgreSQL), NAT/iptables multi-instância,
  runbooks de infraestrutura versionados.
- **Domínio novo, forte diferencial:** conformidade regulatória/
  criptografia de protocolo (RFID/CIR, AES, ISO 18000-63/29167-10,
  homologação ARTESP) — nada parecido aparece no CV atual, é uma
  categoria inteiramente nova (compliance técnico).
- **IA (reforça a seção já planejada acima):** Groq/Llama3 em produção
  (conversio), Ollama local + fallback em cascata de 3 provedores
  (email_cleanup_bot), TensorFlow.js/MediaPipe pra segmentação de vídeo
  (zib).

## Inventário técnico dos projetos de áudio (2026-07-30)

Levantamento pedido pelo usuário: entrar em `analisador-chamadas` e
`nextqualify-auditor` e listar **tudo o que está em uso** — feito lendo o
código-fonte e os dois `.venv` reais (`pip list`), não os READMEs. A linha 5
da tabela acima estava subvendendo esses dois projetos em uma frase; aqui
está o conteúdo completo, que é a fonte do vocabulário novo do CV.

**Decisão do usuário (2026-07-30):** os modelos que ficaram *em avaliação*
(SQUIM, NISQA, DNSMOS — hoje desligados por padrão no produto) **também
contam como dado de currículo**. Eles entram, redigidos como o que foram de
verdade: **avaliação comparativa de modelos**, com corpus rotulado, métrica
de discriminação por eixo e decisão de arquitetura documentada — que é uma
competência mais rara que "instalei a lib".

### Bibliotecas Python — o que está instalado e em uso

**Terceiros, em uso no código de produção (as duas ferramentas):**

| Biblioteca | Versão | Para quê |
|---|---|---|
| `numpy` | 2.4.6 / 2.5.1 | **todo o DSP**: RMS por frame, dBFS, `sliding_window_view`, FFT (`np.fft.rfft`), percentis, polinômios (`np.poly1d`) |
| `flask` | 3.1.3 | painel web + API REST (31 endpoints no analisador, 19 no auditor) |
| `requests` | 2.34.2 | clientes HTTP das APIs (Yeastar OAuth2 / NextQualify Bearer), com `Session` reaproveitada |
| `python-dotenv` | 1.2.2 | configuração por `.env` |
| `faster-whisper` | 1.2.1 | ASR local em CPU (`device="cpu"`, `compute_type="int8"`, `vad_filter=True`) |
| `llama-cpp-python` | 0.3.33 / 0.3.34 | **LLM local em CPU** (llama.cpp) sobre GGUF Qwen2.5-1.5B-Instruct Q4_K_M |
| `onnxruntime` | 1.27.0 | inferência ONNX em CPU (`CPUExecutionProvider`) do DNSMOS P.835 |
| `urllib3` | 2.7.0 | supressão de warning de TLS autoassinado (appliance em IP) |

**Terceiros usados na avaliação de modelos (entram no CV como benchmark):**

| Biblioteca | Versão | Para quê |
|---|---|---|
| `torch` | 2.13.0+cpu | tensores/inferência sem grad (`torch.no_grad()`) para o SQUIM |
| `torchaudio` | 2.11.0+cpu | pipelines `SQUIM_OBJECTIVE` (PESQ/STOI/SI-SDR) e `SQUIM_SUBJECTIVE` (NMR), `functional.resample` |
| `librosa` | 0.11.0 | pré-requisito do NISQA na validação offline |
| `matplotlib` | 3.11.0 | pré-requisito do NISQA / inspeção de sinal |
| `pandas` | 3.0.3 | tabulação dos resultados do comparativo |

**Transitivas relevantes** (vêm do faster-whisper, mas definem o runtime real):
`ctranslate2` 4.8.1 (motor de inferência do Whisper), `av` 18.0.0 (PyAV),
`tokenizers` 0.23.1, `huggingface_hub` 1.22/1.24, `soundfile` 0.14.0.
Total: **74 pacotes** no venv do analisador, **42** no do auditor.

**Testes (dev):** `pytest` 9.1.1 + `responses` 0.26.2 (mock de HTTP) —
**121 testes** no `nextqualify-auditor`. O `analisador-chamadas` não tem
suíte pytest: valida por `selftest.py`, que **injeta picote e clipping em
sinal sintético** e confere se a detecção pega (teste de DSP sem depender do
PBX).

**Biblioteca padrão usada de forma não-trivial** (vale citar porque
substitui dependência externa): `sqlite3` (banco inteiro, com `PRAGMA
journal_mode=WAL` e `busy_timeout`), `threading` (`Lock`, `Event`,
thread-local, jobs em background), `hashlib`/`hmac`/`secrets` (PBKDF2-HMAC-SHA256,
`compare_digest`, geração de salt e secret key), `subprocess` (ffmpeg/ffprobe),
`wave`+`struct` (geração de WAV sintético nos testes), `unicodedata`
(normalização NFKD de transcrição pt-BR), `csv`, `uuid`, `tempfile`, `glob`.

**Fora do pip (dependência de sistema):** `ffmpeg` / `ffprobe` 8.0.1 — é o
decodificador de áudio do projeto (evita libsndfile e preserva os canais,
essencial para detectar one-way). **Python 3.14.4** nos dois venvs.

### Processamento de sinais e normas de telefonia (categoria nova no CV)

- **DSP**: energia RMS por frame (20 ms, hop 10 ms) → dBFS; janelas
  deslizantes vetorizadas; estimativa de **ruído de fundo por percentil**
  (o discriminador que separa picote de pausa natural); detecção de
  **clipping** por saturação de amostra; **SNR**; dead-air; one-way.
- **Análise espectral (FFT)**: **spectral flatness** (entropia de Wiener,
  som metálico/tonal), **spectral flux** (descontinuidade/robotização por
  PLC), **spectral centroid**.
- **Normas ITU-T implementadas**: **G.107 (E-model)** — `Ie,eff` e conversão
  R-factor→MOS do Anexo B, escritas do zero a partir da norma, alimentadas
  por perda-de-pacote *equivalente* estimada do próprio áudio;
  **P.862.1** (PESQ→MOS-LQO); **P.835** (eixos SIG/BAK/OVRL).
- **Vocabulário de qualidade de voz**: MOS, R-factor, PESQ, STOI, SI-SDR,
  PLC, impairment de codec (G.711 Ie=0 / G.729 Ie=11 / G.723.1 Ie=15).

### IA local e avaliação de modelos

- **Inferência local em CPU, sem nuvem**: Whisper quantizado int8 + LLM
  GGUF Q4_K_M (1,1 GB) + ONNX Runtime. Motivação real: os áudios são de
  clientes, não podem sair da máquina.
- **Prompt engineering estruturado**: system prompt + **6 exemplos few-shot**
  injetados como turnos `user→JSON`, `temperature=0.0`,
  `response_format={"type":"json_object"}`, coerção de schema na saída e
  fallback de extração por regex quando o JSON vem sujo.
- **Degradação graciosa em cadeia**: sem GGUF → matching de frases
  normalizadas; sem Whisper → segue só no DSP. O produto nunca quebra por
  falta de modelo.
- **Benchmark de modelos neurais de MOS** (`docs/COMPARATIVO_MODELOS_NEURAIS.md`
  do analisador): corpus real rotulado em 4 categorias (bom/picote/queda/ruído),
  métrica de **separação por eixo**, correlação de **Pearson**, comparação de
  DNSMOS P.835 × SQUIM objective/subjective × NISQA × E-model próprio.
  Conclusões: os neurais são **cegos a silêncio** (não penalizam dead-air);
  NISQA *discontinuity* é o melhor detector de picote mas os **pesos são
  CC BY-NC**, inviável comercialmente; SQUIM objective ficou
  **anticorrelacionado** porque o PESQ pune a banda estreita de 8 kHz
  inerente a qualquer telefonia. **Decisão documentada: manter o E-model
  próprio.** Ou seja: avaliação de modelo com critério técnico *e* de
  licenciamento.

### Arquitetura, dados e segurança

- **Multi-tenancy com isolamento físico** por UUID imutável (não pelo
  endereço do PABX), banco + áudio por tenant, resolução via header
  `X-Tenant` em thread-local, com o tenant recapturado no spawn da thread.
  Origem do requisito: `recording_id` é sequencial **por PBX**, então um
  layout global sobrescreveria a gravação de um cliente com a de outro —
  vazamento, não desorganização. Migração single→multi idempetente com
  backup automático do banco.
- **Autenticação**: PBKDF2-HMAC-SHA256 com salt por usuário,
  `hmac.compare_digest`, cookie `HttpOnly`/`SameSite=Lax`, log de acesso.
- **Concorrência**: jobs assíncronos em `threading`, lock serializando a
  renovação de token OAuth2 (o `refresh_token` do Yeastar é de uso único —
  duas threads renovando ao mesmo tempo estouram o limite de tokens do PABX),
  cursor persistido para o job nunca reconsultar a mesma janela.
- **Frontend com zero dependências**: SPA de arquivo único (2.081 linhas),
  HTML/CSS/JS vanilla ES6+, **sem build, sem npm, sem CDN**, tema
  claro/escuro por CSS Custom Properties, `<canvas>` desenhando o envelope
  real da forma de onda, player nativo com salto para o instante do defeito.
- **Auditoria de classificador (AMD)**: mapeamento de equivalência entre o
  `amd_reason` de terceiros e a classificação própria, com 5 categorias de
  divergência (concordante, falso positivo máquina→humano, falso positivo
  humano→máquina, defeito técnico, indeterminado) — na prática, uma matriz
  de confusão aplicada a um classificador de produção alheio.
- **Deploy**: Docker multi-modo (`--build-arg WITH_AI=0` para imagem slim),
  modelo Whisper pré-baixado na build, dados de cliente por volume (nunca na
  imagem), bind em `127.0.0.1`; gunicorn + systemd em LXC/Proxmox.

## Inventário técnico dos demais projetos (2026-07-30)

Mesmo método aplicado aos outros projetos: leitura dos manifestos reais
(`package.json`, `composer.json`, `requirements.txt`) e do código, não dos
READMEs. Os repositórios estão em `~/projects/` (discador, zib, conversio,
painel-git) e `~/ide/`.

> **Resolvido em 2026-07-30:** o `slt` foi clonado do painel-git
> (`git clone ssh://…:65002/…/repos/slt.git` → `~/ide/slt`) e está
> inventariado no item 7 abaixo. Todos os 7 projetos têm agora inventário
> de bibliotecas.

### 1. Plataforma de Discador VoIP (`~/projects/discador/`)

**painel-discador** (Python): Flask 3.1, **psycopg2** 2.9, **gunicorn** 23,
requests 2.32 · PostgreSQL 17 · Docker Compose com **healthcheck** e
`depends_on: service_healthy` · `app.py` 1.131 linhas, `models.py` 1.285,
~45 rotas REST · **15 arquivos de teste pytest** só do engine de IVR
(playback, DTMF, HTTP, timecondition, if-else, caseswitch, hangup, log,
recorder, goto-external, say, read-var-http, integração ODBC).

**Cliente da API do Proxmox VE** (`proxmox_api.py`): autenticação por
ticket (`PVEAuthCookie`) + `CSRFPreventionToken` sobre `/api2/json` —
provisionamento de container pelo painel.

**motordediscagem** (Python): `concurrent.futures` + `threading` para
discagem horizontal, `http.server` (`BaseHTTPRequestHandler`) recebendo
webhook do Asterisk, psycopg2 com `DictCursor`, logging, uuid.

**dbdialer** (PostgreSQL): 13 tabelas + 12 índices — `executions`,
`controls`, `threads`, `mailling_imported`, `mailling_status`,
`customer_profile`, `user_profile`, `dialer_siptrunk`, `cdr`, `cel`,
`dialer_log`, `horizontal_log`, `active_calls`, mais o schema do IVR
(`ivr_flows`, `ivr_flow_data`, `ivr_flow_steps`, `ivr_flow_tags`) ·
`postgresql.conf` (846 linhas) e `pg_hba.conf` tunados à mão.

**asteriskdialer** (Asterisk): **PJSIP**, **ARI** (Asterisk REST
Interface), **ODBC realtime** — `res_odbc`, `func_odbc`, `cdr_odbc`,
`cdr_adaptive_odbc`, `cel_odbc`, `cdr_pgsql`, `res_pgsql` — sobre
**unixODBC** (`odbc.ini`/`odbcinst.ini`, driver PostgreSQL Unicode).
O `func_odbc.conf` tem SQL escrito direto no dialplan (`SQL_ESC`),
incluindo healthcheck de conexão.

**ivr-custom** (dialplan JSON-driven): 16 contextos implementados —
playback, playback-dtmf, dtmf-http, playback-dtmf-http, timecondition,
if-else, caseswitch, hangup + hangup-handler, log, recorder,
goto-external, say, read-var-http, error-log. É uma **linguagem de fluxo
própria interpretada pelo dialplan**, não um IVR de menu fixo.

**ivr-flow-designer** (React): React 18, Create React App 5,
**TailwindCSS** + PostCSS, lucide-react, **Testing Library**
(jest-dom / react / user-event), web-vitals · `App.jsx` 871 linhas.
`ivr_convert.py` faz a conversão **bidirecional** entre o grafo do editor
e os steps do engine (roteamento vem das conexões do grafo).

### 2. Plataforma Omnichannel — `zib` (Node/TS) → `conversio` (Laravel)

**zib** — React 18 + **TypeScript**, **Vite** + **esbuild** + tsx,
**Express**, **Drizzle ORM** (+ drizzle-zod, drizzle-kit), PostgreSQL
(`pg`, **@neondatabase/serverless**, **@supabase/supabase-js**,
connect-pg-simple), **Passport** (passport-local), **JWT**
(jsonwebtoken), **bcryptjs**, multer, nodemailer, cors, express-session,
memorystore, nanoid · UI: **Radix UI** (30+ primitivos), TailwindCSS +
tailwind-merge + tailwindcss-animate + class-variance-authority + clsx,
**framer-motion**, **@tanstack/react-query**, **react-hook-form** +
@hookform/resolvers, **recharts**, embla-carousel, react-day-picker,
date-fns, cmdk, input-otp, next-themes, react-resizable-panels ·
Tempo real/mídia: **LiveKit** (client + server-sdk), **mediasoup**,
**@wavoip/wavoip-webphone** · IA no navegador: **TensorFlow.js** +
**@tensorflow-models/body-segmentation** + **@mediapipe/selfie_segmentation**
· Testes E2E: **Cypress** (+ @cypress/grep).

**conversio** — **PHP 8.2** + **Laravel 12**, laravel/tinker,
**webklex/php-imap** · dev: **PHPUnit 11.5**, **Mockery**, **FakerPHP**,
**Laravel Pint**, Pail, Sail, Collision · front: Vite +
laravel-vite-plugin + TailwindCSS + axios + concurrently · **41
migrations**, **23 arquivos de teste** · módulos: Analytics, Auth,
Automation, Chat, Connection, Mail, Pipeline, Tenant, Video, Webhook,
Widget · **5 drivers de WhatsApp atrás de uma interface**
(`WhatsAppDriverInterface`: Evolution, Native, WaVoIP, Waha, Whaticket) —
**padrão Strategy aplicado a integração**, o ponto mais forte do projeto ·
`AutomationEngine`, `BotFlowService`, `CRMService`, ingestão de e-mail por
IMAP com drivers próprios · Jobs assíncronos: `AiQualitySummaryJob`,
`AiSentimentMonitorJob`, `SyncWhatsAppHistoryJob`, `QueueHandoff` ·
IA: `GroqAIService` → API **Groq** (`llama-3.1-70b-instruct` e
`llama-3.1-8b-instruct`) · designer de IVR em JS puro (476 linhas).

### 3. `painel-git` — plataforma de hospedagem Git

PHP (>= 7.4, roda em **php:8.2-apache** no Docker) com **zero dependência
de runtime** — o composer só traz PHPUnit em dev. 31 arquivos PHP,
~10.800 linhas. O que está implementado do zero:

- **WebDAV (RFC 4918) escrito à mão**: OPTIONS, PROPFIND, MKCOL, PUT,
  DELETE, COPY, MOVE, **LOCK/UNLOCK** — com mutex **FIFO por caminho**,
  `flock` e detecção de sobreposição de escopo de lock.
- **Protocolo git smart HTTP** (`git-server.php`): upload-pack /
  receive-pack, mais `post-receive-handler.php`.
- **Autenticação por desafio criptográfico SSH**: servidor gera nonce, o
  cliente assina com `ssh-keygen -Y sign` e o servidor verifica com
  `ssh-keygen -Y verify` contra o `authorized_keys` — com tratamento
  explícito do replay (uma operação git manda o mesmo header em 2
  requisições; um desafio "de uso único" ingênuo quebraria clone/push).
- **Criptografia**: **AES-256-GCM** (`openssl_encrypt` com
  `OPENSSL_RAW_DATA`) para credenciais de CI/CD; **HMAC-SHA256**
  (`hash_hmac`) assinando o dispatch de action, com **validação
  anti-SSRF** do endpoint (HTTPS obrigatório).
- **Segurança de aplicação**: rate limiting, ban de IP, log de segurança,
  token CSRF, security headers, sanitização de entrada/nome de repo/usuário.
- **gitolite** para controle de acesso, `proc_open` para os processos git.
- **i18n em 4 idiomas** (pt-BR, en, it, zh) por arquivos JSON.

### 4. `sipproxy-fusionpbx` — SIP proxy Kamailio

**Kamailio** com 20 módulos em uso deliberado (`tm`, `sl`, `rr`, `pv`,
`maxfwd`, `sanity`, `ctl`, `xhttp`, `jsonrpcs`, `xlog`, **`rtpengine`**,
`textops`, `siputils`, `db_mysql`, **`permissions`**, **`drouting`**,
**`htable`**, **`nathelper`**, **`path`**, `kex`, `sdpops`) — com
disciplina declarada de "módulo só entra se estiver em uso ativo".

- **rtpengine** para relay de mídia / NAT traversal; modo transparent.
- **SIPp — 13 cenários XML de teste de protocolo**: negociação **G.729**
  (UAS conformante, payload type dinâmico × estático, **AVPF sem
  rtpmap**), INVITE inbound/outbound, REGISTER de ramal remoto, rejeição
  **403 unauthorized source** e **404 no route**. Isso é teste de
  conformidade de sinalização SIP, não teste de aplicação.
- **Painel Flask** (Flask 3.1 + Werkzeug 3.1) com **blueprints**
  (auth, carriers, dashboard, domains, inbound, manual, outbound, pbx,
  registrations), **SQLAlchemy 2.0 usando reflection + mapeamento
  imperativo** sobre as tabelas do motor, **PyMySQL** como driver puro
  Python para MariaDB, `werkzeug.security` para hash de senha.
- **Cliente JSON-RPC sobre HTTP** para o Kamailio (`kamailio_rpc.py`),
  porta TCP dedicada a RPC.
- **Migrations SQL versionadas**, provisionamento do FusionPBX por
  systemd unit + script + SQL, **4 Dockerfiles** (kamailio, rtpengine,
  fusionpbx, panel), Makefile, pytest.

### 5. Motor de automação autônoma de interação web (RPA)

> **Decisão de redação do usuário (2026-07-30):** este projeto entra no CV
> como **motor genérico de automação de interação web**, sem citar que a
> aplicação concreta é candidatura a vagas. É descrição fiel — o que existe
> no código é um motor multi-site com adaptadores por site.

Node.js + **Puppeteer 25**, **Prisma 5.22** sobre SQLite, runner de teste
nativo do Node (`node --test`) — **716 testes passando**, 46 módulos em
`core/`. Motor de regras próprio, adaptadores por site, painel web de
operação, evidência por screenshot, controle de ritmo, rede de segurança
e trava de concorrência. **Cadeia de fallback de IA multi-provedor**
(OpenRouter, OpenAI, Anthropic, NVIDIA NIM, OpenCode Zen) sobre **dois
formatos de API distintos** (OpenAI-compatível e Anthropic Messages),
com fallback determinístico quando todos falham.

### 7. `slt` — Sistema de Leitura de Transponder (retaguarda de pedágio)

Clonado em 2026-07-30. **55 arquivos, 3.950 linhas Python, 1 commit
(30/06/2026)** — o commit único é um "despejo" de um sistema já maduro,
não o histórico real do desenvolvimento. Cliente: **AstraMobi**
(autoria declarada no cabeçalho dos módulos).

**Bibliotecas Python:**

| Biblioteca | Para quê |
|---|---|
| **FastAPI** + **uvicorn[standard]** | API REST assíncrona (`POST /api/v1/slt/processar-leitura`, `/health`, `/license`) com middleware CORS |
| **cryptography** (hazmat) | AES via `Cipher`/`algorithms`/`modes` + `padding` — **10 combinações**: AES-128 e AES-256 nos modos **CBC, ECB, CFB, OFB e CTR** |
| **protobuf** | serialização binária; `slt.proto` em proto3 com `Passagem`, `DadosSensores`, `LeituraCompleta` |
| **stomp.py** | cliente **JMS/STOMP** para broker **ActiveMQ** (porta 61613), thread-safe com lock de conexão |
| **httpx** | cliente HTTP assíncrono |
| **pydantic** 2 + **python-dotenv** | validação e configuração |
| **pytest**, **pytest-asyncio**, **pytest-cov** | testes, inclusive de código assíncrono, com cobertura |
| **locust** | **teste de carga/performance** — nenhum outro projeto do portfólio tem isso |
| **black**, **flake8**, **mypy** | formatação, lint e **checagem estática de tipos** |
| **PyInstaller** | compilação para **binário único** distribuível (`slt.spec` + `scripts/compilar.py`) |
| stdlib | `xml.etree.ElementTree` (SOAP), `configparser`, `argparse`, `hashlib`, `secrets`, `base64`, `threading`, `logging`, `platform` |

**O que o sistema faz, tecnicamente:**

- **Parser do protocolo da antena CIR** (Componente Interrogador RFID):
  a `stringtag` chega como `[OBUID]_[PayloadHex]` e é decomposta em
  identificador do transponder + payload cifrado.
- **Decriptação AES do payload do chip**, com o modo escolhido por
  configuração (`slt.ini`) — chave e IV em hexadecimal.
- **Três serializadores de saída** para o mesmo dado, selecionáveis:
  **Protobuf**, **JSON** e **SOAP/XML**. É integração com sistema legado
  de concessionária, onde o formato é imposto pelo outro lado.
- **Publicação em fila JMS/STOMP** no broker da concessionária.
- **Licenciamento próprio de software**: assinatura **RSA-2048**,
  **hash do hardware** como identificador de máquina, data de expiração,
  três níveis (DEMO com cota diária / PROFISSIONAL / CORPORATIVO),
  com TPM/HSM previsto. Sem licença válida o sistema não opera.
- **CLI completa** (`argparse` com subcomandos): `init`, `run`, `test`,
  `license info|generate|demo`, `info`, `logs`.
- **Instaladores por distribuição**: Rocky Linux, Ubuntu e Windows.

**Normas e regulamentação implementadas** (o diferencial do projeto):
**ISO/IEC 18000-63** (RFID UHF em 915 MHz), **ISO/IEC 29167-10**
(suítes criptográficas ECB/CBC/CGCN para RFID) e **Resolução ARTESP
001/2014** (que define Protobuf como formato de serialização).

**Engenharia documentada**: 9 documentos de lições aprendidas escritos
durante o desenvolvimento (CPython e performance, criptografia AES,
servidor HTTP de alta performance, JMS + Protobuf, VPN e certificados,
compilação para binário único, logging, licenciamento, formatos
flexíveis), mais docs de arquitetura, planejamento, deploy, instalação e
revisão técnica.

> ⚠️ **Chave e IV versionados**: `projeto/keys/chave.aes` e `iv.aes`
> estão no repositório. Se forem material de teste, tudo bem; se forem
> de produção da concessionária, vale rotacionar. Registrado, sem ação.

**Redação escolhida pelo usuário (2026-07-30):** o CV apresenta o `slt`
como **projeto freelance contratado e entregue diretamente** ("recebi o
orçamento e fiz o projeto"), não como alocação via consultoria. O que
muda é a cadeia comercial, não o trabalho — a descrição fica restrita ao
que foi de fato executado (arquitetura da integração + implementação),
sem afirmar negociação de contrato, gestão de conta ou liderança de
equipe, que seriam checáveis e falsas.

**Contrato e papel (confirmado pelo usuário em 2026-07-30):** o repositório
inclui a proposta comercial `EASYCODE - ASTRAMOBI - Alocacao_Dev_V1.pdf`
(24/11/2025), que aloca dois perfis — Arquiteto de Software Hands-On e
Desenvolvedor Full-Stack — para a fase de **Discovery de 2 meses** de um
sistema de pedágio **free-flow** (identificação automática por placa,
perfil do veículo por **LiDAR**, contagem de eixos por câmeras laterais,
adaptação de tecnologia chinesa às regras brasileiras de cobrança por
eixo). O usuário atuou como **Arquiteto de Software Hands-On** e o
trabalho **durou os 2 meses de Discovery**, sem prorrogação. Datas para o
CV: **12/2025 – 01/2026**.

> 🔒 **Confidencialidade:** esse PDF é marcado como confidencial e é
> propriedade da EASYCODE, contendo rate card e custo mensal por perfil.
> **Nada desses valores entra no CV nem neste documento** — foram lidos
> só para datar o projeto e identificar o papel. O que é legítimo levar
> pro CV é o papel exercido, o escopo técnico e o período.

### 6. Projetos secundários (relevantes como vocabulário, não como freelance)

- **evoluaiv2** — o mais moderno do portfólio: **Bun** + **Turborepo**
  (monorepo com workspaces e catalog), **Hono**, **tRPC 11**, **Drizzle
  ORM**, **better-auth**, **Zod 4**, **BullMQ** + **ioredis** (filas),
  **Next.js**, stack **TanStack** completa (react-query, react-router,
  react-table, react-form, react-virtual), **shadcn/ui** + Base UI,
  TailwindCSS 4, **Sentry**, **pino**, SDK da **OpenAI**, **AWS SDK S3**
  com presigned URL, **fumadocs** (documentação em MDX), **Vitest**,
  **Biome**, `trpc-to-openapi`, mermaid, mammoth, dnd-kit, recharts.
- **email_cleanup_bot** — imap-simple, mailparser, nodemailer,
  **puppeteer-extra + plugin-stealth**, Playwright.
- **asterisk-media-server-lab** — Asterisk como media server, Docker
  Compose, **SIPp**, captura de pacotes, transcodificação, relay/NAT;
  produziu um estudo comparativo de arquitetura de media farm.
- **vitalpbx-whatsapp-calling** — **WhatsApp Calling da Meta** (Graph
  API, não REGISTER SIP) integrado a Asterisk/VitalPBX, DTLS-SRTP.
- **pfsense-restapi-fixes** — PHP/composer, **Vagrant**, mkdocs;
  correções em API REST de firewall.

### Consolidado — o que aparece em MAIS DE UM projeto (peso real no CV)

| Tecnologia | Em quantos projetos |
|---|---|
| **Python** | discador (painel + motor), sipproxy (painel), analisador, auditor — **4** |
| **Flask** | discador, sipproxy, analisador, auditor — **4** |
| **PostgreSQL** | discador, zib, evoluaiv2 — **3** |
| **Docker / Compose** | praticamente todos — **7+** |
| **React** | zib, ivr-flow-designer, evoluaiv2 — **3** |
| **TypeScript** | zib, evoluaiv2 — **2** |
| **TailwindCSS** | zib, ivr-flow-designer, evoluaiv2, conversio — **4** |
| **Asterisk** | discador, asterisk-lab, vitalpbx, conversio (IVR) — **4** |
| **SIPp** (teste de protocolo SIP) | sipproxy, asterisk-lab — **2** |
| **pytest / PHPUnit / Vitest / node:test** | todos têm suíte — **7** |
| **Drizzle ORM** | zib, evoluaiv2 — **2** |
| **Integração de LLM** | conversio (Groq), suite RPA (5 provedores), analisador/auditor (local), evoluaiv2 (OpenAI) — **4** |

## Reavaliação das lacunas do relatório de aderência (após o inventário)

Cruzando as 12 lacunas do relatório de 2026-07-27 com o que o inventário
de projetos realmente confirmou:

**Fecharam de verdade (evidência real em código, não suposição):**
- **Git** (20 vagas) — óbvio em retrospecto: os 30 repositórios inteiros
  são histórico Git real, com centenas de commits. Só não estava
  escrito no CV.
- **React** (11 vagas) — confirmado em produção em 2 projetos (`zib`,
  `ivr-flow-designer`), não é teórico.
- **TypeScript** (7 vagas) — confirmado via `zib` (React 18 + TS).

**Continuam em aberto de verdade (o inventário NÃO encontrou evidência
em nenhum dos 30 repositórios) — candidatos reais a curso, não só a
"escrever no CV":**
- **Azure** (18 vagas) — toda a infra encontrada é AWS/GCP/on-premise
  (LXC/Proxmox), nenhum projeto usa Azure. Mantém a recomendação do
  AZ-900.
- **SQL Server** (10 vagas) / **DAX** (7) — todo o portfólio usa
  PostgreSQL/MySQL; nenhum BI com Power BI/DAX de verdade apareceu nos
  projetos (só está no CV atual como competência declarada).
- **C#/.NET** (8/6 vagas) — nenhum projeto usa .NET; stack real é
  Python/PHP/JS/TS.
- **LGPD** (11 vagas) — o `slt` tem compliance regulatório forte (ISO,
  ARTESP), mas é uma área ADJACENTE, não o mesmo conteúdo — LGPD
  especificamente não aparece em nenhum projeto.
- **Excel avançado** (11 vagas) — nenhuma evidência em nenhum projeto.
- **SAP** (7 vagas) — nenhuma evidência.
- **ITIL** (7 vagas) — nenhum projeto documenta processo ITIL formal
  (o histórico de NOC/SRE do CV já é ITIL-adjacent na prática, mas sem
  certificação nem nomenclatura formal em nenhum lugar).

**Achado novo que NÃO estava na lista de lacunas original** (o
vocabulário de `core/termos-mercado.js` não cobria isso ainda, mas é
real e forte): **compliance regulatório/criptografia de protocolo**
(RFID/CIR, AES, ISO 18000-63/29167-10, ARTESP) e **multi-tenancy/RBAC**
— nenhuma vaga coletada até agora pediu isso explicitamente (por isso
não apareceu como "lacuna"), mas são diferenciais reais que vale
destacar mesmo sem demanda de mercado medida ainda.

**Conclusão prática:** dos 12 itens da lista original, o inventário
resolveu 3 (Git, React, TypeScript — só precisam entrar no CV). Os
outros 9 continuam sendo lacunas reais de conhecimento, não de
documentação — a recomendação de cursos da seção anterior (AZ-900,
ITIL Foundation, PL-300, LGPD/DPO) continua de pé, sem mudança.

## Rascunho de texto pronto pro CV (revisar antes de colar)

Texto no MESMO estilo do CV atual (bullets com verbo de ação, técnico,
sem métricas inventadas — os projetos abaixo não tinham números de
impacto documentados como os empregos formais têm, então não fabriquei
percentuais; se você tiver números reais, adicione).

**Datas — como foram fechadas (2026-07-30).** O usuário pediu pra fixar
valores e encerrar o item. Base de cada uma, pra você poder defender em
entrevista:

| Projeto | Data no CV | De onde veio |
|---|---|---|
| Discador VoIP | **01/2025 – 07/2026** | **Evidência forte.** 18 meses de commits incrementais reais em 3 repositórios (dbdialer 01/2025→07/2026, motordediscagem 01/2025→03/2026, painel-discador 09/2025→07/2026). |
| Hospedagem Git | **08/2025 – atual** | **Evidência forte.** 129 commits contínuos de 08/2025 a 07/2026 no mesmo repositório. |
| Pedágio (slt) | **12/2025 – 01/2026** | **Confirmado por contrato** + confirmação do usuário: Discovery de 2 meses, papel de Arquiteto Hands-On. |
| Motor RPA | **06/2026 – atual** | **Evidência forte.** Bots iniciais em 06/2026, suite com 190 commits em 07/2026, projeto ativo. |
| Análise de áudio | **07/2026 – atual** | **Evidência forte.** 39 + 43 commits em 07/2026, projetos ativos. |
| SIP Proxy | **07/2026 – atual** | **Evidência forte.** 56 commits em 07/2026, projeto ativo. |
| Omnichannel | **02/2026 – 07/2026** | ⚠️ **A única estimada de verdade.** O `zib` entrou no git num commit só (06/2026), então o git não diz quando começou — mas é um produto completo de 500 arquivos (React 18/TS, LiveKit, mediasoup, TensorFlow.js, Cypress), impossível de construir no mês em que foi despejado. Estimei ~4 meses pro `zib` + os 2 meses documentados da reescrita em Laravel = 6 meses. **Corrija se lembrar do mês real de início.** |

Regra que segui: onde o git tem histórico incremental, a data é o
histórico. Onde o repositório é um despejo de commit único, o git só
prova o fim — aí estimei pelo tamanho do que foi entregue e marquei como
estimativa. Nenhuma data foi inventada sem base.

> **Sobreposição de períodos — resolvida pelo usuário (2026-07-30).**
> Levantei que vários períodos correm em paralelo (o discador,
> 01/2025–07/2026, cobre quase todos os outros). O usuário esclareceu que
> **atua como PJ e pode pegar quantos trabalhos quiser em paralelo** — a
> sobreposição é legítima e não precisa ser escondida nem explicada. A
> seção fica rotulada "PROJETOS FREELANCE / PORTFÓLIO TÉCNICO", separada
> da experiência profissional formal, com a nota de que são projetos
> executados como PJ em paralelo às atividades acima.

### Seção nova: COMPETÊNCIAS — IA & LLM

```
IA & LLM:
- Engenharia assistida por IA (Claude Code) com metodologia spec-driven
  (especificação → plano → implementação → revisão adversarial)
- Integração multi-provedor com fallback em cadeia (OpenRouter, OpenAI,
  Anthropic/Claude, NVIDIA NIM, Groq/Llama3, Ollama local)
- Inferência local em CPU, sem nuvem (dados sensíveis não saem da máquina):
  LLM quantizado GGUF via llama.cpp, ASR com faster-whisper int8, ONNX Runtime
- Prompt engineering estruturado: few-shot, saída JSON forçada, coerção de
  schema e fallback determinístico quando o modelo falha
- Avaliação comparativa de modelos (MOS neural: DNSMOS P.835, TorchAudio SQUIM,
  NISQA) com corpus rotulado, métrica de discriminação por eixo e critério de
  licenciamento comercial na decisão de arquitetura
- MCP (Model Context Protocol) para automação de infraestrutura via IA
```

### Seção nova: COMPETÊNCIAS — Processamento de Sinais & Ecossistema Python

```
Processamento de Sinais / Áudio:
- DSP em Python/NumPy: energia por frame (RMS/dBFS), janelas deslizantes
  vetorizadas, FFT e features espectrais (flatness, flux, centroide)
- Qualidade de voz por norma ITU-T: E-model G.107 (R-factor → MOS)
  implementado do zero, P.862.1 (PESQ→MOS-LQO), P.835 (SIG/BAK/OVRL)
- Detecção de defeito em telefonia: picote/dropout por perda de pacote,
  clipping, dead-air, one-way, SNR; codecs G.711/G.729/G.723.1 e PLC
- ASR (reconhecimento de fala) local e classificação de transcrição pt-BR
- ffmpeg/ffprobe para decodificação multi-formato preservando canais

Python:
- Bibliotecas: NumPy, Flask, requests, pytest, python-dotenv, ONNX Runtime,
  PyTorch/TorchAudio, faster-whisper (CTranslate2), llama-cpp-python,
  librosa, pandas, matplotlib, responses
- Padrão: sqlite3 (WAL), threading (Lock/Event/thread-local), hashlib/hmac/
  secrets (PBKDF2-HMAC-SHA256), subprocess, csv, wave, unicodedata
- Concorrência: jobs assíncronos em background, serialização de renovação
  de token OAuth2 de uso único, cursor persistido e parada verificada
```

### Seção nova: PROJETOS FREELANCE (ou "PORTFÓLIO TÉCNICO")

```
- Plataforma de Discador VoIP para Call Center (projeto próprio/freelance) | 01/2025 – 07/2026
  Arquitetei e mantive uma suite completa de discador para call center: painel
  web de gestão (Python/Flask/gunicorn sobre PostgreSQL 17), motor de discagem
  horizontal com controle de concorrência multi-nível (concurrent.futures +
  threading, Asterisk ARI/PJSIP) e engine de IVR JSON-driven — uma linguagem
  de fluxo própria com 16 primitivas (playback, DTMF, condicional, switch,
  time condition, gravação, chamada HTTP, salto externo) interpretada pelo
  dialplan, com backend realtime via ODBC (unixODBC/func_odbc/CDR/CEL sobre
  PostgreSQL) e editor visual de fluxo em React/Tailwind com conversão
  bidirecional grafo↔steps. Provisionamento de infraestrutura por LXC e Docker
  (comparação arquitetural documentada entre as duas abordagens) e cliente
  próprio da API do Proxmox VE para criar os containers pelo painel, com
  NAT/iptables multi-tenant e webhooks assíncronos substituindo polling.
  Modelagem de 17 tabelas e tuning manual de PostgreSQL; 15 suítes pytest
  cobrindo cada primitiva do IVR ponta a ponta.

- Plataforma de Atendimento Omnichannel Multi-tenant (projeto próprio/freelance) | 02/2026 – 07/2026
  Liderei a reescrita completa de uma plataforma SaaS de atendimento
  (originalmente Node.js/React/Drizzle) para Laravel 12/PHP, mantendo paridade
  de funcionalidades para viabilizar hospedagem própria em vez de infra Node
  dedicada. Integrei 5 gateways de WhatsApp atrás de uma única interface de
  driver (Evolution, WAHA, Whaticket, WaVoIP, Meta Cloud API) — padrão Strategy
  aplicado a integração, permitindo trocar de gateway sem tocar na aplicação —
  além de ingestão de e-mail por IMAP com a mesma abordagem, motor de automação
  conversacional com estado, RBAC multi-tenant de 4 níveis e jobs assíncronos
  de IA (Groq, Llama 3.1 70B/8B) para análise de sentimento e qualidade de
  atendimento sem bloquear a operação. 41 migrations e 23 suítes PHPUnit.
  A versão anterior (React 18/TypeScript, Express, Drizzle ORM, PostgreSQL)
  já incluía videochamada WebRTC (LiveKit/mediasoup), webphone SIP embarcado
  e segmentação de fundo por IA no navegador (TensorFlow.js/MediaPipe), com
  testes E2E em Cypress.

- Arquiteto de Software (Hands-On) — Retaguarda de Pedágio Eletrônico (freelance) | 12/2025 – 01/2026
  Atuei como arquiteto hands-on na fase de Discovery de um sistema de pedágio
  free-flow, definindo a visão técnica das integrações externas e validando as
  decisões em protótipos funcionais.
  Desenvolvi o backend de retaguarda para leitura de transponder RFID em
  pedágio eletrônico: parser do protocolo da antena CIR, decriptação AES do
  payload do chip com suporte configurável a 10 combinações de algoritmo e
  modo (AES-128/256 em CBC, ECB, CFB, OFB e CTR via biblioteca cryptography),
  API assíncrona em FastAPI, publicação em fila JMS/STOMP no broker ActiveMQ
  da concessionária e três serializadores intercambiáveis de saída
  (Protobuf, JSON e SOAP/XML) para atender formatos impostos por sistemas
  legados. Sistema aderente às normas ISO/IEC 18000-63 e ISO/IEC 29167-10 e
  à Resolução ARTESP 001/2014. Implementei licenciamento próprio de software
  com assinatura RSA-2048, vínculo por hash de hardware e níveis de licença,
  distribuído como binário único via PyInstaller com instaladores para Rocky
  Linux, Ubuntu e Windows. Qualidade garantida por pytest (incluindo testes
  assíncronos e cobertura), teste de carga com Locust e checagem estática de
  tipos com mypy.

- SIP Proxy / SBC para FusionPBX (projeto próprio/freelance) | 07/2026 – atual
  Desenvolvo um proxy SIP baseado em Kamailio + rtpengine com foco em NAT
  traversal e modo transparent, como alternativa enxuta ao dSIPRouter para
  integração com FusionPBX. Roteamento dinâmico (drouting), controle de acesso
  por origem (permissions), estado em htable e registro remoto via path;
  painel de administração em Flask com blueprints e SQLAlchemy 2.0 por
  reflection sobre as tabelas do motor (MariaDB/PyMySQL), comandando o
  Kamailio por JSON-RPC. Validação por 13 cenários SIPp de conformidade de
  protocolo — negociação de G.729 com payload type dinâmico e estático, AVPF
  sem rtpmap, REGISTER de ramal remoto e rejeição 403/404. Migrations SQL
  versionadas e stack inteira containerizada (Kamailio, rtpengine, FusionPBX
  e painel).

- Análise de Qualidade de Chamadas por Processamento de Sinais (projeto próprio/freelance) | 07/2026 – atual
  Desenvolvi um analisador de qualidade de áudio de telefonia que detecta picote
  (dropout por perda de pacote), clipping, dead-air, one-way e nível/SNR baixo
  diretamente do sinal, em Python/NumPy — energia por frame, análise espectral
  (FFT: flatness, flux, centroide) e estimativa de ruído de fundo por percentil
  para separar perda de pacote de pausa natural da conversa. Implementei o
  E-model (ITU-T G.107) do zero, convertendo as detecções em R-factor e MOS, e
  avaliei modelos neurais no-reference (DNSMOS P.835 via ONNX Runtime, TorchAudio
  SQUIM, NISQA) contra corpus real rotulado, com decisão de arquitetura
  documentada por eixo de discriminação e por licenciamento comercial. Camada de
  IA 100% local em CPU (faster-whisper int8 + LLM GGUF via llama.cpp) classifica
  a transcrição — caixa postal, URA, reclamação de qualidade — com prompt
  few-shot de saída JSON e fallback determinístico. Painel Flask multi-tenant com
  isolamento físico de dados por cliente, SQLite, autenticação PBKDF2 e SPA sem
  framework/build; empacotado em Docker e implantado via systemd em LXC/Proxmox.
  Derivei do mesmo motor uma ferramenta de auditoria de classificador AMD
  (Answering Machine Detection) de terceiros, que cruza a classificação da API do
  cliente com a análise independente do áudio para achar falso positivo nas duas
  direções (121 testes automatizados em pytest).

- Motor de Automação Autônoma de Interação Web (RPA) com IA Multi-provedor (projeto próprio) | 06/2026 – atual
  Projetei um motor genérico de automação de navegador (Node.js/Puppeteer) que
  opera portais web de forma autônoma e não supervisionada: adaptadores por
  site sobre um núcleo compartilhado, motor de regras próprio, preenchimento
  de formulários dinâmicos, detecção de página e de estado de sessão com
  re-login automático, controle de ritmo por ação, rede de segurança e trava
  de concorrência entre execuções. Persistência em Prisma/SQLite, painel web
  de operação (iniciar/parar ciclos) e evidência auditável por captura de
  tela a cada etapa. Camada de decisão por IA com cadeia de fallback entre
  provedores (OpenRouter, OpenAI, Anthropic, NVIDIA NIM) sobre dois formatos
  de API distintos, degradando para regra determinística quando todos falham.
  Suíte de 716 testes automatizados no runner nativo do Node.
```

**Plataforma própria de hospedagem Git (`painel-git`)** — decisão em
aberto: pode virar um bullet de projeto freelance OU ficar de fora do
CV formal e só ser mencionado em entrevista/portfólio, já que é
infraestrutura pessoal (não foi contratado por um cliente pra fazer
isso). Se entrar, sugestão de texto:

```
- Plataforma Própria de Hospedagem Git (projeto pessoal, uso profissional contínuo) | 08/2025 – atual
  Desenvolvi e mantenho uma plataforma própria de hospedagem Git (alternativa
  self-hosted a GitHub/GitLab) em PHP, sem nenhuma dependência de runtime.
  Implementei do zero o servidor WebDAV (RFC 4918 — PROPFIND, MKCOL, COPY,
  MOVE, LOCK/UNLOCK) com mutex FIFO por caminho, o protocolo git smart HTTP
  (upload-pack/receive-pack) e um esquema de autenticação por desafio
  criptográfico com chave SSH (nonce assinado pelo cliente e verificado no
  servidor contra o authorized_keys). Pipeline de CI/CD com disparo assinado
  por HMAC-SHA256 e validação anti-SSRF do endpoint, credenciais cifradas em
  AES-256-GCM, controle de acesso via gitolite, rate limiting, bloqueio de IP,
  CSRF e cabeçalhos de segurança, interface internacionalizada em 4 idiomas.
  129 commits ao longo de quase 1 ano de operação contínua, hospedando +30
  repositórios de projetos próprios/clientes.
```

## Em aberto

- Usuário confirmar/corrigir a categorização da tabela de certificações
  ("só escrever" vs "buscar certificação" vs "estudar de verdade").
- ~~Confirmar a duração real dos projetos~~ **FECHADO em 2026-07-30**: todas
  as datas dos 7 projetos estão fixadas (ver a tabela "Datas — como foram
  fechadas" na seção do rascunho). Seis vêm de evidência de git ou de
  contrato; só a do omnichannel é estimativa, e está sinalizada como tal —
  se você lembrar do mês real em que o `zib` começou, é só ajustar a data
  de início desse bullet.
- Decidir se `painel-git` entra como projeto freelance formal no CV.
- Revisar o rascunho acima e decidir a redação final antes de colar em
  `bots/infojobs/cv.txt`/`bots/vagas/cv.txt` — **nada foi escrito no CV
  real ainda**, isso é só material preparado.
- Decidir se/quando escrever as variantes de CV por grupo (multi-perfil).
- Se for adiante com multi-perfil: decidir se `aderencia.js` ganha um
  argumento de perfil (`node aderencia.js --perfil=devops-cloud`) ou se
  cada perfil vira uma pasta com seu próprio `cv.txt` + categorias.
- Confirmar (via inspeção real do InfoJobs/Vagas.com.br) se dá pra
  anexar CV diferente por candidatura antes de pensar em automatizar
  essa parte.
