#!/usr/bin/env node
// Leest een Lighthouse- of PageSpeed Insights-resultaat (JSON) en print een
// nette samenvatting in gewone taal, met een oordeel per meetwaarde.
//
// Gebruik:
//   node scripts/parse-lighthouse.mjs <json-bestand> [--label "mobiel"]
//
// Accepteert twee vormen:
//   - een ruw Lighthouse-resultaat:   { categories, audits, ... }
//   - een PSI-antwoord dat het inpakt: { lighthouseResult: { categories, audits, ... } }
import { readFileSync } from "node:fs";

// --- Argumenten uitlezen -----------------------------------------------------

const args = process.argv.slice(2);
let file = null;
let label = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--label") {
    label = args[++i] ?? null;
  } else if (arg.startsWith("--label=")) {
    label = arg.slice("--label=".length);
  } else if (!file) {
    file = arg;
  }
}

// Duidelijke Nederlandse foutmelding en stoppen met een niet-nul exitcode.
function faal(bericht) {
  console.error(`Fout: ${bericht}`);
  process.exit(1);
}

if (!file) {
  faal(
    'geef een JSON-bestand op. Gebruik: node scripts/parse-lighthouse.mjs <json-bestand> [--label "mobiel"]',
  );
}

// --- JSON inlezen ------------------------------------------------------------

let raw;
try {
  raw = readFileSync(file, "utf8");
} catch {
  faal(`kan het bestand '${file}' niet lezen. Bestaat het en klopt het pad?`);
}

let data;
try {
  data = JSON.parse(raw);
} catch {
  faal(`het bestand '${file}' bevat geen geldige JSON.`);
}

// PSI pakt het echte Lighthouse-resultaat in onder 'lighthouseResult'.
const lhr = data?.lighthouseResult ?? data;

const categories = lhr?.categories;
const audits = lhr?.audits;

if (!categories?.performance) {
  faal(
    "geen performance-categorie gevonden in de JSON. Is dit wel een Lighthouse- of PageSpeed-resultaat?",
  );
}

// --- Hulpfuncties voor oordeel ----------------------------------------------

const KLEUR = {
  goed: "goed",
  matig: "matig",
  slecht: "slecht",
  onbekend: "onbekend",
};

// Bepaalt op basis van drempelwaarden of een waarde goed/matig/slecht is.
// good: waarde <= grens.goed  →  goed
// nsi:  waarde <= grens.matig →  matig
// anders                      →  slecht
function oordeelLager(numeriek, grens) {
  if (numeriek == null || Number.isNaN(numeriek)) return KLEUR.onbekend;
  if (numeriek <= grens.goed) return KLEUR.goed;
  if (numeriek <= grens.matig) return KLEUR.matig;
  return KLEUR.slecht;
}

// Voor de performance-score geldt: hoger is beter.
function oordeelHoger(numeriek, grens) {
  if (numeriek == null || Number.isNaN(numeriek)) return KLEUR.onbekend;
  if (numeriek >= grens.goed) return KLEUR.goed;
  if (numeriek >= grens.matig) return KLEUR.matig;
  return KLEUR.slecht;
}

// Toont bij voorkeur displayValue, valt anders terug op numericValue.
function toonWaarde(audit) {
  if (!audit) return "onbekend";
  if (audit.displayValue) return audit.displayValue;
  if (typeof audit.numericValue === "number") {
    return String(Math.round(audit.numericValue));
  }
  return "onbekend";
}

// Standaard Core Web Vitals-drempels (numericValue is in milliseconden).
const DREMPELS = {
  lcp: { goed: 2500, matig: 4000 }, // ms
  cls: { goed: 0.1, matig: 0.25 }, // eenheidsloos
  tbt: { goed: 200, matig: 600 }, // ms
  fcp: { goed: 1800, matig: 3000 }, // ms
  si: { goed: 3400, matig: 5800 }, // ms
  inp: { goed: 200, matig: 500 }, // ms
  score: { goed: 90, matig: 50 }, // 0-100
};

// --- Meetwaarden verzamelen --------------------------------------------------

const scoreRuw = categories.performance.score;
const score = scoreRuw == null ? null : Math.round(scoreRuw * 100);

const rijen = [];

// Performance-score bovenaan.
rijen.push({
  naam: "Performance-score",
  waarde: score == null ? "onbekend" : `${score} / 100`,
  oordeel: oordeelHoger(score, DREMPELS.score),
});

// Definitie van de audits die we tonen, met hun drempels.
const metrieken = [
  { id: "largest-contentful-paint", naam: "LCP (grootste element)", grens: DREMPELS.lcp },
  { id: "cumulative-layout-shift", naam: "CLS (verschuiving)", grens: DREMPELS.cls },
  { id: "total-blocking-time", naam: "TBT (blokkeringstijd)", grens: DREMPELS.tbt },
  { id: "first-contentful-paint", naam: "FCP (eerste inhoud)", grens: DREMPELS.fcp },
  { id: "speed-index", naam: "Speed Index", grens: DREMPELS.si },
];

for (const m of metrieken) {
  const audit = audits?.[m.id];
  const numeriek = audit?.numericValue;
  rijen.push({
    naam: m.naam,
    waarde: toonWaarde(audit),
    oordeel: oordeelLager(numeriek, m.grens),
  });
}

// INP alleen tonen als het aanwezig is.
const inpAudit = audits?.["interaction-to-next-paint"];
if (inpAudit) {
  rijen.push({
    naam: "INP (reactiesnelheid)",
    waarde: toonWaarde(inpAudit),
    oordeel: oordeelLager(inpAudit.numericValue, DREMPELS.inp),
  });
}

// --- Uitprinten --------------------------------------------------------------

const kop = label ? `Speedtest — ${label}` : "Speedtest";
console.log("");
console.log(kop);
console.log("=".repeat(kop.length));

// Nette uitlijning: bepaal de breedste naam.
const naamBreedte = Math.max(...rijen.map((r) => r.naam.length));

for (const r of rijen) {
  const naam = r.naam.padEnd(naamBreedte, " ");
  console.log(`${naam}  ${r.waarde}   [${r.oordeel}]`);
}

console.log("");
