---
tags:
  - rpg
  - marvel-multiverse-rpg
  - sorteio
  - criacao-de-personagem
  - rank-4
sistema: Marvel Multiverse RPG (d616)
---

# Sistema de Seleção e Desempate (Pontuação de 4 Casas Decimais + Ordem de Palavras)

Este protocolo define **como atribuir as 5 fichas mecânicas** aos personagens civis criados pelos jogadores para [[Convergência Macabra]], **sem uso de dados** (100% determinístico para sorteio remoto), usando **pontuação de até 4 casas decimais (`0.0000`)** e **desempate pela quantidade e ordem exata (1ª a 5ª) das palavras escolhidas**.

---

## Como Funciona (Sem Dados e com Códigos Privados)

1. **Códigos Individuais Ocultos (SHA-256):** Cada jogador recebe do Mestre **apenas o seu próprio código** em particular. O site e os arquivos públicos do repositório exibem apenas **`Vaga #1` a `Vaga #5`** e validam o código via hash criptográfico SHA-256, sem listar os códigos abertamente.
2. **Pontuação até 4 Casas Decimais (`XX.XXXX`):**
   * Cada uma das **3 perguntas** distribui pesos fracionários distintos de 4 casas decimais para uma ficha **primária**, uma **secundária** e uma **terciária**.
   * Na **Sincronização de Palavras (15 palavras — 3 por ficha)**, o jogador escolhe **5 palavras EM ORDEM de prioridade (`1ª`, `2ª`, `3ª`, `4ª` e `5ª`)**.
3. **Regra de Desempate Ordenado de Palavras (Exemplo A vs B vs C):**
   * **Mais palavras daquela ficha vence:** Quem acertou 3 palavras da ficha vence quem acertou 2 ou 1.
   * **Ordem das palavras desempata:** Entre jogadores com a mesma quantidade de palavras (ou mesmas respostas nas perguntas), vence quem escolheu a palavra daquela ficha **mais cedo na ordem (`1ª > 2ª > 3ª > 4ª > 5ª`)**:
     * **Jogador B** (acertou 3 palavras da ficha, começando na 1ª) → **`10.4800` pts (1º Lugar — Vencedor)**.
     * **Jogador A** (acertou 1 palavra da ficha logo na **1ª posição**) → **`7.6100` pts (2º Lugar)**.
     * **Jogador C** (acertou 1 palavra da ficha apenas na **4ª posição**) → **`7.4700` pts (3º Lugar)**.

---

## Parte A — Bloco para os Jogadores *(Sem Spoilers)*

### 1. Falta energia no prédio ou na rua à noite e você está com amigos ou vizinhos. O que essa pessoa faz primeiro?
* **A)** Abre o portão pesado da garagem no braço, carrega as compras ou ajuda alguém a subir as escadas.
* **B)** Desce rápido para pegar velas, busca lanterna no carro e dá uma volta na rua para ver se a luz caiu no quarteirão inteiro.
* **C)** Puxa conversa no corredor para acalmar quem ficou nervoso e mantém o clima leve até a energia voltar.
* **D)** Vai direto olhar o quadro de disjuntores, checa o aplicativo da companhia elétrica e organiza quem tem bateria no celular.
* **E)** Já tinha deixado uma lanterna carregada num lugar fácil e percebe logo pelo movimento do corredor quem precisa de ajuda.

### 2. No trabalho, na faculdade ou na rotina da semana, pelo que os conhecidos mais reconhecem essa pessoa?
* **A)** Por ter disposição física, gostar de academia, esporte de contato ou nunca fugir de serviço pesado.
* **B)** Por ter ótimo reflexo no trânsito, mandar bem em jogos de mira ou resolver tarefas manuais com rapidez.
* **C)** Por saber conversar com qualquer pessoa, convencer os outros com facilidade e guardar bem os próprios assuntos.
* **D)** Por ser organizada, resolver problemas técnicos, montar coisas ou pesquisar assuntos difíceis até entender tudo.
* **E)** Por reparar em detalhes que passam batido pelos outros, lembrar de fisionomias e notar rápido quando alguém está diferente.

