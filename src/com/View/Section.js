import {useEffect, useState} from 'react'
import style from './Section.module.css'


export default function Sections({data}) {
  const [line, setLine] = useState('')

  useEffect(() => {
    if (data) {
      console.log(data)
      
      const text = data.lyrics.split('^')
      const chrd = data.chords.split(' ')
      
      const newLine = text.map((_, I) => {
        const eol = _[_.length-1] === '\n' ? true : false
        
        return <>
          <span className={style.chord}>{chrd[I] || ''}</span>
          <span className={style.lyric}>{_}</span>
          
          {eol && <br />}
        </>
      })
      
      setLine(newLine)
    }
  }, [data])
  
  
  return <div>
    <div className={style.slug}>
      {data.name}
    </div>
    
    <div>{line}</div>
  </div>
}