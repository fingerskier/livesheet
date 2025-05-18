import React from 'react'
import Add from './Add'
import Edit from './Edit'
import List from './List'
import Set from './Set'
import View from './View/View'
import useLocalStorage from '../hook/useLocalStorage'
import {KEY, STATE} from '../constants'


export default function Main() {
  const [state] = useLocalStorage(KEY.MAIN, STATE.LIST)
  
  
  return <main>
    {state === STATE.ADD && <Add />}
    {state === STATE.EDIT && <Edit />}
    {state === STATE.LIST && <List />}
    {state === STATE.SET && <Set />}
    {state === STATE.VIEW && <View />}
  </main>
}