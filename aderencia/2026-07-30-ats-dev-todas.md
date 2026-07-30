# Simulação de triagem por ATS — dev — 2026-07-30

Currículo: `cv/dev/cv.txt`
Alvo: todas as vagas com requisitos (379 vagas)
Limiar de aprovação: 60% dos termos exigidos

> **O que isto simula.** Um ATS trabalha em duas etapas: primeiro tenta
> extrair a estrutura do currículo (contato, seções, empregos, datas) e
> descarta o que não consegue ler; só então compara palavras-chave com a
> vaga. O valor aqui não é o percentual — é o **motivo** de cada recusa.

## Etapa 1 — o que o sistema conseguiu extrair

| Campo | Valor |
|---|---|
| Nome | CARLOS ALBERTO |
| Cargo | Desenvolvedor Backend Sênior |
| E-mail | carlosalberto4ti@gmail.com |
| Telefone | +55 11 2615-2880 |
| Empregos reconhecidos | 7 |
| Formação reconhecida | 5 |
| Tempo de carreira | 8.1 anos |
| Seções reconhecidas | 7 |

Nenhum problema de extração. O currículo passa da etapa de estrutura.

> O tempo de carreira é contado pela **união** dos períodos, não pela
> soma: contratos em paralelo não viram o dobro de experiência.

## Etapa 2 — resultado da triagem

| Resultado | Vagas |
|---|---|
| Aprovado | 38 |
| Reprovado por palavra-chave | 35 |
| Reprovado por estrutura | 0 |
| Indeterminado (vaga com poucos termos) | 306 |

**Taxa de aprovação: 52%** (38 de 73 vagas avaliadas).

As indeterminadas ficam fora do denominador: contá-las inventaria
reprovação que não houve.

## O que mais bloqueia

Termos exigidos pelas vagas que reprovaram, ordenados por quantas
destravariam. É a lista acionável deste relatório.

| Termo | Vagas que destrava |
|---|---|
| sql server | 8 |
| azure | 6 |
| .net | 6 |
| etl | 6 |
| lgpd | 6 |
| c# | 5 |
| dax | 5 |
| power query | 5 |
| documentação técnica | 4 |
| totvs | 4 |
| excel avançado | 4 |
| selenium | 3 |
| automação de processos | 3 |
| waf | 3 |
| firewall | 3 |
| iso 27001 | 3 |
| qa | 3 |
| protheus | 3 |
| clean architecture | 2 |
| kafka | 2 |

## Vagas que passariam (38)

### Bolsista Desenvolvedor Inteligência Artificial - Stellantis — 100%
- Categoria: Desenvolvedor | Empresa: Stellantis
- Link: https://www.vagas.com.br/vagas/v2827289/bolsista-desenvolvedor-inteligencia-artificial-stellantis
- Cobre: python, sql, power bi, aws, git, machine learning

### Vaga de emprego de Analista De Sistemas SR | Linx ERP VTEX em São Paulo,- SP — 100%
- Categoria: Analista de Sistemas | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-analista-sistemas-sr-linx-erp-vtex-em-sao-paulo__11842009.aspx
- Cobre: sql, power bi, omnichannel

### Analista de Controle de Estoque Júnior (Desenvolvimento de Dados) — 100%
- Categoria: Analista de Dados | Empresa: Bunge Alimentos
- Link: https://www.vagas.com.br/vagas/v2824693/analista-de-controle-de-estoque-junior-desenvolvimento-de-dados
- Cobre: python, sql, power bi

### Vaga de emprego de Desenvlvedor Back-End PHP - Júnior Ou Pleno -1014 em São José dos Pinhais,- PR — 89%
- Categoria: Desenvolvedor | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-desenvlvedor-back-end-php-junior-pleno-1014-em-parana__11846057.aspx
- Cobre: php, laravel, sql, postgresql, docker, ci/cd, git, redis
- Ainda falta: jwt

### Vaga de emprego de Tech Lead em Juiz de Fora,- MG — 89%
- Categoria: DevOps | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-tech-lead-em-minas-gerais__11841904.aspx
- Cobre: php, laravel, aws, docker, git, scrum, kanban, devops
- Ainda falta: vue

### Programador de Sistemas — 88%
- Categoria: Desenvolvedor | Empresa: Controllab
- Link: https://www.vagas.com.br/vagas/v2819925/programador-de-sistemas
- Cobre: php, laravel, react, postgresql, docker, soap, xml
- Ainda falta: symfony

### Especialista Soluções — 86%
- Categoria: DevOps | Empresa: Confidencial
- Link: https://www.vagas.com.br/vagas/v2823434/especialista-solucoes
- Cobre: aws, docker, kubernetes, devops, microsserviços, mensageria
- Ainda falta: azure

### Vaga de emprego de Engenheiro(A) De Inteligência Artificial Sênior (Martech / AI Agents) em São Paulo,- SP — 86%
- Categoria: Engenheiro de Software | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-engenheiroa-inteligencia-artificial-senior-martech-ai-agents-em-sao-paulo__11830138.aspx
- Cobre: python, docker, git, microsserviços, rag, mcp
- Ainda falta: versionamento

