import React from 'react'
import {KEY, STATE} from '../constants'
import useLocalStorage from '../hook/useLocalStorage'


export default function BackButton() {
  return <a className="back button" href={`#${STATE.LIST}`}> 🔙 </a>
}