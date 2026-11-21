import { ARCHETYPES } from "../data/archetypes.js";
import { buildBlindQuizForSlot } from "./scoring.js";

/**
 * Gera o espelho público seguro (state/public-state.json) para o Limbo OS ler.
 * Remove masterCode, respostas brutas e pontuações internas antes da revelação.
 */
export function buildPublicState(session) {
  const slotsPublic = {};

  for (const [code, slot] of Object.entries(session.slots)) {
    const assigned = slot.assignedArchetypeId ? ARCHETYPES[slot.assignedArchetypeId] : null;
    slotsPublic[code] = {
      slotCode: code,
      status: slot.status,
      locked: slot.locked,
      playerName: slot.civilIdentity?.playerName || null,
      civilName: slot.civilIdentity?.civilName || null,
      submittedAt: slot.submittedAt,
      blindQuiz: slot.locked ? null : buildBlindQuizForSlot(code),
      result:
        slot.status === "revealed" && assigned
          ? {
              archetypeId: assigned.id,
              slotLabel: assigned.slotLabel,
              origin: assigned.origin,
              originLabel: assigned.originLabel,
              focusAttribute: assigned.focusAttribute,
              title: assigned.title,
              rank: assigned.rank,
              health: assigned.health,
              focus: assigned.focus,
              karma: assigned.karma,
              initiative: assigned.initiative,
              healthDR: assigned.healthDR,
              damageMultiplier: assigned.damageMultiplier,
              attributes: assigned.attributes,
              traits: assigned.traits,
              originTags: assigned.originTags,
              powerSets: assigned.powerSets,
              customizableFields: assigned.customizableFields,
              obsidianFile: assigned.obsidianFile,
              affinityScore: slot.assignedAffinityScore,
              isUnexpectedAwakening: slot.isUnexpectedAwakening,
            }
          : null,
    };
  }

  const totalSlots = Object.keys(session.slots).length;
  const submittedCount = Object.values(session.slots).filter((s) => s.locked).length;
  const revealedCount = Object.values(session.slots).filter((s) => s.status === "revealed").length;

  return {
    sessionId: session.sessionId,
    campaignName: session.campaignName,
    mode: session.mode,
    version: session.version,
    converged: session.converged,
    updatedAt: session.updatedAt,
    summary: {
      totalSlots,
      submittedCount,
      pendingCount: totalSlots - submittedCount,
      revealedCount,
      remainingArchetypesCount: session.availablePool.length,
    },
    slots: slotsPublic,
  };
}

/**
 * Gera painel visual em Markdown (state/status-board.md) e para o GitHub Actions Summary.
 */
