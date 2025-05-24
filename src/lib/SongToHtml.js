// SongToHtml.js – convert chord‑lyric source to HTML + arrangements
// Author: ChatGPT 2025‑05‑23 (rev‑33)
//
// rev‑33 (lyric capture + section‑header regex fix)
//   • Lyric lines were being skipped because the regex that detects the start
//     of the *next* section was too broad (it matched any indented text).
//     Now section headers **must** end with a colon.
//       ‑ Section header → 2+ leading spaces & ends with ':'
//       ‑ Lyric line      → anything else (so we capture them correctly).
//   • Chord summary still shows original progression strings; lyrics now render
//     with superscript chords.
// ---------------------------------------------------------------------------

export default function songToHtml (source, arrangementName = "") {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  let idx = 0;

  // 1. Title ----------------------------------------------------------------
  const titleLine = lines[idx]?.trim() ?? "";
  idx++;

  // 2. Fret glyphs -----------------------------------------------------------
  const FRET = ["", "⠂", "⠅", "⠇", "⠏", "⠗", "⠛", "⠞", "⠟", "⠥", "⠦", "⠧", "⠨", "⠩"];
  const fmtChord = c => c.replace(/\|(\d{1,2})$/, (_, n) => (FRET[n] || n));

  // 3. Chord definitions -----------------------------------------------------
  const chordDefs = {}, chordDisplay = {};
  while (idx < lines.length && !/^\s*Sections:/i.test(lines[idx])) {
    const m = lines[idx].match(/^\s*([\w \-]+):\s*(.+)$/);
    if (m) {
      const key = m[1].trim().toLowerCase();
      const disp = [m[2].trim()];
      let j = idx + 1;
      while (j < lines.length && /^\s{2,}\S/.test(lines[j]) && !/^[\w \-]+:\s*/.test(lines[j].trim())) {
        disp.push(lines[j].trim());
        j++;
      }
      idx = j - 1;
      chordDisplay[key] = disp;
      chordDefs[key] = expandProg(disp.join(" "));
    }
    idx++;
  }

  // 4. Lyric sections --------------------------------------------------------
  const lyricSections = {}, sectionOrder = [];
  const sectionHeaderRE = /^\s{2,}([\w \-]+):\s*$/; // colon *required*
  while (idx < lines.length && !/^\s*Arrangements:/i.test(lines[idx])) {
    const mh = lines[idx].match(sectionHeaderRE);
    if (mh) {
      const name = mh[1].trim();
      sectionOrder.push(name);
      idx++;
      const lns = [];
      while (idx < lines.length && !sectionHeaderRE.test(lines[idx]) && !/^\s*Arrangements:/i.test(lines[idx])) {
        const raw = lines[idx];
        if (raw.trim()) lns.push(raw.replace(/^\s{4}/, ""));
        idx++;
      }
      lyricSections[name] = lns;
    } else {
      idx++;
    }
  }

  // 5. Arrangements ----------------------------------------------------------
  const arrangements = {};
  if (idx < lines.length && /^\s*Arrangements:/i.test(lines[idx])) {
    idx++;
    while (idx < lines.length) {
      const headMatch = lines[idx].match(/^(\s{2,})([\w \-]+)\s*:?\s*$/);
      if (headMatch) {
        const indent = headMatch[1].length;
        const arrName = headMatch[2].trim();
        // Confirm header
        let look = idx + 1;
        while (look < lines.length && !lines[look].trim()) look++;
        const nextIndent = look < lines.length ? (/^(\s*)/.exec(lines[look]) || [""])[0].length : 0;
        const isHeader = lines[idx].trim().endsWith(":") || nextIndent > indent;
        if (!isHeader) { idx++; continue; }
        idx++;
        const secs = [];
        while (idx < lines.length) {
          const ln = lines[idx];
          const lnIndent = (/^(\s*)/.exec(ln) || [""])[0].length;
          if (lnIndent <= indent) break;
          if (ln.trim()) secs.push(ln.trim());
          idx++;
        }
        arrangements[arrName] = secs;
      } else {
        idx++;
      }
    }
  }
  if (!Object.keys(arrangements).length) arrangements.default = sectionOrder;

  const chosenArr = arrangements[arrangementName] || arrangements[Object.keys(arrangements)[0]];

  // 6. Build HTML ------------------------------------------------------------
  const out = [];
  out.push(`<article class="song">`);

  // 6a. Chord summary --------------------------------------------------------
  out.push(`<section class="song-chords"><h3 class="chords-title">Chords</h3>`);
  chosenArr.forEach(sec => {
    const disp = chordDisplay[sectionType(sec)] || [];
    if (!disp.length) return;
    let h = `<span class="chord-section-label">${esc(sec)}</span> ` + spanLine(disp[0]);
    for (let i = 1; i < disp.length; i++) h += `<br class="line-break"/>` + spanLine(disp[i]);
    out.push(`<p class="chord-line">${h}</p>`);
  });
  out.push(`</section>`);

  // 6b. Lyric sections -------------------------------------------------------
  chosenArr.forEach(sec => {
    out.push(`<section class="song-section section-${sec.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">`);
    out.push(`<h3 class="section-title">${esc(sec)}</h3>`);
    const lns = lyricSections[sec] || [];
    const cArr = chordDefs[sectionType(sec)] || [];
    let ci = 0;
    lns.forEach(ln => {
      const htmlLine = processLyric(ln, () => {
        const c = cArr[ci % cArr.length] || ""; ci++; return `<sup class="chord">${esc(fmtChord(c))}</sup>`;
      });
      out.push(`<p class="lyric-line">${htmlLine}</p>`);
    });
    out.push(`</section>`);
  });
  out.push(`</article>`);

  return { html: out.join("\n"), arrangements: Object.keys(arrangements) };

  // helper fns --------------------------------------------------------------
  function spanLine(s) { return s.split(/\s+/).filter(Boolean).map(c => `<span class="chord">${esc(fmtChord(c))}</span>`).join(" "); }
  function esc(s) { return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch])); }
  function sectionType(sec) { return sec.split(/\s+/)[0].toLowerCase(); }
  function processLyric(l, inject) { let o="", last=0; for(let i=0;i<l.length;i++){ if(l[i]==='^'){ o+=esc(l.slice(last,i))+inject(); last=i+1; } } return o+esc(l.slice(last)); }
  function expandProg(exp) { const t=exp.split(/\s+/).filter(Boolean), out=[]; for(let i=0;i<t.length;i++){ let tk=t[i]; if(tk.startsWith('(')){ const g=[]; if(tk.endsWith(')')) g.push(tk.slice(1,-1)); else { g.push(tk.slice(1)); while(++i<t.length && !t[i].endsWith(')')) g.push(t[i]); if(i<t.length) g.push(t[i].slice(0,-1)); } let r=1; if(i+1<t.length && /^x\d+$/i.test(t[i+1])) r=+t[++i].slice(1); while(r--) out.push(...g); } else if(!/^x\d+$/i.test(tk)) out.push(tk); } return out; }
}
