// SongToHtml.js – ESM module to convert chord‑lyric source into HTML with section arrangements.
// Author: ChatGPT 2025‑05‑18 (rev‑17)
//
// rev‑17 (simplification & accuracy)
//   • **Caret is now *always* a chord placeholder.** We removed the rev‑16
//     “explicit inline chord” feature because your format never embeds
//     chords like “^Am”. Every “^” simply pulls the *next* chord from the
//     section progression.
//   • Rendering logic rewritten: each caret injects `<sup class="chord">…` and
//     is discarded; the following lyric word remains untouched.
//   • Internal helper `renderLyricLine()` is smaller and more robust.
//   • No other behaviour changed – duplicate sections inside an Arrangement
//     are still honoured, so if you repeat “Chorus 1” twice it’s rendered
//     twice.
//
// Usage (unchanged):
//   const { html, arrangements } = songToHtml(src, "Studio");
// ————————————————————————————————————————————————————————————————————————

export default function songToHtml(src, arrangementName = null) {
  const { sections, arrangementsMap, chordMap } = parseSong(src);

  const arrangementKeys = Object.keys(arrangementsMap);
  const selectedName = arrangementName && arrangementsMap[arrangementName]
    ? arrangementName
    : arrangementKeys[0] || null;

  const order = selectedName
    ? arrangementsMap[selectedName]
    : Object.keys(sections);

  const htmlParts = order.flatMap(name => renderSection(name, sections[name] || [], chordMap));
  const html = htmlParts.join("\n");

  return { html, arrangements: arrangementKeys };
}

// ————————————————————————————————————————————————————————————————————————
// Parsing helpers (unchanged)

function parseSong(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");

  const chordMap = Object.create(null);   // base‑section‑name ➜ [chords]
  const sections = Object.create(null);   // "Verse 1" ➜ [lyric lines]
  const arrangementsMap = Object.create(null); // name ➜ [ordered section names]

  let mode = "meta";
  let currentSection = null;
  let currentArrangement = null;

  for (let rawLine of lines) {
    const line = rawLine.replace(/\t/g, "  ");

    // ===== mode switches =====
    if (/^\s*Sections:/i.test(line)) {
      mode = "sections";
      currentSection = null;
      currentArrangement = null;
      continue;
    }
    if (/^\s*Arrangements:/i.test(line)) {
      mode = "arrangements";
      currentSection = null;
      currentArrangement = null;
      continue;
    }

    // ===== chord meta (before Sections:) =====
    if (mode === "meta") {
      const m = line.match(/^\s*([a-z0-9_ ]+):\s*(.+)$/i);
      if (m) {
        const base = m[1].trim().toLowerCase();
        chordMap[base] = parseChordProgression(m[2].trim());
      }
      continue;
    }

    // ===== Sections block =====
    if (mode === "sections") {
      const header = line.match(/^\s{2,}([^:]+):\s*$/); // e.g. "  Verse 1:"
      if (header) {
        currentSection = header[1].trim();
        sections[currentSection] = [];
        continue;
      }
      if (currentSection) {
        const contentLine = line.replace(/^\s{4}/, "");
        if (contentLine.trim() !== "") sections[currentSection].push(contentLine);
      }
      continue;
    }

    // ===== Arrangements block =====
    if (mode === "arrangements") {
      const header = line.match(/^\s{2,}([^:]+):\s*(.*)$/); // "  Live:" etc.
      if (header) {
        currentArrangement = header[1].trim();
        const rest = header[2].trim();
        arrangementsMap[currentArrangement] = rest
          ? rest.split(/,\s*/).filter(Boolean)
          : [];
        continue;
      }
      if (currentArrangement && /^\s{4,}\S/.test(line)) {
        arrangementsMap[currentArrangement].push(line.trim());
      }
    }
  }

  // Default arrangement body = all sections (if none supplied)
  for (const name in arrangementsMap) {
    if (arrangementsMap[name].length === 0) arrangementsMap[name] = Object.keys(sections);
  }

  return { sections, arrangementsMap, chordMap };
}

// ————————————————————————————————————————————————————————————————————————
// Rendering helpers

function renderSection(name, lines, chordMap) {
  const base = deriveBaseName(name);
  const chords = (chordMap[base] || []).slice(); // work on a copy

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const bodyLines = lines.length
    ? lines.map(line => renderLyricLine(line, chords))
    : chords.length
      ? [`  <p class="chord-line">${chords.map(c => `<span class="chord">${escapeHtml(c)}</span>`).join(" ")}</p>`]
      : [];

  return [
    `<section class="song-section section-${slug}">`,
    `  <h3 class="section-title">${escapeHtml(name)}</h3>`,
    ...bodyLines,
    `</section>`
  ];
}

function renderLyricLine(line, chordPool) {
  let out = "  <p class=\"lyric-line\">";
  let i = 0;
  while (i < line.length) {
    if (line[i] === "^") {
      const chord = chordPool.shift() || "";
      if (chord) out += `<sup class=\"chord\">${escapeHtml(chord)}</sup>`;
      i++; // skip caret
      continue;
    }
    // Append regular characters until next caret or end
    const nextCaret = line.indexOf("^", i);
    const end = nextCaret === -1 ? line.length : nextCaret;
    out += escapeHtml(line.slice(i, end));
    i = end;
  }
  return out + "</p>";
}

function deriveBaseName(sectionName) {
  return sectionName.toLowerCase().replace(/\s*\d+$/, "").trim();
}

// ————————————————————————————————————————————————————————————————————————
// Chord progression parsing (unchanged)

function parseChordProgression(str) {
  if (!str) return [];

  // Expand patterns like "(C F) x2"
  let expanded = str;
  const parenRepeatRe = /\(([^)]+)\)\s*x(\d+)/i;
  while (parenRepeatRe.test(expanded)) {
    expanded = expanded.replace(parenRepeatRe, (_, seq, n) => {
      return Array(Number(n)).fill(seq.trim()).join(" ");
    });
  }

  return expanded
    .split(/\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

// ————————————————————————————————————————————————————————————————————————
// Util

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, ch => map[ch]);
}
