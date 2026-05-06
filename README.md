# 💰 Bolsa — App de Finanças Pessoais com IA

> Projeto desenvolvido como parte do desafio **Vibe Coding** da [DIO](https://dio.me), utilizando inteligência artificial para criar um app completo de controle financeiro pessoal.

[![Deploy na Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://projeto-ia-lovable-claude-copilot-a.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repositório-181717?logo=github)](https://github.com/poliato2015-max/projeto_ia_lovable_claude_copilot_app_financas)
[![Lovable](https://img.shields.io/badge/Gerado%20com-Lovable-ff6b6b)](https://lovable.dev)

---

## 🌐 Acesse o App

**🔗 [https://projeto-ia-lovable-claude-copilot-a.vercel.app/](https://projeto-ia-lovable-claude-copilot-a.vercel.app/)**

---

## 📋 Índice

- [Sobre o Desafio](#-sobre-o-desafio)
- [O App Bolsa](#-o-app-bolsa)
- [Ferramentas Utilizadas](#-ferramentas-utilizadas)
- [A Jornada — Do PRD ao App em Produção](#-a-jornada---do-prd-ao-app-em-produção)
- [PRD Final v4.0](#-prd-final-v40)
- [Telas do App](#-telas-do-app)
- [Interações com o Copilot](#-interações-com-o-copilot)
- [Reflexão sobre o Processo](#-reflexão-sobre-o-processo)
- [Como Executar Localmente](#-como-executar-localmente)

---

## 🎯 Sobre o Desafio

O desafio propõe criar o **conceito de um App de Organização de Finanças Pessoais com IA** aplicando o **Vibe Coding** — uma forma de programar conversando com a IA, guiando ferramentas como o Copilot e o Lovable com prompts claros e criativos.

O objetivo é transformar ideias em um projeto real e construir um portfólio que destaque habilidades técnicas e de comunicação para o mercado.

---

## 💡 O App Bolsa

**Bolsa** é um app web de finanças pessoais que elimina o controle financeiro manual e cansativo. O usuário simplesmente conversa com a IA — digita ou fala "gastei R$50 no mercado com pix" — e o app registra, categoriza e analisa automaticamente.

### ✨ Diferenciais

- 🤖 **IA que entende linguagem natural** — registre gastos e receitas conversando
- 📊 **Dashboard analítico** — 3 gráficos com propósitos distintos
- 🎯 **Metas inteligentes** — por categoria, com progresso em tempo real
- 🌙 **Dark mode** — preferência salva por usuário
- 📱 **PWA** — instalável no celular sem precisar da Play Store
- 🔒 **RLS no Supabase** — cada usuário vê apenas seus próprios dados

---

## 🛠️ Ferramentas Utilizadas

| Ferramenta | Papel no Projeto |
|------------|-----------------|
| **Claude (Anthropic)** | Mentor e orientador em todas as etapas |
| **GitHub Copilot Web** | Refinamento e validação do PRD |
| **Lovable** | Desenvolvimento completo do app (Vibe Coding) |
| **Supabase** | Backend, autenticação e banco de dados (via Lovable Cloud) |
| **Vercel** | Deploy e hospedagem do app |
| **GitHub** | Versionamento do código |

### Stack Técnica

- **Frontend:** React + TypeScript + Tailwind CSS + React Router
- **Backend:** Supabase (Auth + PostgreSQL) via Lovable Cloud
- **Deploy:** Vercel
- **PWA:** manifest.json + service worker

---

## 🗺️ A Jornada — Do PRD ao App em Produção

### Etapa 1 — Entendendo o Desafio e Definindo as Ferramentas

O primeiro passo foi analisar o desafio proposto pelo professor e definir as ferramentas que seriam usadas:

- **Claude** como mentor orientando cada etapa
- **Copilot Web** para refinamento do PRD
- **Lovable** como desenvolvedor do código
- **Supabase** para o banco de dados
- **Vercel** para o deploy

Antes de escrever uma linha de prompt, o projeto foi planejado do zero: funcionalidades, stack técnica, fluxo de telas e critérios de qualidade.

---

### Etapa 2 — Configurando o Supabase

O projeto `finances-app` foi criado no Supabase com as seguintes configurações:

- **Região:** South America (São Paulo) — menor latência para usuários brasileiros
- **Enable Data API:** ativado para comunicação via supabase-js
- **RLS:** habilitado para segurança por usuário
- **Credenciais anotadas:** Project URL + Publishable Key

> 💡 Durante o desenvolvimento descobrimos que o Lovable usa um **Lovable Cloud** próprio baseado em Supabase. O banco externo será conectado em uma fase futura do projeto.

---

### Etapa 3 — Construindo o PRD v1.0

O PRD (Product Requirements Document) foi construído iterativamente. Iniciamos com as funcionalidades base do professor e fomos enriquecendo com decisões estratégicas:

**Funcionalidades base:**
- Registro de gastos por chat em linguagem natural
- Classificação automática de transações
- Metas financeiras com progresso visual
- Agente Financeiro IA com dicas personalizadas
- Relatórios e extrato

**Decisões adicionadas após análise crítica:**
- ✅ Exportação em CSV — diferencial para imposto de renda e planilhas
- ✅ Interface responsiva (mobile 375px + desktop 1280px) — sem custo de crédito extra
- ✅ Integração com Supabase — dados reais e persistentes
- ✅ Dark mode — preferência salva no perfil

---

### Etapa 4 — Refinando com o Copilot (PRD v2.0 e v3.0)

O PRD foi levado ao **GitHub Copilot Web** para revisão. Das sugestões recebidas, foi feita uma triagem crítica:

**✅ Aceitas (9 melhorias):**
- Persona definida com contexto real
- KPIs visuais na tela inicial
- Fallback manual para categorização
- Filtro por período no Dashboard
- Metas por categoria
- Transparência nas sugestões da IA
- Dark mode
- Campos adicionais nas tabelas
- Deploy na Vercel

**⏳ Fase 2 (6 itens):**
- PWA + notificações push
- Exportação em PDF
- Testes automatizados
- Alertas por e-mail

**❌ Recusadas (7 itens):**
- Login social (complexidade desnecessária para o MVP)
- Edge Functions (o Lovable gerencia nativamente)
- Rate limiting (infraestrutura de produção além do MVP)
- JWT manual (o Supabase Auth já gerencia)

> 💡 **Aprendizado:** O Copilot pensou como arquiteto de sistema. Filtrar as sugestões com critério de MVP foi essencial para não inchar o escopo.

#### Interação com o Copilot — Validação do PRD v3.0

<!-- 
📌 INSTRUÇÃO: Cole aqui o trecho da resposta do Copilot validando o PRD v3.0
Exemplo de formato:

> **Copilot:** "Sim, o PRD v3.0 está coeso, consistente e pronto para ser usado como prompt no Lovable..."
-->

**[RESERVADO — colar validação do Copilot ao PRD v3.0]**

---

### Etapa 5 — Gerando o App com o Lovable

Com o PRD refinado, o prompt final foi enviado ao Lovable em uma única mensagem. O Lovable gerou:

- Landing page profissional com identidade visual própria (nome "Bolsa")
- Sistema de autenticação completo
- Todas as telas do fluxo definido no PRD
- Integração automática com banco de dados
- Dark mode e responsividade

**Créditos utilizados estrategicamente:** cada prompt consolidava múltiplas correções em um único crédito, evitando desperdício.

---

### Etapa 6 — Avaliação e Correções (3 rodadas)

O app passou por **3 rodadas completas de avaliação** tela por tela, totalizando **19+ correções mapeadas** e aplicadas:

#### Principais correções e melhorias identificadas:

| # | Tela | Correção |
|---|------|----------|
| 1 | Cadastro | Mensagens de erro em inglês → português |
| 2 | Cadastro | Campo aceita 1 nome → exigir nome + sobrenome |
| 3 | Cadastro | Campo "Repetir senha" ausente |
| 4 | Cadastro | Checklist visual de política de senha |
| 5 | Registro | Toggle Gasto/Receita removido — IA detecta automaticamente |
| 6 | Registro | Distinção RECEITA vs DESPESA (lacuna crítica do PRD) |
| 7 | Dashboard | Tooltip invisível no dark mode |
| 8 | Dashboard | Gráfico Ano agrupando por datas em vez de meses |
| 9 | Dashboard | 3 gráficos com propósitos distintos |
| 10 | Metas | Date picker sem fechar automaticamente |
| 11 | Metas | Categorias de receita ausentes |
| 12 | Relatórios | Emojis corrompidos no CSV |
| 13 | Relatórios | Filtro por tipo (Despesa/Receita) ausente |

#### Descoberta mais importante:

> 💡 O PRD original não contemplava a **distinção entre receita e despesa** — uma lacuna real identificada durante os testes. Ao registrar "recebi salário de R$1.000", o app registrava como gasto na categoria "Outros". Essa correção impactou toda a arquitetura: banco de dados, dashboard, metas e relatórios. É um exemplo real de como o Vibe Coding exige pensamento crítico além do prompt.

---

### Etapa 7 — PRD v4.0 — Documento Final

Após o desenvolvimento completo, o PRD foi atualizado para refletir o app real em produção e validado novamente pelo Copilot.

#### Interação com o Copilot — Validação do PRD v4.0

<!-- 
📌 INSTRUÇÃO: Cole aqui o trecho da resposta do Copilot validando o PRD v4.0
-->

**[RESERVADO — colar validação do Copilot ao PRD v4.0]**

---

### Etapa 8 — Deploy

- **GitHub:** código sincronizado automaticamente pelo Lovable
- **Vercel:** deploy conectado ao repositório GitHub — build automático a cada commit
- **URL pública:** https://projeto-ia-lovable-claude-copilot-a.vercel.app/

---

## 📄 PRD Final v4.0

```
PRD v4.0 — App Bolsa: Finanças Pessoais com IA
Versão final · Reflete o app construído em produção · Desafio DIO Vibe Coding

1. Visão Geral do Produto
Bolsa é um App Web de Organização de Finanças Pessoais com IA, desenvolvido em
português brasileiro, com interface responsiva para mobile (375px) e desktop (1280px),
dark mode nativo e suporte a PWA — instalável diretamente na tela inicial do celular
sem passar pela Play Store.

Persona principal: adulto brasileiro, 25 a 40 anos, com renda variável ou fixa,
que busca simplicidade e controle financeiro rápido no dia a dia — sem planilhas complexas.

2. Problema que resolve
Pessoas têm dificuldade em manter o controle financeiro por causa da complexidade
das planilhas e da falta de tempo. O Bolsa resolve isso permitindo registrar qualquer
transação — gasto ou receita — em linguagem natural por texto ou voz, com um agente
de IA que analisa hábitos e sugere formas de economizar de forma transparente e educativa.
Exemplo: "Sugiro reduzir gastos em Lazer porque você gastou 35% acima da média dos últimos 3 meses."

3. Funcionalidades do MVP
- Autenticação: cadastro e login com e-mail e senha. Validações em português:
  nome completo (nome + sobrenome obrigatórios), e-mail válido, checklist visual
  de política de senha em tempo real, campo confirmar senha.
- Landing Page (pública): headline, 6 cards de funcionalidades e CTAs.
- Tela inicial: 3 KPIs em tempo real — Despesas (vermelho) · Receitas (verde) ·
  Saldo disponível (azul). Última transação · Meta ativa · Atalhos.
- Registro por chat com IA: linguagem natural por texto ou voz. IA detecta
  automaticamente receita ou despesa. Salvar automático quando todos os campos
  detectados; card de confirmação apenas quando meio de pagamento não detectado.
  Categorias de despesa: Alimentação · Transporte · Moradia · Saúde · Lazer ·
  Vestuário · Educação · Contas e Serviços · Viagem · Outros
  Categorias de receita: Salário · Freelance · Aluguel recebido · Investimentos ·
  Presente · Venda · Outros rendimentos
- Dashboard: filtro por período e 3 gráficos — Pizza (distribuição com %) ·
  Barras verticais (Receitas vs Despesas) · Barras horizontais (Top categorias)
- Metas: toggle Despesa/Receita · categorias por tipo · progresso real · date picker
- Agente IA: análise dos dados reais · sugestões transparentes · microfone · tom educativo
- Relatórios: filtros por período, tipo e categoria · CSV com UTF-8 BOM · sem emoji

4. Stack Técnica
- Frontend: React + TypeScript + Tailwind CSS + React Router
- Backend: Supabase (Auth + PostgreSQL) via Lovable Cloud
- Deploy: Vercel · PWA: manifest.json + service worker
- Tabelas: transactions (com campo type) · categories · goals (com campo type) · profiles
- RLS habilitado em todas as tabelas

5. Design, Experiência e Acessibilidade
- Responsiva: mobile-first (375px) e desktop (1280px)
- Dark mode nativo · PWA instalável · Bottom nav no mobile
- HTML semântico + ARIA · Suporte a voz · Contraste WCAG AA
- Erros padronizados: borda vermelha + ⚠️ + texto abaixo do campo

6. Evoluções futuras (Fase 2)
Migração para Supabase próprio · Login social · PDF · Notificações push ·
Testes automatizados · Edge Functions · Relatórios comparativos
```

---

## 📸 Telas do App

### 🌅 Landing Page

| Tema Claro | Tema Escuro |
|-----------|-------------|
| ![Landing Page Claro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_inicial_claro.png) | ![Landing Page Escuro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_inicial_escuro.png) |

---

### 🔐 Tela de Login

| Tema Claro | Tema Escuro |
|-----------|-------------|
| ![Login Claro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_login_claro.png) | ![Login Escuro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_login_escuro.png) |

---

### 📝 Tela de Cadastro

| Tema Claro | Tema Escuro |
|-----------|-------------|
| ![Cadastro Claro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_criar_conta_claro.png) | ![Cadastro Escuro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_criar_conta_escuro.png) |

---

### 🏠 Tela Inicial — Resumo do Mês

| Tema Claro | Tema Escuro |
|-----------|-------------|
| ![Resumo Claro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_resumo_claro.png) | ![Resumo Escuro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_resumo_escuro.png) |

---

### 💬 Registro por Chat com IA

| Tema Claro | Tema Escuro |
|-----------|-------------|
| ![Registrar Claro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_registrar_claro.png) | ![Registrar Escuro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_registrar_meta_escuro.png) |

---

### 📊 Dashboard Analítico

| Tema Claro | Tema Escuro |
|-----------|-------------|
| ![Dashboard Claro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_dash_claro.png) | ![Dashboard Escuro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_dash_escuro.png) |

---

### 🎯 Metas Financeiras

#### Registrar Meta

| Tema Claro | Tema Escuro |
|-----------|-------------|
| ![Registrar Meta Claro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_registrar_meta_claro.png) | ![Registrar Meta Escuro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_registrar_meta_escuro.png) |

#### Acompanhar Metas

| Tema Claro | Tema Escuro |
|-----------|-------------|
| ![Acompanhar Meta Claro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_acompanhar_meta_claro.png) | ![Acompanhar Meta Escuro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_acompanhar_meta_escuro.png) |

---

### 📋 Relatórios e Extrato

| Tema Claro | Tema Escuro |
|-----------|-------------|
| ![Relatório Claro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_relatorio_claro.png) | ![Relatório Escuro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_relatorio_escuro.png) |

---

### 🤖 Agente Financeiro IA

| Tema Claro | Tema Escuro |
|-----------|-------------|
| ![Agente IA Claro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_agente_ia_claro.png) | ![Agente IA Escuro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_agente_ia_escuro.png) |

---

### 📱 Versão Mobile (PWA)

| Dashboard Mobile | Resumo Mobile |
|-----------------|---------------|
| ![Dashboard Mobile](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_dash_claro_app.jpg) | ![Resumo Mobile](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto_ia_lovable_claude_copilot_app_financas_tela_resumo_escuro_app.jpg) |

---

## 💬 Interações com o Copilot

### Revisão do PRD v3.0 — Triagem de Sugestões

<!-- 📌 Cole aqui o trecho da resposta do Copilot revisando o PRD v3.0 -->

> **Prompt enviado ao Copilot:**
> *"Você é um especialista em Product Management. Vou te apresentar um PRD de um app de finanças pessoais com IA. Quero que você revise, sugira melhorias na clareza e adicione qualquer detalhe técnico ou de UX que esteja faltando..."*

> **Resposta do Copilot (trecho principal):**
> 
> **[RESERVADO — cole aqui o trecho da resposta do Copilot sobre o PRD v3.0]**

---

### Devolução ao Copilot — Justificativa das Decisões

<!-- 📌 Cole aqui o trecho da sua resposta ao Copilot explicando o que aceitou e recusou -->

> **Prompt enviado ao Copilot:**
> *"Obrigado pela revisão anterior do PRD. Analisei todas as suas sugestões e tomei as seguintes decisões: Aceitei 9 melhorias... Deixei 6 itens para fase 2... Recusei 7 sugestões..."*

> **Resposta do Copilot (validação):**
>
> **[RESERVADO — cole aqui a resposta do Copilot validando suas decisões]**

---

### Validação Final do PRD v4.0

<!-- 📌 Cole aqui a resposta do Copilot validando o PRD v4.0 final -->

> **Resposta do Copilot:**
>
> **[RESERVADO — cole aqui a validação final do Copilot ao PRD v4.0]**

---

## 🧠 Reflexão sobre o Processo

### O que aprendi com o Vibe Coding

**1. O PRD é vivo — não é um documento estático**

O PRD começou como v1.0 e chegou ao v4.0 após 4 rodadas de refinamento. A maior lição foi que um PRD bem escrito não é aquele que antecipa tudo — é aquele que evolui junto com o produto. A lacuna mais crítica que identificamos (distinção entre receita e despesa) só apareceu durante os testes reais.

**2. Filtrar sugestões da IA é tão importante quanto gerá-las**

O Copilot sugeriu 22 melhorias para o PRD. Aceitamos 9, deixamos 6 para depois e recusamos 7. Essa triagem crítica foi o que manteve o projeto focado e entregável. Aceitar tudo cegamente teria inchado o escopo e tornado o MVP inviável.

**3. A IA comete erros — e isso é parte do processo**

O Lovable gerou código com bugs reais: tooltip invisível no dark mode, cálculo errado de metas de receita, emojis corrompidos no CSV, filtro de semana com comportamento igual ao de dia. Identificar, diagnosticar e corrigir esses bugs foi uma experiência de QA real.

**4. Vibe Coding não significa "sem pensar"**

O maior equívoco sobre Vibe Coding é achar que é só escrever um prompt e o app aparece pronto. Na prática, exige: pensamento crítico sobre o produto, conhecimento técnico para diagnosticar bugs, habilidade de comunicação para escrever prompts precisos e capacidade de decisão para priorizar o que entra no MVP.

**5. A jornada importa tanto quanto o destino**

O app Bolsa que está em produção hoje é significativamente mais rico do que o conceito inicial. Não porque planejamos tudo desde o início — mas porque fomos refinando, testando e tomando decisões conscientes em cada etapa.

### Melhorias identificadas para a Fase 2

Durante o desenvolvimento, identificamos evoluções naturais para uma próxima versão:

- **Migração para Supabase próprio** — independência do Lovable Cloud
- **Login social** (Google/Apple) — redução de fricção no cadastro
- **Exportação em PDF** — relatórios para compartilhamento
- **Notificações push** — alertas ao estourar metas
- **Testes automatizados** — garantia de qualidade em produção
- **Relatórios comparativos** — comparar períodos diferentes

---

## 🚀 Como Executar Localmente

```bash
# Clone o repositório
git clone https://github.com/poliato2015-max/projeto_ia_lovable_claude_copilot_app_financas.git

# Acesse a pasta
cd projeto_ia_lovable_claude_copilot_app_financas

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

> ⚠️ O app utiliza o Lovable Cloud como backend. Para execução local completa com autenticação e banco de dados, é necessário configurar as variáveis de ambiente do Supabase.

---

## 👨‍💻 Autor

Desenvolvido por **Marcelo Oliveira** como parte do desafio Vibe Coding da DIO.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Conectar-0077B5?logo=linkedin)](https://linkedin.com/in/seu-perfil)
[![GitHub](https://img.shields.io/badge/GitHub-poliato2015--max-181717?logo=github)](https://github.com/poliato2015-max)

---

## 📜 Licença

Este projeto foi desenvolvido para fins educacionais como parte do programa de cursos da [DIO](https://dio.me).

---

*Desenvolvido com 💚 usando Vibe Coding — Claude + Copilot + Lovable*
# Welcome to your Lovable project

TODO: Document your project here
