#!/usr/bin/env node
// Bereidt echte site-afbeeldingen voor: center-crop op aspect-ratio, resizen
// en/of omzetten naar webp/jpg/png. Gebruikt de macOS-ingebouwde `sips` en de
// `cwebp`-binary (voor webp). Geen npm-dependencies.
//
// Belangrijk: het invoerbestand wordt NOOIT gewijzigd. Er wordt altijd op een
// tijdelijke kopie gewerkt en een NIEUW uitvoerbestand geschreven.
//
// Gebruik:
//   node scripts/crop-image.mjs <input> [--aspect W:H] [--width N] [--height N] [--out PATH] [--format webp|jpg|png]

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";

const USAGE =
  "Gebruik: node scripts/crop-image.mjs <input> [--aspect W:H] [--width N] [--height N] [--out PATH] [--format webp|jpg|png]";

// --- Kleine helpers -------------------------------------------------------

function fail(message) {
  console.error(message);
  console.error(USAGE);
  process.exit(1);
}

// Positief geheel getal parsen (voor --width, --height en aspect-delen).
function parsePositiveInt(value, label) {
  if (!/^\d+$/.test(value)) fail(`Ongeldige ${label}: "${value}" (verwacht een positief geheel getal).`);
  const n = Number.parseInt(value, 10);
  if (n <= 0) fail(`Ongeldige ${label}: "${value}" (moet groter dan 0 zijn).`);
  return n;
}

// sips draaien en de stdout teruggeven.
function sips(args) {
  return execFileSync("sips", args, { encoding: "utf8" });
}

// Pixel-afmetingen van een bestand lezen via sips.
function readDimensions(file) {
  const out = sips(["-g", "pixelWidth", "-g", "pixelHeight", file]);
  const width = out.match(/pixelWidth:\s*(\d+)/);
  const height = out.match(/pixelHeight:\s*(\d+)/);
  if (!width || !height) fail(`Kon de afmetingen van "${file}" niet lezen.`);
  return { width: Number(width[1]), height: Number(height[1]) };
}

// Bytes leesbaar maken.
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// --- Batch-modus (--all): alle PNG/JPG in een map naar webp -----------------

// Recursief PNG/JPG(JPEG) verzamelen. webp/avif/svg/gif slaan we over.
function findRasterImages(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRasterImages(full));
    } else if (entry.isFile()) {
      const ext = extname(entry.name).slice(1).toLowerCase();
      if (ext === "png" || ext === "jpg" || ext === "jpeg") results.push(full);
    }
  }
  return results;
}

// Alle PNG/JPG in `dir` naar webp zetten, naast het origineel. Originelen
// blijven staan; een bestaande .webp wordt niet overschreven.
function convertAllToWebp(dir) {
  const root = resolve(dir);
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    fail(`Map bestaat niet of is geen map: ${root}`);
  }
  const images = findRasterImages(root);
  if (images.length === 0) {
    console.log(`Geen PNG/JPG-afbeeldingen gevonden in ${root}.`);
    return;
  }

  let converted = 0;
  let skipped = 0;
  let beforeTotal = 0;
  let afterTotal = 0;

  for (const src of images) {
    const out = `${src.slice(0, -extname(src).length)}.webp`;
    if (existsSync(out)) {
      console.log(`Overslaan (webp bestaat al): ${out}`);
      skipped++;
      continue;
    }
    // sips-webp is onbetrouwbaar; gebruik cwebp, net als in de enkel-modus.
    execFileSync("cwebp", ["-quiet", "-q", "90", src, "-o", out]);
    const before = statSync(src).size;
    const after = statSync(out).size;
    beforeTotal += before;
    afterTotal += after;
    converted++;
    const pct = before > 0 ? Math.round((1 - after / before) * 100) : 0;
    console.log(
      `${src} -> ${out}  ${formatBytes(before)} -> ${formatBytes(after)} (${pct}% kleiner)`,
    );
  }

  const totalPct =
    beforeTotal > 0 ? Math.round((1 - afterTotal / beforeTotal) * 100) : 0;
  console.log("");
  console.log(
    `Klaar: ${converted} geconverteerd, ${skipped} overgeslagen. ` +
      `Totaal ${formatBytes(beforeTotal)} -> ${formatBytes(afterTotal)} (${totalPct}% kleiner).`,
  );
  if (converted > 0) {
    console.log(
      "Originelen blijven staan. Wijs je <img>/next/image naar de .webp-bestanden en verwijder daarna eventueel de originelen.",
    );
  }
}

// --- Argumenten parsen ----------------------------------------------------

const argv = process.argv.slice(2);
if (argv.length === 0) fail("Geen invoerbestand opgegeven.");

// Batch-modus: `--all [map]` zet alle PNG/JPG in de map (standaard public/)
// om naar webp. Geen crop/resize — pure formaatconversie.
if (argv.includes("--all")) {
  const rest = argv.filter((a) => a !== "--all");
  if (rest.length > 1) {
    fail(`Onverwachte extra argumenten bij --all: ${rest.slice(1).join(" ")}`);
  }
  convertAllToWebp(rest[0] ?? "public");
  process.exit(0);
}

