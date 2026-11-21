import test from "node:test";
import assert from "node:assert/strict";
import { calculateAffinity, buildBlindQuizForSlot } from "../engine/scoring.js";
import { resolveBatchAssignments, resolveInstantAssignment } from "../engine/allocator.js";
import { ARCHETYPE_IDS } from "../data/quizConfig.js";
import { mulberry32 } from "../engine/prng.js";

test("Embaralhamento cego é determinístico por slotCode e difere entre jogadores", () => {
  const quizA1 = buildBlindQuizForSlot("X616-AAAA");
  const quizA2 = buildBlindQuizForSlot("X616-AAAA");
  const quizB = buildBlindQuizForSlot("X616-BBBB");

  assert.deepEqual(quizA1, quizA2);
  assert.notDeepEqual(
    quizA1.words.map((w) => w.id),
    quizB.words.map((w) => w.id)
  );
});

test("Cálculo de afinidade aplica pesos de perguntas + bônus de sincronia de par de palavras", () => {
  // Todas respostas Melee + par completo de Melee (Impacto + Resistência) + 3 palavras distintas
  const result = calculateAffinity(
    { q1: "A", q2: "A", q3: "A" },
    ["Impacto", "Resistência", "Névoa", "Sonho", "Instinto"]
  );

  // q1 (+2) + q2 (+2) + q3 (+2) + Impacto (+1) + Resistência (+1) + Bônus par (+1) = 9
  assert.equal(result.scores.melee, 9);
  assert.deepEqual(result.matchedPairs, ["melee"]);
  assert.equal(result.ranking[0], "melee");
});

test("Validação rejeita menos ou mais de 5 palavras distintas", () => {
  assert.throws(
    () => calculateAffinity({ q1: "A", q2: "A", q3: "A" }, ["Impacto", "Resistência", "Névoa"]),
    /exatamente 5 palavras distintas/
  );
});

test("Cenário Ideal (5 distintos): todos os 5 jogadores recebem 1º lugar sem repetição", () => {
  const specs = [
    { code: "S1", ans: { q1: "A", q2: "A", q3: "A" }, words: ["Impacto", "Resistência", "Névoa", "Sonho", "Instinto"], expected: "melee" },
    { code: "S2", ans: { q1: "B", q2: "B", q3: "B" }, words: ["Precisão", "Fuga", "Impacto", "Sonho", "Instinto"], expected: "agility" },
    { code: "S3", ans: { q1: "C", q2: "C", q3: "C" }, words: ["Névoa", "Segredo", "Impacto", "Sonho", "Instinto"], expected: "ego" },
    { code: "S4", ans: { q1: "D", q2: "D", q3: "D" }, words: ["Sonho", "Estratégia", "Impacto", "Névoa", "Instinto"], expected: "logic" },
    { code: "S5", ans: { q1: "E", q2: "E", q3: "E" }, words: ["Instinto", "Presságio", "Impacto", "Névoa", "Sonho"], expected: "vigilance" },
  ];

  const submissions = specs.map((s) => ({
    slotCode: s.code,
    scores: calculateAffinity(s.ans, s.words).scores,
  }));

  const res = resolveBatchAssignments(submissions, mulberry32("test-ideal"));
  const assignedList = specs.map((s) => res.assignments[s.code].archetypeId);

  assert.equal(new Set(assignedList).size, 5);
  assert.equal(res.metrics.firstChoicesHit, 5);
  assert.equal(res.tieBreakAudit, null);
  specs.forEach((s) => assert.equal(res.assignments[s.code].archetypeId, s.expected));
});

test("Colisão Total (todos os 5 marcam exatamente Melee): 0 repetições + desempate d616 auditado", () => {
  const baseScores = calculateAffinity(
    { q1: "A", q2: "A", q3: "A" },
    ["Impacto", "Resistência", "Precisão", "Sonho", "Névoa"]
  ).scores;

  const submissions = ["P1", "P2", "P3", "P4", "P5"].map((slotCode) => ({
    slotCode,
    scores: { ...baseScores },
  }));

  const res = resolveBatchAssignments(submissions, mulberry32("test-collision"));
  const assignedList = Object.values(res.assignments).map((a) => a.archetypeId);

  assert.equal(assignedList.length, 5);
  assert.equal(new Set(assignedList).size, 5);
  assert.equal(res.remainingPool.length, 0);
  assert.ok(res.tieBreakAudit !== null);
  assert.ok(res.tieBreakAudit.d616Rounds.length >= 1);
});

test("Sessão parcial (3 jogadores): aloca 3 fichas únicas e mantém 2 no pool", () => {
  const submissions = [
    { slotCode: "P1", scores: calculateAffinity({ q1: "A", q2: "A", q3: "A" }, ["Impacto", "Resistência", "Névoa", "Sonho", "Instinto"]).scores },
    { slotCode: "P2", scores: calculateAffinity({ q1: "B", q2: "B", q3: "B" }, ["Precisão", "Fuga", "Névoa", "Sonho", "Instinto"]).scores },
    { slotCode: "P3", scores: calculateAffinity({ q1: "D", q2: "D", q3: "D" }, ["Sonho", "Estratégia", "Névoa", "Impacto", "Instinto"]).scores },
  ];

  const res = resolveBatchAssignments(submissions, mulberry32("test-partial"));
  const assignedSet = new Set(Object.values(res.assignments).map((a) => a.archetypeId));

  assert.equal(assignedSet.size, 3);
  assert.equal(res.remainingPool.length, 2);
});

test("Modo Instant (5 envios sequenciais): nunca repete ficha e esvazia o pool", () => {
  let pool = [...ARCHETYPE_IDS];
  const chosen = [];
  const rng = mulberry32("test-instant");

  for (let i = 1; i <= 5; i++) {
    const scores = calculateAffinity(
      { q1: "C", q2: "C", q3: "C" },
      ["Névoa", "Segredo", "Sonho", "Instinto", "Impacto"]
    ).scores;
    const out = resolveInstantAssignment({ slotCode: `P${i}`, scores }, pool, rng);
    chosen.push(out.archetypeId);
    pool = out.remainingPool;
  }

  assert.equal(new Set(chosen).size, 5);
  assert.equal(pool.length, 0);
});
