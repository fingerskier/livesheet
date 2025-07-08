import React, {useEffect, useState} from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY} from '../../constants'
import Icon from 'unicode-icons'
import songToHtml from '../../lib/SongToHtml'
import { downloadJSON, loadJSON } from '../../lib/file'


export default function View({setId}) {
  const [songs] = useLocalStorage(KEY.LIST, [])
  const [sets, setSets] = useLocalStorage(KEY.SETS, [])

  const [selectedSet, setSelectedSet] = useState(null)
  const [songToAdd, setSongToAdd] = useState('')
  const [arrangementToAdd, setArrangementToAdd] = useState('')
  const [arrangementOpts, setArrangementOpts] = useState([])

  // helper to persist selectedSet changes
  const updateSet = updated => {
    setSelectedSet(updated)
    setSets(sets.map(s => (s.id === updated.id ? updated : s)))
  }

  const addSong = () => {
    if (!songToAdd) return
    const newSongs = [...(selectedSet.songs || []), {songId: songToAdd, arrangement: arrangementToAdd}]
    updateSet({ ...selectedSet, songs: newSongs })
    setSongToAdd('')
    setArrangementToAdd('')
    setArrangementOpts([])
  }

  const removeSong = id => {
    const newSongs = selectedSet.songs.filter(s => s.songId !== id)
    updateSet({ ...selectedSet, songs: newSongs })
  }

  const moveSong = (index, delta) => {
    const newIndex = index + delta
    if (newIndex < 0 || newIndex >= selectedSet.songs.length) return
    const newSongs = [...selectedSet.songs]
    const [item] = newSongs.splice(index, 1)
    newSongs.splice(newIndex, 0, item)
    updateSet({ ...selectedSet, songs: newSongs })
  }

  const updateArrangement = (id, arrangement) => {
    const newSongs = selectedSet.songs.map(s =>
      s.songId === id ? { ...s, arrangement } : s
    )
    updateSet({ ...selectedSet, songs: newSongs })
  }

  useEffect(() => {
    const s = sets.find(s => s.id === setId)
    setSelectedSet(s)
  }, [setId, sets])

  useEffect(() => {
    if (songToAdd) {
      const song = songs.find(s => s.id === songToAdd)
      if (song?.raw) {
        const { arrangements } = songToHtml(song.raw)
        setArrangementOpts(arrangements)
      }
    } else {
      setArrangementOpts([])
    }
  }, [songToAdd])

  function SetSong({entry, index}) {
    const song = songs.find(song => song.id === entry.songId)
    const [opts, setOpts] = useState([])

    useEffect(() => {
      if (song?.raw) {
        const { arrangements } = songToHtml(song.raw)
        setOpts(arrangements)
      }
    }, [song])

    return <li>
      <button onClick={() => moveSong(index, -1)} disabled={index===0}>▲</button>
      <button onClick={() => moveSong(index, 1)} disabled={index===selectedSet.songs.length-1}>▼</button>
      {song?.name}
      <select value={entry.arrangement || ''} onChange={e => updateArrangement(entry.songId, e.target.value)}>
        <option value=''>default</option>
        {opts.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
      </select>
      <button onClick={() => removeSong(entry.songId)}>{Icon.RED_X}</button>
    </li>
  }

  return <div>
    <h2>Set: {selectedSet?.name}</h2>
    <div>
      <button onClick={() => downloadJSON(`${selectedSet?.name || 'set'}.json`, selectedSet)}>Save Set</button>
      <button onClick={async () => {
        const data = await loadJSON();
        if (data) updateSet({ ...selectedSet, ...data });
      }}>Load Set</button>
    </div>
    <label>
      Date/Time:
      <input type="datetime-local" value={selectedSet?.datetime || ''} onChange={e => updateSet({ ...selectedSet, datetime: e.target.value })} />
    </label>

    <p>Songs in this set:</p>
    <ul className='song list'>
      {selectedSet?.songs?.map((entry, i) => <SetSong key={i} entry={entry} index={i} />)}
    </ul>

    <div>
      <p>Add a song to the set:</p>
      <select onChange={e => setSongToAdd(e.target.value)} value={songToAdd}>
        <option value=''>Select a song</option>
        {songs.map((song, i) => <option key={i} value={song.id}>{song.name}</option>)}
      </select>
      {arrangementOpts.length > 0 && (
        <select onChange={e => setArrangementToAdd(e.target.value)} value={arrangementToAdd}>
          <option value=''>default</option>
          {arrangementOpts.map((arr, i) => <option key={i} value={arr}>{arr}</option>)}
        </select>
      )}
      <button onClick={addSong}>Add</button>
    </div>
  </div>
}
