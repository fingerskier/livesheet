import {useEffect, useState} from 'react'
import {KEY} from '../../constants'
import {useHREF} from '../../lib/HREFContext'
import Sections from './Sections'
import useLocalStorage from '../../hook/useLocalStorage'


export default function Edit() {
  const {songID} = useHREF()
  const [songs, setSongs] = useLocalStorage(KEY.SONGS, [])
  const [sections, setSections] = useState([])
  const [song, setSong] = useState({})
  
  
  const save = event=>{
    event.preventDefault()
    
    const songIndex = songs.findIndex(song=>song.id===songID)
    songs[songIndex] = song
    
    setSongs([...songs])
    
    return false
  }
  
  
  const updateSections = sections=>{
    setSections(sections)
    setSong({...song, sections})
  }
  
  
  useEffect(()=>{
    const song = songs.find(song=>song.id===songID)
    
    if(song){
      setSong(song)
    }
  }, [songID])
  
  
  useEffect(() => {
    if (song?.sections) {
      setSections(song.sections)
    }
  }, [song])
  
  
  return <div>
    <h2>Meta</h2>
    
    <form onSubmit={save}>
      <label>
        Name:
        <input value={song.name} onChange={e=>setSong({...song, name: e.target.value})}/>
      </label>
      
      <label>
        Key:
        <input
          value={song.key}
          onChange={e=>setSong({...song, key: e.target.value})}
        />
      </label>
      
      <label>
        Meter:
        <input
          value={song.meter}
          onChange={e=>setSong({...song, meter: e.target.value})}
        />
      </label>
      
      <label>
        BPM:
        <input
          value={song.bpm}
          onChange={e=>setSong({...song, bpm: e.target.value})}
        />
      </label>
      
      <Sections data={sections} onChange={updateSections} />
      
      <button>Save</button>
    </form>
  </div>
}
