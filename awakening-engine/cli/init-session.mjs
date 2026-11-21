import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ARCHETYPE_IDS } from "../data/quizConfig.js";
import { generateUniqueCodes, sha256Hex } from "../engine/prng.js";
import { resolveStateDir, saveSessionAndViews } from "./stateIO.mjs";

const campaignName = process.env.CAMPAIGN_NAME || "Convergência Macabra";
const mode = process.env.ALLOCATION_MODE === "instant" ? "instant" : "batch";
const maxPlayers = Math.min(5, Math.max(1, Number(process.env.MAX_PLAYERS || 5)));
const prefix = (process.env.CODE_PREFIX || "X616").replace(/[^A-Za-z0-9]/g, "").slice(0, 8) || "X616";

const rawCodes = generateUniqueCodes(maxPlayers, prefix);
const now = new Date().toISOString();

const slots = {};
rawCodes.forEach((rawCode, idx) => {
  const slotNumber = idx + 1;
  const slotId = `slot_${slotNumber}`;
  slots[slotId] = {
    slotId,
    slotNumber,
    codeHash: sha256Hex(rawCode),
    status: "pending",
    locked: false,
    civilIdentity: null,
    answers: null,
    selectedWordIds: [],
    selectedWordLabels: [],
    scores: null,
    wordHits: null,
    wordPositions: null,
    wordOrderMask: null,
    ranking: null,
    assignedArchetypeId: null,
    assignedAffinityScore: null,
    assignedWordHitsCount: 0,
    assignedWordPositions: [],
    isUnexpectedAwakening: false,
    submittedAt: null,
  };
});

const session = {
  sessionId: crypto.randomUUID(),
  campaignName,
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
      detail: `Sessão criada no modo '${mode}' com ${maxPlayers} vagas protegidas por hash SHA-256.`,
    },
  ],
  createdAt: now,
  updatedAt: now,
};

const stateDir = resolveStateDir();
saveSessionAndViews(session, stateDir);

// Salva os códigos em texto puro APENAS em arquivo privado ignorado pelo Git (.gitignore)
const privateCodesPath = path.join(stateDir, "gm-codes.private.md");
const privateLines = [
  `# Códigos Privados do Mestre (${campaignName})`,
  ``,
  `> **Confidencial:** Este arquivo está no \`.gitignore\` e **não** sobe para o GitHub.`,
  `> Envie apenas **1 código individual** em particular para cada jogador.`,
  ``,
  `* **Sessão:** \`${session.sessionId}\``,
  `* **Gerado em:** \`${now}\``,
  ``,
  `| Vaga | Código Secreto para Enviar ao Jogador | Hash SHA-256 (público) |`,
  `| :--- | :---: | :--- |`,
  ...rawCodes.map((code, i) => `| **Vaga #${i + 1}** | \`${code}\` | \`${sha256Hex(code).slice(0, 16)}...\` |`),
  ``,
];
fs.writeFileSync(privateCodesPath, privateLines.join("\n"), "utf8");

console.log(`Sessão criada com sucesso: ${session.sessionId}`);
console.log(`Modo: ${session.mode} | Vagas: ${maxPlayers} (códigos ocultos no repositório público via SHA-256)`);
console.log(`Arquivo privado do Mestre salvo em: ${privateCodesPath}`);
