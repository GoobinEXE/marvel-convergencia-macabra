import { ARCHETYPE_IDS } from "../data/quizConfig.js";
import { breakTieWithMarvelDie } from "./marvelDie.js";

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
 * MODO BATCH: Avalia todas as permutações 1-para-1 sem repetição (até 5! = 120)
 * e seleciona a alocação ótima global com desempate auditável via Dado Marvel d616.
 */
export function resolveBatchAssignments(submissions, rng = Math.random) {
  if (!submissions || submissions.length === 0 || submissions.length > ARCHETYPE_IDS.length) {
    throw new Error(`Número inválido de submissões para convergência: ${submissions?.length ?? 0}`);
  }

  const permutations = getPermutations(ARCHETYPE_IDS, submissions.length);

  const evaluated = permutations.map((perm, idx) => {
    const assignedScores = perm.map((arch, i) => submissions[i].scores[arch]);
    const totalScore = assignedScores.reduce((acc, s) => acc + s, 0);
    const minScore = Math.min(...assignedScores);
    const firstChoicesHit = perm.filter((arch, i) => {
      const topPersonal = Math.max(...Object.values(submissions[i].scores));
      return submissions[i].scores[arch] === topPersonal;
    }).length;

    return {
      permId: `perm_${idx}`,
      perm,
      totalScore,
      minScore,
      firstChoicesHit,
    };
  });

  evaluated.sort(
    (a, b) =>
      b.totalScore - a.totalScore ||
      b.minScore - a.minScore ||
      b.firstChoicesHit - a.firstChoicesHit
  );

  const best = evaluated[0];
  const tiedTop = evaluated.filter(
    (e) =>
      e.totalScore === best.totalScore &&
      e.minScore === best.minScore &&
      e.firstChoicesHit === best.firstChoicesHit
  );

  let chosen = best;
  let tieBreakAudit = null;

  if (tiedTop.length > 1) {
    const tie = breakTieWithMarvelDie(
      tiedTop.map((t) => t.permId),
      rng
    );
    chosen = tiedTop.find((t) => t.permId === tie.winnerId);
    tieBreakAudit = {
      reason: "Empate matemático entre alocações ótimas equivalentes",
      tiedPermutationsCount: tiedTop.length,
      d616Rounds: tie.rounds,
      winnerPermId: tie.winnerId,
    };
  }

  const assignments = {};
  const usedArchetypes = new Set();

  submissions.forEach((sub, i) => {
    const arch = chosen.perm[i];
    usedArchetypes.add(arch);
    assignments[sub.slotCode] = {
      archetypeId: arch,
      affinityScore: sub.scores[arch],
      isUnexpectedAwakening: sub.scores[arch] <= 1,
    };
  });

  const remainingPool = ARCHETYPE_IDS.filter((id) => !usedArchetypes.has(id));

  return {
    assignments,
    remainingPool,
    metrics: {
      totalScore: chosen.totalScore,
      minScore: chosen.minScore,
      firstChoicesHit: chosen.firstChoicesHit,
    },
    tieBreakAudit,
  };
}

/**
 * MODO INSTANT: Aloca imediatamente a ficha de maior afinidade dentre as disponíveis
 * no pool da sessão, garantindo zero repetição.
 */
export function resolveInstantAssignment(submission, availablePool, rng = Math.random) {
  if (!availablePool || availablePool.length === 0) {
    throw new Error("Todas as 5 fichas desta sessão já foram atribuídas.");
  }

  const maxScore = Math.max(...availablePool.map((arch) => submission.scores[arch]));
  const topCandidates = availablePool.filter((arch) => submission.scores[arch] === maxScore);

  let chosenArchetype = topCandidates[0];
  let tieBreakAudit = null;

  if (topCandidates.length > 1) {
    const tie = breakTieWithMarvelDie(topCandidates, rng);
    chosenArchetype = tie.winnerId;
    tieBreakAudit = {
      reason: "Empate pessoal entre fichas ainda disponíveis no pool",
      candidates: topCandidates,
      d616Rounds: tie.rounds,
      winnerArchetype: chosenArchetype,
    };
  }

  return {
    archetypeId: chosenArchetype,
    affinityScore: maxScore,
    isUnexpectedAwakening: maxScore <= 1,
    remainingPool: availablePool.filter((id) => id !== chosenArchetype),
    tieBreakAudit,
  };
}
