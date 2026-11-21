import { ARCHETYPES } from "../data/archetypes.js";
import { QUESTIONS, SYNC_WORDS, SCORING_RULES } from "../data/quizConfig.js";
import { buildBlindQuizForSeed, formatScore4 } from "./scoring.js";

export function buildPublicState(session) {
  const slotsByHash = {};
  const publicSlotList = [];

  for (const slot of Object.values(session.slots)) {
    const assigned = slot.assignedArchetypeId ? ARCHETYPES[slot.assignedArchetypeId] : null;
    const scoreFormatted =
      typeof slot.assignedAffinityScore === "number"
        ? formatScore4(slot.assignedAffinityScore)
        : null;
    const responseFormFile = slot.locked
      ? `state/respostas/Vaga-0${slot.slotNumber}.md`
      : null;

    const entry = {
      slotId: slot.slotId,
      slotNumber: slot.slotNumber,
      slotLabel: `Vaga #${slot.slotNumber}`,
      codeHash: slot.codeHash,
      status: slot.status,
      locked: slot.locked,
      playerName: slot.civilIdentity?.playerName || null,
      civilName: slot.civilIdentity?.civilName || null,
      submittedAt: slot.submittedAt,
      responseFormFile,
      blindQuiz: slot.locked ? null : buildBlindQuizForSeed(slot.codeHash),
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
              affinityScoreFormatted: scoreFormatted,
              wordHitsCount: slot.assignedWordHitsCount ?? 0,
              wordPositions: slot.assignedWordPositions ?? [],
              isUnexpectedAwakening: slot.isUnexpectedAwakening,
            }
          : null,
    };

    slotsByHash[slot.codeHash] = entry;
    publicSlotList.push({
      slotId: entry.slotId,
      slotNumber: entry.slotNumber,
      slotLabel: entry.slotLabel,
      status: entry.status,
      locked: entry.locked,
      playerName: entry.playerName,
      civilName: entry.civilName,
      responseFormFile,
      resultTitle: entry.result ? `${entry.result.title} (${scoreFormatted} pts)` : null,
    });
  }

  const totalSlots = publicSlotList.length;
  const submittedCount = publicSlotList.filter((s) => s.locked).length;
  const revealedCount = publicSlotList.filter((s) => s.status === "revealed").length;

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
    publicSlotList,
    slotsByHash,
  };
}

/**
 * Gera o Formulário Individual Completo de cada resposta submetida em state/respostas/Vaga-0X.md
 */