let input;
const opts = { aspect: null, width: null, height: null, out: null, format: null };

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  const next = () => {
    const v = argv[++i];
    if (v === undefined) fail(`Ontbrekende waarde voor ${arg}.`);
    return v;
  };
  switch (arg) {
    case "--aspect": opts.aspect = next(); break;
    case "--width": opts.width = parsePositiveInt(next(), "--width"); break;
    case "--height": opts.height = parsePositiveInt(next(), "--height"); break;
    case "--out": opts.out = next(); break;
    case "--format": opts.format = next().toLowerCase(); break;
    default:
      if (arg.startsWith("--")) fail(`Onbekende optie: ${arg}.`);
      if (input !== undefined) fail(`Onverwacht extra argument: ${arg}.`);
      input = arg;
  }
}

// --- Validatie ------------------------------------------------------------

if (!input) fail("Geen invoerbestand opgegeven.");
input = resolve(input);
if (!existsSync(input)) fail(`Invoerbestand bestaat niet: ${input}`);
if (!statSync(input).isFile()) fail(`Invoer is geen bestand: ${input}`);

let aspectW = null;
let aspectH = null;
if (opts.aspect !== null) {
  const m = opts.aspect.match(/^(\d+):(\d+)$/);
  if (!m) fail(`Ongeldige --aspect: "${opts.aspect}" (verwacht formaat W:H, bijv. 16:9).`);
  aspectW = parsePositiveInt(m[1], "aspect-breedte");
  aspectH = parsePositiveInt(m[2], "aspect-hoogte");
}

const allowedFormats = { webp: "webp", jpg: "jpg", jpeg: "jpg", png: "png" };
if (opts.format !== null && !(opts.format in allowedFormats)) {
  fail(`Ongeldig --format: "${opts.format}" (kies webp, jpg of png).`);
}

// --- Uitvoer-formaat en -extensie bepalen ---------------------------------

const inputExt = extname(input).slice(1).toLowerCase();
// Doelextensie bepalen, in volgorde van prioriteit:
//   1. expliciete --format
//   2. de extensie van een expliciet --out pad
//   3. de extensie van de invoer behouden
let outExt;
if (opts.format) {
  outExt = allowedFormats[opts.format];
} else if (opts.out) {
  const e = extname(opts.out).slice(1).toLowerCase();
  outExt = allowedFormats[e] ?? e ?? inputExt ?? "png";
} else {
  outExt = inputExt || "png";
}

// --- Werkkopie maken (invoer blijft ongemoeid) ----------------------------

const workDir = mkdtempSync(join(tmpdir(), "crop-image-"));
const workFile = join(workDir, `work.${inputExt || "png"}`);

try {
  copyFileSync(input, workFile);

  const src = readDimensions(input);

  // Stap 1: center-crop naar de gevraagde aspect-ratio (grootste gecentreerde
  // rechthoek). sips -c neemt HOOGTE dan BREEDTE en crop't gecentreerd.
  if (aspectW !== null) {
    let cropW;
    let cropH;
    // Bron breder dan doel-aspect -> hoogte is beperkend, anders breedte.
    if (src.width * aspectH > src.height * aspectW) {
      cropH = src.height;
      cropW = Math.round((src.height * aspectW) / aspectH);
    } else {
      cropW = src.width;
      cropH = Math.round((src.width * aspectH) / aspectW);
    }
    sips(["-c", String(cropH), String(cropW), workFile]);
  }

  // Stap 2: resizen.
  // - alleen --width  -> breedte vast, aspect behouden (--resampleWidth)
  // - alleen --height -> hoogte vast, aspect behouden (--resampleHeight)
  // - beide           -> exacte afmetingen forceren (sips -z), kan vervormen.
  //   (Keuze: exact WxH i.p.v. inpassen, zodat een gevraagde maat gegarandeerd
  //   klopt. In combinatie met --aspect klopt de ratio toch al.)
  if (opts.width !== null && opts.height !== null) {
    sips(["-z", String(opts.height), String(opts.width), workFile]);
  } else if (opts.width !== null) {
    sips(["--resampleWidth", String(opts.width), workFile]);
  } else if (opts.height !== null) {
    sips(["--resampleHeight", String(opts.height), workFile]);
  }

  const final = readDimensions(workFile);

  // --- Uitvoerpad bepalen -------------------------------------------------

  let outPath;
  if (opts.out) {
    outPath = resolve(opts.out);
  } else {
    const base = basename(input, extname(input));
    // Label: bij een resize de echte pixelmaat, bij alleen --aspect het
    // aspect-label (bijv. 16x9), anders de echte maat van de conversie.
    let label;
    if (opts.width !== null || opts.height !== null) {
      label = `${final.width}x${final.height}`;
    } else if (aspectW !== null) {
      label = `${aspectW}x${aspectH}`;
    } else {
      label = `${final.width}x${final.height}`;
    }
    outPath = resolve("public", `${base}-${label}.${outExt}`);
  }

  mkdirSync(dirname(outPath), { recursive: true });

  // --- Formaat wegschrijven ----------------------------------------------

  if (outExt === "webp") {
    // sips-webp is onbetrouwbaar; gebruik cwebp voor de conversie.
    execFileSync("cwebp", ["-quiet", "-q", "90", workFile, "-o", outPath]);
  } else {
    const sipsFormat = outExt === "jpg" ? "jpeg" : outExt; // png of jpeg
    sips(["-s", "format", sipsFormat, workFile, "--out", outPath]);
  }

  // --- Samenvatting -------------------------------------------------------

  const size = formatBytes(statSync(outPath).size);
  console.log(
    `Klaar: ${outPath} — ${final.width}x${final.height} ${outExt} (${size})`,
  );
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
