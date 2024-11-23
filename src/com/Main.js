import React from 'react'
import Add from './Add'
import Edit from './Edit'
import List from './List'
import View from './View/View'
import useLocalStorage from '../hook/useLocalStorage'
import {KEY, STATE} from '../constants'


export default function Main() {
  const [state] = useLocalStorage(KEY.MAIN, STATE.LIST)
  
  
  return <main>
    {state === STATE.LIST && <List />}
    {state === STATE.ADD && <Add />}
    {state === STATE.EDIT && <Edit />}
    {state === STATE.VIEW && <View />}
  </main>
}