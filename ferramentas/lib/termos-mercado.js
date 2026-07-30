/**
 * termos-mercado.js — Vocabulário de termos técnicos/mercado usado por
 * `aderencia.js` pra comparar o que as vagas coletadas pedem contra o que
 * aparece no CV (bots/infojobs/cv.txt).
 *
 * Dado editável, não código (mesmo padrão de categorias-mercado.js e
 * compatibilidade-perfil.js): ajustar cobertura de termos aqui, sem tocar
 * em aderencia.js. Lista deliberadamente ampla — cobre tanto o que já está
 * no CV (pra validar que a comparação funciona) quanto tecnologias comuns
 * nas vagas coletadas que podem não estar no CV (é isso que vira o
 * relatório de "lacunas").
 */

module.exports = [
  // Backend / linguagens
  'node.js', 'node', 'php', 'python', 'java', '.net', 'c#', 'golang', 'go',
  'ruby', 'laravel', 'symfony', 'spring',
  // Frontend / mobile
  'react', 'angular', 'vue', 'next.js', 'typescript', 'javascript',
  'react native', 'flutter', 'kotlin', 'swift',
  // Dados / BI
  'sql', 'mysql', 'postgresql', 'sql server', 'power bi', 'dax', 'power query',
  'etl', 'bigquery', 'excel avançado',
  // Cloud / DevOps / Infra
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'k8s', 'terraform',
  'ci/cd', 'jenkins', 'gitlab', 'git', 'proxmox', 'vmware', 'linux',
  'zabbix', 'nagios', 'observabilidade', 'ansible',
  // Segurança
  'waf', 'owasp', 'pentest', 'soc', 'firewall', 'iso 27001', 'lgpd',
  // Telecom / VoIP (força do CV atual — serve pra validar que a
  // comparação também reconhece o que já é forte, não só lacunas)
  'asterisk', 'kamailio', 'opensips', 'sip', 'webrtc', 'sbc', 'freepbx',
  'pabx', 'call center', 'voip',
  // Metodologia / gestão
  'scrum', 'kanban', 'jira', 'agile', 'itil', 'devops',
  // ERP / especialistas de nicho
  'protheus', 'advpl', 'sap', 'totvs',
  // Testes / QA
  'qa', 'teste automatizado', 'selenium', 'cypress', 'istqb', 'bdd',
  // APIs / arquitetura
  'api rest', 'graphql', 'microsserviços', 'clean architecture',
  // IA / LLM (fornecedores + práticas — visto ao vivo em vaga real
  // júnior coletada citando "IA generativa" nos requisitos)
  'ia generativa', 'llm', 'openai', 'chatgpt', 'anthropic', 'claude',
  'claude code', 'gemini', 'llama', 'mistral', 'deepseek', 'openrouter',
  'aws bedrock', 'azure openai', 'prompt engineering', 'rag',
  'agentes de ia', 'mcp', 'fine-tuning', 'langchain',
  // IA local / inferência em CPU e ML aplicado (evidência real em
  // analisador-chamadas + nextqualify-auditor)
  'onnx', 'onnx runtime', 'pytorch', 'torch', 'torchaudio', 'tensorflow',
  'whisper', 'faster-whisper', 'llama.cpp', 'gguf', 'quantização',
  'ollama', 'hugging face', 'transformers', 'machine learning',
  'aprendizado de máquina', 'deep learning', 'redes neurais', 'inferência',
  'nlp', 'processamento de linguagem natural', 'speech to text', 'asr',
  'reconhecimento de fala', 'transcrição', 'visão computacional',
  // Bibliotecas Python (o CV citava 'python' sem nenhuma lib — vagas de
  // dados/backend pedem a lib pelo nome)
  'numpy', 'pandas', 'scipy', 'matplotlib', 'librosa', 'scikit-learn',
  'flask', 'django', 'fastapi', 'pytest', 'requests', 'celery',
  'sqlalchemy', 'pydantic', 'beautifulsoup', 'jupyter',  // 'selenium' já está em Testes/QA
  // Processamento de sinais / áudio & qualidade de voz (categoria
  // inteiramente nova — nenhuma vaga coletada pediu ainda, mas é
  // diferencial real e aparece em vaga de telecom/CPaaS)
  'dsp', 'processamento de sinais', 'processamento de áudio', 'fft',
  'espectrograma', 'ffmpeg', 'codec', 'g.711', 'g.729', 'opus',
  'mos', 'qos', 'jitter', 'perda de pacote', 'e-model', 'itu-t',
  'amd', 'answering machine detection', 'ura', 'ivr', 'cdr', 'rtp',
  // Arquitetura / backend adicional confirmado em código
  'sqlite', 'multi-tenant', 'multi-tenancy', 'rbac', 'oauth2', 'jwt',
  'webhook', 'websocket', 'thread', 'concorrência', 'assíncrono',
  'systemd', 'gunicorn', 'lxc',
  // ── Levantamento dos demais projetos (2026-07-30) ──────────────────
  // Frontend / UI (zib, ivr-flow-designer, evoluaiv2, conversio)
  'tailwind', 'tailwindcss', 'radix ui', 'shadcn', 'vite', 'esbuild',
  'framer-motion', 'react query', 'tanstack', 'react hook form',
  'recharts', 'storybook', 'spa', 'ssr', 'design system',
  // Node / TypeScript backend (zib, evoluaiv2, suite RPA)
  'express', 'hono', 'trpc', 'bun', 'turborepo', 'monorepo', 'prisma',
  'drizzle', 'orm', 'zod', 'bullmq', 'redis', 'ioredis', 'filas',
  'message broker', 'vitest', 'jest', 'biome', 'eslint', 'puppeteer',
  'playwright', 'rpa', 'automação de processos', 'web scraping',
  // PHP / Laravel (conversio, painel-git)
  'phpunit', 'eloquent', 'blade', 'artisan', 'composer', 'mvc',
  'apache', 'nginx', 'webdav', 'rfc 4918', 'gitolite',
  // Python backend (discador, sipproxy)
  'psycopg2', 'werkzeug', 'blueprint', 'pymysql',
  'mariadb', 'json-rpc', 'grpc', 'soap', 'xml',
  // Telefonia / VoIP aprofundado (discador, sipproxy, asterisk-lab)
  'pjsip', 'ari', 'asterisk rest interface', 'dialplan', 'dtmf',
  'cel', 'odbc', 'unixodbc', 'realtime', 'rtpengine', 'sipp',
  'nat traversal', 'fusionpbx', 'vitalpbx', 'issabel',
  'discador', 'dialer', 'tronco sip', 'siptrunk', 'e1',
  'freeswitch', 'media server', 'transcodificação', 'srtp', 'dtls',
  // Infra / virtualização / observabilidade
  'vagrant', 'kvm', 'sentry', 'pino', 'logging',  // 'lxc' já está acima
  'prometheus', 'grafana', 'healthcheck', 'ha', 'alta disponibilidade',
  // Cloud / storage
  's3', 'aws s3', 'presigned url', 'supabase', 'neon', 'cdn',
  // Segurança aplicada (painel-git, analisador)
  'aes', 'aes-256-gcm', 'hmac', 'pbkdf2', 'criptografia', 'ssrf',
  'csrf', 'xss', 'sql injection', 'rate limiting', 'hardening',
  'chave ssh', 'certificado', 'tls', 'ssl',
  // Integrações / mensageria
  'whatsapp', 'whatsapp business', 'evolution api', 'meta cloud api',
  'imap', 'smtp', 'chatbot', 'omnichannel', 'crm', 'livekit',
  'mediasoup', 'webphone',
  // Padrões / engenharia
  'strategy', 'design patterns', 'padrões de projeto', 'solid',
  'code review', 'tdd', 'refatoração', 'spec-driven', 'documentação técnica',
  'i18n', 'internacionalização', 'migrations', 'versionamento',
  // ── slt (retaguarda de pedágio) — clonado e inventariado 2026-07-30 ──
  // Serialização, mensageria e qualidade
  'protobuf', 'serialização', 'stomp', 'jms', 'activemq',  // 'grpc' já está acima
  'rabbitmq', 'kafka', 'mensageria', 'fila de mensagens',
  'locust', 'teste de carga', 'teste de performance', 'mypy', 'black',
  'flake8', 'lint', 'tipagem estática', 'pyinstaller', 'uvicorn', 'asgi',
  'httpx', 'async', 'asyncio', 'cobertura de testes',
  // Criptografia aplicada e identificação por rádio
  'aes-128', 'aes-256', 'cbc', 'ecb', 'ctr', 'rsa', 'assinatura digital',
  'hsm', 'tpm', 'pki', 'rfid', 'nfc', 'iot', 'telemetria', 'embarcado',
  'licenciamento de software',
  // Compliance regulatório / normas (categoria sem concorrência no CV)
  'iso/iec 18000', 'iso/iec 29167', 'artesp', 'antt', 'homologação',
  'compliance', 'conformidade regulatória', 'normas técnicas',
  'pedágio eletrônico', 'free flow', 'anpr', 'lidar', 'visão embarcada',
];
