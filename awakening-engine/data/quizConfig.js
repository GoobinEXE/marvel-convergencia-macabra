export const ARCHETYPE_IDS = ["melee", "agility", "ego", "logic", "vigilance"];

/**
 * Sistema de Pontuação Determinístico com 4 Casas Decimais (sem dados).
 *
 * - As 3 perguntas atribuem pesos fracionários distintos de 4 casas decimais
 *   (primário, secundário e terciário) para minimizar colisões na nota base.
 * - As 5 palavras são escolhidas EM ORDEM (1ª a 5ª escolha) dentre 15 palavras
 *   (3 palavras por ficha).
 * - Os pesos posicionais (.1600, .0800, .0400, .0200, .0100) usam potências de 2
 *   na fração decimal: nenhuma combinação distinta de posições produz o mesmo valor,
 *   e acertar na 1ª posição vale estritamente mais que na 2ª, 3ª, 4ª ou 5ª.
 */
export const SCORING_RULES = {
  requiredWordCount: 5,
  // Pesos de cada palavra conforme a ordem em que o jogador a selecionou (1ª a 5ª)
  wordPositionWeights: [1.1600, 1.0800, 1.0400, 1.0200, 1.0100],
  // Bônus cumulativo ao acertar múltiplas palavras da mesma ficha
  wordCountBonuses: {
    0: 0.0000,
    1: 0.0000,
    2: 0.2500,
    3: 0.7500,
  },
};

export const QUESTIONS = [
  {
    id: "q1",
    prompt: "Quando tudo dá errado e o perigo é imediato, qual é o primeiro reflexo do seu personagem?",
    weights: { primary: 2.3500, secondary: 0.8500, tertiary: 0.3125 },
    options: [
      {
        id: "q1_melee",
        letter: "A",
        text: "Avançar para proteger quem está perto, firmar o pé e segurar o tranco de frente.",
        primary: "melee",
        secondary: "vigilance",
        tertiary: "ego",
      },
      {
        id: "q1_agility",
        letter: "B",
        text: "Ganhar distância, buscar um ângulo seguro e lidar com a ameaça de longe com precisão.",
        primary: "agility",
        secondary: "logic",
        tertiary: "vigilance",
      },
      {
        id: "q1_ego",
        letter: "C",
        text: "Sair do campo de visão, despistar o agressor ou ganhar tempo confundindo a situação.",
        primary: "ego",
        secondary: "agility",
        tertiary: "logic",
      },
      {
        id: "q1_logic",
        letter: "D",
        text: "Analisar o ambiente com frieza, procurar uma falha no problema e organizar quem está em volta.",
        primary: "logic",
        secondary: "ego",
        tertiary: "agility",
      },
      {
        id: "q1_vigilance",
        letter: "E",
        text: "Reagir no susto antes mesmo de pensar, guiado por um arrepio ou percepção súbita do ambiente.",
        primary: "vigilance",
        secondary: "melee",
        tertiary: "agility",
      },
    ],
  },
  {
    id: "q2",
    prompt: "O que mais marcou a história passada do seu personagem até hoje?",
    weights: { primary: 2.1500, secondary: 0.6500, tertiary: 0.1875 },
    options: [
      {
        id: "q2_melee",
        letter: "A",
        text: "Trabalho pesado, esporte de contato, lutas ou a necessidade constante de aguentar pressão física.",
        primary: "melee",
        secondary: "vigilance",
        tertiary: "agility",
      },
      {
        id: "q2_agility",
        letter: "B",
        text: "Atividades que exigiam mira, coordenação fina, reflexo manual ou a sensação de precisar sempre escapar.",
        primary: "agility",
        secondary: "vigilance",
        tertiary: "ego",
      },
      {
        id: "q2_ego",
        letter: "C",
        text: "Isolamento, segredos guardados, sensação de não pertencer ou lidar com pessoas difíceis.",
        primary: "ego",
        secondary: "logic",
        tertiary: "vigilance",
      },
      {
        id: "q2_logic",
        letter: "D",
        text: "Estudos intensos, curiosidade fora do comum ou um sonho/evento estranho que nunca soube explicar.",
        primary: "logic",
        secondary: "ego",
        tertiary: "melee",
      },
      {
        id: "q2_vigilance",
        letter: "E",
        text: "Estado constante de alerta, hipervigilância, intuição aguçada ou um susto que mudou seus sentidos.",
        primary: "vigilance",
        secondary: "logic",
        tertiary: "melee",
      },
    ],
  },
  {
    id: "q3",
    prompt: "Em um grupo tentando sobreviver a uma crise, qual papel combina mais com a personalidade dele?",
    weights: { primary: 1.9500, secondary: 0.4500, tertiary: 0.1250 },
    options: [
      {
        id: "q3_melee",
        letter: "A",
        text: "O escudo da linha de frente que não recua.",
        primary: "melee",
        secondary: "ego",
        tertiary: "vigilance",
      },
      {
        id: "q3_agility",
        letter: "B",
        text: "O especialista ágil que resolve alvos difíceis sem se expor.",
        primary: "agility",
        secondary: "melee",
        tertiary: "logic",
      },
      {
        id: "q3_ego",
        letter: "C",
        text: "O infiltrador ou distraidor que controla o que os outros percebem.",
        primary: "ego",
        secondary: "agility",
        tertiary: "vigilance",
      },
      {
        id: "q3_logic",
        letter: "D",
        text: "O estrategista que monta o plano e protege os companheiros.",
        primary: "logic",
        secondary: "vigilance",
        tertiary: "ego",
      },
      {
        id: "q3_vigilance",
        letter: "E",
        text: "O batedor/sentinela que percebe ameaças escondidas antes de todo mundo.",
        primary: "vigilance",
        secondary: "agility",
        tertiary: "logic",
      },
    ],
  },
];

// 15 palavras (3 por ficha) para que o jogador selecione 5 EM ORDEM (1ª a 5ª)
export const SYNC_WORDS = [
  // Melee (3)
  { id: "w_impacto", label: "Impacto", archetype: "melee" },
  { id: "w_resistencia", label: "Resistência", archetype: "melee" },
  { id: "w_firmeza", label: "Firmeza", archetype: "melee" },
  // Agility (3)
  { id: "w_precisao", label: "Precisão", archetype: "agility" },
  { id: "w_fuga", label: "Fuga", archetype: "agility" },
  { id: "w_reflexo", label: "Reflexo", archetype: "agility" },
  // Ego (3)
  { id: "w_nevoa", label: "Névoa", archetype: "ego" },
  { id: "w_segredo", label: "Segredo", archetype: "ego" },
  { id: "w_sussurro", label: "Sussurro", archetype: "ego" },
  // Logic (3)
  { id: "w_sonho", label: "Sonho", archetype: "logic" },
  { id: "w_estrategia", label: "Estratégia", archetype: "logic" },
  { id: "w_controle", label: "Controle", archetype: "logic" },
  // Vigilance (3)
  { id: "w_instinto", label: "Instinto", archetype: "vigilance" },
  { id: "w_pressagio", label: "Presságio", archetype: "vigilance" },
  { id: "w_alerta", label: "Alerta", archetype: "vigilance" },
];
