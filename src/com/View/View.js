import {useEffect, useState} from 'react'
import Edit from '../Edit'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, STATE} from '../../constants'
import Sections from './Sections'
import songToHtml from '../../lib/SongToHtml'
import Icon from 'unicode-icons'

import style from './View.module.css'

export default function View() {
  const [list] = useLocalStorage(KEY.LIST, [])
  const [state] = useLocalStorage(KEY.VIEW)
  const [query] = useLocalStorage(KEY.QUERY)
  const [showChordset, setShowChordset] = useLocalStorage(KEY.CHORDSET, false)
  const [showChords, setShowChords] = useLocalStorage(KEY.CHORDS, false)
  
  const [arrangement, setArrangement] = useState(null)
  const [arrangOpts, setArrangOpts] = useState(null)
  const [data, setData] = useState(null)
  const [html, setHtml] = useState(null)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    setShowChordset(false)
  }, [])


  useEffect(() => {
    const thisItem = list.find(item => item.id === query.id)
    setData(thisItem)
  }, [query.id, showEdit])


  useEffect(()=>{
    if (data?.raw) {
      const {_, arrangements} = songToHtml(data.raw)
      setArrangOpts(arrangements)
    }
  },[data])

  useEffect(()=>{
    if (arrangement) {
      const {html} = songToHtml(data.raw, arrangement)
      setHtml(html)
      setShowChords(true)
      setShowChordset(false)
    }
  }, [arrangement])

  useEffect(()=>{
    if (showChordset) {
      document.querySelectorAll('.song-chords').forEach(chord => {
        chord.style.display = 'block'
      })
    } else {
      document.querySelectorAll('.song-chords').forEach(chord => {
        chord.style.display = 'none'
      })
    }
  }, [showChordset])

  useEffect(()=>{
    if (showChords) {
      document.querySelectorAll('.chord').forEach(chord => {
        chord.style.display = 'inline'
      })
    } else {
      document.querySelectorAll('.chord').forEach(chord => {
        chord.style.display = 'none'
      })
    }

  }, [showChords])

  
  return <div className={style.container}>
    <div className={style.controls}>
      <button onClick={() => setShowEdit(!showEdit)}>
        {Icon.PENCIL}
      </button>
      <button onClick={() => setShowChords(!showChords)}>
        chords {showChords ? Icon.EYE : ''}
      </button>
      <button onClick={() => setShowChordset(!showChordset)}>
        chordset {showChordset ? Icon.EYE : ''}
      </button>
    </div>

    <div className={style.content}>
      <div>
        {showEdit && <Edit className={style.editor + ' ' + style.controls} itemId={query.id} setShowEdit={setShowEdit} />}
      </div>
    
      <div>
        {data?.sections && <Sections data={data.sections} itemId={query.id} /> }

        {data && arrangOpts && <>
          <select className={style.controls} onChange={e=>setArrangement(e.target.value)}>
            <option value=''>Select Arrangement</option>
            {arrangOpts?.map((arrangement, index) => (
              <option key={index} value={arrangement}>{arrangement}</option>
            ))}
          </select>
        </>}

        {html && arrangement && <>
          <div dangerouslySetInnerHTML={{__html: html}} />
        </>}
      </div>
    </div>
  </div>
}