import {useEffect, useState} from 'react'
import Sections from './Sections'
import Arrangement from './Arrangement'
import useLocalStorage from '../hook/useLocalStorage'
import useURL from '../hook/useURL'
import {KEY, STATE} from '../constants'

import style from './Edit.module.css'


export default function Edit({className, itemId, setShowEdit}) {
  const [list, setList] = useLocalStorage(KEY.LIST, [])
  const {setState} = useURL()
  
  const [selection, setSelection] = useState()
  const [raw, setRaw] = useState('')
  
  
  function handleSubmit(event) {
    event.preventDefault()
    
    const formData = new FormData(event.target)
    const id = formData.get('id')
    const name = formData.get('name')
    // const sections = JSON.parse(formData.get('sections'))
    const rawText = raw
    
    const newItem = {
      ...selection,
      id, name, raw: rawText,
    }
    
    const newList = list.map(item => item.id === id ? newItem : item)
    setList(newList)

    if (typeof setShowEdit === 'function') {
      setShowEdit(false)
    } else {
      setState(STATE.LIST)
    }
  }


  useEffect(() => {
    const thisItem = list.find(item => item.id === itemId)
    setSelection(thisItem)
    setRaw(thisItem?.raw || '')
  }, [itemId])
  
  
  return <div className={`${className}`}>
    <div className={`${style.container}`}>
      <form onSubmit={handleSubmit} className={style.form}>
        <input type="hidden" name="id" defaultValue={selection?.id} />
        
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" defaultValue={selection?.name} />
        
        {/* <Sections data={selection.sections} /> */}

        <Arrangement raw={raw} onChange={setRaw} />

        <textarea name="raw" value={raw} onChange={e=>setRaw(e.target.value)} />
        
        <button type="submit">Save</button>
      </form>
    </div>
  </div>
}