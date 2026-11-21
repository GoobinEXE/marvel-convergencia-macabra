export function rollMarvelDie(rng = Math.random) {
  const face = Math.floor(rng() * 6) + 1;
  return {
    face,
    value: face === 1 ? 6 : face,
    isFantastic: face === 1,
  };
}

/**
 * Desempate oficial pelo Dado Marvel (d616):
 * 1 (Fantástico) > 6 > 5 > 4 > 3 > 2.
 */
export function breakTieWithMarvelDie(candidateIds, rng = Math.random) {
  if (!candidateIds || candidateIds.length === 0) {
    throw new Error("Lista de candidatos vazia para desempate d616.");
  }
  let pool = [...candidateIds];
  const rounds = [];

  while (pool.length > 1) {
    const rolls = pool.map((id) => ({ id, ...rollMarvelDie(rng) }));
    rounds.push(rolls);

    const hasFantastic = rolls.some((r) => r.isFantastic);
    if (hasFantastic) {
      pool = rolls.filter((r) => r.isFantastic).map((r) => r.id);
    } else {
      const maxVal = Math.max(...rolls.map((r) => r.value));
      pool = rolls.filter((r) => r.value === maxVal).map((r) => r.id);
    }
  }

  return { winnerId: pool[0], rounds };
}
