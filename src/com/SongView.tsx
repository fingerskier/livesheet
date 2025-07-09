import {useEffect, useState} from 'react'
import {useStateMachine} from 'ygdrassil'
import {db, type Song} from '@/lib/db'
import songToHtml from '@/lib/SongToHtml'
import useLocalStore from '@/hook/useLocalStore'


export default function Song() {
  const {query} = useStateMachine()
  const [song, setSong] = useState<Song | null>(null)
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
          setHtml(result.html)
        }
      }
    }
    load()
  }, [query.id])


  useEffect(() => {
    if (!song) return


    const elements = document.querySelectorAll('.chord')
    elements.forEach(el => {
      (el as HTMLElement).style.display = store.showChords ? 'inline-block' : 'none'
    })
  
    const el = document.querySelector('.song-chords')
    if (!el) return
    (el as HTMLElement).style.display = store.showChordset ? 'block' : 'none'
  }, [song, store.showChords, store.showChordset])


  if (!song) return <p>Select a song to view.</p>

  return (
    <div>
      <h2>{song.name}</h2>
      <div dangerouslySetInnerHTML={{__html: html}} />
    </div>
  )}