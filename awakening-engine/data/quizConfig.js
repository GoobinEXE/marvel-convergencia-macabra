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
    prompt: "Falta energia no prédio ou na rua à noite e você está com amigos ou vizinhos. O que essa pessoa faz primeiro?",
    weights: { primary: 2.3500, secondary: 0.8500, tertiary: 0.3125 },
    options: [
      {
        id: "q1_melee",
        letter: "A",
        text: "Abre o portão pesado da garagem no braço, carrega as compras ou ajuda alguém a subir as escadas.",
        primary: "melee",
        secondary: "vigilance",
        tertiary: "ego",
      },
      {
        id: "q1_agility",
        letter: "B",
        text: "Desce rápido para pegar velas, busca lanterna no carro e dá uma volta na rua para ver se a luz caiu no quarteirão inteiro.",
        primary: "agility",
        secondary: "logic",
        tertiary: "vigilance",
      },
      {
        id: "q1_ego",
        letter: "C",
        text: "Puxa conversa no corredor para acalmar quem ficou nervoso e mantém o clima leve até a energia voltar.",
        primary: "ego",
        secondary: "agility",
        tertiary: "logic",
      },
      {
        id: "q1_logic",
        letter: "D",
        text: "Vai direto olhar o quadro de disjuntores, checa o aplicativo da companhia elétrica e organiza quem tem bateria no celular.",
        primary: "logic",
        secondary: "ego",
        tertiary: "agility",
      },
      {
        id: "q1_vigilance",
        letter: "E",
        text: "Já tinha deixado uma lanterna carregada num lugar fácil e percebe logo pelo movimento do corredor quem precisa de ajuda.",
        primary: "vigilance",
        secondary: "melee",
        tertiary: "agility",
      },
    ],
  },
  {
    id: "q2",
    prompt: "No trabalho, na faculdade ou na rotina da semana, pelo que os conhecidos mais reconhecem essa pessoa?",
    weights: { primary: 2.1500, secondary: 0.6500, tertiary: 0.1875 },
    options: [
      {
        id: "q2_melee",
        letter: "A",
        text: "Por ter disposição física, gostar de academia, esporte de contato ou nunca fugir de serviço pesado.",
        primary: "melee",
        secondary: "vigilance",
        tertiary: "agility",
      },
      {
        id: "q2_agility",
        letter: "B",
        text: "Por ter ótimo reflexo no trânsito, mandar bem em jogos de mira ou resolver tarefas manuais com rapidez.",
        primary: "agility",
        secondary: "vigilance",
        tertiary: "ego",
      },
      {
        id: "q2_ego",
        letter: "C",
        text: "Por saber conversar com qualquer pessoa, convencer os outros com facilidade e guardar bem os próprios assuntos.",
        primary: "ego",
        secondary: "logic",
        tertiary: "vigilance",
      },
      {
        id: "q2_logic",
        letter: "D",
        text: "Por ser organizada, resolver problemas técnicos, montar coisas ou pesquisar assuntos difíceis até entender tudo.",
        primary: "logic",
        secondary: "ego",
        tertiary: "melee",
      },
      {
        id: "q2_vigilance",
        letter: "E",
        text: "Por reparar em detalhes que passam batido pelos outros, lembrar de fisionomias e notar rápido quando alguém está diferente.",
        primary: "vigilance",
        secondary: "logic",
        tertiary: "melee",
      },
    ],
  },
  {
    id: "q3",
    prompt: "Num churrasco ou encontro de amigos em que nada foi planejado direito, qual papel acaba caindo no colo dela?",
    weights: { primary: 1.9500, secondary: 0.4500, tertiary: 0.1250 },
    options: [
      {
        id: "q3_melee",
        letter: "A",
        text: "Carregar o cooler cheio, mexer na churrasqueira ou resolver o que precisa de força física.",
        primary: "melee",
        secondary: "ego",
        tertiary: "vigilance",
      },
      {
        id: "q3_agility",
        letter: "B",
        text: "Sair de última hora para buscar gelo e bebida antes que o mercado feche.",
        primary: "agility",
        secondary: "melee",
        tertiary: "logic",
      },
      {
        id: "q3_ego",
        letter: "C",
        text: "Receber o pessoal, quebrar o gelo entre quem não se conhece e animar a mesa.",
        primary: "ego",
        secondary: "agility",
        tertiary: "vigilance",
      },
      {
        id: "q3_logic",
        letter: "D",
        text: "Fazer a lista do que falta, dividir a conta no final e organizar os horários.",
        primary: "logic",
        secondary: "vigilance",
        tertiary: "ego",
      },
      {
        id: "q3_vigilance",
        letter: "E",
        text: "Lembrar onde cada um deixou a chave ou o celular, ver quando a comida está passando do ponto e notar quem está sem copo.",
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
