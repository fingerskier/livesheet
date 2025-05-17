import {useEffect, useState} from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, STATE} from '../../constants'
import Sections from './Sections'
import songToHtml from '../../lib/SongToHtml'


export default function View() {
  const [ , setState] = useLocalStorage(KEY.MAIN)
  const [selection] = useLocalStorage(KEY.SELECTION, null)
  
  
  return <div>
    {selection?.sections && <Sections data={selection.sections} /> }

    {selection?.raw && <div dangerouslySetInnerHTML={{__html: songToHtml(selection.raw)}} />}
  </div>
}