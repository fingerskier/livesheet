import {useEffect, useState} from 'react'
import Songs from './Songs'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, VIEW} from '../../constants'
import {useHREF} from '../../lib/HREFContext'


export default function Edit() {
  const {programID} = useHREF()
  const [programs, setPrograms] = useLocalStorage(KEY.PROGRAMS, [])
  const [program, setProgram] = useState({})
  const [songList, setSongList] = useState([])
  
  
  const save = event=>{
    event.preventDefault()
    
    const programIndex = programs.findIndex(prog=>prog.id===programID)
    programs[programIndex] = program
    
    setPrograms([...programs])
    
    return false
  }


  const updateSongList = songs=>{
    setSongList(songs)
    setProgram({...program, songs})
  }
  
  
  useEffect(() => {
    if (programID) setProgram(programs.find(prog=>prog.id===programID))
  }, [programID])
  
  
  return <div>
    <h2>Program</h2>
    
    <form onSubmit={save}>
      <label>
        Name:
        <input
          value={program.name}
        />
      </label>
      
      <Songs data={program?.songs} onChange={updateSongList} />
    </form>
  </div>
}