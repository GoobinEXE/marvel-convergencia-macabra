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
  const assigned = batchResult.assignments[slot.slotCode];
  slot.assignedArchetypeId = assigned.archetypeId;
  slot.assignedAffinityScore = assigned.affinityScore;
  slot.isUnexpectedAwakening = assigned.isUnexpectedAwakening;
  slot.status = "revealed";
}

session.availablePool = batchResult.remainingPool;
session.converged = true;
session.auditLog.push({
  at: now,
  event: "MANUAL_CONVERGENCE",
  detail: `Convergência disparada para ${submittedSlots.length} jogador(es). Soma global: ${batchResult.metrics.totalScore} pts | Piso mínimo: ${batchResult.metrics.minScore} pts | 1ºs lugares: ${batchResult.metrics.firstChoicesHit}.`,
});

if (batchResult.tieBreakAudit) {
  session.auditLog.push({
    at: now,
    event: "TIE_BREAK_D616",
    detail: JSON.stringify(batchResult.tieBreakAudit),
  });
}

saveSessionAndViews(session);

console.log(`Convergência concluída com sucesso para ${submittedSlots.length} jogador(es):`);
for (const slot of submittedSlots) {
  console.log(
    `  - ${slot.slotCode} (${slot.civilIdentity?.playerName}): ${slot.assignedArchetypeId} (${slot.assignedAffinityScore} pts)`
  );
}
