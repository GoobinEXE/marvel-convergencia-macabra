import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPublicState,
  renderStatusBoard,
  renderPlayerExportMarkdown,
  renderSubmissionFormMarkdown,
} from "../engine/boardRenderer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_STATE_DIR = path.resolve(__dirname, "../../state");

export function resolveStateDir() {
  return process.env.AWAKENING_STATE_DIR
    ? path.resolve(process.env.AWAKENING_STATE_DIR)
    : DEFAULT_STATE_DIR;
}

export function loadSession(stateDir = resolveStateDir()) {
  const sessionPath = path.join(stateDir, "session.json");
  if (!fs.existsSync(sessionPath)) {
    throw new Error(`Arquivo de sessão não encontrado em ${sessionPath}. Execute primeiro o init-session.`);
  }
  return JSON.parse(fs.readFileSync(sessionPath, "utf8"));
}

export function saveSessionAndViews(session, stateDir = resolveStateDir()) {
  fs.mkdirSync(stateDir, { recursive: true });

  session.version = (session.version || 0) + 1;
  session.updatedAt = new Date().toISOString();

  const sessionPath = path.join(stateDir, "session.json");
  const publicPath = path.join(stateDir, "public-state.json");
  const boardPath = path.join(stateDir, "status-board.md");
  const docsDir = path.resolve(stateDir, "../docs");
  const respostasDir = path.join(stateDir, "respostas");
  const exportsDir = path.join(stateDir, "exports");

  const publicJson = JSON.stringify(buildPublicState(session), null, 2) + "\n";
  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2) + "\n", "utf8");
  fs.writeFileSync(publicPath, publicJson, "utf8");

  if (fs.existsSync(docsDir)) {
    fs.writeFileSync(path.join(docsDir, "public-state.json"), publicJson, "utf8");
  }

  const boardMd = renderStatusBoard(session);
  fs.writeFileSync(boardPath, boardMd, "utf8");

  // Gera um formulário individual (.md) em state/respostas/ para cada resposta enviada
  const lockedSlots = Object.values(session.slots).filter((s) => s.locked);
  fs.mkdirSync(respostasDir, { recursive: true });
  if (lockedSlots.length === 0) {
    for (const f of fs.readdirSync(respostasDir)) {
      if (f.endsWith(".md")) fs.unlinkSync(path.join(respostasDir, f));
    }
    fs.writeFileSync(
      path.join(respostasDir, "README.md"),
      "# Formulários de Respostas dos Jogadores\n\nNenhuma resposta enviada nesta rodada ainda. Assim que um jogador enviar o formulário, o arquivo `Vaga-0X.md` aparecerá aqui.\n",
      "utf8"
    );
  } else {
    for (const slot of lockedSlots) {
      const formName = `Vaga-0${slot.slotNumber}.md`;
      fs.writeFileSync(
        path.join(respostasDir, formName),
        renderSubmissionFormMarkdown(slot),
        "utf8"
      );
    }
  }

  // Gera exportações de fichas reveladas em state/exports/
  const revealedSlots = Object.values(session.slots).filter(
    (s) => s.status === "revealed" && s.assignedArchetypeId
  );
  if (revealedSlots.length > 0) {
    fs.mkdirSync(exportsDir, { recursive: true });
    for (const slot of revealedSlots) {
      const safeName = `vaga-${slot.slotNumber}-${slot.assignedArchetypeId}.md`;
      fs.writeFileSync(path.join(exportsDir, safeName), renderPlayerExportMarkdown(slot), "utf8");
    }
  } else if (fs.existsSync(exportsDir)) {
    fs.rmSync(exportsDir, { recursive: true, force: true });
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, boardMd + "\n", "utf8");
  }

  return { sessionPath, publicPath, boardPath, boardMd };
}