### Vaga de emprego de # 1231 Devops Kubernetes & Gitops - SRE | Especialista Em Infraestrutura em São Paulo,- SP — 80%
- Categoria: DevOps | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de--1231-devops-kubernetes-gitops-sre-especialista-infraestrutura-em-sao-paulo__11602616.aspx
- Cobre: kubernetes, git, observabilidade, devops
- Ainda falta: versionamento

### Vaga de emprego de Analista Devops Sênior (Azure) em Todo Brasil — 80%
- Categoria: DevOps | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-analista-devops-senior-azure-em-__11573092.aspx
- Cobre: kubernetes, k8s, ci/cd, devops
- Ainda falta: azure

### Vaga de emprego de Analista De Sistemas Mobile (React Native) em Juiz de Fora,- MG — 80%
- Categoria: Analista de Sistemas | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-analista-sistemas-mobile-react-native-em-minas-gerais__11841827.aspx
- Cobre: react, git, scrum, kanban
- Ainda falta: react native

### Vaga de emprego de Engenheiro(A) De Desenvolvimento De Produtos De IA em Porto Alegre,- RS — 80%
- Categoria: Engenheiro de Software | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-engenheiroa-desenvolvimento-produtos-ia-em-rio-grande-do-sul__11784746.aspx
- Cobre: node.js, node, python, sql, postgresql, aws, ci/cd, git
- Ainda falta: etl, crm

### Vaga de emprego de DESENVOLVEDOR DE SISTEMAS I em Todo Brasil — 78%
- Categoria: Desenvolvedor | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-desenvolvedor-sistemas-i-em-__11844626.aspx
- Cobre: javascript, sql, postgresql, docker, git, ia generativa, rag
- Ainda falta: grafana, supabase

### Vaga de emprego de Desenvolvedor Full Stack em Curitiba,- PR — 75%
- Categoria: Desenvolvedor | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-desenvolvedor-full-stack-em-parana__11848228.aspx
- Cobre: node.js, node, python, react, angular, javascript, mysql, apache, xml
- Ainda falta: java, c#, documentação técnica

### Vaga de emprego de Analista De Projetos De TI PL em Jaraguá do Sul,- SC — 75%
- Categoria: DevOps | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-analista-projetos-ti-pl-em-santa-catarina__11835409.aspx
- Cobre: sql, jira, devops
- Ainda falta: azure

### Desenvolvedor Java/Angular Jr — 75%
- Categoria: Desenvolvedor | Empresa: Cognizant
- Link: https://www.vagas.com.br/vagas/v2827052/desenvolvedor-java-angular-jr
- Cobre: angular, typescript, sql, gcp, git, scrum
- Ainda falta: java, spring

### Vaga de emprego de Engenheiro De Software Especialista (Mobile – React Native + Expo) em São Paulo,- SP — 75%
- Categoria: Engenheiro de Software | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-engenheiro-software-especialista-mobile-react-native-expo-em-sao-paulo__11808433.aspx
- Cobre: react, next.js, typescript
- Ainda falta: react native

### Analista de Dados Júnior (Bilíngue) - 114075 — 75%
- Categoria: Analista de Dados | Empresa: Confidencial
- Link: https://www.vagas.com.br/vagas/v2825198/analista-de-dados-junior-bilingue-114075
- Cobre: python, sql, power bi
- Ainda falta: etl

### Vaga de emprego de Desenvolvedor Devops em Todo Brasil — 73%
- Categoria: DevOps | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-desenvolvedor-devops-em-__11830040.aspx
- Cobre: php, python, sql, aws, gcp, docker, git, linux, devops, apache, nginx
- Ainda falta: java, go, ruby, azure

### 11275 - Desenvolvedor Fullstack Node / React — 72%
- Categoria: Desenvolvedor | Empresa: Talent Group
- Link: https://www.vagas.com.br/vagas/v2823630/11275-desenvolvedor-fullstack-node-react
- Cobre: node.js, node, react, next.js, typescript, aws, gcp, docker, ci/cd, cypress, microsserviços, express, mensageria
- Ainda falta: azure, jest, design patterns, rabbitmq, kafka

### Vaga de emprego de Desenvolvedor(A) Front-End / UI Júnior em Curitiba,- PR — 71%
- Categoria: Desenvolvedor | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-desenvolvedora-front-end-ui-junior-em-parana__11829571.aspx
- Cobre: react, next.js, typescript, javascript, git
- Ainda falta: tailwind, versionamento

### Vaga de emprego de Analista De Dados em São Paulo,- SP — 71%
- Categoria: Analista de Dados | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-analista-dados-em-sao-paulo__11849635.aspx
- Cobre: python, sql, aws, gcp, apache
- Ainda falta: etl, azure

### Desenvolvedor Full Stack Pleno — 69%
- Categoria: Desenvolvedor | Empresa: TO Brasil Consultoria em Tecnologia da Informação
- Link: https://www.vagas.com.br/vagas/v2825148/desenvolvedor-full-stack-pleno
- Cobre: node.js, node, react, next.js, typescript, javascript, mysql, postgresql, git
- Ainda falta: ssr, code review, versionamento, homologação

