import { ARCHETYPE_IDS } from "../data/quizConfig.js";
import { loadSession, saveSessionAndViews } from "./stateIO.mjs";

/**
 * Limpa todas as respostas, formulários e resultados da sessão atual,
 * MANTENDO exatamente os mesmos hashes/códigos das 5 vagas para permitir
 * re-testar quantas vezes quiser sem trocar de código.
 */
const session = loadSession();
const now = new Date().toISOString();

for (const slot of Object.values(session.slots)) {
  slot.status = "pending";
  slot.locked = false;
  slot.civilIdentity = null;
  slot.answers = null;
  slot.selectedWordIds = [];
  slot.selectedWordLabels = [];
  slot.scores = null;
  slot.wordHits = null;
  slot.wordPositions = null;
  slot.wordOrderMask = null;
  slot.ranking = null;
  slot.assignedArchetypeId = null;
  slot.assignedAffinityScore = null;
  slot.assignedWordHitsCount = 0;
  slot.assignedWordPositions = [];
  slot.isUnexpectedAwakening = false;
  slot.submittedAt = null;
}

session.converged = false;
session.availablePool = [...ARCHETYPE_IDS];
session.auditLog.push({
  at: now,
  event: "SESSION_RESET",
  detail: "Todas as respostas e formulários foram apagados. Os 5 códigos das vagas foram mantidos para novo teste.",
});

saveSessionAndViews(session);
console.log("Respostas apagadas com sucesso! As 5 vagas voltaram para PENDENTE mantendo os mesmos códigos.");