export function renderStatusBoard(session) {
  const slots = Object.values(session.slots);
  const submittedCount = slots.filter((s) => s.locked).length;
  const pendingCount = slots.length - submittedCount;

  const lines = [
    `# Painel de Controle — Despertar de Poderes (${session.campaignName})`,
    ``,
    `* **Sessão:** \`${session.sessionId}\``,
    `* **Modo:** \`${session.mode}\` | **Convergência Concluída:** \`${session.converged ? "SIM" : "NÃO"}\` | **Versão:** \`v${session.version}\``,
    `* **Progresso:** **${submittedCount}/${slots.length}** responderam (**${pendingCount}** pendentes) | **Fichas livres no pool:** ${session.availablePool.length}`,
    `* **Última atualização:** \`${session.updatedAt}\``,
    ``,
    `## Status por Código de Vaga`,
    ``,
    `| Código | Status | Jogador | Nome Civil | Ficha Atribuída | Afinidade |`,
    `| :--- | :---: | :--- | :--- | :--- | :---: |`,
  ];

  for (const slot of slots) {
    const statusLabel =
      slot.status === "revealed"
        ? "REVELADO"
        : slot.status === "submitted"
          ? "AGUARDANDO"
          : "PENDENTE";
    const playerName = slot.civilIdentity?.playerName || "—";
    const civilName = slot.civilIdentity?.civilName || "—";
    const archLabel = slot.assignedArchetypeId
      ? `\`${slot.assignedArchetypeId}\` (${ARCHETYPES[slot.assignedArchetypeId].title})`
      : "—";
    const affinity =
      typeof slot.assignedAffinityScore === "number"
        ? `${slot.assignedAffinityScore} pts${slot.isUnexpectedAwakening ? " *(Despertar Inesperado)*" : ""}`
        : "—";

    lines.push(`| \`${slot.slotCode}\` | ${statusLabel} | ${playerName} | ${civilName} | ${archLabel} | ${affinity} |`);
  }

  lines.push(``);
  lines.push(`## Fichas Restantes no Pool (Sem Repetição)`);
  if (session.availablePool.length === 0) {
    lines.push(`* Todas as fichas atribuídas (0 restantes).`);
  } else {
    for (const archId of session.availablePool) {
      lines.push(`* \`${archId}\` — ${ARCHETYPES[archId].slotLabel}`);
    }
  }

  if (session.auditLog?.length > 0) {
    lines.push(``);
    lines.push(`## Log de Auditoria (Últimos 10 Eventos)`);
    for (const entry of session.auditLog.slice(-10)) {
      lines.push(`* \`${entry.at}\` — **${entry.event}**: ${entry.detail}`);
    }
  }

  lines.push(``);
  return lines.join("\n");
}

/**
 * Gera um resumo individual em Markdown pronto para colar no Obsidian após revelação.
 */
export function renderPlayerExportMarkdown(slot) {
  const arch = ARCHETYPES[slot.assignedArchetypeId];
  if (!arch) {
    throw new Error(`Slot ${slot.slotCode} ainda não possui ficha atribuída.`);
  }
  const civil = slot.civilIdentity || {};

  return [
    `---`,
    `tags:`,
    `  - personagem`,
    `  - jogador`,
    `  - ${arch.origin === "Mutant" ? "mutante" : "genetica-alterada"}`,
    `  - ${arch.id}`,
    `  - rank-4`,
    `slot_code: ${slot.slotCode}`,
    `jogador: ${civil.playerName || "A definir"}`,
    `nome_civil: ${civil.civilName || "A definir"}`,
    `origem: ${arch.origin}`,
    `foco: ${arch.focusAttribute}`,
    `rank: 4`,
    `---`,
    ``,
    `# ${civil.civilName || civil.playerName || slot.slotCode} — ${arch.title}`,
    ``,
    `## Identidade Civil (Fase 1)`,
    `* **Jogador:** ${civil.playerName || "—"}`,
    `* **Nome Civil:** ${civil.civilName || "—"}`,
    `* **Idade:** ${civil.age || "—"}`,
    `* **Ocupação Civil:** ${civil.occupation || "—"}`,
    `* **Aparência Visual:** ${civil.visualAppearance || "—"}`,
    `* **Histórico Pré-Poderes:** ${civil.prePowerHistory || "—"}`,
    ``,
    `## Resultado do Despertar (d616)`,
    `* **Ficha Mecânica Base:** [[${arch.slotLabel}]]`,
    `* **Origem:** ${arch.originLabel}`,
    `* **Afinidade Calculada:** ${slot.assignedAffinityScore} pts${slot.isUnexpectedAwakening ? " *(Despertar Inesperado)*" : ""}`,
    `* **Palavras Sincronizadas:** ${(slot.selectedWordLabels || []).join(", ")}`,
    `* **Health:** ${arch.health} | **Focus:** ${arch.focus} | **Karma:** ${arch.karma} | **Iniciativa:** +${arch.initiative}`,
    `* **Traits Bônus:** ${arch.traits.join(", ")}`,
    `* **Power Sets:** ${arch.powerSets.join(" + ")}`,
    ``,
    `## Personalização Pendente pelo Jogador`,
    ...arch.customizableFields.map((f) => `* [ ] ${f}`),
    ``,
  ].join("\n");
}
