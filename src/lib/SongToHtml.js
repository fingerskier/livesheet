// songToHtml.js – ESM module to convert custom chord-lyric text files into styled HTML
// Author: ChatGPT 2025-05-16 (updated)
//
// Features
// ─────────────────────────────────────────────────────────────────────────────
// • Detects song key from the title line e.g. "He Reigns [C]" and converts
//   numeric scale-degree chords (1-7) to the proper letter chords for that key
// • Supports chord-progression declarations with optional repetition syntax
//     verses: (4 1 5) x3   →   4-1-5 4-1-5 4-1-5
// • Handles section blocks and section repeats (an un-indented line without
//   a trailing colon repeats a previously rendered section)
// • Replaces every caret (^) in the lyric text with <sup class="chord">…</sup>
// • Emits semantic, class-annotated HTML – ready for theming with CSS
//
// Import & usage example:
//   import songToHtml from "./songToHtml.js";
//   import rawSong     from "./He Reigns.nn.txt?raw";
//   const html = songToHtml(rawSong);
//   document.getElementById("viewer").innerHTML = html;

export default function songToHtml(rawText) {
  // Normalise line endings → «\n» and split into lines
  const lines = rawText.replace(/\r\n?/g, "\n").split("\n");

  // ────────────── 1.  Extract global meta (title + key) ──────────────
  const titleLine = lines.find(l => l.trim());              // first non-blank
  const keyMatch  = titleLine?.match(/\[\s*([A-G][#b]?)\s*]/i);
  const songKey   = keyMatch ? keyMatch[1].toUpperCase() : "C"; // default C
  const majorScale = buildMajorScale(songKey);

  // ────────────── 2.  Parse progression declarations & sections ──────
  const progressionMap = Object.create(null);  // label → chordToken[]
  const sections       = [];                   // ordered section list
  let   currentSection = null;                 // active section obj

  for (const raw of lines) {
    const line       = raw.replace(/\s+$/, "");     // rtrim
    const trimmed    = line.trim();
    if (!trimmed) continue;                           // skip blank lines

    const colonIdx   = trimmed.indexOf(":");
    const isSectionHeader = colonIdx === trimmed.length - 1; // «Verse 1:»
    const hasColon        = colonIdx !== -1;
    const isIndented      = /^\s/.test(raw);

    // 2.a  Progression declaration (e.g. " verses: (4 1 5) x3")
    if (hasColon && !isSectionHeader) {
      const label = trimmed.slice(0, colonIdx).trim();
      const rest  = trimmed.slice(colonIdx + 1).trim();
      progressionMap[label.toLowerCase()] = parseProgression(rest);
      continue;
    }

    // 2.b  Section start (e.g. "Verse 1:")
    if (isSectionHeader) {
      currentSection = { name: trimmed.slice(0, -1).trim(), lines: [] };
      sections.push(currentSection);
      continue;
    }

    // 2.c  Section repeat cue (un-indented, no colon) ⇒ reuse by ref
    if (!isIndented) {
      sections.push({ ref: trimmed });
      currentSection = null;
      continue;
    }

    // 2.d  Lyric line within a section (indented)
    if (currentSection) {
      currentSection.lines.push(trimmed); // remove outer indentation only
    }
  }

  // ────────────── 3.  Render HTML ─────────────────────────────────────
  const htmlParts = [
    `<article class=\"song\">`,
    `  <h2 class=\"song-title\">${escapeHtml(titleLine)}</h2>`
  ];

  for (const section of sections) {
    // 3.a  Section repeat – inject cached HTML of original section
    if (section.ref) {
      const source = sections.find(
        s => s.name && s.name.toLowerCase().startsWith(section.ref.toLowerCase())
      );
      if (source?.html) htmlParts.push(source.html);
      continue;
    }

    // 3.b  Resolve chord progression for this section
    const chords = resolveProgression(section.name, progressionMap);
    let chordIdx = 0;

    const linesHtml = section.lines.map(lyric =>
      `    <p class=\"lyric-line\">${replaceCaretsWithChords(lyric)}</p>`
    ).join("\n");

    const sectionSlug = slugify(section.name);
    const secHtml     = [
      `<section class=\"song-section section-${sectionSlug}\">`,
      `  <h3 class=\"section-title\">${escapeHtml(section.name)}</h3>`,
      linesHtml,
      `</section>`
    ].join("\n");

    section.html = secHtml; // cache for repeats
    htmlParts.push(secHtml);

    // ───── helper: caret substitution scoped to this section's progression
    function replaceCaretsWithChords(text) {
      return text.replace(/\^/g, () => {
        const token = chords[chordIdx % chords.length] || "";
        chordIdx += 1;
        return `<sup class=\"chord\">${formatChordToken(token)}</sup>`;
      });
    }

    function formatChordToken(tok) {
      if (/^[A-G]/i.test(tok)) return tok;          // already a chord letter
      if (/^\d$/.test(tok))   return majorScale[(+tok + 6) % 7]; // 1-7 → 0-6
      return tok; // fallback – leave untouched (e.g. «N.C.»)
    }
  }

  htmlParts.push("</article>");
  return htmlParts.join("\n");

  // ────────────── helpers local to songToHtml ────────────────────────
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$|(?<=-)$/g, "");
  }
}

// ══════════════════════════════════════════════════════════════════════
// Stand-alone utility functions (non-exported)
// ══════════════════════════════════════════════════════════════════════

function parseProgression(str) {
  str = str.trim();
  // Handle "( … ) xN" – one level nesting
  const groupMatch = str.match(/\(([^)]+)\)\s*x(\d+)/i);
  if (groupMatch) {
    const group = groupMatch[1].trim().split(/\s+/);
    const times = parseInt(groupMatch[2], 10) || 1;
    return Array(times).fill(group).flat();
  }
  return str.split(/\s+/);
}

function resolveProgression(sectionName, map) {
  if (!sectionName) return [];
  const lower = sectionName.toLowerCase();
  const first = lower.split(/\s+/)[0];
  const keys  = [lower, first, `${first}s`]; // e.g. "verse 1" → verse(s)
  for (const k of keys) if (map[k]) return map[k];
  return [];
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Build a major scale (array of 7 note names) given a tonic like "C", "F#", "Bb"
function buildMajorScale(tonic) {
  const sharpNames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const flatNames  = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

  const sharpKeys = ["C","G","D","A","E","B","F#","C#"];
  const flatKeys  = ["F","Bb","Eb","Ab","Db","Gb","Cb"];

  const useSharps = tonic.includes("#") || sharpKeys.includes(tonic);
  const names     = useSharps ? sharpNames : flatNames;

  const indexMap = {
    C:0, "C#":1, Db:1, D:2, "D#":3, Eb:3, E:4, Fb:4,
    F:5, "F#":6, Gb:6, G:7, "G#":8, Ab:8, A:9, "A#":10, Bb:10, B:11, Cb:11
  };
  const tonicIdx = indexMap[tonic];
  const majorIntervals = [0,2,4,5,7,9,11];
  return majorIntervals.map(i => names[(tonicIdx + i) % 12]);
}