### 3. Num churrasco ou encontro de amigos em que nada foi planejado direito, qual papel acaba caindo no colo dela?
* **A)** Carregar o cooler cheio, mexer na churrasqueira ou resolver o que precisa de força física.
* **B)** Sair de última hora para buscar gelo e bebida antes que o mercado feche.
* **C)** Receber o pessoal, quebrar o gelo entre quem não se conhece e animar a mesa.
* **D)** Fazer a lista do que falta, dividir a conta no final e organizar os horários.
* **E)** Lembrar onde cada um deixou a chave ou o celular, ver quando a comida está passando do ponto e notar quem está sem copo.

### 4. Sincronização de Palavras — Escolha **5 palavras EM ORDEM (`1ª` a `5ª`)**:
1. `Impacto` | 2. `Precisão` | 3. `Névoa` | 4. `Sonho` | 5. `Instinto` | 6. `Resistência` | 7. `Fuga` | 8. `Segredo` | 9. `Estratégia` | 10. `Presságio` | 11. `Firmeza` | 12. `Reflexo` | 13. `Sussurro` | 14. `Controle` | 15. `Alerta`

---

## Parte B — Gabarito de 4 Casas Decimais (Exclusivo do Mestre)

### 1. Pesos das 3 Perguntas

| Pergunta | Primária | Secundária | Terciária |
| :--- | :---: | :---: | :---: |
| **Pergunta 1 (Reflexo)** | `+2.3500` | `+0.8500` | `+0.3125` |
| **Pergunta 2 (Passado)** | `+2.1500` | `+0.6500` | `+0.1875` |
| **Pergunta 3 (Papel)** | `+1.9500` | `+0.4500` | `+0.1250` |

| Letra | Ficha Primária | Ficha Secundária (P1 / P2 / P3) | Ficha Terciária (P1 / P2 / P3) |
| :---: | :--- | :--- | :--- |
| **A** | [[Jogador 01 - Mutante (Melee)]] | `Vigilance` / `Vigilance` / `Ego` | `Ego` / `Agility` / `Vigilance` |
| **B** | [[Jogador 02 - Mutante (Agility - Tiro)]] | `Logic` / `Vigilance` / `Melee` | `Vigilance` / `Ego` / `Logic` |
| **C** | [[Jogador 03 - Mutante (Ego - Ilusão e Telepatia)]] | `Agility` / `Logic` / `Agility` | `Logic` / `Vigilance` / `Vigilance` |
| **D** | [[Jogador 04 - Genética Alterada (Logic - Tática e Telecinese)]] | `Ego` / `Ego` / `Vigilance` | `Agility` / `Melee` / `Ego` |
| **E** | [[Jogador 05 - Genética Alterada (Vigilance - Sentidos e Reflexos)]] | `Melee` / `Logic` / `Agility` | `Agility` / `Melee` / `Logic` |

### 2. Pesos Posicionais das 5 Palavras Escolhidas + Bônus de Quantidade

| Ordem de Escolha da Palavra | Pontuação Adicionada à Ficha da Palavra |
| :---: | :---: |
| **1ª Palavra escolhida** | **`+1.1600`** |
| **2ª Palavra escolhida** | **`+1.0800`** |
| **3ª Palavra escolhida** | **`+1.0400`** |
| **4ª Palavra escolhida** | **`+1.0200`** |
| **5ª Palavra escolhida** | **`+1.0100`** |
| **Bônus por acertar 2 palavras da mesma ficha** | **`+0.2500`** |
| **Bônus por acertar as 3 palavras da mesma ficha** | **`+0.7500`** |

### 3. As 3 Palavras de Cada Ficha (Total: 15 Palavras)

| Ficha | Palavra 1 | Palavra 2 | Palavra 3 |
| :--- | :---: | :---: | :---: |
| **1. Melee** | `Impacto` | `Resistência` | `Firmeza` |
| **2. Agility (Tiro)** | `Precisão` | `Fuga` | `Reflexo` |
| **3. Ego (Ilusão & Telepatia)** | `Névoa` | `Segredo` | `Sussurro` |
| **4. Logic (Tática & Telecinese)** | `Sonho` | `Estratégia` | `Controle` |
| **5. Vigilance (Sentidos & Reflexos)** | `Instinto` | `Presságio` | `Alerta` |
