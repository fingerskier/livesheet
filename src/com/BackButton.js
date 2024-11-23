import React from 'react'
import {KEY, STATE} from '../constants'
import useLocalStorage from '../hook/useLocalStorage'


export default function BackButton() {
  const [ , setState] = useLocalStorage(KEY.MAIN)
  
  return <button className="back button" onClick={() => setState(STATE.LIST)}> 🔙 </button>
}