export function renderSubmissionFormMarkdown(slot) {
  const civil = slot.civilIdentity || {};
  const wordMap = new Map(SYNC_WORDS.map((w) => [w.id, w]));
  const assigned = slot.assignedArchetypeId ? ARCHETYPES[slot.assignedArchetypeId] : null;

  const lines = [
    `---`,
    `tags:`,
    `  - formulario-resposta`,
    `  - despertar-d616`,
    `vaga: Vaga #${slot.slotNumber}`,
    `status: ${slot.status}`,
    `jogador: ${civil.playerName || "—"}`,
    `nome_civil: ${civil.civilName || "—"}`,
    `enviado_em: ${slot.submittedAt || "—"}`,
    `ficha_atribuida: ${slot.assignedArchetypeId || "aguardando-convergencia"}`,
    `---`,
    ``,
    `# Formulário de Resposta — Vaga #${slot.slotNumber} (${civil.playerName || "Jogador"})`,
    ``,
    `## 1. Identidade Civil Preenchida (Fase 1)`,
    ``,
    `| Campo | Resposta do Jogador |`,
    `| :--- | :--- |`,
    `| **Nome do Jogador** | ${civil.playerName || "—"} |`,
    `| **Nome Civil do Personagem** | ${civil.civilName || "—"} |`,
    `| **Idade** | ${civil.age || "—"} |`,
    `| **Ocupação Civil** | ${civil.occupation || "—"} |`,
    `| **Aparência Visual (Pessoa Normal)** | ${civil.visualAppearance || "—"} |`,
    `| **Histórico Pré-Poderes** | ${civil.prePowerHistory || "—"} |`,
    `| **Data/Hora do Registro** | \`${slot.submittedAt || "—"}\` |`,
    ``,
    `---`,
    ``,
    `## 2. Respostas das 3 Perguntas (Múltipla Escolha Cega)`,
    ``,
  ];

  for (const q of QUESTIONS) {
    const chosenId = slot.answers?.[q.id];
    const opt = q.options.find((o) => o.id === chosenId);
    lines.push(`### ${q.id.toUpperCase()} — ${q.prompt}`);
    if (opt) {
      lines.push(`* **Alternativa Marcada:** **${opt.letter})** ${opt.text}`);
      lines.push(
        `* **Pontuação Gerada:** Primária \`${opt.primary}\` (+${q.weights.primary.toFixed(4)}) | Secundária \`${opt.secondary}\` (+${q.weights.secondary.toFixed(4)}) | Terciária \`${opt.tertiary}\` (+${q.weights.tertiary.toFixed(4)})`
      );
    } else {
      lines.push(`* *Não respondida*`);
    }
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(`## 3. Sincronização de 5 Palavras (Em Ordem de Escolha: 1ª a 5ª)`);
  lines.push(``);
  lines.push(`| Ordem | Palavra Escolhida | Ficha Associada | Peso da Posição (4 Casas) |`);
  lines.push(`| :---: | :--- | :--- | :---: |`);

  (slot.selectedWordIds || []).forEach((wId, idx) => {
    const w = wordMap.get(wId);
    const weight = SCORING_RULES.wordPositionWeights[idx] || 0;
    lines.push(
      `| **${idx + 1}ª escolha** | \`${w ? w.label : wId}\` | \`${w ? w.archetype : "—"}\` (${w ? ARCHETYPES[w.archetype].title : "—"}) | **+${weight.toFixed(4)}** |`
    );
  });

  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## 4. Ranking de Afinidade Calculado (4 Casas Decimais)`);
  lines.push(``);
  lines.push(`| Posição no Ranking Pessoal | Ficha | Pontuação Total | Palavras Acertadas | Ordem dos Acertos |`);
  lines.push(`| :---: | :--- | :---: | :---: | :---: |`);

  (slot.ranking || []).forEach((archId, idx) => {
    const arch = ARCHETYPES[archId];
    const score = formatScore4(slot.scores?.[archId] || 0);
    const hits = slot.wordHits?.[archId] || 0;
    const pos = (slot.wordPositions?.[archId] || []).map((p) => `${p}ª`).join(", ") || "—";
    const bonus = SCORING_RULES.wordCountBonuses[hits] || 0;
    const bonusNote = bonus > 0 ? ` *(inclui +${bonus.toFixed(4)} bônus)*` : "";
    lines.push(
      `| **${idx + 1}º Lugar** | **${arch.slotLabel}** | **${score} pts**${bonusNote} | ${hits} palavra(s) | ${pos} |`
    );
  });

  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## 5. Resultado Final da Convergência`);
  if (assigned) {
    lines.push(`* **Status:** **REVELADO**`);
    lines.push(`* **Ficha Recebida:** [[${assigned.slotLabel}]] — **${assigned.title}**`);
    lines.push(`* **Origem:** ${assigned.originLabel}`);
    lines.push(`* **Pontuação Final na Ficha:** **${formatScore4(slot.assignedAffinityScore || 0)} pts**`);
  } else {
    lines.push(`* **Status:** **TRAVADO / AGUARDANDO CONVERGÊNCIA DOS DEMAIS JOGADORES**`);
  }
  lines.push(``);

  return lines.join("\n");
}

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
    `* **Sistema de Pontuação:** Determinístico com **4 casas decimais** + desempate por quantidade e ordem das 5 palavras (1ª a 5ª escolha, dentre 15 palavras).`,
    `* **Privacidade:** Códigos individuais protegidos por hash SHA-256 (não listados publicamente).`,
    `* **Última atualização:** \`${session.updatedAt}\``,
    ``,
    `## Status das Vagas e Formulários de Resposta`,
    ``,
    `| Vaga | Status | Jogador | Nome Civil | Formulário da Resposta | Ficha Atribuída | Pontuação (4 casas) | Palavras da Ficha (Ordem) |`,
    `| :--- | :---: | :--- | :--- | :---: | :--- | :---: | :---: |`,
  ];

  for (const slot of slots) {
    const statusLabel =
      slot.status === "revealed"
        ? "REVELADO"
        : slot.status === "submitted"
          ? "TRAVADO / AGUARDANDO"
          : "PENDENTE";
    const playerName = slot.civilIdentity?.playerName || "—";
    const civilName = slot.civilIdentity?.civilName || "—";
    const formLink = slot.locked
      ? `[Ver Formulário](respostas/Vaga-0${slot.slotNumber}.md)`
      : "—";
    const archLabel = slot.assignedArchetypeId
      ? `\`${slot.assignedArchetypeId}\` (${ARCHETYPES[slot.assignedArchetypeId].title})`
      : "—";
    const affinity =
      typeof slot.assignedAffinityScore === "number"
        ? `**${formatScore4(slot.assignedAffinityScore)}**${slot.isUnexpectedAwakening ? " *(Inesperado)*" : ""}`
        : "—";
    const wordsDetail =
      slot.assignedArchetypeId && Array.isArray(slot.assignedWordPositions)
        ? slot.assignedWordPositions.length > 0
          ? `${slot.assignedWordPositions.length} acerto(s) (${slot.assignedWordPositions.map((p) => `${p}ª`).join(", ")})`
          : "0 acertos"
        : "—";

    lines.push(
      `| **Vaga #${slot.slotNumber}** | ${statusLabel} | ${playerName} | ${civilName} | ${formLink} | ${archLabel} | ${affinity} | ${wordsDetail} |`
    );
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

export function renderPlayerExportMarkdown(slot) {
  const arch = ARCHETYPES[slot.assignedArchetypeId];
  if (!arch) {
    throw new Error(`Vaga #${slot.slotNumber} ainda não possui ficha atribuída.`);
  }
  const civil = slot.civilIdentity || {};
  const scoreFormatted = formatScore4(slot.assignedAffinityScore || 0);
  const posList = (slot.assignedWordPositions || []).map((p) => `${p}ª`).join(", ") || "nenhuma";

  return [
    `---`,
    `tags:`,
    `  - personagem`,
    `  - jogador`,
    `  - ${arch.origin === "Mutant" ? "mutante" : "genetica-alterada"}`,
    `  - ${arch.id}`,
    `  - rank-4`,
    `vaga: Vaga #${slot.slotNumber}`,
    `jogador: ${civil.playerName || "A definir"}`,
    `nome_civil: ${civil.civilName || "A definir"}`,
    `origem: ${arch.origin}`,
    `foco: ${arch.focusAttribute}`,
    `pontuacao_afinidade: ${scoreFormatted}`,
    `rank: 4`,
    `---`,
    ``,
    `# ${civil.civilName || civil.playerName || `Vaga #${slot.slotNumber}`} — ${arch.title}`,
    ``,
    `## Identidade Civil (Fase 1)`,
    `* **Jogador:** ${civil.playerName || "—"}`,
    `* **Nome Civil:** ${civil.civilName || "—"}`,
    `* **Idade:** ${civil.age || "—"}`,
    `* **Ocupação Civil:** ${civil.occupation || "—"}`,
    `* **Aparência Visual:** ${civil.visualAppearance || "—"}`,
    `* **Histórico Pré-Poderes:** ${civil.prePowerHistory || "—"}`,
    ``,
    `## Resultado do Despertar (d616 — Pontuação 4 Casas Decimais)`,
    `* **Ficha Mecânica Base:** [[${arch.slotLabel}]]`,
    `* **Formulário de Respostas:** [[Vaga-0${slot.slotNumber}]]`,
    `* **Origem:** ${arch.originLabel}`,
    `* **Pontuação Final na Ficha:** **${scoreFormatted} pts**`,
    `* **Palavras da Ficha Acertadas:** ${slot.assignedWordHitsCount || 0} (posições: ${posList})`,
    `* **5 Palavras Escolhidas (em ordem 1ª → 5ª):** ${(slot.selectedWordLabels || []).map((w, i) => `${i + 1}ª ${w}`).join(" | ")}`,
    `* **Health:** ${arch.health} | **Focus:** ${arch.focus} | **Karma:** ${arch.karma} | **Iniciativa:** +${arch.initiative}`,
    `* **Traits Bônus:** ${arch.traits.join(", ")}`,
    `* **Power Sets:** ${arch.powerSets.join(" + ")}`,
    ``,
    `## Personalização Pendente pelo Jogador`,
    ...arch.customizableFields.map((f) => `* [ ] ${f}`),
    ``,
  ].join("\n");
}
