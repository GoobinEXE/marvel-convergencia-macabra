import { ARCHETYPE_IDS, QUESTIONS, SYNC_WORDS, SCORING_RULES } from "../data/quizConfig.js";
import { shuffleWithSeed } from "./prng.js";

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
 * Gera a versão cega e embaralhada do teste para um slotCode específico (Limbo OS).
 */
export function buildBlindQuizForSlot(slotCode) {
  const questions = QUESTIONS.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: shuffleWithSeed(
      q.options.map((opt) => ({ id: opt.id, text: opt.text })),
      `${slotCode}:${q.id}`
    ),
  }));

  const words = shuffleWithSeed(
    SYNC_WORDS.map((w) => ({ id: w.id, label: w.label })),
    `${slotCode}:words`
  );

  return {
    slotCode,
    requiredWordCount: SCORING_RULES.requiredWordCount,
    questions,
    words,
  };
}

/**
 * Valida respostas e calcula a pontuação de afinidade em todas as 5 fichas.
 */
export function calculateAffinity(answers, selectedWordsRaw) {
  const scores = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0]));
  const wordHits = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0]));
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
    scores[chosen.primary] += SCORING_RULES.questionPrimaryPoints;
    if (chosen.secondary) {
      scores[chosen.secondary] += SCORING_RULES.questionSecondaryPoints;
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
      `É obrigatório selecionar exatamente ${SCORING_RULES.requiredWordCount} palavras distintas (recebido: ${resolvedWords.length}).`
    );
  }

  for (const word of resolvedWords) {
    scores[word.archetype] += SCORING_RULES.wordMatchPoints;
    wordHits[word.archetype] += 1;
  }

  const matchedPairs = [];
  for (const arch of ARCHETYPE_IDS) {
    if (wordHits[arch] === 2) {
      scores[arch] += SCORING_RULES.wordPairSyncBonus;
      matchedPairs.push(arch);
    }
  }

  const ranking = [...ARCHETYPE_IDS].sort((a, b) => scores[b] - scores[a]);

  return {
    normalizedAnswers,
    selectedWordIds: resolvedWords.map((w) => w.id),
    selectedWordLabels: resolvedWords.map((w) => w.label),
    scores,
    ranking,
    wordHits,
    matchedPairs,
  };
}
