import {useEffect, useState} from 'react'
import Sections from './Sections'
import useLocalStorage from '../hook/useLocalStorage'
import {KEY, STATE} from '../constants'
import BackButton from './BackButton'


export default function Edit() {
  const [list, setList] = useLocalStorage(KEY.LIST, [])
  const [ , setState] = useLocalStorage(KEY.MAIN)
  const [selection] = useLocalStorage(KEY.SELECTION, null)
  
  
  function handleSubmit(event) {
    event.preventDefault()
    
    const formData = new FormData(event.target)
    const id = formData.get('id')    
    const name = formData.get('name')
    const sections = JSON.parse(formData.get('sections'))
    
    console.log(id, name, sections)
    const newItem = {
      ...selection,
      id, name, sections,
    }
    
    console.log(newItem)
    const newList = list.map(item => item.id === id ? newItem : item)
    setList(newList)
    
    setState(STATE.LIST)
  }
  
  
  return <div>
    <BackButton />
    
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="id" defaultValue={selection?.id} />
      
      <label htmlFor="name">Name</label>
      <input id="name" name="name" type="text" defaultValue={selection?.name} />
      
      <Sections data={selection.sections} />
      
      <button type="submit">Save</button>
    </form>
  </div>
}