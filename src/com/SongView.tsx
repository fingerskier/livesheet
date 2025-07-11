import {useEffect, useState} from 'react'
import {useStateMachine, StateButton} from 'ygdrassil'
import {db, type Song} from '@/lib/db'
import songToHtml from '@/lib/SongToHtml'
import useLocalStore from '@/hook/useLocalStore'


export default function Song() {
  const {query} = useStateMachine()
  const [song, setSong] = useState<Song | null>(null)
  const [arrangements, setArrangements] = useState<string[]>([])
  const [arrangement, setArrangement] = useState('')
  const [html, setHtml] = useState('')
  const store = useLocalStore()
  
  
  useEffect(() => {
    async function load() {
      if (query.id) {
        await db.open()
        const found = await db.songs.get(query.id as string)
        if (found) {
          setSong(found)
          const result = songToHtml(found.text)
          setArrangements(result.arrangements)
          setArrangement(result.arrangements[0] || '')
          setHtml(result.html)
        }
      }
    }
    load()
  }, [query.id])


  useEffect(() => {
    if (!song) return

    const result = songToHtml(song.text, arrangement)
    setHtml(result.html)
    setArrangements(result.arrangements)
  }, [song, arrangement])


  useEffect(() => {
    console.debug('arr', arrangements)
  }, [arrangements])


  useEffect(() => {
    if (!html) return

    const elements = document.querySelectorAll('.chord')
    elements.forEach(el => {
      if (store.showChords) {
        el.classList.remove('hidden')
      } else {
        el.classList.add('hidden')
      }
    })

    const chordEl = document.querySelector('.song-chords')
    if (chordEl) {
      if (store.showChordset) {
        chordEl.classList.remove('hidden')
      } else {  
        chordEl.classList.add('hidden')
      }
    }

    const metaEl = document.querySelector('.song-meta')
    if (metaEl) {
      if (store.showMeta) {
        metaEl.classList.remove('hidden')
      } else {
        metaEl.classList.add('hidden')
      }
    }
  }, [html, store.showChords, store.showChordset, store.showMeta])


  if (!song) return <p>Select a song to view.</p>

  return (
    <div>
      <h2>{song.name}</h2>
      
      {arrangements.length && (
        <select
          className='dont print'
          value={arrangement}
          onChange={e => setArrangement(e.target.value)}
        >
          {arrangements.map((arr, i) => (
            <option key={i} value={arr}>{arr}</option>
          ))}
        </select>
      )}
      
      <StateButton
        className='dont print'
        to='song-edit'
        data={{ id: song.id }}
      >Edit</StateButton>
      
      <div dangerouslySetInnerHTML={{__html: html}} />
    </div>
  )
}
