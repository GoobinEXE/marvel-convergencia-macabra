export const ARCHETYPE_IDS = ["melee", "agility", "ego", "logic", "vigilance"];

export const SCORING_RULES = {
  questionPrimaryPoints: 2,
  questionSecondaryPoints: 1, // aplicado apenas na q1
  wordMatchPoints: 1,
  wordPairSyncBonus: 1, // +1 extra ao escolher as 2 palavras da mesma ficha
  requiredWordCount: 5,
};

export const QUESTIONS = [
  {
    id: "q1",
    prompt: "Quando tudo dá errado e o perigo é imediato, qual é o primeiro reflexo do seu personagem?",
    options: [
      {
        id: "q1_melee",
        letter: "A",
        text: "Avançar para proteger quem está perto, firmar o pé e segurar o tranco de frente.",
        primary: "melee",
        secondary: "vigilance",
      },
      {
        id: "q1_agility",
        letter: "B",
        text: "Ganhar distância, buscar um ângulo seguro e lidar com a ameaça de longe com precisão.",
        primary: "agility",
        secondary: "logic",
      },
      {
        id: "q1_ego",
        letter: "C",
        text: "Sair do campo de visão, despistar o agressor ou ganhar tempo confundindo a situação.",
        primary: "ego",
        secondary: "agility",
      },
      {
        id: "q1_logic",
        letter: "D",
        text: "Analisar o ambiente com frieza, procurar uma falha no problema e organizar quem está em volta.",
        primary: "logic",
        secondary: "ego",
      },
      {
        id: "q1_vigilance",
        letter: "E",
        text: "Reagir no susto antes mesmo de pensar, guiado por um arrepio ou percepção súbita do ambiente.",
        primary: "vigilance",
        secondary: "melee",
      },
    ],
  },
  {
    id: "q2",
    prompt: "O que mais marcou a história passada do seu personagem até hoje?",
    options: [
      {
        id: "q2_melee",
        letter: "A",
        text: "Trabalho pesado, esporte de contato, lutas ou a necessidade constante de aguentar pressão física.",
        primary: "melee",
      },
      {
        id: "q2_agility",
        letter: "B",
        text: "Atividades que exigiam mira, coordenação fina, reflexo manual ou a sensação de precisar sempre escapar.",
        primary: "agility",
      },
      {
        id: "q2_ego",
        letter: "C",
        text: "Isolamento, segredos guardados, sensação de não pertencer ou lidar com pessoas difíceis.",
        primary: "ego",
      },
      {
        id: "q2_logic",
        letter: "D",
        text: "Estudos intensos, curiosidade fora do comum ou um sonho/evento estranho que nunca soube explicar.",
        primary: "logic",
      },
      {
        id: "q2_vigilance",
        letter: "E",
        text: "Estado constante de alerta, hipervigilância, intuição aguçada ou um susto que mudou seus sentidos.",
        primary: "vigilance",
      },
    ],
  },
  {
    id: "q3",
    prompt: "Em um grupo tentando sobreviver a uma crise, qual papel combina mais com a personalidade dele?",
    options: [
      {
        id: "q3_melee",
        letter: "A",
        text: "O escudo da linha de frente que não recua.",
        primary: "melee",
      },
      {
        id: "q3_agility",
        letter: "B",
        text: "O especialista ágil que resolve alvos difíceis sem se expor.",
        primary: "agility",
      },
      {
        id: "q3_ego",
        letter: "C",
        text: "O infiltrador ou distraidor que controla o que os outros percebem.",
        primary: "ego",
      },
      {
        id: "q3_logic",
        letter: "D",
        text: "O estrategista que monta o plano e protege os companheiros.",
        primary: "logic",
      },
      {
        id: "q3_vigilance",
        letter: "E",
        text: "O batedor/sentinela que percebe ameaças escondidas antes de todo mundo.",
        primary: "vigilance",
      },
    ],
  },
];

export const SYNC_WORDS = [
  { id: "w_nevoa", label: "Névoa", archetype: "ego" },
  { id: "w_precisao", label: "Precisão", archetype: "agility" },
  { id: "w_impacto", label: "Impacto", archetype: "melee" },
  { id: "w_sonho", label: "Sonho", archetype: "logic" },
  { id: "w_instinto", label: "Instinto", archetype: "vigilance" },
  { id: "w_segredo", label: "Segredo", archetype: "ego" },
  { id: "w_fuga", label: "Fuga", archetype: "agility" },
  { id: "w_resistencia", label: "Resistência", archetype: "melee" },
  { id: "w_pressagio", label: "Presságio", archetype: "vigilance" },
  { id: "w_estrategia", label: "Estratégia", archetype: "logic" },
];
