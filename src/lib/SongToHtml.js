// SongToHtml.js – ESM module to convert chord‑lyric source into HTML with section arrangements.
// Author: ChatGPT 2025‑05‑18 (rev‑25)
//
// rev‑25 (fret glyph update) – **Braille‑dot fret symbols**
//   • Replaces the playing‑card glyphs with the user‑specified Braille dot
//     characters:
//       1→⠂, 2→⠅, 3→⠇, 4→⠏, 5→⠗, 6→⠛, 7→⠞, 8→⠟, 9→⠥,
//       10→⠦, 11→⠧, 12→⠨, 13→⠩.
//   • Pipe (|) still removed in rendered output.
//
// ----------------------------------------------------------------------
// Usage example:
//   "C|3"     → "C⠇"   (third‑fret)
//   "Bb+|10"  → "Bb+⠦" (tenth‑fret)
// ----------------------------------------------------------------------

export default function songToHtml (source, arrangementName = "") {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  let idx = 0;

  // 1. Title ----------------------------------------------------------------
  const titleLine = lines[idx].trim();
  idx++;

  // -------------------------------------------------------------------------
  // Internal fret‑glyph helper & mapping
  // -------------------------------------------------------------------------
  const FRET_GLYPHS = [
    "",        // 0
    "⠂",      // 1
    "⠅",      // 2
    "⠇",      // 3
    "⠏",      // 4
    "⠗",      // 5
    "⠛",      // 6
    "⠞",      // 7
    "⠟",      // 8
    "⠥",      // 9
    "⠦",      // 10
    "⠧",      // 11
    "⠨",      // 12
    "⠩"       // 13
  ];
  const displayChord = ch => ch.replace(/\|(\d{1,2})$/, (_m, num) => {
    const n = parseInt(num, 10);
    return (n >= 1 && n < FRET_GLYPHS.length) ? FRET_GLYPHS[n] : num;
  });

  // 2. Chord definitions -----------------------------------------------------
  const chordDefs = {};          // flattened array per section‑type
  const chordDisplay = {};       // array<string> preserving line breaks

  while (idx < lines.length && !/^\s*Sections:/i.test(lines[idx])) {
    const defMatch = lines[idx].match(/^\s*([A-Za-z0-9_\- ]+):\s*(.+)$/);
    if (defMatch) {
      const typeKey = defMatch[1].trim().toLowerCase();
      const displayLines = [defMatch[2].trim()];

      // collect continuation lines (indented, no colon)
      let look = idx + 1;
      while (
        look < lines.length &&
        /^\s{2,}\S/.test(lines[look]) &&          // indented
        !/^[A-Za-z0-9_\- ]+:\s*/.test(lines[look].trim()) // not "foo:"
      ) {
        displayLines.push(lines[look].trim());
        look++;
      }

      idx = look - 1; // loop will ++
      chordDisplay[typeKey] = displayLines;
      chordDefs[typeKey] = expandChordProgression(displayLines.join(" "));
    }
    idx++;
  }

  // 3. Lyric sections --------------------------------------------------------
  const lyricSections = {};
  while (idx < lines.length && !/^\s*Arrangements:/i.test(lines[idx])) {
    const sectionHeader = lines[idx].match(/^\s{2,}([A-Za-z0-9_\- ]+):\s*$/);
    if (sectionHeader) {
      const sectionName = sectionHeader[1].trim();
      idx++;
      const lyricLines = [];
      while (
        idx < lines.length &&
        !/^\s{2,}[A-Za-z0-9_\- ]+:\s*$/.test(lines[idx]) &&
        !/^\s*Arrangements:/i.test(lines[idx])
      ) {
        const ln = lines[idx];
        if (ln.trim().length) lyricLines.push(ln.replace(/^\s{4}/, ""));
        idx++;
      }
      lyricSections[sectionName] = lyricLines;
    } else {
      idx++;
    }
  }

  // 4. Arrangements ----------------------------------------------------------
  const arrangements = {};
  if (idx < lines.length && /^\s*Arrangements:/i.test(lines[idx])) {
    idx++; // skip Arrangements:
    while (idx < lines.length) {
      const arrHeader = lines[idx].match(/^\s{2,}([A-Za-z0-9_\- ]+):\s*$/);
      if (arrHeader) {
        const arrName = arrHeader[1].trim();
        idx++;
        const arrSections = [];
        while (
          idx < lines.length &&
          !/^\s{2,}[A-Za-z0-9_\- ]+:\s*$/.test(lines[idx])
        ) {
          const secLine = lines[idx].trim();
          if (secLine.length) arrSections.push(secLine);
          idx++;
        }
        arrangements[arrName] = arrSections;
      } else {
        idx++;
      }
    }
  }

  const arrangementNames = Object.keys(arrangements);
  if (!arrangementNames.length) throw new Error("No arrangements found");
  const chosenArrangement = arrangements[arrangementName] || arrangements[arrangementNames[0]];

  // 5. Build HTML ------------------------------------------------------------
  const htmlParts = [];
  htmlParts.push(`<article class="song">`);

  // 5a. Chord summary block --------------------------------------------------
  htmlParts.push(`<section class="song-chords"><h3 class="chords-title">Chords</h3>`);
  chosenArrangement.forEach(secName => {
    const typeKey = extractSectionType(secName);
    const displayLines = chordDisplay[typeKey] || [];

    if (!displayLines.length) return; // skip if none

    // Build line with breaks
    let lineHtml = `<span class="chord-section-label">${escapeHtml(secName)}</span> ` +
      lineToChordSpans(displayLines[0]);

    for (let i = 1; i < displayLines.length; i++) {
      lineHtml += `<br class="line-break"/>` + lineToChordSpans(displayLines[i]);
    }

    htmlParts.push(`<p class="chord-line">${lineHtml}</p>`);
  });
  htmlParts.push(`</section>`);

  // 5b. Lyric sections -------------------------------------------------------
  chosenArrangement.forEach(secName => {
    const safeId = secName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    htmlParts.push(`<section class="song-section section-${safeId}">`);
    htmlParts.push(`<h3 class="section-title">${escapeHtml(secName)}</h3>`);

    const lns = lyricSections[secName];
    if (lns && lns.length) {
      const typeKey = extractSectionType(secName);
      const chords = chordDefs[typeKey] || [];
      let chordIdx = 0;
      lns.forEach(rawLine => {
        const processed = processLyricLine(rawLine, chords, () => {
          const c = chords[chordIdx % chords.length] || "";
          chordIdx++;
          return `<sup class="chord">${escapeHtml(displayChord(c))}</sup>`;
        });
        htmlParts.push(`<p class="lyric-line">${processed}</p>`);
      });
    } else {
      // chord‑only instrumental
      const chords = chordDefs[extractSectionType(secName)] || [];
      const chordSpans = chords.map(ch => `<span class="chord">${escapeHtml(displayChord(ch))}</span>`).join(" ");
      htmlParts.push(`<p class="chord-line">${chordSpans}</p>`);
    }

    htmlParts.push(`</section>`);
  });

  htmlParts.push(`</article>`);

  return { html: htmlParts.join("\n"), arrangements: arrangementNames };

  // helper to turn a single progression‑line string into spans
  function lineToChordSpans (str) {
    return str.split(/\s+/).filter(Boolean).map(ch => `<span class="chord">${escapeHtml(displayChord(ch))}</span>`).join(" ");
  }
}

