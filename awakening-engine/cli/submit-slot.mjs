import { calculateAffinity } from "../engine/scoring.js";
import { resolveBatchAssignments, resolveInstantAssignment } from "../engine/allocator.js";
import { loadSession, saveSessionAndViews } from "./stateIO.mjs";

const slotCode = String(process.env.SLOT_CODE || "").trim().toUpperCase();
const playerName = String(process.env.PLAYER_NAME || "").trim();
const civilName = String(process.env.CIVIL_NAME || "").trim();
const age = String(process.env.CIVIL_AGE || "").trim();
const occupation = String(process.env.CIVIL_OCCUPATION || "").trim();
const visualAppearance = String(process.env.VISUAL_APPEARANCE || "").trim();
const prePowerHistory = String(process.env.PRE_POWER_HISTORY || "").trim();
const q1 = process.env.ANSWER_Q1;
const q2 = process.env.ANSWER_Q2;
const q3 = process.env.ANSWER_Q3;
const selectedWords = process.env.SELECTED_WORDS;
const autoConvergeWhenFull = process.env.AUTO_CONVERGE !== "false";

if (!slotCode) {
  throw new Error("SLOT_CODE obrigatório.");
}

const session = loadSession();
const slot = session.slots[slotCode];

if (!slot) {
  throw new Error(`Código de vaga inválido ou inexistente nesta sessão: ${slotCode}`);
}

// Idempotência estrita: impede que um jogador refaça o teste ou duplique atribuição
if (slot.locked) {
  console.log(`Slot ${slotCode} já foi submetido e travado em ${slot.submittedAt}. Nenhuma alteração realizada.`);
  process.exit(0);
}

const affinity = calculateAffinity({ q1, q2, q3 }, selectedWords);
const now = new Date().toISOString();

slot.civilIdentity = {
  playerName: playerName || slotCode,
  civilName: civilName || "A definir",
  age: age || "A definir",
  occupation: occupation || "A definir",
  visualAppearance: visualAppearance || "A definir",
  prePowerHistory: prePowerHistory || "A definir",
};
slot.answers = affinity.normalizedAnswers;
slot.selectedWordIds = affinity.selectedWordIds;
slot.selectedWordLabels = affinity.selectedWordLabels;
slot.scores = affinity.scores;
slot.ranking = affinity.ranking;
slot.matchedPairs = affinity.matchedPairs;
slot.locked = true;
slot.submittedAt = now;

if (session.mode === "instant") {
  const result = resolveInstantAssignment(slot, session.availablePool);
  slot.assignedArchetypeId = result.archetypeId;
  slot.assignedAffinityScore = result.affinityScore;
  slot.isUnexpectedAwakening = result.isUnexpectedAwakening;
  slot.status = "revealed";
  session.availablePool = result.remainingPool;

  session.auditLog.push({
    at: now,
    event: "SLOT_REVEALED_INSTANT",
    detail: `Slot ${slotCode} (${slot.civilIdentity.playerName}) recebeu '${result.archetypeId}' (${result.affinityScore} pts). Restantes: ${session.availablePool.length}.`,
  });

  if (result.tieBreakAudit) {
    session.auditLog.push({
      at: now,
      event: "TIE_BREAK_D616",
      detail: JSON.stringify(result.tieBreakAudit),
    });
  }

  if (Object.values(session.slots).every((s) => s.status === "revealed")) {
    session.converged = true;
  }
} else {
  slot.status = "submitted";
  session.auditLog.push({
    at: now,
    event: "SLOT_SUBMITTED_BATCH",
    detail: `Slot ${slotCode} (${slot.civilIdentity.playerName}) submetido e travado. Aguardando convergência.`,
  });

  const allSlots = Object.values(session.slots);
  const allSubmitted = allSlots.every((s) => s.locked);

  if (allSubmitted && autoConvergeWhenFull && !session.converged) {
    const batchResult = resolveBatchAssignments(allSlots);
    for (const s of allSlots) {
      const assigned = batchResult.assignments[s.slotCode];
      s.assignedArchetypeId = assigned.archetypeId;
      s.assignedAffinityScore = assigned.affinityScore;
      s.isUnexpectedAwakening = assigned.isUnexpectedAwakening;
      s.status = "revealed";
    }
    session.availablePool = batchResult.remainingPool;
    session.converged = true;
    session.auditLog.push({
      at: now,
      event: "AUTO_CONVERGED_BATCH",
      detail: `Todos os ${allSlots.length} jogadores enviaram. Convergência concluída (soma global: ${batchResult.metrics.totalScore} pts, piso mínimo: ${batchResult.metrics.minScore} pts, 1ºs lugares: ${batchResult.metrics.firstChoicesHit}).`,
    });
    if (batchResult.tieBreakAudit) {
      session.auditLog.push({
        at: now,
        event: "TIE_BREAK_D616",
        detail: JSON.stringify(batchResult.tieBreakAudit),
      });
    }
  }
}

saveSessionAndViews(session);
console.log(`Submissão processada para ${slotCode} | Status: ${slot.status} | Ficha: ${slot.assignedArchetypeId || "aguardando convergência"}`);
