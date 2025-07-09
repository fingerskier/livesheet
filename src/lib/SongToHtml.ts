// SongToHtml.js – convert chord‑lyric source (numeric or named) to HTML + arrangements
// Author: ChatGPT 2025‑05‑24 (rev‑34)
//
// rev‑34 (Nashville‑number ↔ key translation)
//   • Reads a key in brackets on the title line, e.g. `Amazing Grace [D]`.
//   • Numeric chords 1‑7 (including bass‑notes such as `1/4`) are translated
//     to diatonic chords in that key. Quality follows the major scale pattern:
//       1 maj, 2 min, 3 min, 4 maj, 5 maj, 6 min, 7° (diminished).
//   • Non‑numeric chords and accidentals remain untouched. Fret‑glyph support
//     and all earlier fixes retained.
// ---------------------------------------------------------------------------

export function parseSong(source: string): {
  sections: string[]
  arrangements: Record<string, string[]>
} {
  const lines = source.replace(/\r\n?/g, "\n").split("\n")
  let idx = 0
  const sectionHeader = /^\s{2,}([\w \-]+):\s*$/
  const sections: string[] = []
  while(idx<lines.length && !/^\s*Arrangements:/i.test(lines[idx])){
    const m=lines[idx].match(sectionHeader);
    if(m){
      const name=m[1].trim();
      sections.push(name);
      idx++;
      while(idx<lines.length &&
            !sectionHeader.test(lines[idx]) &&
            !/^\s*Arrangements:/i.test(lines[idx])) idx++; 
    } else idx++; 
  }

  const arrangements: Record<string, string[]> = {};
  if(idx<lines.length && /^\s*Arrangements:/i.test(lines[idx])){
    idx++;
    const head=/^\s{2,}([\w \-]+):\s*$/;
    while(idx<lines.length){
      const mh=lines[idx].match(head);
      if(mh){
        const name=mh[1].trim();
        idx++;
        const items: string[] = [];
        while(idx<lines.length && !head.test(lines[idx])){
          if(lines[idx].trim()) items.push(lines[idx].trim());
          idx++;
        }
        arrangements[name]=items;
      } else idx++;
    }
  }
  if(!Object.keys(arrangements).length) arrangements.default = sections;

  return {sections, arrangements};
}

export interface SongToHtmlResult {
  html: string;
  arrangements: string[];
}

