import crypto from "node:crypto";
import { ARCHETYPE_IDS } from "../data/quizConfig.js";
import { generateAccessCode, generateUniqueCodes } from "../engine/prng.js";
import { saveSessionAndViews } from "./stateIO.mjs";

const campaignName = process.env.CAMPAIGN_NAME || "Convergência Macabra";
const mode = process.env.ALLOCATION_MODE === "instant" ? "instant" : "batch";
const maxPlayers = Math.min(5, Math.max(1, Number(process.env.MAX_PLAYERS || 5)));
const prefix = (process.env.CODE_PREFIX || "X616").replace(/[^A-Za-z0-9]/g, "").slice(0, 8) || "X616";

const slotCodes = generateUniqueCodes(maxPlayers, prefix);
const masterCode = generateAccessCode("GM", 6);
const now = new Date().toISOString();

const slots = {};
for (const code of slotCodes) {
  slots[code] = {
    slotCode: code,
    status: "pending",
    locked: false,
    civilIdentity: null,
    answers: null,
    selectedWordIds: [],
    selectedWordLabels: [],
    scores: null,
    ranking: null,
    matchedPairs: [],
    assignedArchetypeId: null,
    assignedAffinityScore: null,
    isUnexpectedAwakening: false,
    submittedAt: null,
  };
}

const session = {
  sessionId: crypto.randomUUID(),
  campaignName,
  masterCode,
  mode,
  maxPlayers,
  version: 0,
  converged: false,
  availablePool: [...ARCHETYPE_IDS],
  slots,
  auditLog: [
    {
      at: now,
      event: "SESSION_INIT",
      detail: `Sessão criada no modo '${mode}' com ${maxPlayers} códigos (${slotCodes.join(", ")}).`,
    },
  ],
  createdAt: now,
  updatedAt: now,
};

saveSessionAndViews(session);

console.log(`Sessão criada com sucesso: ${session.sessionId}`);
console.log(`Modo: ${session.mode}`);
console.log(`Código do Mestre: ${session.masterCode}`);
console.log(`Códigos das Vagas (${slotCodes.length}):`);
for (const code of slotCodes) {
  console.log(`  - ${code}`);
}
