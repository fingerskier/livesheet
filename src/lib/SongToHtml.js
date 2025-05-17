// songToHtml.js – ESM module to convert custom chord‑lyric text files into styled HTML
// Author: ChatGPT 2025‑05‑16 (rev‑11)
//
// Δ 2025‑05‑16‑k  (Bass notes omit quality/minor suffix)
// ─────────────────────────────────────────────────────────────────────────────
// • In slash‑chords (`root/bass`) the **bass part is now rendered as a raw note
//   name only** – never “m”.
//      `1/5` in key C → `C/G`   (5 maps to G, no minor)
//      `Em/G` stays `Em/G`      (letter bass stripped to “G”)
//      `4m/2` in C → `Fm/D`     (root keeps quality; bass is plain D)
// • Added `noteOnly()` helper used exclusively for bass mapping.
// • All other behaviour from rev‑10 (position superscripts, lyric spans, etc.)
//   preserved.

export default function songToHtml(rawText) {
  /*──────────── TITLE & KEY ──────────────────*/
  const lines = rawText.replace(/\r\n?/g, "\n").split("\n");
  const first = lines.findIndex(l => l.trim());
  if (first === -1) return "";

  const title = lines[first];
  const key   = (title.match(/\[\s*([A-G][#b]?)\s*]/i) || [,"C"])[1].toUpperCase();
  const scale = buildMajorScale(key);

  /*──────────── UTILITY HELPERS ────────────────*/
  const esc  = s=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const span = t=>`<span class="lyric-segment">${esc(t)}</span>`;
  const sup  = t=>`<sup class="chord">${t}</sup>`;
  const slug = s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
  const ciEq = (a,b)=>a.toLowerCase()===b.toLowerCase();
  const DIG_SUP={0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"};
  const supDigits=s=>s.split("").map(d=>DIG_SUP[d]||d).join("");

  /* Degree → chord (with minor on ii/iii/vi) */
  const degChord=d=>{const n=scale[(d+6)%7];return[2,3,6].includes(d)?`${n}m`:n;};
  /* Degree or letter → plain note (no quality) */
  const noteOnly=p=>{
    if(!p) return "";
    if(/^[1-7]$/.test(p)) return scale[(+p+6)%7];
    const m=p.match(/^([A-G][#b]?)/i);return m?m[1]:p;
  };

  const numOrLetterChord=p=>/^[1-7]$/.test(p)?degChord(+p):p;

  /*──────────── TOKEN FORMATTER ────────────────*/
  function formatToken(raw){
    if(!raw)return"";
    let tok=String(raw).trim();

    // |position → superscript
    let pos="";const pipe=tok.indexOf("|");
    if(pipe!==-1){pos=supDigits(tok.slice(pipe+1));tok=tok.slice(0,pipe);}  

    const [rootRaw,bassRaw]=tok.split("/");

    const rm=rootRaw.match(/^([1-7]|[A-G][#b]?)(.*)$/i);
    let root=rootRaw;
    if(rm){const[,base,qual]=rm;root=numOrLetterChord(base)+qual;}

    let out=root;
    if(bassRaw!==undefined){out+=`/${noteOnly(bassRaw)}`;}

    return out+pos;
  }

  const fmtLine=arr=>arr.map(formatToken).map(sup).join(" ");

  /*──────────── PARSE STRUCTURE ────────────────*/
  const prog=Object.create(null);const sections=[];let cur=null;const seen=new Set();
  for(let i=first+1;i<lines.length;i++){
    const raw=lines[i];const r=raw.replace(/\s+$/,"");const t=r.trim();if(!t)continue;
    const ind=/^\s/.test(raw);const cp=t.indexOf(":");const hdr=cp!==-1&&cp===t.length-1;
    if(cp!==-1&&!hdr){prog[t.slice(0,cp).trim().toLowerCase()]=parseProg(t.slice(cp+1));continue;}
    if(!ind&&(hdr||cp===-1)){
      const name=hdr?t.slice(0,-1).trim():t;
      if(cp===-1&&seen.has(name.toLowerCase())){sections.push({ref:name});cur=null;}
      else{cur={name,lines:[]};sections.push(cur);seen.add(name.toLowerCase());}
      continue;
    }
    if(ind&&cur)cur.lines.push(r.trimStart());
  }

  /*──────────── RENDER ────────────────*/
  const out=[`<article class="song">`,`  <h2 class="song-title">${esc(title)}</h2>`];
  for(const s of sections){
    if(s.ref){const src=sections.find(x=>x.name&&ciEq(x.name,s.ref));if(src?.html)out.push(src.html);continue;}
    const toks=resolve(s.name,prog);let idx=0;
    const body=s.lines.length? s.lines.map(l=>lyric(l)).join("\n") : `    <p class="chord-line">${fmtLine(toks)}</p>`;
    s.html=[`<section class="song-section section-${slug(s.name)}">`,`  <h3 class="section-title">${esc(s.name)}</h3>`,body,`</section>`].join("\n");
    out.push(s.html);

    function lyric(line){
      const parts=[];let p=0;while(true){const c=line.indexOf("^",p);if(c===-1){parts.push(span(line.slice(p)));break;}parts.push(span(line.slice(p,c)));parts.push(sup(formatToken(toks[idx++%toks.length])));p=c+1;}return`    <p class="lyric-line">${parts.join("")}</p>`;}
  }
  out.push("</article>");return out.join("\n");

  /*───────── internal helpers ───────*/
  function parseProg(s){const tk=s.trim().split(/\s+/).map(v=>v.trim());const o=[];for(let i=0;i<tk.length;i++){if(tk[i].startsWith("(")){let g=[];let w=tk[i].slice(1);while(!w.endsWith(")")){g.push(w);w=tk[++i];}g.push(w.slice(0,-1));let n=1;if(/^x\d+$/i.test(tk[i+1])){n=parseInt(tk[++i].slice(1),10);}while(n--)o.push(...g);}else o.push(tk[i]);}return o;}
  function resolve(n,m){if(!n)return[];const l=n.toLowerCase();const r=l.split(/\s+/)[0];return m[l]||m[r]||m[`${r}s`]||[];}
}

function buildMajorScale(t){const sh=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],fl=["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],shK=["C","G","D","A","E","B","F#","C#"];const names=t.includes("#")||shK.includes(t)?sh:fl;const idx={C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11}[t];return[0,2,4,5,7,9,11].map(s=>names[(idx+s)%12]);}