// ---------------------------------------------------------------------------
// Helper utilities (outside default export)
// ---------------------------------------------------------------------------

function escapeHtml (str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"]|'"'/g, ch => map[ch] || ch);
}

function extractSectionType (secName) {
  // "Verse 1" → "verse"   "Chorus" → "chorus"
  return secName.split(/\s+/)[0].toLowerCase();
}

function processLyricLine (line, chords, injectChordSup) {
  let out = "";
  let lastIdx = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '^') {
      out += escapeHtml(line.slice(lastIdx, i)) + injectChordSup();
      lastIdx = i + 1;
    }
  }
  out += escapeHtml(line.slice(lastIdx));
  return out;
}

function expandChordProgression (expr) {
  const tokens = expr.split(/\s+/).filter(Boolean);
  const chords = [];
  for (let i = 0; i < tokens.length; i++) {
    let tok = tokens[i];
    if (tok.startsWith('(')) {
      // Collect group until token ending with ')'
      let group = [];
      if (tok.endsWith(')')) {
        group.push(tok.slice(1, -1));
      } else {
        group.push(tok.slice(1));
        while (++i < tokens.length && !tokens[i].endsWith(')')) {
          group.push(tokens[i]);
        }
        if (i < tokens.length) {
          group.push(tokens[i].slice(0, -1));
        }
      }
      // Lookahead for repeat token xN
      let repeat = 1;
      if (i + 1 < tokens.length && /^x\d+$/i.test(tokens[i + 1])) {
        repeat = parseInt(tokens[++i].slice(1), 10);
      }
      for (let r = 0; r < repeat; r++) chords.push(...group);
    } else if (/^x\d+$/i.test(tok)) {
      continue; // stray repeat token
    } else {
      chords.push(tok);
    }
  }
  return chords;
}
