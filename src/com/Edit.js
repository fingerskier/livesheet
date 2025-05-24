import {useEffect, useState} from 'react'
import Sections from './Sections'
import useLocalStorage from '../hook/useLocalStorage'
import {KEY, STATE} from '../constants'

import style from './Edit.module.css'


export default function Edit({className, itemId, setShowEdit}) {
  const [list, setList] = useLocalStorage(KEY.LIST, [])
  
  const [selection, setSelection] = useState()
  const [raw, setRaw] = useState('')
  
  
  function handleSubmit(event) {
    event.preventDefault()
    
    const formData = new FormData(event.target)
    const id = formData.get('id')    
    const name = formData.get('name')
    // const sections = JSON.parse(formData.get('sections'))
    const raw = formData.get('raw')
    
    const newItem = {
      ...selection,
      id, name, raw,
    }
    
    const newList = list.map(item => item.id === id ? newItem : item)
    setList(newList)
    
    if (typeof setShowEdit === 'function') setShowEdit(false)
  }


  useEffect(() => {
    const thisItem = list.find(item => item.id === itemId)
    setSelection(thisItem)
  }, [itemId])
  
  
  return <div className={`${className}`}>
    <div className={`${style.container}`}>
      <form onSubmit={handleSubmit} className={style.form}>
        <input type="hidden" name="id" defaultValue={selection?.id} />
        
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" defaultValue={selection?.name} />
        
        {/* <Sections data={selection.sections} /> */}

        <textarea name="raw" defaultValue={selection?.raw} />
        
        <button type="submit">Save</button>
      </form>
    </div>
  </div>
}