import {useEffect, useState} from 'react'
import styles from './Sections.module.css'
import {parseSong} from '../lib/SongToHtml'

function updateRaw(raw,{name,items}){
  const lines=raw.replace(/\r\n?/g,'\n').split('\n')
  const arrIdx=lines.findIndex(l=>/^\s*Arrangements:/i.test(l))
  const head=/^\s{2,}([\w\d \-]+):/;
  const newLines=items.map(s=>'    '+s)
  if(arrIdx===-1){
    return [...lines,'Arrangements:','  '+name+':',...newLines].join('\n')
  }
  let i=arrIdx+1
  let hdrIdx=null
  while(i<lines.length){
    if(head.test(lines[i])){hdrIdx=i;break}
    i++
  }
  if(hdrIdx===null){
    lines.splice(arrIdx+1,0,'  '+name+':',...newLines)
    return lines.join('\n')
  }
  lines[hdrIdx]='  '+name+':'
  i=hdrIdx+1
  while(i<lines.length && !head.test(lines[i])) lines.splice(i,1)
  lines.splice(i,0,...newLines)
  return lines.join('\n')
}

export default function Arrangement({raw,onChange}){
  const [sections,setSections]=useState([])
  const [arr,setArr]=useState({name:'',items:[]})
  const [dragged,setDragged]=useState(null)

  useEffect(()=>{
    const {sections:secs,arrangements}=parseSong(raw)
    setSections(secs)
    const first=Object.keys(arrangements)[0]
    setArr({name:first,items:arrangements[first]||[]})
  },[raw])

  const updateItems=(items)=>{
    const updated={...arr,items}
    setArr(updated)
    onChange(updateRaw(raw,updated))
  }

  const handleDragStart=(e,i)=>{setDragged(i);e.dataTransfer.effectAllowed='move'}
  const handleDragOver=(e,i)=>{
    e.preventDefault()
    if(dragged===null) return
    const items=[...arr.items]
    const [d]=items.splice(dragged,1)
    items.splice(i,0,d)
    setDragged(i)
    updateItems(items)
  }
  const handleDragEnd=()=>setDragged(null)
  const duplicate=(i)=>{const items=[...arr.items];items.splice(i+1,0,arr.items[i]);updateItems(items)}
  const remove=(i)=>{updateItems(arr.items.filter((_,j)=>j!==i))}
  const changeItem=(i,val)=>{const items=arr.items.map((s,j)=>j===i?val:s);updateItems(items)}
  const addItem=()=>{updateItems([...arr.items,sections[0]||''])}

  return <div className={styles.sections}>
    <h2 className={styles.header}>Arrangement</h2>
    <div className={styles.section}>
      {arr.items.map((sec,i)=>(
        <div key={i} className={`draggable ${dragged===i?'border-blue-500 bg-blue-50':''}`} draggable
          onDragStart={e=>handleDragStart(e,i)}
          onDragOver={e=>handleDragOver(e,i)}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.slug}>
            <div className={styles.grip}>⠿</div>
            <select className={styles.name} value={sec} onChange={e=>changeItem(i,e.target.value)}>
              {sections.map((s,idx)=><option key={idx} value={s}>{s}</option>)}
            </select>
            <button className={styles.delete} type="button" onClick={()=>duplicate(i)}>⧉</button>
            <button className={styles.delete} type="button" onClick={()=>remove(i)}>❌</button>
          </div>
        </div>
      ))}
    </div>
    <button className={styles.add} type="button" onClick={addItem}>Add Item</button>
  </div>
}
