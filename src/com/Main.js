import React, {useEffect} from 'react'
import Add from './Add'
import Edit from './Edit'
import List from './List'
import Set from './Set'
import View from './View/View'
import useLocalStorage from '../hook/useLocalStorage'
import {KEY, STATE} from '../constants'
import { v4 as uuid } from 'uuid'

import example from '../asset/example.txt'


export default function Main() {
  const [state] = useLocalStorage(KEY.MAIN, STATE.LIST)
  const [list, setList] = useLocalStorage(KEY.LIST, [])
  
  useEffect(()=>{
    // if list is empty, add the example song
    if (list.length === 0) {
      setList([{
        id: uuid(),
        name: 'Example',
        raw: example,
      }])
    }
  }, [])
  
  return <main>
    {state === STATE.ADD && <Add />}
    {state === STATE.EDIT && <Edit />}
    {state === STATE.LIST && <List />}
    {state === STATE.SET && <Set />}
    {state === STATE.VIEW && <View />}
  </main>
}