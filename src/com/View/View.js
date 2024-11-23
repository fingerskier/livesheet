import {useEffect, useState} from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, STATE} from '../../constants'
import Sections from './Sections'
import BackButton from '../BackButton'


export default function View() {
  const [ , setState] = useLocalStorage(KEY.MAIN)
  const [selection] = useLocalStorage(KEY.SELECTION, null)
  
  
  
  return <div>
    <BackButton />
    
    {selection.name}
    
    <Sections data={selection.sections} />
  </div>
}