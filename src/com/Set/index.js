import React, {useState} from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY} from '../../constants'
import {v4 as uuid} from 'uuid'
import View from './View'
import Icon from 'unicode-icons'


export default function Set() {
  const [sets, setSets] = useLocalStorage(KEY.SETS, [])
  
  const [selectedSetId, setSelectedSetId] = useState(null)
  

  const add = ()=>{
    const name = window.prompt('Enter the name of the set')
    if(name){
      const dt = window.prompt('Enter the date/time for this set (YYYY-MM-DDThh:mm)', new Date().toISOString().slice(0,16))
      const newId = uuid()
      setSets([...sets, {id:newId, name, datetime: dt || '', songs:[]}])
    }
  }

  const remove = (id)=>{
    const yes = window.confirm('Are you sure you want to remove this set?')
    if (yes) {
      setSets(sets.filter(set => set.id !== id))
    }
  }

  
  return <>
    <h2>Sets</h2>
    <p>A set is a collection of songs that are played together.</p>

    {selectedSetId && <View setId={selectedSetId} />}

    <p>Your Sets:</p>
    <button onClick={add}>Add Set</button>
    <select onChange={e=>setSelectedSetId(e.target.value)} value={selectedSetId}>
      <option value=''>Select a set</option>
      {(Array.isArray(sets) && sets.map((set, index) => (
        <option key={index} value={set.id}>{set.name}</option>
      )))}
    </select>
    
    {/* remove the selected set */}
    {selectedSetId && <button onClick={()=>setSets(sets.filter(set => set.id !== selectedSetId))}>{Icon.RED_X}</button>}
  </>
}
