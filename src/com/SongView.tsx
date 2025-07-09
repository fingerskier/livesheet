import {useEffect, useState} from 'react'
import {useStateMachine} from 'ygdrassil'
import {db, type Song} from '../lib/db'
import songToHtml from '../lib/SongToHtml'


/**
 * 
 */
export default function Song() {
  const {query} = useStateMachine()
  const [song, setSong] = useState<Song | null>(null)
  const [html, setHtml] = useState('')

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

  if (!song) return <p>Select a song to view.</p>

  return (
    <div>
      <h2>{song.name}</h2>
      <div dangerouslySetInnerHTML={{__html: html}} />
    </div>
  )}