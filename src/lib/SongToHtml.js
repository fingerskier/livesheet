// SongToHtml.js – ESM module to convert chord‑lyric source into HTML with section arrangements.
// Author: ChatGPT 2025‑05‑18 (rev‑21)
//
// rev‑21 (bug‑fix)
//   • Fixed typo in expandChordProgression(): `.endswith()` → `.endsWith()`.
//     This caused a TypeError in browsers without the lowercase alias.
//   • No behavioural changes beyond the error fix.
//
// ----------------------------------------------------------------------
// Usage:
//   import songToHtml from "./SongToHtml.js";
//   const { html, arrangements } = songToHtml(srcText, "Studio");
//   document.body.innerHTML = html;
// ----------------------------------------------------------------------

export default function songToHtml (source, arrangementName = "") {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  let idx = 0;

  // 1. Title ----------------------------------------------------------------
  const titleLine = lines[idx].trim();
  idx++;

  // 2. Chord definitions -----------------------------------------------------
  const chordDefs = {};
  while (idx < lines.length && !/^\s*Sections:/i.test(lines[idx])) {
    const m = lines[idx].match(/^\s*([A-Za-z0-9_\- ]+):\s*(.+)$/);
    if (m) {
      const name = m[1].trim().toLowerCase();
      const progression = expandChordProgression(m[2].trim());
      chordDefs[name] = progression;
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
      while (idx < lines.length && !/^\s{2,}[A-Za-z0-9_\- ]+:\s*$/.test(lines[idx]) && !/^\s*Arrangements:/i.test(lines[idx])) {
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
        while (idx < lines.length && !/^\s{2,}[A-Za-z0-9_\- ]+:\s*$/.test(lines[idx])) {
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
    const chordsForType = chordDefs[typeKey] || [];
    const chordSpans = chordsForType.map(ch => `<span class="chord">${escapeHtml(ch)}</span>`).join(" ");
    htmlParts.push(`<p class="chord-line"><span class="chord-section-label">${escapeHtml(secName)}</span> ${chordSpans}</p>`);
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
          return `<sup class="chord">${escapeHtml(c)}</sup>`;
        });
        htmlParts.push(`<p class="lyric-line">${processed}</p>`);
      });
    } else {
      // chord‑only instrumental
      const chords = chordDefs[extractSectionType(secName)] || [];
      const chordSpans = chords.map(ch => `<span class="chord">${escapeHtml(ch)}</span>`).join(" ");
      htmlParts.push(`<p class="chord-line">${chordSpans}</p>`);
    }

    htmlParts.push(`</section>`);
  });

  htmlParts.push(`</article>`);

  return { html: htmlParts.join("\n"), arrangements: arrangementNames };
}

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

function escapeHtml (str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, ch => map[ch] || ch);
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
      // Collect group until we hit a token ending with ')'
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
      // Stray repeat token – ignore
      continue;
    } else {
      chords.push(tok);
    }
  }
  return chords;
}
