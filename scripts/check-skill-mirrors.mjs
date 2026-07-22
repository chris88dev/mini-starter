#!/usr/bin/env node
// Controleert dat Claude en Codex exact dezelfde skills en instructies delen.
// - .agents/skills is een symlink naar ../.claude/skills
// - AGENTS.md en CLAUDE.md zijn inhoudelijk gelijk
import { lstatSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const agentsDir = resolve(root, ".agents/skills");
const claudeDir = resolve(root, ".claude/skills");

const canonicalize = (text) =>
  text
    .replaceAll("AGENTS.md", "ASSISTANT_INSTRUCTIONS.md")
    .replaceAll("CLAUDE.md", "ASSISTANT_INSTRUCTIONS.md");

const issues = [];

if (!lstatSync(agentsDir).isSymbolicLink()) {
  issues.push(".agents/skills must be a symlink to ../.claude/skills.");
} else {
  const target = readlinkSync(agentsDir);
  if (target !== "../.claude/skills") {
    issues.push(`.agents/skills points to '${target}', expected '../.claude/skills'.`);
  }
  if (realpathSync(agentsDir) !== realpathSync(claudeDir)) {
    issues.push(".agents/skills does not resolve to .claude/skills.");
  }
}

const agentsInstructions = canonicalize(readFileSync(resolve(root, "AGENTS.md"), "utf8"));
const claudeInstructions = canonicalize(readFileSync(resolve(root, "CLAUDE.md"), "utf8"));
if (agentsInstructions !== claudeInstructions) {
  issues.push("AGENTS.md and CLAUDE.md differ.");
}

if (issues.length) {
  console.error("Skill mirror check failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Shared Claude/Codex skill symlink is valid.");
