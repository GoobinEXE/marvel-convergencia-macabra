import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAffinity,
  buildBlindQuizForSeed,
  comparePlayersForArchetype,
  formatScore4,
} from "../engine/scoring.js";
import { resolveBatchAssignments, resolveInstantAssignment } from "../engine/allocator.js";
import { ARCHETYPE_IDS } from "../data/quizConfig.js";
import { buildPublicState } from "../engine/boardRenderer.js";
import { sha256Hex } from "../engine/prng.js";

test("Embaralhamento cego de 15 palavras é determinístico por hash e difere entre vagas", () => {
  const quizA1 = buildBlindQuizForSeed("hash_vaga_1");
  const quizA2 = buildBlindQuizForSeed("hash_vaga_1");
  const quizB = buildBlindQuizForSeed("hash_vaga_2");

  assert.equal(quizA1.words.length, 15);
  assert.deepEqual(quizA1, quizA2);
  assert.notDeepEqual(
    quizA1.words.map((w) => w.id),
    quizB.words.map((w) => w.id)
  );
});

test("Pontuação tem 4 casas decimais exatas e soma pesos posicionais (1ª > 2ª > 3ª > 4ª > 5ª)", () => {
  // Perguntas: A, A, A -> melee = 2.3500 + 2.1500 + 1.9500 = 6.4500
  // Palavras: 1ª Impacto (1.1600), 2ª Resistência (1.0800), 3ª Firmeza (1.0400) + Bônus trinca (0.7500) = 4.0300
  // Total esperado em melee = 10.4800
  const result = calculateAffinity(
    { q1: "A", q2: "A", q3: "A" },
    ["Impacto", "Resistência", "Firmeza", "Névoa", "Sonho"]
  );

  assert.equal(formatScore4(result.scores.melee), "10.4800");
  assert.equal(result.wordHits.melee, 3);
  assert.deepEqual(result.wordPositions.melee, [1, 2, 3]);
  assert.equal(result.ranking[0], "melee");
});

test("Desempate A vs B vs C pela quantidade e ordem das palavras (Exemplo Exato: B > A > C)", () => {
  // Todos os 3 responderam exatamente A, A, A nas perguntas (6.4500 base em Melee)
  // Jogador A: apenas a 1ª palavra é de Melee ("Impacto" na 1ª posição)
  const subA = {
    slotId: "slot_A",
    ...calculateAffinity(
      { q1: "A", q2: "A", q3: "A" },
      ["Impacto", "Névoa", "Sonho", "Instinto", "Precisão"]
    ),
  };

  // Jogador B: 3 palavras de Melee logo nas primeiras posições ("Impacto", "Resistência", "Firmeza")
  const subB = {
    slotId: "slot_B",
    ...calculateAffinity(
      { q1: "A", q2: "A", q3: "A" },
      ["Impacto", "Resistência", "Firmeza", "Névoa", "Sonho"]
    ),
  };

  // Jogador C: apenas 1 palavra de Melee, e só na 4ª posição ("Impacto" na 4ª posição)
  const subC = {
    slotId: "slot_C",
    ...calculateAffinity(
      { q1: "A", q2: "A", q3: "A" },
      ["Névoa", "Sonho", "Instinto", "Impacto", "Precisão"]
    ),
  };

  // Verifica pontuações de 4 casas decimais em Melee:
  // B = 10.4800 (3 palavras: 1ª, 2ª, 3ª) > A = 7.6100 (1 palavra: 1ª) > C = 7.4700 (1 palavra: 4ª)
  assert.equal(formatScore4(subB.scores.melee), "10.4800");
  assert.equal(formatScore4(subA.scores.melee), "7.6100");
  assert.equal(formatScore4(subC.scores.melee), "7.4700");

  const ordered = [subA, subB, subC].sort((x, y) =>
    comparePlayersForArchetype(x, y, "melee")
  );

  assert.deepEqual(
    ordered.map((s) => s.slotId),
    ["slot_B", "slot_A", "slot_C"]
  );
});

test("Alocação Batch entre A, B e C disputando Melee entrega Melee para o Jogador B sem usar dados", () => {
  const subA = {
    slotId: "slot_A",
    ...calculateAffinity(
      { q1: "A", q2: "A", q3: "A" },
      ["Impacto", "Névoa", "Segredo", "Sonho", "Instinto"]
    ),
  };
  const subB = {
    slotId: "slot_B",
    ...calculateAffinity(
      { q1: "A", q2: "A", q3: "A" },
      ["Impacto", "Resistência", "Firmeza", "Névoa", "Sonho"]
    ),
  };
  const subC = {
    slotId: "slot_C",
    ...calculateAffinity(
      { q1: "A", q2: "A", q3: "A" },
      ["Sonho", "Estratégia", "Controle", "Impacto", "Precisão"]
    ),
  };

  const res = resolveBatchAssignments([subA, subB, subC]);

  assert.equal(res.assignments.slot_B.archetypeId, "melee");
  assert.equal(res.assignments.slot_A.archetypeId, "ego");
  assert.equal(res.assignments.slot_C.archetypeId, "logic");
});

test("Privacidade: buildPublicState nunca expõe códigos em texto puro, apenas SHA-256", () => {
  const secretCode = "X616-SECRET99";
  const hash = sha256Hex(secretCode);
  const fakeSession = {
    sessionId: "sess-1",
    campaignName: "Convergência Macabra",
    mode: "batch",
    version: 1,
    converged: false,
    updatedAt: new Date().toISOString(),
    availablePool: [...ARCHETYPE_IDS],
    slots: {
      slot_1: {
        slotId: "slot_1",
        slotNumber: 1,
        codeHash: hash,
        status: "pending",
        locked: false,
        civilIdentity: null,
      },
    },
  };

  const pubJson = JSON.stringify(buildPublicState(fakeSession));
  assert.equal(pubJson.includes(secretCode), false);
  assert.equal(pubJson.includes(hash), true);
});
