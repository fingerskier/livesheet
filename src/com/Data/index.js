import React, {useState} from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY} from '../../constants'
import Icon from 'unicode-icons'


export default function Data() {
  const [list] = useLocalStorage(KEY.LIST, [])


  const downloadData = event=>{
    // trigger a download of the data as a json file
    const data = JSON.stringify(list)
    const blob = new Blob([data], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    a.click()
  }

  
  return <>
    <button onClick={downloadData}>{Icon.FLOPPY_DISK}</button>
  </>
}