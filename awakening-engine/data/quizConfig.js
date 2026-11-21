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
    prompt: "Começa uma discussão feia ou um empurra-empurra na rua ou num bar lotado. O que o seu personagem faz na hora?",
    weights: { primary: 2.3500, secondary: 0.8500, tertiary: 0.3125 },
    options: [
      {
        id: "q1_melee",
        letter: "A",
        text: "Entra na frente para separar ou segurar quem está alterado, mesmo correndo o risco de levar um soco.",
        primary: "melee",
        secondary: "vigilance",
        tertiary: "ego",
      },
      {
        id: "q1_agility",
        letter: "B",
        text: "Sai do aperto rápido, pega distância e tenta resolver ou chamar ajuda de fora da confusão.",
        primary: "agility",
        secondary: "logic",
        tertiary: "vigilance",
      },
      {
        id: "q1_ego",
        letter: "C",
        text: "Muda o assunto, inventa uma desculpa convincente ou desconversa até o clima esfriar sem ninguém notar que foi ele.",
        primary: "ego",
        secondary: "agility",
        tertiary: "logic",
      },
      {
        id: "q1_logic",
        letter: "D",
        text: "Observa quem começou, procura a saída mais livre e tenta organizar as pessoas para ninguém se machucar.",
        primary: "logic",
        secondary: "ego",
        tertiary: "agility",
      },
      {
        id: "q1_vigilance",
        letter: "E",
        text: "Já tinha percebido que ia dar briga minutos antes pelo jeito de alguém na mesa e avisa quem está perto antes do copo voar.",
        primary: "vigilance",
        secondary: "melee",
        tertiary: "agility",
      },
    ],
  },
  {
    id: "q2",
    prompt: "Olhando para a rotina e o passado dele antes de qualquer coisa estranha acontecer, o que sempre descreveu bem essa pessoa?",
    weights: { primary: 2.1500, secondary: 0.6500, tertiary: 0.1875 },
    options: [
      {
        id: "q2_melee",
        letter: "A",
        text: "Trabalho braçal, academia, luta de fim de semana ou o costume de aguentar peso e cansaço sem reclamar.",
        primary: "melee",
        secondary: "vigilance",
        tertiary: "agility",
      },
      {
        id: "q2_agility",
        letter: "B",
        text: "Esportes de mira, videogame, dirigir bem no aperto ou sempre dar um jeito ágil de sair de furada.",
        primary: "agility",
        secondary: "vigilance",
        tertiary: "ego",
      },
      {
        id: "q2_ego",
        letter: "C",
        text: "Guardar segredos, mudar de assunto quando fica desconfortável ou saber ler o humor de qualquer roda de conversa.",
        primary: "ego",
        secondary: "logic",
        tertiary: "vigilance",
      },
      {
        id: "q2_logic",
        letter: "D",
        text: "Gostar de montar coisas, resolver quebra-cabeças, organizar planilhas ou ter um sonho esquisito que nunca soube explicar.",
        primary: "logic",
        secondary: "ego",
        tertiary: "melee",
      },
      {
        id: "q2_vigilance",
        letter: "E",
        text: "Ter o sono leve, notar detalhes que ninguém vê na rua ou desconfiar rápido quando algo está fora do lugar.",
        primary: "vigilance",
        secondary: "logic",
        tertiary: "melee",
      },
    ],
  },
  {
    id: "q3",
    prompt: "Numa viagem de carro com amigos em que o pneu fura à noite na estrada, sem sinal de celular, qual função acaba sobrando para ele?",
    weights: { primary: 1.9500, secondary: 0.4500, tertiary: 0.1250 },
    options: [
      {
        id: "q3_melee",
        letter: "A",
        text: "Pegar o macaco, soltar os parafusos duros e fazer a força bruta para trocar a roda.",
        primary: "melee",
        secondary: "ego",
        tertiary: "vigilance",
      },
      {
        id: "q3_agility",
        letter: "B",
        text: "Correr até um ponto mais alto ou seguro para sinalizar o trânsito e tentar pegar sinal.",
        primary: "agility",
        secondary: "melee",
        tertiary: "logic",
      },
      {
        id: "q3_ego",
        letter: "C",
        text: "Manter o pessoal calmo, puxar conversa para ninguém entrar em pânico ou convencer algum motorista a parar.",
        primary: "ego",
        secondary: "agility",
        tertiary: "vigilance",
      },
      {
        id: "q3_logic",
        letter: "D",
        text: "Ler o mapa, dividir as tarefas do grupo e calcular quanto tempo e combustível ainda restam.",
        primary: "logic",
        secondary: "vigilance",
        tertiary: "ego",
      },
      {
        id: "q3_vigilance",
        letter: "E",
        text: "Ficar de olho no movimento da pista, nos barulhos do mato e em quem está se aproximando no escuro.",
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
