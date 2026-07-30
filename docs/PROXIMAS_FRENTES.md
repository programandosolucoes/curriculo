# Próximas frentes

O que está enfileirado, com o suficiente para retomar sem reconstruir o
raciocínio. Frentes concluídas saem daqui e viram entrada no [DIARIO.md](DIARIO.md).

---

## ~~1. Simulador de ATS~~ — CONCLUÍDO

Construído em `ferramentas/simular-ats.js`. Ver a seção 13 do
[DIARIO.md](DIARIO.md#13-simulador-de-ats), inclusive os dois defeitos que ele
encontrou: o currículo antigo era ilegível para um ATS, e o recorte por perfil
estava destruindo anos de carreira.

---

## 2. Coletar vagas de telecom e VoIP

Sem isso o perfil `voip` é gerado e **não medido** — nenhuma das 1.129 vagas
cita Asterisk, VoIP, SIP, PABX ou Kamailio, porque telecom não está entre as 30
categorias coletadas.

Enquanto não houver coleta, a tabela de aderência por categoria fica enviesada
contra a área mais forte do histórico. É pré-requisito para qualquer decisão de
carreira baseada nesses números.

O coletor vive no `vagas-automation-suite` (`core/categorias-mercado.js`).

---

## 3. Regerar o `cv.pdf`

O PDF é o que vai anexado nas candidaturas e ainda é a versão de 25/07,
anterior a todo o trabalho. Cada `cv/<perfil>/cv.html` tem botão de exportação;
são nove cliques, ou uma execução com navegador headless mediante autorização.

Decidir também o destino de `cv/cv.txt`, `cv/cv.pdf` e `cv/cv-2026-07.html`,
que são da estrutura antiga e convivem com a nova — quem clonar o repositório
fica em dúvida sobre qual é o currículo válido.

---

## 4. Confirmar o perfil padrão

`dev` está marcado como `padrao: true`, e é o que vai para o `cv.txt` dos bots.
A escolha foi por volume de vagas (62), mas `dados` (64%) e `ia` (60%) têm
aderência maior. Revisar depois da medição comparativa.

---

## 5. Corrigir o remoto do `vagas-automation-suite`

O remoto usa sintaxe scp (`user@host:path`), que não aceita porta e tenta a 22,
enquanto o servidor atende na 65002. `git push origin` falha ali.

```bash
git remote set-url origin ssh://u560021660@git.programandosolucoes.com.br:65002/home/u560021660/domains/git.programandosolucoes.com.br/public_html/git/repos/vagas-automation-suite.git
```

Não executado por ser configuração do usuário.
