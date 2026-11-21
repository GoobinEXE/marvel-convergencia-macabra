import { ARCHETYPE_IDS, QUESTIONS, SYNC_WORDS, SCORING_RULES } from "../data/quizConfig.js";
import { shuffleWithSeed } from "./prng.js";

export function round4(num) {
  return Number(Math.round((num + Number.EPSILON) * 10000) / 10000);
}

export function formatScore4(num) {
  return round4(num).toFixed(4);
}

function normalizeToken(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resolveOption(question, rawAnswer) {
  const norm = normalizeToken(rawAnswer);
  return question.options.find(
    (opt) =>
      normalizeToken(opt.id) === norm ||
      normalizeToken(opt.letter) === norm ||
      normalizeToken(opt.primary) === norm
  );
}

function resolveWord(rawWord) {
  const norm = normalizeToken(rawWord);
  return SYNC_WORDS.find(
    (w) => normalizeToken(w.id) === norm || normalizeToken(w.label) === norm
  );
}

/**
 * Gera a versão cega e embaralhada do teste usando uma seed de vaga (hash ou ID da vaga),
 * sem nunca expor o código secreto do jogador.
 */
export function buildBlindQuizForSeed(seedKey) {
  const questions = QUESTIONS.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: shuffleWithSeed(
      q.options.map((opt) => ({ id: opt.id, text: opt.text })),
      `${seedKey}:${q.id}`
    ),
  }));

  const words = shuffleWithSeed(
    SYNC_WORDS.map((w) => ({ id: w.id, label: w.label })),
    `${seedKey}:words`
  );

  return {
    requiredWordCount: SCORING_RULES.requiredWordCount,
    questions,
    words,
  };
}

/**
 * Calcula afinidade com precisão de 4 casas decimais e registra a ordem exata
 * (1ª a 5ª palavra) para desempate determinístico sem uso de dados.
 */
export function calculateAffinity(answers, selectedWordsRaw) {
  const scores = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0]));
  const wordHits = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0]));
  // Posições (1..5) em que o jogador escolheu palavras de cada ficha
  const wordPositions = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, []]));
  // Máscara binária de prioridade de ordem: 1ª pos = 16, 2ª = 8, 3ª = 4, 4ª = 2, 5ª = 1
  const wordOrderMask = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0]));
  const normalizedAnswers = {};

  for (const q of QUESTIONS) {
    const raw = answers?.[q.id];
    if (!raw) {
      throw new Error(`Pergunta obrigatória não respondida: ${q.id}`);
    }
    const chosen = resolveOption(q, raw);
    if (!chosen) {
      throw new Error(`Alternativa inválida para ${q.id}: "${raw}"`);
    }
    normalizedAnswers[q.id] = chosen.id;
    scores[chosen.primary] = round4(scores[chosen.primary] + q.weights.primary);
    if (chosen.secondary) {
      scores[chosen.secondary] = round4(scores[chosen.secondary] + q.weights.secondary);
    }
    if (chosen.tertiary) {
      scores[chosen.tertiary] = round4(scores[chosen.tertiary] + q.weights.tertiary);
    }
  }

  const wordList = Array.isArray(selectedWordsRaw)
    ? selectedWordsRaw
    : String(selectedWordsRaw || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const resolvedWords = [];
  const seenWordIds = new Set();

  for (const rawWord of wordList) {
    const word = resolveWord(rawWord);
    if (!word) {
      throw new Error(`Palavra inválida na sincronização: "${rawWord}"`);
    }
    if (!seenWordIds.has(word.id)) {
      seenWordIds.add(word.id);
      resolvedWords.push(word);
    }
  }

  if (resolvedWords.length !== SCORING_RULES.requiredWordCount) {
    throw new Error(
      `É obrigatório selecionar exatamente ${SCORING_RULES.requiredWordCount} palavras distintas em ordem (recebido: ${resolvedWords.length}).`
    );
  }

  resolvedWords.forEach((word, index) => {
    const posWeight = SCORING_RULES.wordPositionWeights[index];
    const bitValue = 1 << (SCORING_RULES.requiredWordCount - 1 - index); // 16, 8, 4, 2, 1
    scores[word.archetype] = round4(scores[word.archetype] + posWeight);
    wordHits[word.archetype] += 1;
    wordPositions[word.archetype].push(index + 1);
    wordOrderMask[word.archetype] += bitValue;
  });

  for (const arch of ARCHETYPE_IDS) {
    const count = wordHits[arch];
    const bonus = SCORING_RULES.wordCountBonuses[count] || 0;
    if (bonus > 0) {
      scores[arch] = round4(scores[arch] + bonus);
    }
  }

  // Ranking pessoal ordenado por:
  // 1) Pontuação de 4 casas decimais
  // 2) Quantidade de palavras daquela ficha
  // 3) Ordem mais cedo das palavras escolhidas (wordOrderMask)
  const ranking = [...ARCHETYPE_IDS].sort(
    (a, b) =>
      scores[b] - scores[a] ||
      wordHits[b] - wordHits[a] ||
      wordOrderMask[b] - wordOrderMask[a]
  );

  return {
    normalizedAnswers,
    selectedWordIds: resolvedWords.map((w) => w.id),
    selectedWordLabels: resolvedWords.map((w) => w.label),
    scores,
    wordHits,
    wordPositions,
    wordOrderMask,
    ranking,
  };
}

/**
 * Compara dois jogadores disputando a mesma ficha `archId` sem usar dados:
 * 1) Maior pontuação de 4 casas decimais na ficha
 * 2) Maior quantidade de palavras escolhidas daquela ficha (3 > 2 > 1 > 0)
 * 3) Palavras daquela ficha escolhidas mais cedo na ordem (1ª > 2ª > 3ª > 4ª > 5ª via wordOrderMask)
 * 4) Quem submeteu primeiro (timestamp)
 */
export function comparePlayersForArchetype(subA, subB, archId) {
  const scoreDiff = (subB.scores?.[archId] || 0) - (subA.scores?.[archId] || 0);
  if (Math.abs(scoreDiff) > 1e-6) return scoreDiff;

  const hitsDiff = (subB.wordHits?.[archId] || 0) - (subA.wordHits?.[archId] || 0);
  if (hitsDiff !== 0) return hitsDiff;

  const maskDiff = (subB.wordOrderMask?.[archId] || 0) - (subA.wordOrderMask?.[archId] || 0);
  if (maskDiff !== 0) return maskDiff;

  const timeA = subA.submittedAt ? Date.parse(subA.submittedAt) : 0;
  const timeB = subB.submittedAt ? Date.parse(subB.submittedAt) : 0;
  return timeA - timeB;
}
