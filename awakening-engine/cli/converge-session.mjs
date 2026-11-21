import { resolveBatchAssignments } from "../engine/allocator.js";
import { loadSession, saveSessionAndViews } from "./stateIO.mjs";

const forceReconverge = process.env.FORCE_RECONVERGE === "true";
const session = loadSession();

if (session.converged && !forceReconverge) {
  console.log("A sessão já foi convergida. Use FORCE_RECONVERGE=true apenas se desejar recalcular.");
  process.exit(0);
}

const submittedSlots = Object.values(session.slots).filter((s) => s.locked && s.scores);

if (submittedSlots.length === 0) {
  throw new Error("Nenhum jogador submeteu respostas ainda. Impossível executar convergência.");
}

const batchResult = resolveBatchAssignments(submittedSlots);
const now = new Date().toISOString();

for (const slot of submittedSlots) {
  const assigned = batchResult.assignments[slot.slotId];
  slot.assignedArchetypeId = assigned.archetypeId;
  slot.assignedAffinityScore = assigned.affinityScore;
  slot.assignedWordHitsCount = assigned.wordHitsCount;
  slot.assignedWordPositions = assigned.wordPositions;
  slot.isUnexpectedAwakening = assigned.isUnexpectedAwakening;
  slot.status = "revealed";
}

session.availablePool = batchResult.remainingPool;
session.converged = true;
session.auditLog.push({
  at: now,
  event: "MANUAL_CONVERGENCE",
  detail: `Convergência 4-casas disparada para ${submittedSlots.length} jogador(es). Soma global: ${batchResult.metrics.totalScoreFormatted} pts | Piso mínimo: ${batchResult.metrics.minScoreFormatted} pts | Palavras sincronizadas: ${batchResult.metrics.totalWordHits}.`,
});

saveSessionAndViews(session);

console.log(`Convergência concluída com sucesso para ${submittedSlots.length} jogador(es):`);
for (const slot of submittedSlots) {
  const assigned = batchResult.assignments[slot.slotId];
  console.log(
    `  - Vaga #${slot.slotNumber} (${slot.civilIdentity?.playerName}): ${assigned.archetypeId} (${assigned.affinityScoreFormatted} pts | ${assigned.wordHitsCount} palavra(s) nas posições [${assigned.wordPositions.join(", ")}])`
  );
}
