import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPublicState, renderStatusBoard, renderPlayerExportMarkdown } from "../engine/boardRenderer.js";

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
    throw new Error(`Arquivo de sessão não encontrado em ${sessionPath}. Execute primeiro o workflow awakening-init.`);
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

  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2) + "\n", "utf8");
  fs.writeFileSync(publicPath, JSON.stringify(buildPublicState(session), null, 2) + "\n", "utf8");

  const boardMd = renderStatusBoard(session);
  fs.writeFileSync(boardPath, boardMd, "utf8");

  // Gera exportações individuais em Markdown para todos os slots já revelados
  const revealedSlots = Object.values(session.slots).filter(
    (s) => s.status === "revealed" && s.assignedArchetypeId
  );
  if (revealedSlots.length > 0) {
    const exportsDir = path.join(stateDir, "exports");
    fs.mkdirSync(exportsDir, { recursive: true });
    for (const slot of revealedSlots) {
      const safeName = `${slot.slotCode}-${slot.assignedArchetypeId}.md`;
      fs.writeFileSync(path.join(exportsDir, safeName), renderPlayerExportMarkdown(slot), "utf8");
    }
  }

  // Se estiver rodando no GitHub Actions, publica o painel direto no Step Summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, boardMd + "\n", "utf8");
  }

  return { sessionPath, publicPath, boardPath, boardMd };
}
