# Marvel Multiverse RPG — Convergência Macabra (Sistema de Despertar)

Repositório da campanha **Convergência Macabra** (*Marvel Multiverse RPG — Rank 4 / d616*) e do motor determinístico de seleção e alocação 1-para-1 sem repetição via **GitHub Actions** + **Limbo OS**.

## Painel e Controles no GitHub Actions

* **Painel de Status ao Vivo (quem já escolheu e quem falta):** [`state/status-board.md`](state/status-board.md)
* **Espelho Seguro para o Limbo OS:** [`state/public-state.json`](state/public-state.json)
* **Workflows (aba Actions):**
  1. **Marvel Awakening — 1. Iniciar Sessão (Mestre)** (`awakening-init.yml`) — Gera nova sessão e 5 códigos únicos (`batch` ou `instant`).
  2. **Marvel Awakening — 2. Submeter Jogador** (`awakening-submit.yml`) — Registra respostas (manual ou via API do Limbo OS), trava o código contra reenvio e impede repetições via fila sequencial (`concurrency`).
  3. **Marvel Awakening — 3. Disparar Convergência (Mestre)** (`awakening-converge.yml`) — Executa alocação global ótima ($5! = 120$) com desempate `d616` e exporta fichas em `state/exports/`.
  4. **Marvel Awakening — CI** (`awakening-ci.yml`) — Roda os 7 testes determinísticos do motor em Node.js 22.

## Integração Rápida no `LimboOS-backend`

* **Disparar submissão do jogador (`repository_dispatch`):**
  `POST https://api.github.com/repos/GoobinEXE/marvel-convergencia-macabra/dispatches` (`event_type: "marvel-awakening-submit"`)
* **Ler estado público sem spoilers:**
  `GET https://api.github.com/repos/GoobinEXE/marvel-convergencia-macabra/contents/state/public-state.json`
* Detalhes completos de payload e arquitetura em [`Personagens/Jogadores/Plano Técnico - Sistema de Despertar de Poderes (JS para Limbo OS).md`](Personagens/Jogadores/Plano%20T%C3%A9cnico%20-%20Sistema%20de%20Despertar%20de%20Poderes%20%28JS%20para%20Limbo%20OS%29.md).
