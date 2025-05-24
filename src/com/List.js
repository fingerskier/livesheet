import React from 'react'
import useLocalStorage from '../hook/useLocalStorage'
import useURL from '../hook/useURL'
import {KEY, STATE} from '../constants'
import { v4 as uuid } from 'uuid'

import example from '../asset/example.txt'


export default function List() {
  const [list, setList] = useLocalStorage(KEY.LIST, [])
  const [ , setSelection] = useLocalStorage(KEY.SELECTION, null)
  
  const {setState} = useURL()
  
  
  function addItemClick() {
    const newItem = {
      id: uuid(),
      name: 'Guide Me O Thou Great Jehovah',
      raw: example,
    }
    setList([...list, newItem])
    setSelection(newItem)
    setState(STATE.EDIT)
  }
  
  
  function editItemClick(id) {
    const thisItem = list.find(item => item.id === id)
    setSelection(thisItem)
    setState(STATE.EDIT)
  }
  
  
  function viewItemClick(id) {
    const thisItem = list.find(item => item.id === id)
    setSelection(thisItem)
    setState(STATE.VIEW)
  }
  
  
  function Item({item}) {
    return <div>
      <a href={`?id=${item.id}#view`}>
        {item.name}
      </a>
      
      {/* <button onClick={() => editItemClick(item.id)}> ✏️ </button>
      <button onClick={() => viewItemClick(item.id)}> 🔍 </button> */}
    </div>
  }
  
  
  return <div>
    <div>
      {list.map(item => <Item key={item.id} item={item} />)}
    </div>
    
    <hr />
    
    <button onClick={addItemClick}>Add</button>
  </div>
}