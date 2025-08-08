import { useEffect, useRef, useState } from 'react'
import { useStateMachine } from 'ygdrassil'
import { db } from '../lib/db'
import songToHtml from '@/lib/SongToHtml'
import useLocalStore from '@/hook/useLocalStore'
import Icon from 'unicode-icons'

type ViewSong = {
  id: string
  name: string
  html: string
}

export default function Live() {
  const { query } = useStateMachine()
  const [songs, setSongs] = useState<ViewSong[]>([])
  const [index, setIndex] = useState(0)
  const scrollTarget = useRef<'top' | 'bottom'>('top')
  const store = useLocalStore()

  useEffect(() => {
    async function load() {
      if (!query.id) return
      await db.open()
      const set = await db.sets.get(query.id as string)
      if (!set) return

      const items: ViewSong[] = []
      for (const s of set.songs) {
        const song = await db.songs.get(s.songId)
        if (!song) continue
        let text = song.text
        if (s.key) {
          const nl = text.indexOf('\n')
          if (nl === -1) {
            text = text.replace(/\s*\[[^\]]+\]\s*$/, '') + ` [${s.key}]`
          } else {
            const first = text.slice(0, nl).replace(/\s*\[[^\]]+\]\s*$/, '')
            text = `${first} [${s.key}]${text.slice(nl)}`
          }
        }
        const res = songToHtml(text, s.arrangement)
        items.push({ id: song.id, name: song.name, html: res.html })
      }
      setSongs(items)
      setIndex(0)
    }
    load()
  }, [query.id])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const scrollable = document.body.scrollHeight > window.innerHeight
      if (e.key === 'PageDown') {
        const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2
        if (!scrollable || atBottom) {
          e.preventDefault()
          scrollTarget.current = 'top'
          setIndex(i => Math.min(i + 1, songs.length - 1))
        }
      } else if (e.key === 'PageUp') {
        const atTop = window.scrollY <= 0
        if (!scrollable || atTop) {
          e.preventDefault()
          scrollTarget.current = 'bottom'
          setIndex(i => Math.max(i - 1, 0))
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [songs.length])

  useEffect(() => {
    if (scrollTarget.current === 'top') {
      window.scrollTo({ top: 0 })
    } else {
      window.scrollTo({ top: document.body.scrollHeight })
    }
  }, [index])

  useEffect(() => {
    const current = songs[index]
    if (!current) return
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
  }, [songs, index, store.showChords, store.showChordset, store.showMeta])

  if (!songs.length) return <p>Select a set to view.</p>

  const current = songs[index]

  return (
    <div>
      <h2>{current.name}</h2>
      <div className='dont print'>
        <button
          type='button'
          onClick={() => {
            scrollTarget.current = 'top'
            setIndex(i => Math.max(i - 1, 0))
          }}
          disabled={index === 0}
        >{Icon.ARROW.LEFT}</button>
        <button
          type='button'
          onClick={() => {
            scrollTarget.current = 'top'
            setIndex(i => Math.min(i + 1, songs.length - 1))
          }}
          disabled={index === songs.length - 1}
        >{Icon.ARROW.RIGHT}</button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: current.html }} />
    </div>
  )
}