export default function songToHtml (
  source: string,
  arrangementName: string = "",
): SongToHtmlResult {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  let idx = 0;

  // 1. Title & key -----------------------------------------------------------
  const titleLine = lines[idx]?.trim() ?? "";
  const keyMatch = titleLine.match(/\[(\w[♯#♭b]?)]/);
  const songKey = keyMatch ? normalizeKey(keyMatch[1]) : null; // e.g. "C", "F#"
  idx++;

  // 2. Helpers for number→chord --------------------------------------------
  const chromatic = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  // prefer flats for flat keys
  const flats: { [key: string]: string } = {"C#":"Db","D#":"Eb","F#":"Gb","G#":"Ab","A#":"Bb"};
  const majorIntervals = [0,2,4,5,7,9,11];
  const qualities = ["","m","m","","","m","dim"];
  function normalizeKey(k: string): string { return k.replace(/♯/g, "#").replace(/♭/g, "b") }
  function semitone(note: string): number {
    const up = note.toUpperCase();
    let idx = chromatic.indexOf(up);
    if(idx>-1) return idx;
    // flats
    const alt: string | undefined = {"DB":"C#","EB":"D#","GB":"F#","AB":"G#","BB":"A#"}[up]
    return alt ? chromatic.indexOf(alt) : 0
  }
  function degreeToChord(num: number): string {
    if(!songKey) return String(num); // no key ⇒ leave numeric
    const deg = (num-1)%7;
    const rootSemi = (semitone(songKey)+majorIntervals[deg])%12;
    let root = chromatic[rootSemi];
    if(/b$/.test(songKey)||["F","Bb","Eb","Ab","Db","Gb","Cb"].includes(songKey))
      root = flats[root]||root; // prefer flats in flat keys
    return root + qualities[deg];
  }
  function translateToken(tok: string): string {
    // e.g. "1/4", "6", "1sus", "5+" etc
    const m = tok.match(/^(\d)(?:\/(\d))?(.*)$/);
    if(!m) return tok;
    const chord = degreeToChord(+m[1]);
    let out = chord;
    if(m[2]) out += "/"+degreeToChord(+m[2]);
    out += m[3]||"";
    return out;
  }

  // 3. Fret glyphs -----------------------------------------------------------
  const FRET = ["", "⠂", "⠅", "⠇", "⠏", "⠗", "⠛", "⠞", "⠟", "⠥", "⠦", "⠧", "⠨", "⠩"];
  const fmtChord = (c: string): string => {
    const base = c.replace(/\|(\d{1,2})$/, (_: string, n: string) => FRET[+n] || n)
    return translateToken(base);
  };

  // 4. Chord definitions -----------------------------------------------------
  const chordDefs: Record<string, string[]> = {}, chordDisplay: Record<string, string[]> = {};
  while (idx < lines.length && !/^\s*Sections:/i.test(lines[idx])) {
    const m = lines[idx].match(/^[\s\t]*([\w \-]+):\s*(.+)$/);
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

  // 5. Lyric sections (unchanged logic) -------------------------------------
  const lyricSections: Record<string, string[]> = {}, sectionOrder: string[] = [];
  const sectionHeaderRE = /^\s{2,}([\w \-]+):\s*$/;
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
    } else { idx++; }
  }

  // 6. Arrangements (unchanged) ---------------------------------------------
  const arrangements: Record<string, string[]> = {};
  if (idx < lines.length && /^\s*Arrangements:/i.test(lines[idx])) {
    idx++;
    while (idx < lines.length) {
      const headMatch = lines[idx].match(/^(\s{2,})([\w \-]+)\s*:?\s*$/);
      if (headMatch) {
        const indent = headMatch[1].length;
        const arrName = headMatch[2].trim();
        let look = idx + 1;
        while (look < lines.length && !lines[look].trim()) look++;
        const nextIndent = look < lines.length ? (/^(\s*)/.exec(lines[look]) || [""])[0].length : 0;
        const isHeader = lines[idx].trim().endsWith(":") || nextIndent > indent;
        if (!isHeader) { idx++; continue; }
        idx++;
        const secs: string[] = [];
        while (idx < lines.length) {
          const ln = lines[idx];
          const lnIndent = (/^(\s*)/.exec(ln) || [""])[0].length;
          if (lnIndent <= indent) break;
          if (ln.trim()) secs.push(ln.trim());
          idx++;
        }
        arrangements[arrName] = secs;
      } else { idx++; }
    }
  }
  if (!Object.keys(arrangements).length) arrangements.default = sectionOrder;
  const chosenArr: string[] = arrangements[arrangementName] || arrangements[Object.keys(arrangements)[0]];

  // 7. Build HTML ------------------------------------------------------------
  const out=[];
  out.push(`<article class="song">`);
  out.push(`<section class="song-chords"><h3 class="chords-title">Chords</h3>`);
  chosenArr.forEach(sec=>{
    const disp = chordDisplay[sectionType(sec)]||[];
    if(!disp.length) return;
    let h=`<span class="chord-section-label">${esc(sec)}</span> `+ spanLine(disp[0]);
    for(let i=1;i<disp.length;i++) h+=`<br class="line-break"/>`+spanLine(disp[i]);
    out.push(`<p class="chord-line">${h}</p>`);
  });
  out.push(`</section>`);

  chosenArr.forEach(sec=>{
    out.push(`<section class="song-section section-${sec.toLowerCase().replace(/[^a-z0-9]+/g,"-")}">`);
    out.push(`<h3 class="section-title">${esc(sec)}</h3>`);
    const lns: string[] = lyricSections[sec] || [];
    const cArr: string[] = chordDefs[sectionType(sec)] || [];
    let ci=0;
    lns.forEach((ln: string) => {
      const htmlLine=processLyric(ln,()=>{
        const c=cArr[ci % cArr.length]||""; ci++; return `<sup class="chord">${esc(fmtChord(c))}</sup>`;});
      out.push(`<p class="lyric-line">${htmlLine}</p>`);
    });
    out.push(`</section>`);
  });
  out.push(`</article>`);

  return {html:out.join("\n"),arrangements:Object.keys(arrangements)};

  // helper -------------------------------------------------------------
  function spanLine(s: string): string { return s.split(/\s+/).filter(Boolean).map(c => `<span class="chord">${esc(fmtChord(c))}</span>`).join(" ") }
  function esc(s: string): string {
    const map: Record<string, string> = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#039;'}
    return String(s).replace(/[&<>"]|'"'/g, ch => map[ch] ?? ch)
  }
  function sectionType(sec: string): string { return sec.split(/\s+/)[0].toLowerCase() }
  function processLyric(l: string, inj: () => string): string { let o="", last=0; for(let i=0;i<l.length;i++){ if(l[i]==='^'){ o+=esc(l.slice(last,i))+inj(); last=i+1; } } return o+esc(l.slice(last)) }
  function expandProg(exp: string): string[] { const t=exp.split(/\s+/).filter(Boolean),out:string[]=[]; for(let i=0;i<t.length;i++){ let tk=t[i]; if(tk.startsWith('(')){ const g:string[]=[]; if(tk.endsWith(')')) g.push(tk.slice(1,-1)); else { g.push(tk.slice(1)); while(++i<t.length && !t[i].endsWith(')')) g.push(t[i]); if(i<t.length) g.push(t[i].slice(0,-1)); } let r=1; if(i+1<t.length && /^x\d+$/i.test(t[i+1])) r=+t[++i].slice(1); while(r--) out.push(...g); } else if(!/^x\d+$/i.test(tk)) out.push(tk); } return out }
}
