import { ARCHETYPE_IDS } from "../data/quizConfig.js";
import { round4, formatScore4 } from "./scoring.js";

function getPermutations(items, k) {
  if (k === 0) return [[]];
  const result = [];
  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const tail of getPermutations(rest, k - 1)) {
      result.push([current, ...tail]);
    }
  }
  return result;
}

/**
 * MODO BATCH (100% Determinístico — Zero Dados):
 * Avalia todas as permutações 1-para-1 sem repetição (até 5! = 120) usando:
 * 1. Maior soma global de pontuação (4 casas decimais)
 * 2. Maior pontuação mínima individual (equidade Max-Min)
 * 3. Maior total de palavras sincronizadas nas fichas atribuídas
 * 4. Maior prioridade posicional de palavras (1ª > 2ª > 3ª > 4ª > 5ª escolha)
 * 5. Prioridade de quem acertou mais palavras / mais cedo em caso de disputa direta
 */
export function resolveBatchAssignments(submissions) {
  if (!submissions || submissions.length === 0 || submissions.length > ARCHETYPE_IDS.length) {
    throw new Error(`Número inválido de submissões para convergência: ${submissions?.length ?? 0}`);
  }

  // Ordena submissões por horário de envio (ou índice) para estabilidade determinística
  const orderedSubs = [...submissions];
  const permutations = getPermutations(ARCHETYPE_IDS, orderedSubs.length);

  const evaluated = permutations.map((perm, idx) => {
    const assignedScores = perm.map((arch, i) => orderedSubs[i].scores[arch] || 0);
    const totalScore = round4(assignedScores.reduce((acc, s) => acc + s, 0));
    const minScore = round4(Math.min(...assignedScores));

    const totalWordHits = perm.reduce(
      (acc, arch, i) => acc + (orderedSubs[i].wordHits?.[arch] || 0),
      0
    );
    const totalWordOrderMask = perm.reduce(
      (acc, arch, i) => acc + (orderedSubs[i].wordOrderMask?.[arch] || 0),
      0
    );

    const firstChoicesHit = perm.filter((arch, i) => {
      const topPersonal = Math.max(...Object.values(orderedSubs[i].scores));
      return Math.abs(orderedSubs[i].scores[arch] - topPersonal) < 1e-6;
    }).length;

    // Vetor lexicográfico por jogador na ordem de envio (desempata A vs B vs C pela quantidade e ordem das palavras)
    const lexicalVector = perm.map((arch, i) => ({
      score: orderedSubs[i].scores[arch] || 0,
      hits: orderedSubs[i].wordHits?.[arch] || 0,
      mask: orderedSubs[i].wordOrderMask?.[arch] || 0,
    }));

    return {
      permId: `perm_${idx}`,
      perm,
      totalScore,
      minScore,
      totalWordHits,
      totalWordOrderMask,
      firstChoicesHit,
      lexicalVector,
    };
  });

  evaluated.sort((a, b) => {
    if (Math.abs(b.totalScore - a.totalScore) > 1e-6) return b.totalScore - a.totalScore;
    if (Math.abs(b.minScore - a.minScore) > 1e-6) return b.minScore - a.minScore;
    if (b.totalWordHits !== a.totalWordHits) return b.totalWordHits - a.totalWordHits;
    if (b.totalWordOrderMask !== a.totalWordOrderMask) return b.totalWordOrderMask - a.totalWordOrderMask;
    if (b.firstChoicesHit !== a.firstChoicesHit) return b.firstChoicesHit - a.firstChoicesHit;

    for (let i = 0; i < a.lexicalVector.length; i++) {
      const va = a.lexicalVector[i];
      const vb = b.lexicalVector[i];
      if (vb.hits !== va.hits) return vb.hits - va.hits;
      if (vb.mask !== va.mask) return vb.mask - va.mask;
      if (Math.abs(vb.score - va.score) > 1e-6) return vb.score - va.score;
    }
    return 0;
  });

  const chosen = evaluated[0];
  const assignments = {};
  const usedArchetypes = new Set();

  orderedSubs.forEach((sub, i) => {
    const arch = chosen.perm[i];
    const score = round4(sub.scores[arch] || 0);
    const hits = sub.wordHits?.[arch] || 0;
    const positions = sub.wordPositions?.[arch] || [];
    usedArchetypes.add(arch);

    const key = sub.slotId || sub.codeHash || sub.slotCode;
    assignments[key] = {
      archetypeId: arch,
      affinityScore: score,
      affinityScoreFormatted: formatScore4(score),
      wordHitsCount: hits,
      wordPositions: positions,
      wordOrderMask: sub.wordOrderMask?.[arch] || 0,
      isUnexpectedAwakening: score < 2.0,
    };
  });

  const remainingPool = ARCHETYPE_IDS.filter((id) => !usedArchetypes.has(id));

  return {
    assignments,
    remainingPool,
    metrics: {
      totalScore: chosen.totalScore,
      totalScoreFormatted: formatScore4(chosen.totalScore),
      minScore: chosen.minScore,
      minScoreFormatted: formatScore4(chosen.minScore),
      totalWordHits: chosen.totalWordHits,
      firstChoicesHit: chosen.firstChoicesHit,
    },
  };
}

/**
 * MODO INSTANT (100% Determinístico — Zero Dados):
 * Escolhe a ficha livre no pool com:
 * 1) Maior pontuação de 4 casas decimais
 * 2) Maior quantidade de palavras escolhidas daquela ficha
 * 3) Palavras escolhidas mais cedo na ordem (1ª > 2ª > 3ª > 4ª > 5ª)
 */
export function resolveInstantAssignment(submission, availablePool) {
  if (!availablePool || availablePool.length === 0) {
    throw new Error("Todas as 5 fichas desta sessão já foram atribuídas.");
  }

  const sorted = [...availablePool].sort((a, b) => {
    const sDiff = (submission.scores[b] || 0) - (submission.scores[a] || 0);
    if (Math.abs(sDiff) > 1e-6) return sDiff;

    const hDiff = (submission.wordHits?.[b] || 0) - (submission.wordHits?.[a] || 0);
    if (hDiff !== 0) return hDiff;

    return (submission.wordOrderMask?.[b] || 0) - (submission.wordOrderMask?.[a] || 0);
  });

  const chosenArchetype = sorted[0];
  const score = round4(submission.scores[chosenArchetype] || 0);

  return {
    archetypeId: chosenArchetype,
    affinityScore: score,
    affinityScoreFormatted: formatScore4(score),
    wordHitsCount: submission.wordHits?.[chosenArchetype] || 0,
    wordPositions: submission.wordPositions?.[chosenArchetype] || [],
    wordOrderMask: submission.wordOrderMask?.[chosenArchetype] || 0,
    isUnexpectedAwakening: score < 2.0,
    remainingPool: availablePool.filter((id) => id !== chosenArchetype),
  };
}