### Vaga de emprego de WEG TINTAS - Analista De Dados E Transformação Digital em Guaramirim,- SC — 69%
- Categoria: Analista de Dados | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-weg-tintas-analista-dados-transformacao-digital-em-santa-catarina__11805571.aspx
- Cobre: python, sql, power bi, git, scrum, kanban, jira, devops, machine learning
- Ainda falta: dax, etl, crm, versionamento

### Vaga de emprego de Desenvolvedora Devops Backend Sênior em Todo Brasil — 69%
- Categoria: DevOps | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-desenvolvedora-devops-backend-senior-em-__11619325.aspx
- Cobre: node.js, node, typescript, aws, docker, kubernetes, ci/cd, jenkins, git, observabilidade, devops
- Ainda falta: terraform, gitlab, prometheus, grafana, versionamento

### Vaga de emprego de Desenvolvedor Full Stack Angular | C# | Node - Sênior em Rio de Janeiro,- RJ — 67%
- Categoria: Desenvolvedor | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-desenvolvedor-full-stack-angular-c-node-senior-em-rio-janeiro__11839871.aspx
- Cobre: node, angular
- Ainda falta: c#

### Vaga de emprego de Devops Engineer Pleno em São Paulo,- SP — 67%
- Categoria: DevOps | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-devops-engineer-pleno-em-sao-paulo__11748180.aspx
- Cobre: python, aws, docker, kubernetes, ci/cd, jenkins, git, linux, observabilidade, devops
- Ainda falta: azure, terraform, gitlab, ansible, versionamento

### Vaga de emprego de Analista De Dados Comerciais em São Paulo,- SP — 67%
- Categoria: Analista de Dados | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-analista-dados-comerciais-em-sao-paulo__11849352.aspx
- Cobre: sql, power bi
- Ainda falta: excel avançado

### Analista Sistemas Sr — 67%
- Categoria: Analista de Sistemas | Empresa: bp bioenergy
- Link: https://www.vagas.com.br/vagas/v2827093/analista-sistemas-sr
- Cobre: python, rpa
- Ainda falta: automação de processos

### Analista de Sinistros Pleno (Dados e Faturamento) — 67%
- Categoria: Analista de Dados | Empresa: SulAmérica
- Link: https://www.vagas.com.br/vagas/v2826599/analista-de-sinistros-pleno-dados-e-faturamento
- Cobre: power bi, xml
- Ainda falta: excel avançado

### Analista de Dados (Power Bi) — 67%
- Categoria: Analista de Dados | Empresa: Hospital da Baleia
- Link: https://www.vagas.com.br/vagas/v2814006/analista-de-dados-power-bi
- Cobre: sql, power bi
- Ainda falta: dax

### Analista de Sinistros Sr (Dados e Faturamento) — 67%
- Categoria: Analista de Dados | Empresa: SulAmérica
- Link: https://www.vagas.com.br/vagas/v2827240/analista-de-sinistros-sr-dados-e-faturamento
- Cobre: power bi, xml
- Ainda falta: excel avançado

### Analista Comercial Sr — 67%
- Categoria: Analista de Dados | Empresa: Confidencial
- Link: https://www.vagas.com.br/vagas/v2824089/analista-comercial-sr
- Cobre: sql, power bi
- Ainda falta: excel avançado

### Vaga de emprego de Analista De Qualidade (Quality Analyst) em Todo Brasil — 63%
- Categoria: QA | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-analista-qualidade-quality-analyst-em-__11849122.aspx
- Cobre: python, aws, linux, scrum, cypress
- Ainda falta: agile, qa, playwright

### Vaga de emprego de Desenvolvedor De Power BI Pleno em Curitiba,- PR — 60%
- Categoria: Desenvolvedor | Empresa: não informada
- Link: https://www.infojobs.com.br/vaga-de-desenvolvedor-power-bi-pleno-em-parana__11828888.aspx
- Cobre: power bi, ci/cd, git
- Ainda falta: dax, homologação

### 11306 - Desenvolvedor Fullstack Sênior (node.js/React) — 60%
- Categoria: Desenvolvedor | Empresa: Talent Group
- Link: https://www.vagas.com.br/vagas/v2825916/11306-desenvolvedor-fullstack-senior-node-js-react
- Cobre: node.js, node, react
- Ainda falta: chatgpt, claude

### Analista de Sistemas Jr — 60%
- Categoria: Analista de Sistemas | Empresa: FFM
- Link: https://www.vagas.com.br/vagas/v2826631/analista-de-sistemas-jr
- Cobre: react, javascript, sql, mysql, postgresql, aws, scrum, soap, xml
- Ainda falta: c#, react native, sql server, azure, qa, documentação técnica

### Analista de Dados Junior - Sales Ops — 60%
- Categoria: Analista de Dados | Empresa: SM Educação
- Link: https://www.vagas.com.br/vagas/v2827175/analista-de-dados-junior-sales-ops
- Cobre: python, sql, power bi
- Ainda falta: excel avançado, crm

