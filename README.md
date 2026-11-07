# Trilha Musical

Plataforma gamificada (estilo Duolingo) para estudar o método de música da igreja: trilha com 16 módulos, leitura de teoria interativa e exercícios com XP, ofensiva, estrelas e ranking.

**Stack:** Nuxt 4 (SPA + rotas `/api` serverless) · MongoDB Atlas · Vercel

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem `NUXT_MONGODB_URI`, os dados ficam em `.data/` (arquivo local) — bom para desenvolver.

> O Nuxt 4.6 recomenda Node 22+. Funciona no Node 20, mas mostra um aviso.

## MongoDB Atlas

1. Crie um cluster gratuito (M0) no [Atlas](https://cloud.mongodb.com).
2. Em **Database Access**, crie um usuário; em **Network Access**, libere `0.0.0.0/0` (necessário para a Vercel).
3. Em **Connect → Drivers**, copie a string de conexão.
4. Copie `.env.example` para `.env` e preencha `NUXT_MONGODB_URI`.

A coleção `users` e seus índices são criados automaticamente no primeiro acesso.

## Deploy na Vercel

1. Suba o projeto para um repositório no GitHub e importe na Vercel (o preset do Nuxt é detectado sozinho).
2. Em **Settings → Environment Variables**, adicione `NUXT_MONGODB_URI` (e opcionalmente `NUXT_MONGODB_DB`).
3. Faça o deploy. Em produção o MongoDB é obrigatório (o armazenamento local não persiste na Vercel).

## Adicionando conteúdo

O conteúdo fica em `app/data/`:

- `modulo-01.ts` — teoria (seções e blocos) e banco de questões do Módulo 1.
- `modules.ts` — lista dos 16 módulos, nota mínima para liberar o próximo (`PASS_SCORE`) e questões por sessão.

Para um novo módulo, crie `modulo-02.ts` seguindo o mesmo formato e adicione-o ao array `ready` em `modules.ts`. Os módulos sem conteúdo aparecem na trilha como "Em breve".

**Tipos de bloco de teoria:** `p`, `def`, `tip`, `warn`, `wave`, `instruments`, `cards` (com som opcional), `staircase`, `octaves`, `staffAnatomy`, `staff` (pauta com notas) e `clefs`.

**Tipos de questão:**

- `choice` — múltipla escolha; `answer` é o índice da opção correta (as opções são embaralhadas na tela). Aceita `staff` para mostrar uma pauta.
- `fill` — completar frase; use `___` para cada lacuna, `answers` na ordem e `distractors` como palavras extras.

As posições na pauta (`staff.notes`) contam de baixo para cima: `0` = 1ª linha, `1` = 1º espaço, `2` = 2ª linha … `8` = 5ª linha; negativos e valores acima de 8 usam linhas suplementares.

## Gamificação

- **XP:** 10 por acerto de primeira, +20 em lição perfeita, +15 na primeira leitura da teoria.
- **Nota/estrelas:** % de acertos de primeira. 60% = 1 estrela (libera o próximo módulo), 80% = 2, 100% = 3.
- **Ofensiva:** dias seguidos com pelo menos uma lição ou leitura.
- Questões erradas voltam no fim da lição até serem acertadas (sem afetar a nota).
- Sequências de acertos, efeitos sonoros (podem ser silenciados) e confete.
- Atalhos no computador: teclas `1`–`4` escolhem a opção, `Enter` verifica/continua.
