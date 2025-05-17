// songToHtml.js – ESM module to convert custom chord-lyric text files into styled HTML
// Author: ChatGPT 2025-05-16 (rev-4)
//
// Δ 2025-05-16-d  (minor chords on 2, 3, 6)
// ─────────────────────────────────────────────────────────────────────────────
// • Numeric scale-degree chords 2, 3, 6 are now rendered as minor ("m") relative
//   to the detected key, e.g. in C major → Dm, Em, Am.
// • formatToken() updated accordingly; chord-only lines pick up the change.
// • No other behaviour altered.
//
// Usage unchanged.

export default function songToHtml(rawText) {
  // ───────── 1. Normalise EOL & split
  const lines = rawText.replace(/\r\n?/g, "\n").split("\n");
  const firstContentIdx = lines.findIndex(l => l.trim());
  if (firstContentIdx === -1) return ""; // empty file

  const titleLine = lines[firstContentIdx];
  const keyMatch  = titleLine.match(/\[\s*([A-G][#b]?)\s*]/i);
  const songKey   = keyMatch ? keyMatch[1].toUpperCase() : "C";
  const majorScale = buildMajorScale(songKey);

  // ───────── 2. Parse progression declarations & sections
  const progressionMap = Object.create(null);
  const sections = [];
  let   currentSection = null;
  const definedSectionNames = new Set();

  for (let i = firstContentIdx + 1; i < lines.length; ++i) {
    const raw = lines[i];
    const trimmed = raw.replace(/\s+$/, "").trim();
    if (!trimmed) continue;

    const isIndented = /^\s/.test(raw);
    const colonIdx = trimmed.indexOf(":");
    const hasColon = colonIdx !== -1;
    const isHeaderWithColon = hasColon && colonIdx === trimmed.length - 1;

    // Progression declaration
    if (hasColon && !isHeaderWithColon) {
      const label = trimmed.slice(0, colonIdx).trim();
      const rest = trimmed.slice(colonIdx + 1).trim();
      progressionMap[label.toLowerCase()] = parseProgression(rest);
      continue;
    }

    // Section header with colon
    if (!isIndented && isHeaderWithColon) {
      openSection(trimmed.slice(0, -1).trim());
      continue;
    }

    // Section header without colon
    if (!isIndented && !hasColon) {
      if (definedSectionNames.has(trimmed.toLowerCase())) {
        sections.push({ ref: trimmed });
        currentSection = null;
      } else {
        openSection(trimmed);
      }
      continue;
    }

    // Lyric line inside section
    if (isIndented && currentSection) currentSection.lines.push(trimmed);
  }

  // ───────── 3. Render HTML
  const htmlParts = [
    `<article class="song">`,
    `  <h2 class="song-title">${escapeHtml(titleLine)}</h2>`
  ];

  for (const section of sections) {
    if (section.ref) {
      const src = sections.find(s => s.name && eqCi(s.name, section.ref));
      if (src?.html) htmlParts.push(src.html);
      continue;
    }

    const chords = resolveProgression(section.name, progressionMap);
    let chordIdx = 0;

    let linesHtml;
    if (section.lines.length === 0) {
      linesHtml = `    <p class="chord-line">${formatChordLine(chords)}</p>`;
    } else {
      linesHtml = section.lines.map(lyric =>
        `    <p class="lyric-line">${lyric.replace(/\^/g, () => {
          const token = chords[chordIdx % chords.length] || "";
          chordIdx += 1;
          return `<sup class="chord">${formatToken(token)}</sup>`;
        })}</p>`
      ).join("\n");
    }

    const slug = slugify(section.name);
    section.html = [
      `<section class="song-section section-${slug}">`,
      `  <h3 class="section-title">${escapeHtml(section.name)}</h3>`,
      linesHtml,
      `</section>`
    ].join("\n");

    htmlParts.push(section.html);
  }

  htmlParts.push("</article>");
  return htmlParts.join("\n");

  // ───── helpers scoped ─────────────────────────────────────────────
  function openSection(name) {
    currentSection = { name, lines: [] };
    sections.push(currentSection);
    definedSectionNames.add(name.toLowerCase());
  }

  function formatToken(tok) {
    if (/^[A-G]/i.test(tok)) return tok; // explicit chord name

    if (/^[1-7]$/.test(tok)) {
      const degree = +tok;                           // 1–7
      const letter = majorScale[(degree + 6) % 7];   // map to scale index
      return [2,3,6].includes(degree) ? `${letter}m` : letter;
    }
    return tok; // fallback (e.g. N.C.)
  }

  function formatChordLine(arr) {
    return arr.map(formatToken).map(c => `<sup class="chord">${c}</sup>`).join(" ");
  }

  function eqCi(a, b) { return a.toLowerCase() === b.toLowerCase(); }
}

// ═════════════════════════════════ utilities ══════════════════════════
function parseProgression(str) {
  const tokens = str.trim().split(/\s+/);
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].startsWith("(")) {
      let group = [];
      let tok = tokens[i].replace(/^\(/, "");
      while (!tok.endsWith(")")) {
        group.push(tok);
        tok = tokens[++i];
      }
      group.push(tok.replace(/\)$/ ,""));
      let times = 1;
      const nxt = tokens[i + 1];
      if (/^x\d+$/i.test(nxt)) { times = parseInt(nxt.slice(1), 10); i++; }
      for (let t = 0; t < times; ++t) out.push(...group);
    } else {
      out.push(tokens[i]);
    }
    i++;
  }
  return out;
}

function resolveProgression(sectionName, map) {
  if (!sectionName) return [];
  const lower = sectionName.toLowerCase();
  const first = lower.split(/\s+/)[0];
  for (const k of [lower, first, `${first}s`]) if (map[k]) return map[k];
  return [];
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildMajorScale(tonic) {
  const sharp = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const flat  = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
  const sharpKeys = ["C","G","D","A","E","B","F#","C#"];
  const useSharps = tonic.includes("#") || sharpKeys.includes(tonic);
  const names = useSharps ? sharp : flat;
  const idxMap = {C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,Fb:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11,Cb:11};
  const tonicIdx = idxMap[tonic];
  const intervals = [0,2,4,5,7,9,11];
  return intervals.map(i => names[(tonicIdx + i) % 12]);
}