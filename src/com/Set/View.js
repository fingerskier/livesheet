import React, {useEffect, useState} from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY} from '../../constants'
import Icon from 'unicode-icons'


export default function View({setId}) {
  const [songs, setSongs] = useLocalStorage(KEY.LIST, [])
  const [set] = useLocalStorage(KEY.SET, [])
  
  const [selectedSet, setSelectedSet] = useState(null)
  const [selectedId, setSelectedId] = useState(null)


  const add = id=>{
    console.debug(selectedSet)
    setSelectedSet([...selectedSet, id])
  }

  const remove = id=>{
    setSelectedSet(selectedSet.filter(id=>id!==id))
  }
  
  
  useEffect(() => {
    const thisSet = set.find(setId => setId === setId)
    setSelectedSet(thisSet)
  }, [setId])


  useEffect(()=>{
    if(selectedId){
      add(selectedId)
    }
  }, [selectedId])


  function SetSong({id}){
    const song = songs.find(song => song.id === id)
    return <li>
      <button onClick={()=>setSelectedId(id)}>{song.name}</button>
      <button onClick={()=>remove(id)}>{Icon.RED_X}</button>
    </li>
  }

  
  return <div>
    <h2>Set: {selectedSet?.name}</h2>
    <p>{selectedSet?.description}</p>

    <p>Songs in this set:</p>
    <ul>
      {selectedSet?.songs.map((id,I)=><SetSong key={I} id={id} />)}
    </ul>

    <div>
      Add a song to the set:
      <select onChange={e=>setSelectedId(e.target.value)} value={selectedId}>
        {songs.map((song,I)=><option key={I} value={song.id}>{song.name}</option>)}
      </select>
    </div>
  </div>
}